import React, { useEffect, useRef } from 'react';
import { PythonConsoleProps } from '../../types/python.types';

const PythonConsole: React.FC<PythonConsoleProps> = ({
  output,
  errors,
  isExecuting,
  onClear
}) => {
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output, errors]);

  const formatOutput = (text: string, isError: boolean = false) => {
    // Handle multiline output
    const lines = text.split('\n');
    return lines.map((line, index) => (
      <div
        key={index}
        className={`font-mono text-sm ${
          isError 
            ? 'text-red-600 bg-red-50' 
            : 'text-gray-800'
        } ${line.trim() ? 'py-0.5' : ''}`}
      >
        {line || '\u00A0'} {/* Non-breaking space for empty lines */}
      </div>
    ));
  };

  const hasContent = output.length > 0 || errors.length > 0 || isExecuting;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Python Console</span>
          {isExecuting && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Running...</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasContent && (
            <button
              onClick={onClear}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
              title="Clear console"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div
        ref={consoleRef}
        className="flex-1 overflow-auto p-3 bg-white border-t"
        style={{ minHeight: '100px' }}
      >
        {!hasContent && (
          <div className="text-gray-400 text-sm italic">
            Console output will appear here...
          </div>
        )}

        {output.map((line, index) => (
          <div key={`output-${index}`} className="mb-1">
            {formatOutput(line)}
          </div>
        ))}

        {errors.map((error, index) => (
          <div key={`error-${index}`} className="mb-1">
            <div className="text-xs text-red-500 font-semibold mb-1">ERROR:</div>
            {formatOutput(error, true)}
          </div>
        ))}

        {isExecuting && (
          <div className="flex items-center space-x-2 text-blue-600 text-sm">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>Executing Python script...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PythonConsole;