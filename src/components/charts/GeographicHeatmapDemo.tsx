import React, { useState, useCallback } from 'react';
import { GeographicHeatmap, GEOGRAPHIC_METRICS, TIME_PERIODS } from './GeographicHeatmap';
import { generateGeographicData } from '../../data/mockData';
import { GeographicData } from '../../types/dashboard.types';

export const GeographicHeatmapDemo: React.FC = () => {
  // Generate demo data
  const [geographicData] = useState<GeographicData[]>(() => generateGeographicData());
  
  // Chart state
  const [selectedMetric, setSelectedMetric] = useState<string>('customer_count');
  const [timePeriod, setTimePeriod] = useState<string>('Current');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'revenue' | 'customers' | 'growth'>('customers');

  // Get unique values for filters
  const countries = Array.from(new Set(geographicData.map(item => item.country))).sort();
  
  // Handle chart interactions
  const handleChartInteraction = useCallback((data: any) => {
    if (data.country) {
      console.log('Country clicked:', data.country);
    }
  }, []);

  // Handle metric changes based on view mode
  const handleViewModeChange = useCallback((mode: 'revenue' | 'customers' | 'growth') => {
    setViewMode(mode);
    
    switch (mode) {
      case 'revenue':
        setSelectedMetric('q4_2023_revenue');
        setTimePeriod('Q4 2023');
        break;
      case 'customers':
        setSelectedMetric('customer_count');
        setTimePeriod('Current');
        break;
      case 'growth':
        setSelectedMetric('growth_rate');
        setTimePeriod('YoY');
        break;
    }
  }, []);

  // Handle country filter changes
  const handleCountryToggle = useCallback((country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedCountries([]);
  }, []);

  // Calculate summary statistics
  const filteredData = selectedCountries.length > 0
    ? geographicData.filter(item => selectedCountries.includes(item.country))
    : geographicData;

  const currentMetric = GEOGRAPHIC_METRICS.find(m => m.key === selectedMetric);
  const totalRevenue = filteredData.reduce((sum, item) => 
    sum + item.q1_2023_revenue + item.q2_2023_revenue + item.q3_2023_revenue + item.q4_2023_revenue, 0
  );
  const totalCustomers = filteredData.reduce((sum, item) => sum + item.customer_count, 0);
  const avgGrowthRate = filteredData.reduce((sum, item) => sum + item.growth_rate, 0) / filteredData.length;
  const topCountry = filteredData.length > 0 
    ? filteredData.reduce((prev, current) => 
        (current as any)[selectedMetric] > (prev as any)[selectedMetric] ? current : prev
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Geographic Heatmap Demo</h1>
            <p className="text-gray-600 mt-1">
              Interactive world map visualization with quarterly revenue, customer data, and growth metrics
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">View Mode</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleViewModeChange('revenue')}
            className={`p-4 rounded-lg border-2 transition-all ${
              viewMode === 'revenue'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold text-gray-900">Revenue Analysis</div>
              <div className="text-sm text-gray-600 mt-1">
                Quarterly revenue distribution with animation
              </div>
            </div>
          </button>

          <button
            onClick={() => handleViewModeChange('customers')}
            className={`p-4 rounded-lg border-2 transition-all ${
              viewMode === 'customers'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold text-gray-900">Customer Distribution</div>
              <div className="text-sm text-gray-600 mt-1">
                Customer count by country
              </div>
            </div>
          </button>

          <button
            onClick={() => handleViewModeChange('growth')}
            className={`p-4 rounded-lg border-2 transition-all ${
              viewMode === 'growth'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-gray-900">Growth Analysis</div>
              <div className="text-sm text-gray-600 mt-1">
                Year-over-year growth rates
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Detailed Controls */}
      {viewMode === 'revenue' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Controls</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Metric Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenue Metric
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {GEOGRAPHIC_METRICS.filter(m => m.key.includes('revenue')).map(metric => (
                  <option key={metric.key} value={metric.key}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {TIME_PERIODS.map(period => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Country Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Country Filters</h3>
        
        <div className="flex flex-wrap gap-2">
          {countries.slice(0, 10).map(country => {
            const countryData = geographicData.find(item => item.country === country);
            return (
              <button
                key={country}
                onClick={() => handleCountryToggle(country)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedCountries.includes(country)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {country}
                <span className="ml-2 text-xs opacity-75">
                  ({countryData ? countryData.customer_count.toLocaleString() : '0'})
                </span>
              </button>
            );
          })}
          {countries.length > 10 && (
            <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
              +{countries.length - 10} more countries
            </div>
          )}
        </div>
        
        {selectedCountries.length > 0 && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} countries selected
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm font-semibold">📈</span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Avg Growth Rate</div>
              <div className="text-2xl font-bold text-gray-900">
                {(avgGrowthRate * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {topCountry && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-sm font-semibold">🏆</span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500">Top Country</div>
                <div className="text-lg font-bold text-gray-900">
                  {topCountry.country}
                </div>
                <div className="text-xs text-gray-500">
                  {(currentMetric?.format === '.1%' 
                    ? ((topCountry as any)[selectedMetric] * 100).toFixed(1) + '%'
                    : ((topCountry as any)[selectedMetric] / 1000000).toFixed(1) + 'M'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <GeographicHeatmap
          data={geographicData}
          selectedMetric={selectedMetric}
          timePeriod={timePeriod}
          selectedCountries={selectedCountries}
          onChartInteraction={handleChartInteraction}
          height={600}
          className=""
        />
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h4>
        <div className="space-y-2 text-blue-800">
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span><strong>Choose View Mode:</strong> Select between Revenue Analysis, Customer Distribution, or Growth Analysis</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span><strong>Explore the Map:</strong> Click and drag to pan, hover over countries for details</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span><strong>Animate Revenue:</strong> In Revenue mode, click "Animate Quarters" to see quarterly progression</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <span><strong>Filter Countries:</strong> Use country filters to focus on specific regions</span>
          </div>
        </div>
      </div>

      {/* Geographic Insights */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">🌍 Geographic Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div>
            <strong>Market Coverage:</strong> Operating in {countries.length} countries worldwide with 
            diverse revenue distribution across major markets.
          </div>
          <div>
            <strong>Growth Patterns:</strong> Average growth rate of {(avgGrowthRate * 100).toFixed(1)}% 
            indicates strong market expansion potential.
          </div>
          <div>
            <strong>Customer Concentration:</strong> Total customer base of {totalCustomers.toLocaleString()} 
            distributed across global markets with varying densities.
          </div>
          <div>
            <strong>Revenue Performance:</strong> Combined annual revenue of ${(totalRevenue / 1000000).toFixed(1)}M 
            demonstrates strong international presence.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeographicHeatmapDemo;