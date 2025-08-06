import { useState } from 'react';
import PythonPanel from './components/python/PythonPanel';
import ExcelImport from './components/data/ExcelImport';
import DataTables from './components/data/DataTables';
import { RevenueChartDemo } from './components/charts/RevenueChartDemo';
import { CustomerPieChartDemo } from './components/charts/CustomerPieChartDemo';
import { PerformanceScatterDemo } from './components/charts/PerformanceScatterDemo';
import { GeographicHeatmapDemo } from './components/charts/GeographicHeatmapDemo';
import { ControlPanelDemo } from './components/controls/ControlPanelDemo';
import { EnhancedStateDemo } from './components/controls/EnhancedStateDemo';
import { useDashboard } from './hooks/useDashboard';
import { ExcelDatasets } from './utils/excelImport';

function App() {
  const { 
    importState, 
    filteredData,
    loadData
  } = useDashboard();
  
  const [showPython, setShowPython] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'revenue-chart' | 'customer-pie' | 'performance-scatter' | 'geographic-heatmap' | 'controls' | 'state-management'>('dashboard');

  const handleDataLoaded = (excelData: ExcelDatasets) => {
    loadData(excelData);
    setShowImport(false);
    setImportError(null);
  };

  const handleImportError = (error: string) => {
    setImportError(error);
  };

  // Convert filtered data to format Python panel expects
  const pythonData = [...filteredData.revenue, ...filteredData.customer, 
                      ...filteredData.performance, ...filteredData.geographic];

  // Show Excel import modal overlay
  if (showImport) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Import Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Import Dashboard Data</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowImport(false)}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    ← Back to Dashboard
                  </button>
                  <button
                    onClick={() => setShowImport(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Error Display */}
              {importError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">Import Error:</p>
                  <p className="text-red-600 text-sm mt-1">{importError}</p>
                  <button 
                    onClick={() => setImportError(null)}
                    className="text-red-600 hover:text-red-800 text-sm underline mt-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              
              <ExcelImport 
                onDataLoaded={handleDataLoaded}
                onError={handleImportError}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Python split view
  if (showPython) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          {/* Dashboard Side */}
          <div className="w-1/2 border-r bg-gray-50 overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Data Tables</h2>
                <button
                  onClick={() => setShowPython(false)}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <DataTables datasets={filteredData} />
            </div>
          </div>

          {/* Python Panel Side */}
          <div className="w-1/2 bg-white">
            <PythonPanel
              dashboardData={importState.hasData ? pythonData : []}
              onDataUpdate={(newData) => {
                console.log('Python data updated:', newData);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Normal dashboard view - Simple layout for now
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DT</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">DataTech Dashboard</h1>
              {importState.hasData && (
                <div className="px-3 py-1 bg-green-50 rounded-full border border-green-200">
                  <span className="text-sm text-green-700 font-medium">
                    {(importState.recordCounts.revenue + importState.recordCounts.customer + 
                      importState.recordCounts.performance + importState.recordCounts.geographic).toLocaleString()} records loaded
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Navigation Tabs */}
              <div className="flex items-center space-x-1 mr-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('revenue-chart')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'revenue-chart'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📊 Revenue Chart
                </button>
                <button
                  onClick={() => setCurrentView('customer-pie')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'customer-pie'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🥧 Customer Pie
                </button>
                <button
                  onClick={() => setCurrentView('performance-scatter')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'performance-scatter'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📊 Performance
                </button>
                <button
                  onClick={() => setCurrentView('geographic-heatmap')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'geographic-heatmap'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🌍 Geographic
                </button>
                <button
                  onClick={() => setCurrentView('controls')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'controls'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🎛️ Controls
                </button>
                <button
                  onClick={() => setCurrentView('state-management')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'state-management'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🧠 State Demo
                </button>
              </div>
              
              <button
                onClick={() => setShowImport(true)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                📊 Import Data
              </button>
              <button
                onClick={() => setShowPython(true)}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                🐍 Python Engine
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Render different views based on currentView */}
        {currentView === 'revenue-chart' ? (
          <RevenueChartDemo />
        ) : currentView === 'customer-pie' ? (
          <CustomerPieChartDemo />
        ) : currentView === 'performance-scatter' ? (
          <PerformanceScatterDemo />
        ) : currentView === 'geographic-heatmap' ? (
          <GeographicHeatmapDemo />
        ) : currentView === 'controls' ? (
          <ControlPanelDemo />
        ) : currentView === 'state-management' ? (
          <EnhancedStateDemo />
        ) : !importState.hasData ? (
          // No data state
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to DataTech Dashboard
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Import your Excel data to begin exploring interactive visualizations. 
              Your dashboard will display revenue trends, customer analytics, 
              performance metrics, and geographic insights.
            </p>
            <button
              onClick={() => setShowImport(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              📁 Import Excel Data
            </button>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={() => setCurrentView('revenue-chart')}
                className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer group text-left"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💰</div>
                <h4 className="font-medium text-blue-900 group-hover:text-blue-700">Revenue Analytics</h4>
                <p className="text-sm text-blue-700 group-hover:text-blue-600">Track subscription & usage revenue</p>
                <p className="text-xs text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view demo →
                </p>
              </button>
              <button
                onClick={() => setCurrentView('customer-pie')}
                className="bg-green-50 p-4 rounded-lg border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-200 cursor-pointer group text-left"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                <h4 className="font-medium text-green-900 group-hover:text-green-700">Customer Insights</h4>
                <p className="text-sm text-green-700 group-hover:text-green-600">Industry & regional breakdown</p>
                <p className="text-xs text-green-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view demo →
                </p>
              </button>
              <button
                onClick={() => setCurrentView('performance-scatter')}
                className="bg-purple-50 p-4 rounded-lg border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all duration-200 cursor-pointer group text-left"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📈</div>
                <h4 className="font-medium text-purple-900 group-hover:text-purple-700">Performance Metrics</h4>
                <p className="text-sm text-purple-700 group-hover:text-purple-600">Employee & team analytics</p>
                <p className="text-xs text-purple-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view demo →
                </p>
              </button>
              <button
                onClick={() => setCurrentView('geographic-heatmap')}
                className="bg-orange-50 p-4 rounded-lg border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 cursor-pointer group text-left"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🌍</div>
                <h4 className="font-medium text-orange-900 group-hover:text-orange-700">Geographic Sales</h4>
                <p className="text-sm text-orange-700 group-hover:text-orange-600">Global revenue distribution</p>
                <p className="text-xs text-orange-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view demo →
                </p>
              </button>
            </div>
          </div>
        ) : (
          // Dashboard with data
          <div className="space-y-6">
            {/* Dashboard Stats Header */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                  <p className="text-gray-600 mt-1">
                    {(importState.recordCounts.revenue + importState.recordCounts.customer + 
                      importState.recordCounts.performance + importState.recordCounts.geographic).toLocaleString()} total records • Last updated: {importState.lastImported?.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Revenue: {importState.recordCounts.revenue}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Customers: {importState.recordCounts.customer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">Performance: {importState.recordCounts.performance}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600">Geographic: {importState.recordCounts.geographic}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2x2 Chart Grid - Clickable Tiles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trends Tile */}
              <button
                onClick={() => setCurrentView('revenue-chart')}
                className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 text-left hover:shadow-xl hover:scale-105 transform transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">Revenue Trends</h3>
                  <span className="text-2xl group-hover:scale-110 transition-transform">💰</span>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <div className="text-center">
                    <div className="text-4xl mb-2 opacity-50 group-hover:opacity-70 transition-opacity">💰</div>
                    <p className="text-gray-500 text-sm group-hover:text-blue-600">Monthly revenue by subscription & usage</p>
                    <p className="text-gray-400 text-xs mt-1 group-hover:text-blue-500">Click to view interactive chart</p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 group-hover:text-blue-600 transition-colors flex items-center">
                  <span>📊 Interactive Revenue Chart</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
              
              {/* Customer Distribution Tile */}
              <button
                onClick={() => setCurrentView('customer-pie')}
                className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 text-left hover:shadow-xl hover:scale-105 transform transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600">Customer Distribution</h3>
                  <span className="text-2xl group-hover:scale-110 transition-transform">👥</span>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-green-50 transition-colors">
                  <div className="text-center">
                    <div className="text-4xl mb-2 opacity-50 group-hover:opacity-70 transition-opacity">👥</div>
                    <p className="text-gray-500 text-sm group-hover:text-green-600">Customer segments by industry & region</p>
                    <p className="text-gray-400 text-xs mt-1 group-hover:text-green-500">Click to view interactive chart</p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 group-hover:text-green-600 transition-colors flex items-center">
                  <span>🥧 Interactive Pie Chart with Drill-down</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
              
              {/* Performance Analytics Tile */}
              <button
                onClick={() => setCurrentView('performance-scatter')}
                className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500 text-left hover:shadow-xl hover:scale-105 transform transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600">Performance Analytics</h3>
                  <span className="text-2xl group-hover:scale-110 transition-transform">📈</span>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                  <div className="text-center">
                    <div className="text-4xl mb-2 opacity-50 group-hover:opacity-70 transition-opacity">📈</div>
                    <p className="text-gray-500 text-sm group-hover:text-purple-600">Employee performance correlation analysis</p>
                    <p className="text-gray-400 text-xs mt-1 group-hover:text-purple-500">Click to view interactive chart</p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 group-hover:text-purple-600 transition-colors flex items-center">
                  <span>📊 Interactive Scatter Plot with Bubble Size</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
              
              {/* Geographic Revenue Tile */}
              <button
                onClick={() => setCurrentView('geographic-heatmap')}
                className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500 text-left hover:shadow-xl hover:scale-105 transform transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600">Geographic Revenue</h3>
                  <span className="text-2xl group-hover:scale-110 transition-transform">🌍</span>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                  <div className="text-center">
                    <div className="text-4xl mb-2 opacity-50 group-hover:opacity-70 transition-opacity">🌍</div>
                    <p className="text-gray-500 text-sm group-hover:text-orange-600">Global sales heat map with growth rates</p>
                    <p className="text-gray-400 text-xs mt-1 group-hover:text-orange-500">Click to view interactive chart</p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 group-hover:text-orange-600 transition-colors flex items-center">
                  <span>🌍 Interactive World Map with Animation</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            </div>

            {/* Data Actions Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Data Actions</h3>
                  <p className="text-gray-600 text-sm">Analyze and transform your dashboard data</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowPython(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    🐍 Open Python Analysis
                  </button>
                  <button 
                    onClick={() => setShowPython(true)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    📊 View Data Tables
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App