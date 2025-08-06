import React from 'react';
import { ControlPanel } from './ControlPanel';
import { useDashboard } from '../../hooks/useDashboard';

export const ControlPanelDemo: React.FC = () => {
  const { dashboardState, updateDashboardState, availableFilters, getFilterOptions } = useDashboard();

  const handleStateChange = (updates: Partial<typeof dashboardState>) => {
    updateDashboardState(updates);
    console.log('Dashboard state updated:', { ...dashboardState, ...updates });
  };

  // Convert available filters to control component format
  const availableOptions = {
    departments: getFilterOptions('departments').map(value => ({
      label: value === 'all' ? 'All Departments' : value.charAt(0).toUpperCase() + value.slice(1),
      value
    })),
    regions: getFilterOptions('regions').map(value => ({
      label: value === 'all' ? 'All Regions' : value.charAt(0).toUpperCase() + value.slice(1),
      value
    })),
    industries: getFilterOptions('industries').map(value => ({
      label: value === 'all' ? 'All Industries' : value.charAt(0).toUpperCase() + value.slice(1),
      value
    })),
    metrics: getFilterOptions('metrics').map(value => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' '),
      description: `${value} related metrics`
    }))
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Control Panel Demo
      </h1>

      {/* Current State Display */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Current Dashboard State:</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Time Range:</span> {dashboardState.selectedTimeRange}
          </div>
          <div>
            <span className="font-medium">Department:</span> {dashboardState.selectedDepartment}
          </div>
          <div>
            <span className="font-medium">Region:</span> {dashboardState.selectedRegion}
          </div>
          <div>
            <span className="font-medium">Industry:</span> {dashboardState.selectedIndustry}
          </div>
          <div>
            <span className="font-medium">Metric:</span> {dashboardState.selectedMetric}
          </div>
          <div>
            <span className="font-medium">Revenue Type:</span> {dashboardState.selectedRevenueType}
          </div>
        </div>
      </div>

      {/* Horizontal Layout */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Horizontal Layout</h2>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <ControlPanel
            state={dashboardState}
            onStateChange={handleStateChange}
            availableOptions={availableOptions}
            layout="horizontal"
          />
        </div>
      </div>

      {/* Vertical Layout */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Vertical Layout</h2>
        <div className="p-4 border border-gray-200 rounded-lg bg-white max-w-md">
          <ControlPanel
            state={dashboardState}
            onStateChange={handleStateChange}
            availableOptions={availableOptions}
            layout="vertical"
          />
        </div>
      </div>

      {/* Sidebar Layout */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Sidebar Layout</h2>
        <div className="flex">
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <ControlPanel
              state={dashboardState}
              onStateChange={handleStateChange}
              availableOptions={availableOptions}
              layout="sidebar"
            />
          </div>
          <div className="flex-1 p-4 ml-4 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-600">Main content area would go here...</p>
          </div>
        </div>
      </div>

      {/* Available Filter Options */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Available Filter Options:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Departments:</span>
            <ul className="list-disc list-inside mt-1">
              {availableFilters.departments.map(dept => (
                <li key={dept}>{dept}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-medium">Regions:</span>
            <ul className="list-disc list-inside mt-1">
              {availableFilters.regions.map(region => (
                <li key={region}>{region}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-medium">Industries:</span>
            <ul className="list-disc list-inside mt-1">
              {availableFilters.industries.map(industry => (
                <li key={industry}>{industry}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-medium">Time Ranges:</span>
            <ul className="list-disc list-inside mt-1">
              {availableFilters.timeRange.map(range => (
                <li key={range}>{range}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanelDemo;