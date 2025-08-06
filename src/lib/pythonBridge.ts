import { PythonWorkerMessage, PythonWorkerResponse, PythonExecutionResult } from '../types/python.types';

export class PythonDataBridge {
  private worker: Worker | null = null;
  private messageId = 0;
  private pendingMessages = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }>();

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    try {
      // Create the worker from the TypeScript file
      this.worker = new Worker(
        new URL('../workers/python.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (event: MessageEvent<PythonWorkerResponse>) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('Python worker error:', error);
        this.rejectAllPending(new Error(`Worker error: ${error.message}`));
      };

    } catch (error) {
      console.error('Failed to create Python worker:', error);
      throw new Error('Failed to initialize Python execution environment');
    }
  }

  private handleWorkerMessage(response: PythonWorkerResponse) {
    const pending = this.pendingMessages.get(response.id);
    
    if (!pending) {
      console.warn('Received response for unknown message:', response.id);
      return;
    }

    if (response.type === 'error') {
      pending.reject(new Error(response.error || 'Unknown error'));
    } else {
      pending.resolve(response);
    }

    this.pendingMessages.delete(response.id);
  }

  private generateMessageId(): string {
    return `msg_${++this.messageId}_${Date.now()}`;
  }

  private sendMessage(message: PythonWorkerMessage): Promise<PythonWorkerResponse> {
    if (!this.worker) {
      return Promise.reject(new Error('Python worker not initialized'));
    }

    return new Promise((resolve, reject) => {
      const id = this.generateMessageId();
      const messageWithId = { ...message, id };
      
      this.pendingMessages.set(id, { resolve, reject });
      this.worker!.postMessage(messageWithId);

      // Set timeout for message processing
      setTimeout(() => {
        if (this.pendingMessages.has(id)) {
          this.pendingMessages.delete(id);
          reject(new Error('Python execution timeout'));
        }
      }, 30000); // 30 second timeout
    });
  }

  async initializePython(): Promise<void> {
    const response = await this.sendMessage({ 
      id: '', 
      type: 'initialize' 
    });
    
    if (response.type !== 'initialized') {
      throw new Error('Failed to initialize Python environment');
    }
  }

  async executeScript(code: string, data?: any): Promise<{
    result: PythonExecutionResult;
    output: string;
  }> {
    const response = await this.sendMessage({
      id: '',
      type: 'execute',
      code,
      data
    });

    if (response.type === 'error') {
      throw new Error(response.error);
    }

    return {
      result: response.result as PythonExecutionResult,
      output: response.output || ''
    };
  }

  async installPackage(packageName: string): Promise<string> {
    const response = await this.sendMessage({
      id: '',
      type: 'installPackage',
      packageName
    });

    if (response.type === 'error') {
      throw new Error(response.error);
    }

    return response.result as string;
  }

  // Utility methods for data conversion
  toDataFrame(data: any[]): any[] {
    // Ensure data is in the correct format for pandas DataFrame
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array of objects');
    }

    // Validate that all items are objects with consistent keys
    if (data.length > 0) {
      const firstKeys = Object.keys(data[0]).sort();
      const inconsistentItem = data.find(item => {
        const keys = Object.keys(item).sort();
        return JSON.stringify(keys) !== JSON.stringify(firstKeys);
      });

      if (inconsistentItem) {
        console.warn('Inconsistent object keys detected, DataFrame creation may fail');
      }
    }

    return data;
  }

  fromDataFrame(dfData: any[]): any[] {
    // Convert DataFrame records back to JavaScript objects
    if (!Array.isArray(dfData)) {
      throw new Error('DataFrame data must be an array');
    }

    return dfData.map(row => {
      // Handle any special pandas data types
      const cleanedRow: any = {};
      for (const [key, value] of Object.entries(row)) {
        // Handle NaN, null, undefined
        if (value === null || value === undefined || 
            (typeof value === 'number' && isNaN(value))) {
          cleanedRow[key] = null;
        } else {
          cleanedRow[key] = value;
        }
      }
      return cleanedRow;
    });
  }

  addComputedColumns(
    originalData: any[],
    newColumns: Record<string, any[]>
  ): any[] {
    // Merge new computed columns with original data
    return originalData.map((row, index) => {
      const newRow = { ...row };
      
      for (const [columnName, columnData] of Object.entries(newColumns)) {
        if (index < columnData.length) {
          newRow[columnName] = columnData[index];
        }
      }
      
      return newRow;
    });
  }

  validateCode(code: string): { 
    isValid: boolean; 
    warnings: string[]; 
    errors: string[]; 
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Basic validation checks
    if (!code.trim()) {
      errors.push('Code cannot be empty');
    }

    // Check for potentially dangerous operations
    const dangerousPatterns = [
      /import\s+os/g,
      /import\s+subprocess/g,
      /import\s+sys/g,
      /exec\s*\(/g,
      /eval\s*\(/g,
      /__import__\s*\(/g,
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(code)) {
        warnings.push(`Potentially unsafe operation detected: ${pattern.source}`);
      }
    });

    // Check for infinite loops (basic detection)
    if (/while\s+True\s*:/g.test(code) && !/break/g.test(code)) {
      warnings.push('Potential infinite loop detected');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  private rejectAllPending(error: Error) {
    for (const pending of this.pendingMessages.values()) {
      pending.reject(error);
    }
    this.pendingMessages.clear();
  }

  dispose() {
    this.rejectAllPending(new Error('Python bridge disposed'));
    
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}