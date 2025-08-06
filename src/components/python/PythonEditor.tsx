import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { PythonEditorProps } from '../../types/python.types';

const PythonEditor: React.FC<PythonEditorProps> = ({
  code,
  onChange,
  onExecute,
  dataContext,
  isExecuting = false,
  theme = 'light'
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure Python language features
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onExecute(code);
    });

    // Add auto-completion for pandas/numpy common functions
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = [
          // Pandas suggestions
          {
            label: 'df.head()',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'head(${1:5})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            documentation: 'Return the first n rows'
          },
          {
            label: 'df.tail()',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'tail(${1:5})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            documentation: 'Return the last n rows'
          },
          {
            label: 'df.describe()',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'describe()',
            range: range,
            documentation: 'Generate descriptive statistics'
          },
          {
            label: 'df.groupby()',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'groupby(${1:column})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            documentation: 'Group DataFrame using a mapper or by a Series of columns'
          },
          {
            label: 'pd.DataFrame()',
            kind: monaco.languages.CompletionItemKind.Constructor,
            insertText: 'DataFrame(${1:data})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            documentation: 'Create a new DataFrame'
          },
          // Numpy suggestions
          {
            label: 'np.mean()',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'mean(${1:array})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            documentation: 'Compute the arithmetic mean'
          },
          {
            label: 'np.std()',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'std(${1:array})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            documentation: 'Compute the standard deviation'
          }
        ];

        // Add column suggestions if dataContext is available
        if (dataContext && Object.keys(dataContext).length > 0) {
          const firstRow = Object.values(dataContext)[0];
          if (Array.isArray(firstRow) && firstRow.length > 0) {
            const columns = Object.keys(firstRow[0] || {});
            columns.forEach(column => {
              suggestions.push({
                label: `df['${column}']`,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: `['${column}']`,
                range: range,
                documentation: `Access column: ${column}`
              });
            });
          }
        }

        return { suggestions };
      }
    });
  };

  const editorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on' as const,
    roundedSelection: false,
    scrollbar: {
      vertical: 'auto' as const,
      horizontal: 'auto' as const,
    },
    automaticLayout: true,
    tabSize: 4,
    wordWrap: 'on' as const,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    glyphMargin: false,
    folding: true,
    selectOnLineNumbers: true,
    selectionHighlight: false,
    cursorStyle: 'line' as const,
    cursorBlinking: 'smooth' as const,
    readOnly: isExecuting,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Python Script</span>
          {isExecuting && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600">Executing...</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExecute(code)}
            disabled={isExecuting || !code.trim()}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              isExecuting || !code.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isExecuting ? 'Running...' : 'Run (Ctrl+Enter)'}
          </button>
        </div>
      </div>

      <div className="flex-1 border rounded-b">
        <Editor
          height="100%"
          language="python"
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          value={code}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          options={editorOptions}
        />
      </div>
    </div>
  );
};

export default PythonEditor;