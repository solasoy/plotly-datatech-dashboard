import { useState, useEffect, useCallback, useRef } from 'react';
import { SimplePythonBridge } from '../lib/pythonBridgeSimple';
import { PythonEngineState, PythonExecutionResult } from '../types/python.types';

interface UsePythonReturn {
  state: PythonEngineState;
  executeScript: (code: string, data?: any) => Promise<{
    result: PythonExecutionResult;
    output: string;
  }>;
  installPackage: (packageName: string) => Promise<void>;
  clearOutput: () => void;
  validateCode: (code: string) => {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  };
}

export const usePython = (autoInitialize = true): UsePythonReturn => {
  const bridgeRef = useRef<SimplePythonBridge | null>(null);
  const [state, setState] = useState<PythonEngineState>({
    isInitialized: false,
    isExecuting: false,
    error: null,
    output: [],
    installedPackages: ['pandas', 'numpy', 'matplotlib', 'scipy'] // Default packages
  });

  // Initialize Python environment
  useEffect(() => {
    if (autoInitialize && !bridgeRef.current) {
      initializePython();
    }

    return () => {
      if (bridgeRef.current) {
        bridgeRef.current.dispose();
      }
    };
  }, [autoInitialize]);

  const initializePython = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      bridgeRef.current = new SimplePythonBridge();
      await bridgeRef.current.initializePython();
      
      setState(prev => ({ 
        ...prev, 
        isInitialized: true,
        error: null
      }));
      
    } catch (error) {
      console.error('Failed to initialize Python:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to initialize Python',
        isInitialized: false
      }));
    }
  }, []);

  const executeScript = useCallback(async (code: string, data?: any) => {
    if (!bridgeRef.current) {
      throw new Error('Python environment not initialized');
    }

    // Validate code before execution
    const validation = bridgeRef.current.validateCode(code);
    if (!validation.isValid) {
      throw new Error(`Code validation failed: ${validation.errors.join(', ')}`);
    }

    setState(prev => ({ 
      ...prev, 
      isExecuting: true, 
      error: null 
    }));

    try {
      const { result, output } = await bridgeRef.current.executeScript(code, data);
      
      setState(prev => ({
        ...prev,
        isExecuting: false,
        output: output ? [...prev.output, output] : prev.output
      }));

      return { result, output };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Script execution failed';
      
      setState(prev => ({
        ...prev,
        isExecuting: false,
        error: errorMessage,
        output: [...prev.output, `Error: ${errorMessage}`]
      }));

      throw error;
    }
  }, []);

  const installPackage = useCallback(async (packageName: string) => {
    // Package installation not supported in simplified bridge
    console.warn('Package installation not supported in development mode');
    setState(prev => ({
      ...prev,
      output: [...prev.output, `Package installation not available in development mode: ${packageName}`]
    }));
  }, []);

  const clearOutput = useCallback(() => {
    setState(prev => ({
      ...prev,
      output: [],
      error: null
    }));
  }, []);

  const validateCode = useCallback((code: string) => {
    if (!bridgeRef.current) {
      return {
        isValid: false,
        warnings: [],
        errors: ['Python environment not initialized']
      };
    }

    return bridgeRef.current.validateCode(code);
  }, []);

  return {
    state,
    executeScript,
    installPackage,
    clearOutput,
    validateCode
  };
};

// Hook for script execution with automatic state management
export const useScriptExecution = () => {
  const { executeScript, state } = usePython();
  const [lastResult, setLastResult] = useState<PythonExecutionResult | null>(null);
  const [lastOutput, setLastOutput] = useState<string>('');

  const runScript = useCallback(async (code: string, data?: any) => {
    try {
      const { result, output } = await executeScript(code, data);
      setLastResult(result);
      setLastOutput(output);
      return { result, output };
    } catch (error) {
      setLastResult(null);
      setLastOutput('');
      throw error;
    }
  }, [executeScript]);

  return {
    runScript,
    isExecuting: state.isExecuting,
    isInitialized: state.isInitialized,
    error: state.error,
    lastResult,
    lastOutput,
    clearResults: () => {
      setLastResult(null);
      setLastOutput('');
    }
  };
};