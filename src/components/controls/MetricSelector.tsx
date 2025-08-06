import React from 'react';

export interface MetricOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface MetricSelectorProps {
  selectedMetric: string;
  availableMetrics: MetricOption[];
  onMetricChange: (metric: string) => void;
  layout?: 'buttons' | 'tabs' | 'grid';
  className?: string;
  disabled?: boolean;
}

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  selectedMetric,
  availableMetrics,
  onMetricChange,
  layout = 'buttons',
  className = '',
  disabled = false
}) => {
  const handleMetricSelect = (metric: string) => {
    if (!disabled && metric !== selectedMetric) {
      onMetricChange(metric);
    }
  };

  const renderButtons = () => (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {availableMetrics.map((metric) => (
        <button
          key={metric.value}
          type="button"
          onClick={() => handleMetricSelect(metric.value)}
          disabled={disabled}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            selectedMetric === metric.value
              ? 'bg-blue-600 text-white shadow-md'
              : disabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            {metric.icon && <span className="w-4 h-4">{metric.icon}</span>}
            <span>{metric.label}</span>
          </div>
        </button>
      ))}
    </div>
  );

  const renderTabs = () => (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8">
        {availableMetrics.map((metric) => (
          <button
            key={metric.value}
            type="button"
            onClick={() => handleMetricSelect(metric.value)}
            disabled={disabled}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 focus:outline-none ${
              selectedMetric === metric.value
                ? 'border-blue-500 text-blue-600'
                : disabled
                ? 'border-transparent text-gray-400 cursor-not-allowed'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {metric.icon && <span className="w-4 h-4">{metric.icon}</span>}
              <span>{metric.label}</span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );

  const renderGrid = () => (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${className}`}>
      {availableMetrics.map((metric) => (
        <button
          key={metric.value}
          type="button"
          onClick={() => handleMetricSelect(metric.value)}
          disabled={disabled}
          className={`p-4 rounded-lg border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            selectedMetric === metric.value
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : disabled
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start space-x-3">
            {metric.icon && (
              <div className={`w-6 h-6 mt-0.5 ${
                selectedMetric === metric.value ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {metric.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                selectedMetric === metric.value ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {metric.label}
              </p>
              {metric.description && (
                <p className={`text-xs mt-1 ${
                  selectedMetric === metric.value ? 'text-blue-700' : 'text-gray-500'
                }`}>
                  {metric.description}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Select Metric
      </h3>
      
      {layout === 'buttons' && renderButtons()}
      {layout === 'tabs' && renderTabs()}
      {layout === 'grid' && renderGrid()}
    </div>
  );
};

// Pre-defined metric sets for common use cases
export const REVENUE_METRICS: MetricOption[] = [
  { value: 'subscription_revenue', label: 'Subscription', description: 'Recurring subscription revenue' },
  { value: 'usage_revenue', label: 'Usage', description: 'Pay-per-use revenue' },
  { value: 'total_revenue', label: 'Total', description: 'Combined revenue streams' },
];

export const PERFORMANCE_METRICS: MetricOption[] = [
  { value: 'performance_score', label: 'Performance', description: 'Overall performance rating' },
  { value: 'projects_completed', label: 'Projects', description: 'Number of completed projects' },
  { value: 'satisfaction_score', label: 'Satisfaction', description: 'Employee satisfaction rating' },
  { value: 'budget_managed', label: 'Budget', description: 'Total budget managed' },
];

export const GEOGRAPHIC_METRICS: MetricOption[] = [
  { value: 'customer_count', label: 'Customers', description: 'Number of active customers' },
  { value: 'growth_rate', label: 'Growth', description: 'Revenue growth rate' },
  { value: 'quarterly_revenue', label: 'Revenue', description: 'Quarterly revenue totals' },
];

export default MetricSelector;