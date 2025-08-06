import React, { useEffect, useRef, useState, useCallback } from 'react';
import Plotly from 'plotly.js-dist-min';
import { PerformanceData } from '../../types/dashboard.types';
import { useChartCallbacks } from '../../hooks/useChartCallbacks';
import {
  defaultPlotlyLayout,
  colorPalettes,
  getResponsiveHeight,
  formatNumber,
  createAxisConfig
} from '../../utils/plotlyHelpers';

export interface PerformanceScatterProps {
  data: PerformanceData[];
  xAxisMetric: string;
  yAxisMetric: string;
  sizeMetric: string;
  selectedDepartments: string[];
  selectedEmployees?: string[];
  height?: number;
  className?: string;
  onChartInteraction?: (data: any) => void;
  onMetricChange?: (axis: 'x' | 'y' | 'size', metric: string) => void;
}

interface ProcessedScatterData {
  x: number[];
  y: number[];
  sizes: number[];
  colors: string[];
  texts: string[];
  departments: string[];
  employees: PerformanceData[];
  hoverTexts: string[];
}

// Available metrics for axis selection
export const PERFORMANCE_METRICS = [
  { key: 'performance_score', label: 'Performance Score', format: '.1f' },
  { key: 'projects_completed', label: 'Projects Completed', format: '.0f' },
  { key: 'team_size', label: 'Team Size', format: '.0f' },
  { key: 'budget_managed', label: 'Budget Managed ($)', format: '$,.0f' },
  { key: 'years_experience', label: 'Years Experience', format: '.0f' },
  { key: 'satisfaction_score', label: 'Satisfaction Score', format: '.1f' }
];

export const PerformanceScatter: React.FC<PerformanceScatterProps> = ({
  data,
  xAxisMetric,
  yAxisMetric,
  sizeMetric,
  selectedDepartments,
  selectedEmployees = [],
  height,
  className = '',
  onChartInteraction,
  onMetricChange: _onMetricChange
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const chartCallbacks = useChartCallbacks('performance-scatter');

  // Get unique departments
  const departments = Array.from(new Set(data.map(item => item.department))).sort();

  // Process data based on filters and selected metrics
  const processedData = React.useMemo((): ProcessedScatterData => {
    let filtered = [...data];
    
    // Apply department filter
    if (selectedDepartments.length > 0) {
      filtered = filtered.filter(item => selectedDepartments.includes(item.department));
    }
    
    // Apply employee filter if any
    if (selectedEmployees.length > 0) {
      filtered = filtered.filter(item => selectedEmployees.includes(item.employee_id));
    }
    
    // Extract metric values
    const x = filtered.map(item => (item as any)[xAxisMetric] || 0);
    const y = filtered.map(item => (item as any)[yAxisMetric] || 0);
    const rawSizes = filtered.map(item => (item as any)[sizeMetric] || 1);
    
    // Normalize sizes for bubble chart (min 10, max 50 pixels)
    const minSize = Math.min(...rawSizes);
    const maxSize = Math.max(...rawSizes);
    const sizeRange = maxSize - minSize || 1; // Avoid division by zero
    const sizes = rawSizes.map(size => 
      10 + ((size - minSize) / sizeRange) * 40
    );
    
    // Generate colors based on departments
    const departmentColorMap = new Map<string, string>();
    departments.forEach((dept, index) => {
      departmentColorMap.set(dept, colorPalettes.departments[index % colorPalettes.departments.length]);
    });
    
    const colors = filtered.map(item => 
      departmentColorMap.get(item.department) || colorPalettes.departments[0]
    );
    
    // Generate text labels for points
    const texts = filtered.map(item => 
      `${item.name}\n(${item.department})`
    );
    
    // Generate hover text with detailed information
    const hoverTexts = filtered.map((item, index) => {
      const xMetric = PERFORMANCE_METRICS.find(m => m.key === xAxisMetric);
      const yMetric = PERFORMANCE_METRICS.find(m => m.key === yAxisMetric);
      const sizeMetric_ = PERFORMANCE_METRICS.find(m => m.key === sizeMetric);
      
      return [
        `<b>${item.name}</b>`,
        `Department: ${item.department}`,
        `${xMetric?.label}: ${formatNumber(x[index])}`,
        `${yMetric?.label}: ${formatNumber(y[index])}`,
        `${sizeMetric_?.label}: ${formatNumber(rawSizes[index])}`,
        `Employee ID: ${item.employee_id}`
      ].join('<br>');
    });
    
    return {
      x,
      y,
      sizes,
      colors,
      texts,
      departments: filtered.map(item => item.department),
      employees: filtered,
      hoverTexts
    };
  }, [data, xAxisMetric, yAxisMetric, sizeMetric, selectedDepartments, selectedEmployees]);

  // Create Plotly scatter plot traces grouped by department
  const createTraces = useCallback((): Partial<Plotly.PlotData>[] => {
    const traces: Partial<Plotly.PlotData>[] = [];
    
    // Group data by department for better legend organization
    const departmentGroups = new Map<string, {
      x: number[];
      y: number[];
      sizes: number[];
      colors: string[];
      texts: string[];
      hoverTexts: string[];
      employees: PerformanceData[];
    }>();
    
    processedData.departments.forEach((dept, index) => {
      if (!departmentGroups.has(dept)) {
        departmentGroups.set(dept, {
          x: [],
          y: [],
          sizes: [],
          colors: [],
          texts: [],
          hoverTexts: [],
          employees: []
        });
      }
      
      const group = departmentGroups.get(dept)!;
      group.x.push(processedData.x[index]);
      group.y.push(processedData.y[index]);
      group.sizes.push(processedData.sizes[index]);
      group.colors.push(processedData.colors[index]);
      group.texts.push(processedData.texts[index]);
      group.hoverTexts.push(processedData.hoverTexts[index]);
      group.employees.push(processedData.employees[index]);
    });
    
    // Create a trace for each department
    Array.from(departmentGroups.entries()).forEach(([dept, group]) => {
      traces.push({
        x: group.x,
        y: group.y,
        mode: 'markers',
        type: 'scatter',
        name: dept,
        marker: {
          size: group.sizes,
          color: group.colors[0], // Use consistent color for department
          opacity: 0.7,
          line: {
            width: 2,
            color: '#ffffff'
          }
        },
        text: group.texts,
        hovertemplate: group.hoverTexts.map(text => text + '<extra></extra>'),
        hoverlabel: {
          bgcolor: '#ffffff',
          bordercolor: '#e5e7eb',
          font: { color: '#374151', size: 12 }
        }
      });
    });
    
    return traces;
  }, [processedData]);

  // Create chart layout
  const createLayout = useCallback((): Partial<Plotly.Layout> => {
    const chartHeight = height || getResponsiveHeight(containerSize.width);
    const xMetric = PERFORMANCE_METRICS.find(m => m.key === xAxisMetric);
    const yMetric = PERFORMANCE_METRICS.find(m => m.key === yAxisMetric);
    
    // Calculate axis ranges to prevent overflow
    const xValues = processedData.x;
    const yValues = processedData.y;
    
    const xRange = xValues.length > 0 ? [
      Math.min(...xValues) * 0.95, // Add 5% padding
      Math.max(...xValues) * 1.05
    ] : undefined;
    
    const yRange = yValues.length > 0 ? [
      Math.min(...yValues) * 0.95, // Add 5% padding
      Math.max(...yValues) * 1.05
    ] : undefined;
    
    return {
      ...defaultPlotlyLayout,
      title: {
        ...defaultPlotlyLayout.title,
        text: `Performance Analysis: ${yMetric?.label} vs ${xMetric?.label}`,
        x: 0.5,
        xanchor: 'center'
      },
      height: chartHeight,
      xaxis: {
        ...createAxisConfig(
          xMetric?.label || xAxisMetric,
          xMetric?.format,
          'linear'
        ),
        range: xRange,
        automargin: true
      },
      yaxis: {
        ...createAxisConfig(
          yMetric?.label || yAxisMetric,
          yMetric?.format,
          'linear'
        ),
        range: yRange,
        automargin: true
      },
      margin: {
        l: 80,
        r: 80,
        t: 80,
        b: 80
      },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.5,
        y: -0.15,
        xanchor: 'center',
        yanchor: 'top',
        font: { size: 11 },
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: '#e5e7eb',
        borderwidth: 1
      },
      hovermode: 'closest'
    };
  }, [xAxisMetric, yAxisMetric, height, containerSize.width, processedData]);

  // Handle chart clicks for employee selection
  const handlePlotlyClick = useCallback((data: Plotly.PlotMouseEvent) => {
    const point = data.points[0];
    if (point) {
      const clickData = {
        employee: processedData.employees[point.pointIndex],
        department: processedData.departments[point.pointIndex],
        xValue: point.x,
        yValue: point.y,
        xMetric: xAxisMetric,
        yMetric: yAxisMetric
      };
      
      chartCallbacks.handleChartInteraction({
        chartId: 'performance-scatter',
        type: 'click',
        data: clickData
      });
      
      onChartInteraction?.(clickData);
    }
  }, [processedData, xAxisMetric, yAxisMetric, chartCallbacks, onChartInteraction]);

  // Handle chart hover
  const handlePlotlyHover = useCallback((data: Plotly.PlotMouseEvent) => {
    const point = data.points[0];
    if (point) {
      chartCallbacks.handleChartInteraction({
        chartId: 'performance-scatter',
        type: 'hover',
        data: {
          employee: processedData.employees[point.pointIndex],
          department: processedData.departments[point.pointIndex]
        }
      });
    }
  }, [processedData, chartCallbacks]);

  // Resize observer for responsive behavior
  useEffect(() => {
    if (!plotRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    
    resizeObserver.observe(plotRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Create or update the chart
  useEffect(() => {
    if (!plotRef.current || processedData.x.length === 0) return;
    
    setIsLoading(true);
    
    const traces = createTraces();
    const layout = createLayout();
    const config = {
      displayModeBar: true,
      displaylogo: false,
      responsive: true,
      modeBarButtonsToRemove: [
        'pan2d' as const,
        'lasso2d' as const,
        'select2d' as const,
        'autoScale2d' as const,
        'hoverClosestCartesian' as const,
        'hoverCompareCartesian' as const,
        'toggleSpikelines' as const
      ],
      toImageButtonOptions: {
        format: 'png' as const,
        filename: 'performance-scatter',
        height: 600,
        width: 800
      }
    };
    
    // Create new plot or update existing
    Plotly.react(plotRef.current, traces, layout, config)
      .then(() => {
        // Add event listeners
        if (plotRef.current) {
          (plotRef.current as any).on('plotly_click', handlePlotlyClick);
          (plotRef.current as any).on('plotly_hover', handlePlotlyHover);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error creating performance scatter chart:', error);
        setIsLoading(false);
      });
    
    // Cleanup function
    return () => {
      if (plotRef.current) {
        (plotRef.current as any).removeAllListeners('plotly_click');
        (plotRef.current as any).removeAllListeners('plotly_hover');
      }
    };
  }, [processedData, xAxisMetric, yAxisMetric, sizeMetric, selectedDepartments, height, containerSize.width]);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (plotRef.current) {
        Plotly.Plots.resize(plotRef.current);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (processedData.x.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No Data Available</div>
          <div className="text-gray-400 text-sm">
            No employee performance data found for the current filters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Chart Header with Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Performance Scatter Plot
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{formatNumber(processedData.x.length)} employees</span>
            <span>•</span>
            <span>{departments.length} departments</span>
            <span>•</span>
            <span>Bubble size: {PERFORMANCE_METRICS.find(m => m.key === sizeMetric)?.label}</span>
          </div>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="p-4">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading chart...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={plotRef}
          className="w-full"
          style={{ minHeight: height || 400 }}
        />
      </div>
      
      {/* Chart Instructions */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-2">
          💡 Bubble size represents {PERFORMANCE_METRICS.find(m => m.key === sizeMetric)?.label}. 
          Click on any point to see employee details. Hover for quick info.
        </div>
      </div>
    </div>
  );
};

export default PerformanceScatter;