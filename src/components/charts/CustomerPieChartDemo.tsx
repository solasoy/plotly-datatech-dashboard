import React, { useState, useCallback } from 'react';
import { CustomerPieChart } from './CustomerPieChart';
import { generateCustomerData } from '../../data/mockData';
import { CustomerData } from '../../types/dashboard.types';

export const CustomerPieChartDemo: React.FC = () => {
  // Generate demo data
  const [customerData] = useState<CustomerData[]>(() => generateCustomerData());
  
  // Chart state
  const [drillDownLevel, setDrillDownLevel] = useState<'industry' | 'region'>('industry');
  const [metricType, setMetricType] = useState<'customer_count' | 'revenue_share'>('customer_count');
  const [selectedIndustry, setSelectedIndustry] = useState<string | undefined>(undefined);
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);

  // Get unique values for filters
  const industries = Array.from(new Set(customerData.map(item => item.industry))).sort();

  // Handle chart interactions
  const handleChartInteraction = useCallback((data: any) => {
    if (data.metricType) {
      setMetricType(data.metricType);
    }
  }, []);

  // Handle drill-down
  const handleDrillDown = useCallback((level: 'industry' | 'region', value: string) => {
    if (level === 'region') {
      setSelectedIndustry(value);
      setDrillDownLevel('region');
    }
  }, []);

  // Reset to industry view
  const resetToIndustryView = useCallback(() => {
    setDrillDownLevel('industry');
    setSelectedIndustry(undefined);
    setSelectedRegion(undefined);
  }, []);

  // Calculate summary statistics
  const totalCustomers = customerData
    .filter(item => 
      (!selectedIndustry || item.industry === selectedIndustry) &&
      (!selectedRegion || item.region === selectedRegion)
    )
    .reduce((sum, item) => sum + item.customer_count, 0);

  const totalRevenue = customerData
    .filter(item => 
      (!selectedIndustry || item.industry === selectedIndustry) &&
      (!selectedRegion || item.region === selectedRegion)
    )
    .reduce((sum, item) => sum + item.total_revenue, 0);

  const avgMonthlySpend = customerData
    .filter(item => 
      (!selectedIndustry || item.industry === selectedIndustry) &&
      (!selectedRegion || item.region === selectedRegion)
    )
    .reduce((sum, item) => sum + (item.avg_monthly_spend * item.customer_count), 0) / totalCustomers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Pie Chart Demo</h1>
            <p className="text-gray-600 mt-1">
              Interactive donut chart with drill-down functionality and metric toggle
            </p>
          </div>
          
          {/* Breadcrumb navigation */}
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={resetToIndustryView}
              className={`px-3 py-1 rounded-md transition-colors ${
                drillDownLevel === 'industry'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              Industries
            </button>
            {drillDownLevel === 'region' && (
              <>
                <span className="text-gray-400">/</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded-md">
                  {selectedIndustry ? `${selectedIndustry} Regions` : 'All Regions'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Controls</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* View Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Level
            </label>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setDrillDownLevel('industry');
                  setSelectedIndustry(undefined);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  drillDownLevel === 'industry'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Industry
              </button>
              <button
                onClick={() => setDrillDownLevel('region')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  drillDownLevel === 'region'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Region
              </button>
            </div>
          </div>

          {/* Metric Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metric Type
            </label>
            <div className="space-x-2">
              <button
                onClick={() => setMetricType('customer_count')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  metricType === 'customer_count'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Customer Count
              </button>
              <button
                onClick={() => setMetricType('revenue_share')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  metricType === 'revenue_share'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Revenue Share
              </button>
            </div>
          </div>

          {/* Industry Filter (when in region view) */}
          {drillDownLevel === 'region' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Industry
              </label>
              <select
                value={selectedIndustry || ''}
                onChange={(e) => setSelectedIndustry(e.target.value || undefined)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm font-semibold">👥</span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Total Customers</div>
              <div className="text-2xl font-bold text-gray-900">
                {totalCustomers.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm font-semibold">💰</span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Total Revenue</div>
              <div className="text-2xl font-bold text-gray-900">
                ${(totalRevenue / 1000000).toFixed(1)}M
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm font-semibold">📊</span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Avg Monthly Spend</div>
              <div className="text-2xl font-bold text-gray-900">
                ${avgMonthlySpend.toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CustomerPieChart
          data={customerData}
          drillDownLevel={drillDownLevel}
          metricType={metricType}
          selectedIndustry={selectedIndustry}
          selectedRegion={selectedRegion}
          onChartInteraction={handleChartInteraction}
          onDrillDown={handleDrillDown}
          height={500}
          className=""
        />
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h4>
        <div className="space-y-2 text-blue-800">
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span><strong>Toggle Metrics:</strong> Switch between "Customer Count" and "Revenue Share" to see different perspectives</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span><strong>Drill Down:</strong> Click on any industry segment to drill down to regional view</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span><strong>Navigate:</strong> Use the breadcrumb navigation or "Industries" button to return to industry view</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <span><strong>Hover:</strong> Hover over chart segments to see detailed information</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPieChartDemo;