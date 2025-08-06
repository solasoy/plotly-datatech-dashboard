import React, { useState, useCallback, useRef } from 'react';
import { ExcelDataImporter, WorksheetInfo, ExcelDatasets } from '../../utils/excelImport';

interface ExcelImportProps {
  onDataLoaded: (datasets: ExcelDatasets) => void;
  onError: (error: string) => void;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onDataLoaded, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [worksheets, setWorksheets] = useState<Map<string, WorksheetInfo>>(new Map());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showWorksheets, setShowWorksheets] = useState(false);

  const importerRef = useRef<ExcelDataImporter>(new ExcelDataImporter());

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
      onError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);
    setShowWorksheets(false);

    try {
      const worksheetMap = await importerRef.current.loadExcelFile(file);
      setWorksheets(worksheetMap);
      setShowWorksheets(true);
      
      console.log(`Loaded Excel file with ${worksheetMap.size} worksheets:`, 
        Array.from(worksheetMap.keys()));
      
    } catch (error) {
      console.error('Excel import error:', error);
      onError(`Failed to load Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const handleAutoImport = useCallback(async () => {
    if (!selectedFile) {
      onError('No file selected. Please select an Excel file first.');
      return;
    }

    if (worksheets.size === 0) {
      onError('No worksheets loaded. Please select and load an Excel file first.');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure the workbook is loaded by reprocessing the file if needed
      if (worksheets.size === 0) {
        console.log('Reloading Excel file...');
        await importerRef.current.loadExcelFile(selectedFile);
      }

      const datasets = await importerRef.current.loadAllDatasets();
      
      // Validate that we have some data
      const totalRecords = datasets.revenueData.length + 
                          datasets.customerData.length + 
                          datasets.performanceData.length + 
                          datasets.geographicData.length;
      
      if (totalRecords === 0) {
        onError('No recognizable data found in Excel file. Please check worksheet names and column headers. Expected sheets with names containing: "revenue", "customer", "performance", or "geographic".');
        return;
      }

      console.log('Successfully imported datasets:', {
        revenue: datasets.revenueData.length,
        customer: datasets.customerData.length,
        performance: datasets.performanceData.length,
        geographic: datasets.geographicData.length
      });

      onDataLoaded(datasets);
      
    } catch (error) {
      console.error('Auto import error:', error);
      onError(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, worksheets, onDataLoaded, onError]);

  const handleManualImport = useCallback(async (sheetName: string) => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      // Try to import just this one sheet as revenue data
      const revenueData = importerRef.current.getRevenueData(sheetName);
      
      const datasets: ExcelDatasets = {
        revenueData: revenueData,
        customerData: [],
        performanceData: [],
        geographicData: []
      };

      console.log(`Manual import from "${sheetName}":`, {
        revenue: revenueData.length,
        customer: 0,
        performance: 0,
        geographic: 0
      });

      onDataLoaded(datasets);
      
    } catch (error) {
      console.error('Manual import error:', error);
      onError(`Failed to import "${sheetName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, onDataLoaded, onError]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        📊 Import Excel Data
      </h2>

      {/* File Upload Section */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="excel-upload"
            disabled={isLoading}
          />
          <label
            htmlFor="excel-upload"
            className={`cursor-pointer ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-gray-600">Processing Excel file...</span>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-2">📁</div>
                <p className="text-lg font-medium text-gray-700">
                  {selectedFile ? 'File Selected' : 'Click to select Excel file'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports .xlsx and .xls files
                </p>
              </>
            )}
          </label>
        </div>

        {selectedFile && (
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">{selectedFile.name}</p>
                <p className="text-sm text-blue-700">
                  {formatFileSize(selectedFile.size)} • Modified: {selectedFile.lastModified ? new Date(selectedFile.lastModified).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setWorksheets(new Map());
                  setShowWorksheets(false);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Worksheets Preview */}
      {showWorksheets && worksheets.size > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Worksheets Found ({worksheets.size})</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Array.from(worksheets.entries()).map(([name, info]) => (
              <div key={name} className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{name}</h4>
                  <span className="text-sm text-gray-500">
                    {info.rowCount} rows × {info.columnCount} cols
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Columns:</span> {info.columns.join(', ')}
                </div>
                
                {info.preview.length > 0 && (
                  <div className="text-xs">
                    <span className="font-medium text-gray-700">Sample data:</span>
                    <div className="mt-1 bg-white rounded p-2 border">
                      {info.preview.slice(0, 2).map((row, idx) => (
                        <div key={idx} className="text-gray-600">
                          {Object.entries(row).slice(0, 3).map(([key, value]) => 
                            `${key}: ${value}`
                          ).join(' • ')}
                          {Object.keys(row).length > 3 && ' • ...'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auto Import Button */}
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Auto-Import Data</h4>
            <p className="text-sm text-green-700 mb-3">
              I'll automatically detect and import data from worksheets with names containing:
              <br />
              <span className="font-mono text-xs bg-green-100 px-1 rounded">
                "revenue", "customer", "performance", "geographic"
              </span>
            </p>
            <div className="space-y-2">
              <button
                onClick={handleAutoImport}
                disabled={isLoading || !selectedFile || worksheets.size === 0}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  isLoading || !selectedFile || worksheets.size === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isLoading ? 'Importing...' : 'Import Dashboard Data'}
              </button>
              
              <div className="text-xs text-gray-600">
                Status: File {selectedFile ? '✓' : '✗'} | Worksheets {worksheets.size > 0 ? '✓' : '✗'} ({worksheets.size})
              </div>
            </div>
            
            {/* Manual worksheet mapping option */}
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm font-medium text-green-800 mb-2">
                📝 Manual Import (if auto-detection fails)
              </p>
              <p className="text-xs text-green-700 mb-2">
                If your worksheets have different names, you can try importing each sheet individually:
              </p>
              <div className="space-y-1">
                {Array.from(worksheets.keys()).map(sheetName => (
                  <button
                    key={sheetName}
                    onClick={() => handleManualImport(sheetName)}
                    disabled={isLoading}
                    className="block w-full text-left px-2 py-1 text-xs bg-green-100 hover:bg-green-200 rounded border text-green-800 disabled:opacity-50"
                  >
                    Try importing "{sheetName}" as revenue data
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expected Data Format Help */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-2">💡 Expected Data Format</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Revenue Data:</span> month, subscription_revenue, usage_revenue, product_line, department, region</p>
          <p><span className="font-medium">Customer Data:</span> industry, region, customer_count, total_revenue, avg_monthly_spend, churn_rate</p>
          <p><span className="font-medium">Performance Data:</span> employee_id, name, department, performance_score, projects_completed, etc.</p>
          <p><span className="font-medium">Geographic Data:</span> country, country_code, latitude, longitude, quarterly revenue data</p>
        </div>
      </div>
    </div>
  );
};

export default ExcelImport;