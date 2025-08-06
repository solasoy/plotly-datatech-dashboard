import React from 'react';
import { DateRangePicker } from './DateRangePicker';
import { FilterDropdown } from './FilterDropdown';
import { MetricSelector } from './MetricSelector';
import type { DashboardState } from '../../types/dashboard.types';
import type { MetricOption } from './MetricSelector';

export interface ControlPanelProps {
  state: DashboardState;
  onStateChange: (updates: Partial<DashboardState>) => void;
  availableOptions?: {
    departments?: Array<{ label: string; value: string }>;
    regions?: Array<{ label: string; value: string }>;
    industries?: Array<{ label: string; value: string }>;
    metrics?: MetricOption[];
  };
  layout?: 'horizontal' | 'vertical' | 'sidebar';
  className?: string;
  disabled?: boolean;
}

const defaultOptions = {
  departments: [
    { label: 'Engineering', value: 'engineering' },
    { label: 'Sales', value: 'sales' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Operations', value: 'operations' },
    { label: 'Finance', value: 'finance' },
    { label: 'HR', value: 'hr' }
  ],
  regions: [
    { label: 'North America', value: 'north_america' },
    { label: 'Europe', value: 'europe' },
    { label: 'Asia Pacific', value: 'asia_pacific' },
    { label: 'Latin America', value: 'latin_america' },
    { label: 'Africa', value: 'africa' }
  ],
  industries: [
    { label: 'Technology', value: 'technology' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Finance', value: 'finance' },
    { label: 'Manufacturing', value: 'manufacturing' },
    { label: 'Retail', value: 'retail' },
    { label: 'Energy', value: 'energy' },
    { label: 'Education', value: 'education' },
    { label: 'Transportation', value: 'transportation' }
  ],
  metrics: [
    { value: 'revenue', label: 'Revenue', description: 'Total revenue metrics' },
    { value: 'customers', label: 'Customers', description: 'Customer-related metrics' },
    { value: 'performance', label: 'Performance', description: 'Performance indicators' },
    { value: 'geographic', label: 'Geographic', description: 'Geographic distribution' }
  ]
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
  state,
  onStateChange,
  availableOptions = {},
  layout = 'horizontal',
  className = '',
  disabled = false
}) => {
  const options = { ...defaultOptions, ...availableOptions };

  const handleTimeRangeChange = (timeRange: string) => {
    onStateChange({ selectedTimeRange: timeRange });
  };

  const handleDepartmentChange = (department: string | string[]) => {
    onStateChange({ selectedDepartment: Array.isArray(department) ? department[0] : department });
  };

  const handleRegionChange = (region: string | string[]) => {
    onStateChange({ selectedRegion: Array.isArray(region) ? region[0] : region });
  };

  const handleIndustryChange = (industry: string | string[]) => {
    onStateChange({ selectedIndustry: Array.isArray(industry) ? industry[0] : industry });
  };

  const handleMetricChange = (metric: string) => {
    onStateChange({ selectedMetric: metric });
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col space-y-6';
      case 'sidebar':
        return 'flex flex-col space-y-6 w-full max-w-xs';
      case 'horizontal':
      default:
        return 'flex flex-wrap items-end gap-4 lg:gap-6';
    }
  };

  const getControlWrapperClasses = () => {
    switch (layout) {
      case 'vertical':
      case 'sidebar':
        return 'w-full';
      case 'horizontal':
      default:
        return 'flex-shrink-0';
    }
  };

  return (
    <div className={`control-panel ${getLayoutClasses()} ${className}`}>
      {/* Time Range Picker */}
      <div className={getControlWrapperClasses()}>
        <DateRangePicker
          value={state.selectedTimeRange}
          onChange={handleTimeRangeChange}
          className="w-full"
        />
      </div>

      {/* Department Filter */}
      <div className={getControlWrapperClasses()}>
        <FilterDropdown
          label="Department"
          value={state.selectedDepartment}
          options={options.departments}
          onChange={handleDepartmentChange}
          placeholder="All Departments"
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Region Filter */}
      <div className={getControlWrapperClasses()}>
        <FilterDropdown
          label="Region"
          value={state.selectedRegion}
          options={options.regions}
          onChange={handleRegionChange}
          placeholder="All Regions"
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Industry Filter */}
      <div className={getControlWrapperClasses()}>
        <FilterDropdown
          label="Industry"
          value={state.selectedIndustry}
          options={options.industries}
          onChange={handleIndustryChange}
          placeholder="All Industries"
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Metric Selector */}
      {layout === 'horizontal' && (
        <div className="flex-1 min-w-0">
          <MetricSelector
            selectedMetric={state.selectedMetric}
            availableMetrics={options.metrics}
            onMetricChange={handleMetricChange}
            layout="buttons"
            disabled={disabled}
          />
        </div>
      )}

      {(layout === 'vertical' || layout === 'sidebar') && (
        <div className="w-full">
          <MetricSelector
            selectedMetric={state.selectedMetric}
            availableMetrics={options.metrics}
            onMetricChange={handleMetricChange}
            layout="grid"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default ControlPanel;