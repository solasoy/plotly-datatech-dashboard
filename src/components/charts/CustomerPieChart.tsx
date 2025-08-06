import React, { useEffect, useRef, useState, useCallback } from 'react';
import Plotly from 'plotly.js-dist-min';
import { CustomerData } from '../../types/dashboard.types';
import { useChartCallbacks } from '../../hooks/useChartCallbacks';
import {
  defaultPlotlyLayout,
  colorPalettes,
  getResponsiveHeight,
  formatNumber
} from '../../utils/plotlyHelpers';

export interface CustomerPieChartProps {
  data: CustomerData[];
  drillDownLevel: 'industry' | 'region';
  metricType: 'customer_count' | 'revenue_share';
  selectedIndustry?: string;
  selectedRegion?: string;
  height?: number;
  className?: string;
  onChartInteraction?: (data: any) => void;
  onDrillDown?: (level: 'industry' | 'region', value: string) => void;
}

interface ProcessedPieData {
  labels: string[];
  values: number[];
  colors: string[];
  hoverInfo: string[];
}

export const CustomerPieChart: React.FC<CustomerPieChartProps> = ({
  data,
  drillDownLevel,
  metricType,
  selectedIndustry,
  selectedRegion,
  height,
  className = '',
  onChartInteraction,
  onDrillDown
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const chartCallbacks = useChartCallbacks('customer-pie-chart');

  // Process data based on drill-down level and filters
  const processedData = React.useMemo((): ProcessedPieData => {
    let filtered = [...data];
    
    // Apply filters
    if (selectedIndustry && drillDownLevel === 'region') {
      filtered = filtered.filter(item => item.industry === selectedIndustry);
    }
    if (selectedRegion) {
      filtered = filtered.filter(item => item.region === selectedRegion);
    }
    
    // Group data by drill-down level
    const grouped = new Map<string, { customer_count: number; total_revenue: number }>();
    
    filtered.forEach(item => {
      const key = drillDownLevel === 'industry' ? item.industry : item.region;
      const existing = grouped.get(key) || { customer_count: 0, total_revenue: 0 };
      grouped.set(key, {
        customer_count: existing.customer_count + item.customer_count,
        total_revenue: existing.total_revenue + item.total_revenue
      });
    });
    
    // Convert to arrays
    const labels = Array.from(grouped.keys());
    const values = labels.map(label => {
      const item = grouped.get(label)!;
      return metricType === 'customer_count' ? item.customer_count : item.total_revenue;
    });
    
    // Calculate percentages for revenue share
    if (metricType === 'revenue_share') {
      const total = values.reduce((sum, val) => sum + val, 0);
      values.forEach((_, index) => {
        values[index] = (values[index] / total) * 100;
      });
    }
    
    // Generate colors from palette
    const colors = labels.map((_, index) => 
      colorPalettes.categorical[index % colorPalettes.categorical.length]
    );
    
    // Create hover info
    const hoverInfo = labels.map((label, index) => {
      const item = grouped.get(label)!;
      const percentage = metricType === 'revenue_share' ? values[index] : 
        (values[index] / values.reduce((sum, val) => sum + val, 0)) * 100;
      
      return `${label}<br>` +
        `${metricType === 'customer_count' ? 'Customers' : 'Revenue'}: ${formatNumber(
          metricType === 'customer_count' ? values[index] : item.total_revenue
        )}${metricType === 'revenue_share' ? '%' : ''}<br>` +
        `Percentage: ${percentage.toFixed(1)}%`;
    });
    
    return {
      labels,
      values,
      colors,
      hoverInfo
    };
  }, [data, drillDownLevel, metricType, selectedIndustry, selectedRegion]);

  // Create Plotly pie chart trace
  const createTrace = useCallback((): Partial<Plotly.PlotData> => {
    return {
      type: 'pie',
      labels: processedData.labels,
      values: processedData.values,
      hole: 0.4, // Creates donut chart
      marker: {
        colors: processedData.colors,
        line: {
          color: '#ffffff',
          width: 2
        }
      },
      textinfo: 'label+percent',
      textposition: 'auto',
      textfont: {
        size: 12,
        color: '#374151'
      },
      hovertemplate: processedData.hoverInfo.map(info => info + '<extra></extra>'),
      hoverlabel: {
        bgcolor: '#ffffff',
        bordercolor: '#e5e7eb',
        font: { color: '#374151', size: 12 }
      }
    };
  }, [processedData]);

  // Create chart layout
  const createLayout = useCallback((): Partial<Plotly.Layout> => {
    const chartHeight = height || getResponsiveHeight(containerSize.width);
    
    return {
      ...defaultPlotlyLayout,
      title: {
        ...defaultPlotlyLayout.title,
        text: `Customer Distribution by ${drillDownLevel === 'industry' ? 'Industry' : 'Region'}${
          selectedIndustry && drillDownLevel === 'region' ? ` - ${selectedIndustry}` : ''
        }`,
        x: 0.5,
        xanchor: 'center'
      },
      height: chartHeight,
      showlegend: true,
      legend: {
        orientation: 'v',
        x: 1.02,
        y: 0.5,
        xanchor: 'left',
        yanchor: 'middle',
        font: { size: 11 },
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: '#e5e7eb',
        borderwidth: 1
      },
      annotations: [{
        text: `Total<br>${metricType === 'customer_count' ? 'Customers' : 'Revenue'}<br><b>${
          formatNumber(processedData.values.reduce((sum, val) => sum + val, 0))
        }${metricType === 'revenue_share' ? '%' : ''}</b>`,
        x: 0.5,
        y: 0.5,
        xanchor: 'center',
        yanchor: 'middle',
        showarrow: false,
        font: { size: 14, color: '#374151' },
        bgcolor: 'rgba(255,255,255,0.9)',
        bordercolor: '#e5e7eb',
        borderwidth: 1,
        borderpad: 8
      }]
    };
  }, [drillDownLevel, selectedIndustry, metricType, processedData, height, containerSize.width]);

  // Handle chart clicks for drill-down
  const handlePlotlyClick = useCallback((data: Plotly.PlotMouseEvent) => {
    const point = data.points[0];
    if (point && (point as any).label) {
      const clickData = {
        level: drillDownLevel,
        value: (point as any).label,
        metricType,
        count: (point as any).value,
        percentage: (point as any).percent
      };
      
      // Trigger drill-down
      if (drillDownLevel === 'industry') {
        onDrillDown?.('region', (point as any).label as string);
      }
      
      chartCallbacks.handleChartInteraction({
        chartId: 'customer-pie-chart',
        type: 'click',
        data: clickData
      });
      
      onChartInteraction?.(clickData);
    }
  }, [drillDownLevel, metricType, chartCallbacks, onDrillDown, onChartInteraction]);

  // Handle chart hover
  const handlePlotlyHover = useCallback((data: Plotly.PlotMouseEvent) => {
    const point = data.points[0];
    if (point) {
      chartCallbacks.handleChartInteraction({
        chartId: 'customer-pie-chart',
        type: 'hover',
        data: {
          level: drillDownLevel,
          value: (point as any).label,
          count: (point as any).value,
          percentage: (point as any).percent
        }
      });
    }
  }, [drillDownLevel, chartCallbacks]);

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
    if (!plotRef.current || processedData.labels.length === 0) return;
    
    setIsLoading(true);
    
    const trace = createTrace();
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
        'hoverClosestPie' as const
      ],
      toImageButtonOptions: {
        format: 'png' as const,
        filename: 'customer-pie-chart',
        height: 600,
        width: 800
      }
    };
    
    // Create new plot or update existing
    Plotly.react(plotRef.current, [trace], layout, config)
      .then(() => {
        // Add event listeners
        if (plotRef.current) {
          (plotRef.current as any).on('plotly_click', handlePlotlyClick);
          (plotRef.current as any).on('plotly_hover', handlePlotlyHover);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error creating customer pie chart:', error);
        setIsLoading(false);
      });
    
    // Cleanup function
    return () => {
      if (plotRef.current) {
        (plotRef.current as any).removeAllListeners('plotly_click');
        (plotRef.current as any).removeAllListeners('plotly_hover');
      }
    };
  }, [processedData, drillDownLevel, metricType, selectedIndustry, height, containerSize.width]);

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

  if (processedData.labels.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No Data Available</div>
          <div className="text-gray-400 text-sm">
            No customer data found for the current filters
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
            Customer Distribution
          </h3>
          <div className="flex items-center space-x-2">
            {/* Metric Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onChartInteraction?.({ metricType: 'customer_count' })}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  metricType === 'customer_count'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Count
              </button>
              <button
                onClick={() => onChartInteraction?.({ metricType: 'revenue_share' })}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  metricType === 'revenue_share'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Revenue
              </button>
            </div>
            
            {/* Drill-down indicator */}
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span className="capitalize">{drillDownLevel} view</span>
              {drillDownLevel === 'region' && selectedIndustry && (
                <>
                  <span>•</span>
                  <span>{selectedIndustry}</span>
                </>
              )}
            </div>
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
      
      {/* Drill-down help text */}
      {drillDownLevel === 'industry' && (
        <div className="px-4 pb-4">
          <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-2">
            💡 Click on any industry segment to drill down to regional view
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPieChart;