import React, { useState, useCallback } from 'react';
import PythonEditor from './PythonEditor';
import PythonConsole from './PythonConsole';
import DataPreview from './DataPreview';
import ScriptTemplates from './ScriptTemplates';
import { usePython } from '../../hooks/usePython';
import { PythonScriptTemplate } from '../../types/python.types';
import { PYTHON_SCRIPT_TEMPLATES } from '../../lib/scriptTemplates';

interface PythonPanelProps {
  dashboardData?: any[];
  onDataUpdate?: (newData: any[]) => void;
}

const PythonPanel: React.FC<PythonPanelProps> = ({
  dashboardData,
  onDataUpdate
}) => {
  const { state, executeScript, clearOutput } = usePython();
  const [currentCode, setCurrentCode] = useState(`# Python script for dashboard data transformation
# The dashboard data is available as 'df' (pandas DataFrame)

print("Dashboard data loaded!")
print(f"Shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print("\\nFirst 5 rows:")
print(df.head())
`);
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'console' | 'preview'>('editor');
  const [lastResult, setLastResult] = useState<any[] | null>(null);
  const [templates, setTemplates] = useState<PythonScriptTemplate[]>(PYTHON_SCRIPT_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleExecuteScript = useCallback(async (code: string) => {
    try {
      const { result, output } = await executeScript(code, dashboardData);
      
      if (result.dataFrame) {
        setLastResult(result.dataFrame);
        onDataUpdate?.(result.dataFrame);
        setActiveTab('preview'); // Switch to preview tab to show results
      } else if (output) {
        setActiveTab('console'); // Switch to console if there's output but no DataFrame
      }
    } catch (error) {
      console.error('Script execution failed:', error);
      setActiveTab('console'); // Switch to console to show error
    }
  }, [executeScript, dashboardData, onDataUpdate]);

  const handleSelectTemplate = useCallback((template: PythonScriptTemplate) => {
    setCurrentCode(template.code);
    setActiveTab('editor');
  }, []);

  const handleSaveScript = useCallback((name: string, description: string, code: string) => {
    const newTemplate: PythonScriptTemplate = {
      id: `custom-${Date.now()}`,
      name,
      description,
      code,
      category: 'custom',
      tags: ['custom', 'user-created']
    };
    
    setTemplates(prev => [...prev, newTemplate]);
  }, []);

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'editor': return '📝';
      case 'templates': return '📋';
      case 'console': return '💻';
      case 'preview': return '📊';
      default: return '';
    }
  };

  const getTabBadge = (tab: string) => {
    switch (tab) {
      case 'console':
        return state.output.length > 0 || state.error ? state.output.length + (state.error ? 1 : 0) : null;
      case 'preview':
        return lastResult?.length || null;
      default:
        return null;
    }
  };

  if (!state.isInitialized && !state.error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Python environment...</p>
          <p className="text-sm text-gray-500 mt-1">Loading Pyodide and data science packages</p>
        </div>
      </div>
    );
  }

  if (state.error && !state.isInitialized) {
    return (
      <div className="h-full flex items-center justify-center bg-red-50">
        <div className="text-center p-6">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-700 font-medium mb-2">Failed to initialize Python environment</p>
          <p className="text-red-600 text-sm">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          🐍 Python Script Engine
        </h2>
        <div className="flex items-center space-x-2">
          {state.isExecuting && (
            <div className="flex items-center space-x-1 text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm">Running...</span>
            </div>
          )}
          <div className="text-sm text-gray-500">
            {dashboardData?.length || 0} rows loaded
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        {[
          { id: 'editor', label: 'Script Editor' },
          { id: 'templates', label: 'Templates' },
          { id: 'console', label: 'Console' },
          { id: 'preview', label: 'Data Preview' }
        ].map(tab => {
          const badge = getTabBadge(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center space-x-1">
                <span>{getTabIcon(tab.id)}</span>
                <span>{tab.label}</span>
                {badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'editor' && (
          <PythonEditor
            code={currentCode}
            onChange={setCurrentCode}
            onExecute={handleExecuteScript}
            dataContext={{ dashboardData }}
            isExecuting={state.isExecuting}
          />
        )}

        {activeTab === 'templates' && (
          <ScriptTemplates
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onSaveScript={handleSaveScript}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        )}

        {activeTab === 'console' && (
          <PythonConsole
            output={state.output}
            errors={state.error ? [state.error] : []}
            isExecuting={state.isExecuting}
            onClear={clearOutput}
          />
        )}

        {activeTab === 'preview' && (
          <DataPreview
            data={lastResult}
            maxRows={100}
            maxCols={10}
          />
        )}
      </div>
    </div>
  );
};

export default PythonPanel;