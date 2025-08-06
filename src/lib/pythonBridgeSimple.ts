import { PythonExecutionResult } from '../types/python.types';

// Simplified Python bridge without Web Workers for development
export class SimplePythonBridge {
  private pyodide: any = null;
  private isInitialized = false;

  async initializePython(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Loading Pyodide directly...');
      
      // Load Pyodide from CDN
      const pyodideScript = document.createElement('script');
      pyodideScript.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
      
      await new Promise((resolve, reject) => {
        pyodideScript.onload = resolve;
        pyodideScript.onerror = reject;
        document.head.appendChild(pyodideScript);
      });

      // Wait for global loadPyodide function
      const loadPyodide = (window as any).loadPyodide;
      if (!loadPyodide) {
        throw new Error('Pyodide failed to load');
      }

      this.pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
      });

      console.log('Installing Python packages...');
      // Install essential packages
      await this.pyodide.loadPackage(['pandas', 'numpy']);
      
      // Set up output capture
      this.pyodide.runPython(`
import sys
import io
from contextlib import redirect_stdout

class OutputCapture:
    def __init__(self):
        self.output = []
    
    def write(self, text):
        if text.strip():  # Only capture non-empty lines
            self.output.append(text.strip())
    
    def flush(self):
        pass
    
    def get_output(self):
        result = '\\n'.join(self.output)
        self.output.clear()
        return result

_output_capture = OutputCapture()
sys.stdout = _output_capture
      `);

      this.isInitialized = true;
      console.log('Pyodide initialized successfully!');
      
    } catch (error) {
      console.error('Failed to initialize Pyodide:', error);
      throw new Error(`Python initialization failed: ${error}`);
    }
  }

  async executeScript(code: string, data?: any): Promise<{
    result: PythonExecutionResult;
    output: string;
  }> {
    if (!this.pyodide || !this.isInitialized) {
      throw new Error('Python environment not initialized');
    }

    try {
      // Clear previous output
      this.pyodide.runPython('_output_capture.output.clear()');
      
      // Set up data context if provided
      if (data && Array.isArray(data) && data.length > 0) {
        // Convert JavaScript data to Python
        this.pyodide.globals.set('dashboard_data', this.pyodide.toPy(data));
        this.pyodide.runPython(`
import pandas as pd
import numpy as np

# Convert dashboard data to DataFrame
try:
    df = pd.DataFrame(dashboard_data.to_py())
    print(f"Data loaded: {df.shape[0]} rows, {df.shape[1]} columns")
except Exception as e:
    print(f"Error creating DataFrame: {e}")
    df = pd.DataFrame()
        `);
      } else {
        // Create empty DataFrame if no data
        this.pyodide.runPython(`
import pandas as pd
import numpy as np
df = pd.DataFrame()
print("No data provided - empty DataFrame created")
        `);
      }

      // Execute the user's code
      this.pyodide.runPython(code);
      
      // Get output
      const output = this.pyodide.runPython('_output_capture.get_output()');
      
      // Get the updated DataFrame if it exists
      let resultData = null;
      try {
        const dfExists = this.pyodide.runPython('len(df) > 0');
        if (dfExists) {
          resultData = this.pyodide.runPython('df.to_dict("records")').toJs();
        }
      } catch (e) {
        console.warn('Could not extract DataFrame:', e);
      }

      return {
        result: {
          dataFrame: resultData,
          variables: {},
          success: true
        },
        output: output || ''
      };

    } catch (error) {
      console.error('Python execution error:', error);
      
      // Try to get error output
      let errorOutput = '';
      try {
        errorOutput = this.pyodide.runPython('_output_capture.get_output()') || '';
      } catch (e) {
        // Ignore
      }

      throw new Error(`Python execution failed: ${error}\n${errorOutput}`);
    }
  }

  validateCode(code: string): { 
    isValid: boolean; 
    warnings: string[]; 
    errors: string[]; 
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!code.trim()) {
      errors.push('Code cannot be empty');
    }

    // Basic safety checks
    const dangerousPatterns = [
      /import\s+os/g,
      /import\s+subprocess/g,
      /exec\s*\(/g,
      /eval\s*\(/g,
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(code)) {
        warnings.push(`Potentially unsafe operation detected: ${pattern.source}`);
      }
    });

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  dispose() {
    // Cleanup if needed
    this.isInitialized = false;
    this.pyodide = null;
  }
}