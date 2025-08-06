// @ts-ignore
import { loadPyodide, PyodideInterface } from 'pyodide';

interface PythonWorkerMessage {
  id: string;
  type: 'initialize' | 'execute' | 'installPackage';
  code?: string;
  data?: any;
  packageName?: string;
}

interface PythonWorkerResponse {
  id: string;
  type: 'initialized' | 'result' | 'error' | 'output' | 'packageInstalled';
  result?: any;
  error?: string;
  output?: string;
}

class PythonWorkerEngine {
  private pyodide: PyodideInterface | null = null;
  private isInitialized = false;
  private outputBuffer: string[] = [];

  async initialize() {
    try {
      console.log('Initializing Pyodide...');
      // Try different CDN URLs for better compatibility
      this.pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
      });

      // Redirect Python stdout to capture print statements
      this.pyodide.runPython(`
import sys
import io
from contextlib import redirect_stdout

class OutputCapture:
    def __init__(self):
        self.output = []
    
    def write(self, text):
        self.output.append(text)
    
    def flush(self):
        pass
    
    def get_output(self):
        result = ''.join(self.output)
        self.output.clear()
        return result

_output_capture = OutputCapture()
      `);

      // Install essential data science packages
      await this.installPackages(['pandas', 'numpy', 'matplotlib', 'scipy']);
      
      this.isInitialized = true;
      console.log('Pyodide initialized successfully');
      
      this.postMessage({
        id: 'init',
        type: 'initialized'
      });
    } catch (error) {
      console.error('Failed to initialize Pyodide:', error);
      this.postMessage({
        id: 'init',
        type: 'error',
        error: `Failed to initialize Python environment: ${error}`
      });
    }
  }

  async installPackages(packages: string[]) {
    if (!this.pyodide) throw new Error('Pyodide not initialized');
    
    console.log('Installing packages:', packages);
    await this.pyodide.loadPackage(packages);
    console.log('Packages installed successfully');
  }

  async executeScript(id: string, code: string, data?: any) {
    if (!this.pyodide || !this.isInitialized) {
      this.postMessage({
        id,
        type: 'error',
        error: 'Python environment not initialized'
      });
      return;
    }

    try {
      // Clear previous output
      this.pyodide.runPython('_output_capture.output.clear()');
      
      // Set up data context if provided
      if (data) {
        // Convert JavaScript objects to Python
        this.pyodide.globals.set('dashboard_data', this.pyodide.toPy(data));
        this.pyodide.runPython(`
import pandas as pd
import numpy as np

# Convert dashboard data to DataFrame if it's a list of objects
if isinstance(dashboard_data, list) and len(dashboard_data) > 0:
    df = pd.DataFrame(dashboard_data.to_py())
else:
    df = pd.DataFrame()
        `);
      }

      // Execute the user's code with output capture
      const wrappedCode = `
import sys
sys.stdout = _output_capture
try:
${code.split('\n').map(line => '    ' + line).join('\n')}
finally:
    sys.stdout = sys.__stdout__
`;

      this.pyodide.runPython(wrappedCode);
      
      // Capture any output
      const output = this.pyodide.runPython('_output_capture.get_output()');
      
      // Get the updated DataFrame if it exists
      let result = null;
      try {
        const dfExists = this.pyodide.runPython('isinstance(df, pd.DataFrame) and not df.empty');
        if (dfExists) {
          result = this.pyodide.runPython('df.to_dict("records")').toJs();
        }
      } catch (e) {
        // df might not exist or be modified
      }

      // Get any variables that were created
      const globals = this.pyodide.globals.toJs();
      const userVariables: any = {};
      
      for (const [key, value] of globals) {
        if (!key.startsWith('_') && !['df', 'pd', 'np', 'dashboard_data', 'sys', 'io'].includes(key)) {
          try {
            userVariables[key] = value;
          } catch (e) {
            // Some objects can't be converted
            userVariables[key] = '[Object not serializable]';
          }
        }
      }

      this.postMessage({
        id,
        type: 'result',
        result: {
          dataFrame: result,
          variables: userVariables,
          success: true
        },
        output: output || ''
      });

    } catch (error) {
      console.error('Python execution error:', error);
      this.postMessage({
        id,
        type: 'error',
        error: `Python execution failed: ${error}`
      });
    }
  }

  async installPackage(id: string, packageName: string) {
    if (!this.pyodide || !this.isInitialized) {
      this.postMessage({
        id,
        type: 'error',
        error: 'Python environment not initialized'
      });
      return;
    }

    try {
      await this.pyodide.loadPackage([packageName]);
      this.postMessage({
        id,
        type: 'packageInstalled',
        result: `Package ${packageName} installed successfully`
      });
    } catch (error) {
      this.postMessage({
        id,
        type: 'error',
        error: `Failed to install package ${packageName}: ${error}`
      });
    }
  }

  private postMessage(message: PythonWorkerResponse) {
    self.postMessage(message);
  }
}

// Initialize the worker
const engine = new PythonWorkerEngine();

// Handle messages from the main thread
self.onmessage = async (event: MessageEvent<PythonWorkerMessage>) => {
  const { id, type, code, data, packageName } = event.data;

  switch (type) {
    case 'initialize':
      await engine.initialize();
      break;
    
    case 'execute':
      if (code) {
        await engine.executeScript(id, code, data);
      }
      break;
    
    case 'installPackage':
      if (packageName) {
        await engine.installPackage(id, packageName);
      }
      break;
  }
};

// Auto-initialize when the worker starts
engine.initialize();