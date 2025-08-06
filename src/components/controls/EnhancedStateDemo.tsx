import React, { useEffect, useState } from 'react';
import { ControlPanel } from './ControlPanel';
import { useDashboard } from '../../hooks/useDashboard';
import { useChartCallbacks } from '../../hooks/useChartCallbacks';

export const EnhancedStateDemo: React.FC = () => {
  const dashboard = useDashboard();
  const chartCallbacks = useChartCallbacks('demo-chart');
  const [callbackLog, setCallbackLog] = useState<string[]>([]);

  // Register a callback to log all state changes
  useEffect(() => {
    const logCallback = (newState: any, prevState: any) => {
      const timestamp = new Date().toLocaleTimeString();
      const changes = Object.keys(newState).filter(
        key => newState[key] !== prevState[key]
      );
      
      if (changes.length > 0) {
        setCallbackLog(prev => [
          `[${timestamp}] State changed: ${changes.join(', ')}`,
          ...prev.slice(0, 9) // Keep only last 10 logs
        ]);
      }
    };

    dashboard.registerCallback('demo-logger', logCallback);

    return () => {
      dashboard.unregisterCallback('demo-logger');
    };
  }, [dashboard]);

  const handleStateChange = (updates: Partial<typeof dashboard.dashboardState>) => {
    dashboard.updateDashboardState(updates, 'enhanced-state-demo');
  };

  const handleSaveState = () => {
    const name = `demo_${Date.now()}`;
    dashboard.saveState(name);
    alert(`State saved as: ${name}`);
  };

  const handleLoadState = (stateName: string) => {
    const success = dashboard.loadState(stateName);
    if (success) {
      alert(`State "${stateName}" loaded successfully`);
    } else {
      alert(`Failed to load state "${stateName}"`);
    }
  };

  const simulateChartClick = () => {
    chartCallbacks.handleChartInteraction({
      chartId: 'demo-chart',
      type: 'click',
      data: { department: 'engineering', value: 1000 }
    });
  };

  const simulateChartFilter = () => {
    chartCallbacks.handleChartInteraction({
      chartId: 'demo-chart',
      type: 'filter',
      data: {
        filterField: 'region',
        filterValue: 'north_america',
        targetCharts: ['revenue-chart', 'customer-chart']
      }
    });
  };

  // Convert available filters to control component format
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
        Enhanced State Management Demo
      </h1>

      {/* Control Panel */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Interactive Controls</h2>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <ControlPanel
            state={dashboard.dashboardState}
            onStateChange={handleStateChange}
            availableOptions={availableOptions}
            layout="horizontal"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current State Display */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Current Dashboard State</h2>
          <div className="space-y-2 text-sm font-mono">
            <div><span className="font-bold">Time Range:</span> {dashboard.dashboardState.selectedTimeRange}</div>
            <div><span className="font-bold">Department:</span> {dashboard.dashboardState.selectedDepartment}</div>
            <div><span className="font-bold">Region:</span> {dashboard.dashboardState.selectedRegion}</div>
            <div><span className="font-bold">Industry:</span> {dashboard.dashboardState.selectedIndustry}</div>
            <div><span className="font-bold">Metric:</span> {dashboard.dashboardState.selectedMetric}</div>
            <div><span className="font-bold">Revenue Type:</span> {dashboard.dashboardState.selectedRevenueType}</div>
          </div>
        </div>

        {/* State History Controls */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">State History & Actions</h2>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <button
                onClick={dashboard.undo}
                disabled={!dashboard.canUndo}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Undo
              </button>
              <button
                onClick={dashboard.redo}
                disabled={!dashboard.canRedo}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Redo
              </button>
              <button
                onClick={dashboard.resetToDefault}
                className="px-3 py-1 text-sm bg-red-100 border border-red-300 rounded hover:bg-red-200 text-red-800"
              >
                Reset
              </button>
            </div>
            <div>
              <span className="text-sm font-medium">History: </span>
              <span className="text-sm">{dashboard.getStateHistory().length} transactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* State Persistence */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">State Persistence</h2>
        <div className="flex space-x-3 mb-3">
          <button
            onClick={handleSaveState}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Current State
          </button>
          <div className="text-sm">
            <span className="font-medium">Saved States: </span>
            {dashboard.getSavedStates().length === 0 ? (
              <span className="text-gray-500">None</span>
            ) : (
              <div className="mt-1 space-x-2">
                {dashboard.getSavedStates().map(stateName => (
                  <button
                    key={stateName}
                    onClick={() => handleLoadState(stateName)}
                    className="px-2 py-1 text-xs bg-green-100 border border-green-300 rounded hover:bg-green-200"
                  >
                    Load "{stateName.replace('demo_', '')}"
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Interaction Simulation */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Chart Interaction Simulation</h2>
        <div className="space-y-3">
          <div className="flex space-x-3">
            <button
              onClick={simulateChartClick}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Simulate Chart Click (Engineering)
            </button>
            <button
              onClick={simulateChartFilter}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Simulate Chart Filter (North America)
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Try clicking these buttons to see how chart interactions affect the dashboard state.
          </div>
        </div>
      </div>

      {/* Callback Log */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">State Change Log</h2>
        <div className="bg-white border rounded p-3 max-h-48 overflow-y-auto">
          {callbackLog.length === 0 ? (
            <div className="text-gray-500 text-sm">No state changes yet...</div>
          ) : (
            <div className="space-y-1">
              {callbackLog.map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-700">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Dependencies Info */}
      <div className="mt-6 p-4 bg-orange-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Filter Dependencies</h2>
        <div className="text-sm space-y-2">
          <div>
            <span className="font-medium">Region → Industry:</span> 
            <span className="ml-2 text-gray-600">Changing region resets industry filter</span>
          </div>
          <div>
            <span className="font-medium">Department → Metric:</span> 
            <span className="ml-2 text-gray-600">Changing department resets metric to default</span>
          </div>
          <div className="text-xs text-orange-700 mt-2">
            Try changing the region or department above to see the dependencies in action.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStateDemo;