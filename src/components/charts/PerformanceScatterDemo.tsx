import React, { useState, useCallback } from 'react';
import { PerformanceScatter, PERFORMANCE_METRICS } from './PerformanceScatter';
import { generatePerformanceData } from '../../data/mockData';
import { PerformanceData } from '../../types/dashboard.types';

export const PerformanceScatterDemo: React.FC = () => {
  // Generate demo data
  const [performanceData] = useState<PerformanceData[]>(() => generatePerformanceData());
  
  // Chart state
  const [xAxisMetric, setXAxisMetric] = useState<string>('performance_score');
  const [yAxisMetric, setYAxisMetric] = useState<string>('satisfaction_score');
  const [sizeMetric, setSizeMetric] = useState<string>('projects_completed');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [correlationAnalysis, setCorrelationAnalysis] = useState<boolean>(false);

  // Get unique values for filters
  const departments = Array.from(new Set(performanceData.map(item => item.department))).sort();
  
  // Handle chart interactions
  const handleChartInteraction = useCallback((data: any) => {
    if (data.employee) {
      console.log('Employee clicked:', data.employee);
      // Could highlight the employee or show details
    }
  }, []);

  // Handle metric changes
  const handleMetricChange = useCallback((axis: 'x' | 'y' | 'size', metric: string) => {
    switch (axis) {
      case 'x':
        setXAxisMetric(metric);
        break;
      case 'y':
        setYAxisMetric(metric);
        break;
      case 'size':
        setSizeMetric(metric);
        break;
    }
  }, []);

  // Handle department filter changes
  const handleDepartmentToggle = useCallback((department: string) => {
    setSelectedDepartments(prev => 
      prev.includes(department)
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedDepartments([]);
    setSelectedEmployees([]);
  }, []);

  // Calculate correlation coefficient
  const calculateCorrelation = useCallback(() => {
    if (!correlationAnalysis) return null;
    
    const filteredData = selectedDepartments.length > 0
      ? performanceData.filter(item => selectedDepartments.includes(item.department))
      : performanceData;
    
    const xValues = filteredData.map(item => (item as any)[xAxisMetric]);
    const yValues = filteredData.map(item => (item as any)[yAxisMetric]);
    
    const n = xValues.length;
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    const sumYY = yValues.reduce((sum, y) => sum + y * y, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }, [performanceData, xAxisMetric, yAxisMetric, selectedDepartments, correlationAnalysis]);

  // Calculate summary statistics
  const filteredData = selectedDepartments.length > 0
    ? performanceData.filter(item => selectedDepartments.includes(item.department))
    : performanceData;

  const avgPerformance = filteredData.reduce((sum, item) => sum + item.performance_score, 0) / filteredData.length;
  const avgSatisfaction = filteredData.reduce((sum, item) => sum + item.satisfaction_score, 0) / filteredData.length;
  const totalProjects = filteredData.reduce((sum, item) => sum + item.projects_completed, 0);
  const correlation = calculateCorrelation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Performance Scatter Plot Demo</h1>
            <p className="text-gray-600 mt-1">
              Interactive bubble chart for employee performance analysis with customizable metrics
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCorrelationAnalysis(!correlationAnalysis)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                correlationAnalysis
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Correlation Analysis
            </button>
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Metric Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* X-Axis Metric */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X-Axis Metric
            </label>
            <select
              value={xAxisMetric}
              onChange={(e) => {
                const newMetric = e.target.value;
                setXAxisMetric(newMetric);
                // If Y-axis is the same, change it to a different metric
                if (yAxisMetric === newMetric) {
                  const differentMetric = PERFORMANCE_METRICS.find(m => m.key !== newMetric);
                  if (differentMetric) {
                    setYAxisMetric(differentMetric.key);
                  }
                }
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {PERFORMANCE_METRICS.map(metric => (
                <option key={metric.key} value={metric.key}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>

          {/* Y-Axis Metric */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Y-Axis Metric
            </label>
            <select
              value={yAxisMetric}
              onChange={(e) => {
                const newMetric = e.target.value;
                setYAxisMetric(newMetric);
                // If X-axis is the same, change it to a different metric
                if (xAxisMetric === newMetric) {
                  const differentMetric = PERFORMANCE_METRICS.find(m => m.key !== newMetric);
                  if (differentMetric) {
                    setXAxisMetric(differentMetric.key);
                  }
                }
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {PERFORMANCE_METRICS.map(metric => (
                <option 
                  key={metric.key} 
                  value={metric.key}
                  disabled={metric.key === xAxisMetric}
                >
                  {metric.label} {metric.key === xAxisMetric ? '(X-Axis)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Size Metric */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bubble Size Metric
            </label>
            <select
              value={sizeMetric}
              onChange={(e) => setSizeMetric(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {PERFORMANCE_METRICS.map(metric => (
                <option key={metric.key} value={metric.key}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Department Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Filters</h3>
        
        <div className="flex flex-wrap gap-2">
          {departments.map(department => (
            <button
              key={department}
              onClick={() => handleDepartmentToggle(department)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedDepartments.includes(department)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {department}
              <span className="ml-2 text-xs opacity-75">
                ({performanceData.filter(item => item.department === department).length})
              </span>
            </button>
          ))}
        </div>
        
        {selectedDepartments.length > 0 && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} employees from {selectedDepartments.length} department{selectedDepartments.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm font-semibold">📈</span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Avg Performance</div>
              <div className="text-2xl font-bold text-gray-900">
                {avgPerformance.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm font-semibold">😊</span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Avg Satisfaction</div>
              <div className="text-2xl font-bold text-gray-900">
                {avgSatisfaction.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm font-semibold">🎯</span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Total Projects</div>
              <div className="text-2xl font-bold text-gray-900">
                {totalProjects.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {correlationAnalysis && correlation !== null && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-sm font-semibold">🔗</span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500">Correlation</div>
                <div className="text-2xl font-bold text-gray-900">
                  {correlation.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">
                  {Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.3 ? 'Moderate' : 'Weak'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <PerformanceScatter
          data={performanceData}
          xAxisMetric={xAxisMetric}
          yAxisMetric={yAxisMetric}
          sizeMetric={sizeMetric}
          selectedDepartments={selectedDepartments}
          selectedEmployees={selectedEmployees}
          onChartInteraction={handleChartInteraction}
          onMetricChange={handleMetricChange}
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
            <span><strong>Configure Metrics:</strong> Choose which performance metrics to display on X-axis, Y-axis, and bubble size</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span><strong>Filter Departments:</strong> Click on department buttons to focus on specific teams</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span><strong>Analyze Relationships:</strong> Enable correlation analysis to see statistical relationships between metrics</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <span><strong>Interact:</strong> Click on bubbles to see employee details, hover for quick information</span>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      {correlationAnalysis && correlation !== null && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">📊 Performance Insights</h4>
          <div className="space-y-3 text-gray-700">
            <div>
              <strong>Correlation Analysis:</strong> The correlation coefficient between{' '}
              {PERFORMANCE_METRICS.find(m => m.key === xAxisMetric)?.label} and{' '}
              {PERFORMANCE_METRICS.find(m => m.key === yAxisMetric)?.label} is{' '}
              <span className={`font-bold ${
                Math.abs(correlation) > 0.7 ? 'text-green-600' : 
                Math.abs(correlation) > 0.3 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {correlation.toFixed(3)}
              </span>
            </div>
            <div>
              <strong>Interpretation:</strong> {
                correlation > 0.7 ? 'Strong positive correlation - as one metric increases, the other tends to increase significantly.' :
                correlation > 0.3 ? 'Moderate positive correlation - there is some relationship between the metrics.' :
                correlation > -0.3 ? 'Weak correlation - little to no linear relationship between the metrics.' :
                correlation > -0.7 ? 'Moderate negative correlation - as one metric increases, the other tends to decrease.' :
                'Strong negative correlation - as one metric increases, the other tends to decrease significantly.'
              }
            </div>
            <div>
              <strong>Sample Size:</strong> Analysis based on {filteredData.length} employees
              {selectedDepartments.length > 0 && ` from ${selectedDepartments.join(', ')}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceScatterDemo;