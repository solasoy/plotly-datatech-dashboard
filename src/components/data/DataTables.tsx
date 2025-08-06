import React, { useState } from 'react';
import DataTable from './DataTable';
import { DashboardDatasets } from '../../types/dashboard.types';

interface DataTablesProps {
  datasets: DashboardDatasets;
}

const DataTables: React.FC<DataTablesProps> = ({ datasets }) => {
  const [activeTab, setActiveTab] = useState('revenue');

  const tabs = [
    {
      id: 'revenue',
      name: 'Revenue Data',
      icon: '💰',
      data: datasets.revenue,
      count: datasets.revenue.length,
      color: 'blue'
    },
    {
      id: 'customer',
      name: 'Customer Data',
      icon: '👥',
      data: datasets.customer,
      count: datasets.customer.length,
      color: 'green'
    },
    {
      id: 'performance',
      name: 'Performance Data',
      icon: '📊',
      data: datasets.performance,
      count: datasets.performance.length,
      color: 'purple'
    },
    {
      id: 'geographic',
      name: 'Geographic Data',
      icon: '🌍',
      data: datasets.geographic,
      count: datasets.geographic.length,
      color: 'orange'
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const getTabClasses = (tabId: string, color: string) => {
    const isActive = activeTab === tabId;
    const baseClasses = "flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer";
    
    if (isActive) {
      const colorClasses = {
        blue: 'bg-blue-100 text-blue-800 border-2 border-blue-300',
        green: 'bg-green-100 text-green-800 border-2 border-green-300',
        purple: 'bg-purple-100 text-purple-800 border-2 border-purple-300',
        orange: 'bg-orange-100 text-orange-800 border-2 border-orange-300'
      };
      return `${baseClasses} ${colorClasses[color as keyof typeof colorClasses]}`;
    } else {
      return `${baseClasses} bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200 hover:text-gray-800`;
    }
  };

  const totalRecords = datasets.revenue.length + datasets.customer.length + 
                      datasets.performance.length + datasets.geographic.length;

  if (totalRecords === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Import some Excel data to view tables here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Data Tables</h2>
          <div className="text-sm text-gray-600">
            {totalRecords.toLocaleString()} total records across {tabs.filter(t => t.count > 0).length} datasets
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={getTabClasses(tab.id, tab.color)}
              disabled={tab.count === 0}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                tab.count === 0 
                  ? 'bg-gray-200 text-gray-500' 
                  : activeTab === tab.id
                    ? 'bg-white bg-opacity-70 text-current'
                    : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count.toLocaleString()}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Description */}
        {activeTabData && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              {activeTabData.id === 'revenue' && 'Monthly revenue data broken down by subscription and usage revenue across different product lines, departments, and regions.'}
              {activeTabData.id === 'customer' && 'Customer segmentation data showing customer counts, revenue metrics, and churn rates by industry and region.'}
              {activeTabData.id === 'performance' && 'Employee performance metrics including performance scores, projects completed, team management, and satisfaction ratings.'}
              {activeTabData.id === 'geographic' && 'Geographic revenue distribution with quarterly data, customer counts, and growth rates by country.'}
            </p>
          </div>
        )}
      </div>

      {/* Active Data Table */}
      {activeTabData && activeTabData.count > 0 && (
        <DataTable
          data={activeTabData.data}
          title={`${activeTabData.name} (${activeTabData.count.toLocaleString()} records)`}
          searchable={true}
          sortable={true}
          exportable={true}
        />
      )}

      {/* Empty State for Active Tab */}
      {activeTabData && activeTabData.count === 0 && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <div className="text-4xl mb-3">{activeTabData.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTabData.name}</h3>
            <p className="text-gray-600">
              No data found for this dataset. Check your Excel file to ensure it contains 
              a worksheet with {activeTabData.id} data.
            </p>
          </div>
        </div>
      )}

      {/* Data Summary Footer */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {tabs.map(tab => (
            <div key={tab.id} className="space-y-1">
              <div className="text-2xl">{tab.icon}</div>
              <div className="font-semibold text-gray-900">{tab.count.toLocaleString()}</div>
              <div className="text-xs text-gray-600">{tab.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataTables;