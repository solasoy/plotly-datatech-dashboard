import React, { useState } from 'react';
import { RevenueChart } from './RevenueChart';
import { RevenueChartControls } from './RevenueChartControls';
import { ControlPanel } from '../controls/ControlPanel';
import { useDashboard } from '../../hooks/useDashboard';
import { mockDatasets } from '../../data/mockData';

export const RevenueChartDemo: React.FC = () => {
  const dashboard = useDashboard();
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [revenueType, setRevenueType] = useState<'subscription' | 'usage' | 'both'>('both');
  const [interactionLog, setInteractionLog] = useState<string[]>([]);

  const handleStateChange = (updates: Partial<typeof dashboard.dashboardState>) => {
    dashboard.updateDashboardState(updates, 'revenue-chart-demo');
  };

  const handleChartInteraction = (data: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] Chart clicked: ${data.month} - ${data.revenueType} revenue: $${data.value?.toLocaleString() || 'N/A'}`;
    setInteractionLog(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 interactions
  };

  // Convert dashboard filters to control component format
  const availableOptions = {
    departments: dashboard.getFilterOptions('departments').map(value => ({
      label: value === 'all' ? 'All Departments' : value.charAt(0).toUpperCase() + value.slice(1),
      value
    })),
    regions: dashboard.getFilterOptions('regions').map(value => ({
      label: value === 'all' ? 'All Regions' : value.charAt(0).toUpperCase() + value.slice(1),
      value
    })),
    industries: dashboard.getFilterOptions('industries').map(value => ({
      label: value === 'all' ? 'All Industries' : value.charAt(0).toUpperCase() + value.slice(1),
      value
    })),
    metrics: dashboard.getFilterOptions('metrics').map(value => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' '),
      description: `${value} related metrics`
    }))
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Revenue Chart Demo
      </h1>

      {/* Dashboard Controls */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Dashboard Controls</h2>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <ControlPanel
            state={dashboard.dashboardState}
            onStateChange={handleStateChange}
            availableOptions={availableOptions}
            layout="horizontal"
          />
        </div>
      </div>

      {/* Chart Controls */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Chart Controls</h2>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <RevenueChartControls
            chartType={chartType}
            revenueType={revenueType}
            onChartTypeChange={setChartType}
            onRevenueTypeChange={setRevenueType}
          />
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="mb-6">
        <RevenueChart
          data={mockDatasets.revenue}
          timeRange={dashboard.dashboardState.selectedTimeRange}
          revenueType={revenueType}
          selectedDepartment={dashboard.dashboardState.selectedDepartment}
          selectedRegion={dashboard.dashboardState.selectedRegion}
          chartType={chartType}
          onChartInteraction={handleChartInteraction}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current State Display */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Current Configuration</h2>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Time Range:</span>
                <span className="ml-2 text-gray-900">{dashboard.dashboardState.selectedTimeRange}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Chart Type:</span>
                <span className="ml-2 text-gray-900 capitalize">{chartType}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Revenue Type:</span>
                <span className="ml-2 text-gray-900 capitalize">{revenueType}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Department:</span>
                <span className="ml-2 text-gray-900">{dashboard.dashboardState.selectedDepartment}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Region:</span>
                <span className="ml-2 text-gray-900">{dashboard.dashboardState.selectedRegion}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Data Points:</span>
                <span className="ml-2 text-gray-900">{mockDatasets.revenue.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Interactions Log */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Chart Interactions</h2>
          <div className="bg-white border rounded p-3 max-h-48 overflow-y-auto">
            {interactionLog.length === 0 ? (
              <div className="text-gray-500 text-sm">No interactions yet. Click on chart elements to see interactions.</div>
            ) : (
              <div className="space-y-1">
                {interactionLog.map((log, index) => (
                  <div key={index} className="text-xs font-mono text-gray-700 border-b border-gray-100 pb-1">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3 text-xs text-blue-700">
            💡 Tip: Click on chart bars/lines to trigger interactions
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Data Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {mockDatasets.revenue.length.toLocaleString()}
            </div>
            <div className="text-gray-600">Total Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {new Set(mockDatasets.revenue.map(d => d.department)).size}
            </div>
            <div className="text-gray-600">Departments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {new Set(mockDatasets.revenue.map(d => d.region)).size}
            </div>
            <div className="text-gray-600">Regions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {new Set(mockDatasets.revenue.map(d => d.month)).size}
            </div>
            <div className="text-gray-600">Months</div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Features Demonstrated</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium">Interactive Plotly.js Chart</div>
              <div className="text-gray-600">Bar and line chart with hover tooltips</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium">State Integration</div>
              <div className="text-gray-600">Synced with dashboard state management</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium">Dynamic Filtering</div>
              <div className="text-gray-600">Department and region filtering</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium">Time Range Selection</div>
              <div className="text-gray-600">6M, 1Y, 2Y, All Time options</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium">Revenue Type Toggle</div>
              <div className="text-gray-600">Subscription, usage, or both</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium">Responsive Design</div>
              <div className="text-gray-600">Auto-resizes with container</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChartDemo;