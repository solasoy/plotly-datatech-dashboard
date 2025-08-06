export interface PythonExecutionResult {
  dataFrame?: any[];
  variables?: Record<string, any>;
  success: boolean;
}

export interface PythonWorkerMessage {
  id: string;
  type: 'initialize' | 'execute' | 'installPackage';
  code?: string;
  data?: any;
  packageName?: string;
}

export interface PythonWorkerResponse {
  id: string;
  type: 'initialized' | 'result' | 'error' | 'output' | 'packageInstalled';
  result?: PythonExecutionResult | string;
  error?: string;
  output?: string;
}

export interface PythonEngineState {
  isInitialized: boolean;
  isExecuting: boolean;
  error: string | null;
  output: string[];
  installedPackages: string[];
}

export interface PythonScriptTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
  category: 'data-transformation' | 'analysis' | 'visualization' | 'custom';
  tags: string[];
}

export interface PythonEditorProps {
  code: string;
  onChange: (code: string) => void;
  onExecute: (code: string) => void;
  dataContext?: Record<string, any>;
  isExecuting?: boolean;
  theme?: 'light' | 'dark';
}

export interface PythonConsoleProps {
  output: string[];
  errors: string[];
  isExecuting: boolean;
  onClear?: () => void;
}

export interface DataPreviewProps {
  data: any[] | null;
  maxRows?: number;
  maxCols?: number;
}

export interface ModuleManagerProps {
  installedPackages: string[];
  onInstallPackage: (packageName: string) => void;
  isInstalling?: boolean;
}

export interface ScriptTemplatesProps {
  templates: PythonScriptTemplate[];
  onSelectTemplate: (template: PythonScriptTemplate) => void;
  onSaveScript: (name: string, description: string, code: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}