import React from 'react';
import { ChartBarIcon, CurrencyDollarIcon, BoltIcon } from '@heroicons/react/24/outline';
import { PresentationChartLineIcon } from '@heroicons/react/24/outline';

export interface RevenueChartControlsProps {
  chartType: 'bar' | 'line';
  revenueType: 'subscription' | 'usage' | 'both';
  onChartTypeChange: (type: 'bar' | 'line') => void;
  onRevenueTypeChange: (type: 'subscription' | 'usage' | 'both') => void;
  className?: string;
}

export const RevenueChartControls: React.FC<RevenueChartControlsProps> = ({
  chartType,
  revenueType,
  onChartTypeChange,
  onRevenueTypeChange,
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {/* Chart Type Toggle */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Chart Type:</label>
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => onChartTypeChange('bar')}
            className={`px-3 py-2 text-xs font-medium rounded-l-md border border-r-0 flex items-center space-x-1 transition-colors duration-200 ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>Bar</span>
          </button>
          <button
            onClick={() => onChartTypeChange('line')}
            className={`px-3 py-2 text-xs font-medium rounded-r-md border flex items-center space-x-1 transition-colors duration-200 ${
              chartType === 'line'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <PresentationChartLineIcon className="h-4 w-4" />
            <span>Line</span>
          </button>
        </div>
      </div>

      {/* Revenue Type Toggle */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Revenue Type:</label>
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => onRevenueTypeChange('subscription')}
            className={`px-3 py-2 text-xs font-medium rounded-l-md border border-r-0 flex items-center space-x-1 transition-colors duration-200 ${
              revenueType === 'subscription'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <CurrencyDollarIcon className="h-4 w-4" />
            <span>Subscription</span>
          </button>
          <button
            onClick={() => onRevenueTypeChange('usage')}
            className={`px-3 py-2 text-xs font-medium border border-r-0 flex items-center space-x-1 transition-colors duration-200 ${
              revenueType === 'usage'
                ? 'bg-cyan-600 text-white border-cyan-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <BoltIcon className="h-4 w-4" />
            <span>Usage</span>
          </button>
          <button
            onClick={() => onRevenueTypeChange('both')}
            className={`px-3 py-2 text-xs font-medium rounded-r-md border flex items-center space-x-1 transition-colors duration-200 ${
              revenueType === 'both'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex">
              <CurrencyDollarIcon className="h-4 w-4" />
              <BoltIcon className="h-4 w-4 -ml-1" />
            </div>
            <span>Both</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center space-x-4 text-xs text-gray-500 border-l border-gray-200 pl-4">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-emerald-500 rounded"></div>
          <span>Subscription</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-cyan-500 rounded"></div>
          <span>Usage</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChartControls;