import React, { useEffect, useRef, useState, useCallback } from 'react';
import Plotly from 'plotly.js-dist-min';
import { RevenueData } from '../../types/dashboard.types';
import { useChartCallbacks } from '../../hooks/useChartCallbacks';
import {
  defaultPlotlyLayout,
  colorPalettes,
  getResponsiveHeight,
  formatNumber,
  createHoverTemplate,
  aggregateByTimePeriod,
  filterByTimeRange,
  createAxisConfig
} from '../../utils/plotlyHelpers';

export interface RevenueChartProps {
  data: RevenueData[];
  timeRange: string;
  revenueType: 'subscription' | 'usage' | 'both';
  selectedDepartment: string;
  selectedRegion: string;
  chartType: 'bar' | 'line';
  height?: number;
  className?: string;
  onChartInteraction?: (data: any) => void;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  timeRange,
  revenueType,
  selectedDepartment,
  selectedRegion,
  chartType = 'bar',
  height,
  className = '',
  onChartInteraction
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const chartCallbacks = useChartCallbacks('revenue-chart');

  // Process and filter data based on current state
  const processedData = React.useMemo(() => {
    let filtered = [...data];
    
    // Apply time range filter
    filtered = filterByTimeRange(filtered, 'month', timeRange);
    
    // Apply department filter
    if (selectedDepartment !== 'all' && selectedDepartment !== '') {
      filtered = filtered.filter(item => item.department === selectedDepartment);
    }
    
    // Apply region filter
    if (selectedRegion !== 'all' && selectedRegion !== '') {
      filtered = filtered.filter(item => item.region === selectedRegion);
    }
    
    // Aggregate by month
    const valueFields = revenueType === 'both' 
      ? ['subscription_revenue', 'usage_revenue']
      : revenueType === 'subscription'
      ? ['subscription_revenue']
      : ['usage_revenue'];
    
    const aggregated = aggregateByTimePeriod(filtered, 'month', valueFields);
    
    return aggregated;
  }, [data, timeRange, selectedDepartment, selectedRegion, revenueType]);

  // Create Plotly traces based on revenue type and chart type
  const createTraces = useCallback((): Partial<Plotly.PlotData>[] => {
    const traces: Partial<Plotly.PlotData>[] = [];
    const xData = processedData.map(item => item.month);
    
    if (revenueType === 'both') {
      // Subscription revenue trace
      traces.push({
        x: xData,
        y: processedData.map(item => item.subscription_revenue),
        type: chartType === 'bar' ? 'bar' : 'scatter',
        mode: chartType === 'line' ? 'lines+markers' : undefined,
        name: 'Subscription Revenue',
        marker: {
          color: colorPalettes.revenue[0]
        },
        line: chartType === 'line' ? {
          color: colorPalettes.revenue[0],
          width: 3
        } : undefined,
        hovertemplate: createHoverTemplate([
          { label: 'Month', value: 'x' },
          { label: 'Subscription Revenue', value: 'y', format: 'currency' }
        ])
      });
      
      // Usage revenue trace
      traces.push({
        x: xData,
        y: processedData.map(item => item.usage_revenue),
        type: chartType === 'bar' ? 'bar' : 'scatter',
        mode: chartType === 'line' ? 'lines+markers' : undefined,
        name: 'Usage Revenue',
        marker: {
          color: colorPalettes.revenue[1]
        },
        line: chartType === 'line' ? {
          color: colorPalettes.revenue[1],
          width: 3
        } : undefined,
        hovertemplate: createHoverTemplate([
          { label: 'Month', value: 'x' },
          { label: 'Usage Revenue', value: 'y', format: 'currency' }
        ])
      });
    } else {
      // Single revenue type
      const fieldName = revenueType === 'subscription' ? 'subscription_revenue' : 'usage_revenue';
      const displayName = revenueType === 'subscription' ? 'Subscription Revenue' : 'Usage Revenue';
      
      traces.push({
        x: xData,
        y: processedData.map(item => item[fieldName]),
        type: chartType === 'bar' ? 'bar' : 'scatter',
        mode: chartType === 'line' ? 'lines+markers' : undefined,
        name: displayName,
        marker: {
          color: colorPalettes.revenue[0]
        },
        line: chartType === 'line' ? {
          color: colorPalettes.revenue[0],
          width: 3
        } : undefined,
        hovertemplate: createHoverTemplate([
          { label: 'Month', value: 'x' },
          { label: displayName, value: 'y', format: 'currency' }
        ])
      });
    }
    
    return traces;
  }, [processedData, revenueType, chartType]);

  // Create chart layout
  const createLayout = useCallback((): Partial<Plotly.Layout> => {
    const chartHeight = height || getResponsiveHeight(containerSize.width);
    
    return {
      ...defaultPlotlyLayout,
      title: {
        ...defaultPlotlyLayout.title,
        text: `Revenue Trends ${selectedDepartment !== 'all' ? `- ${selectedDepartment}` : ''}`
      },
      height: chartHeight,
      xaxis: createAxisConfig('Month', undefined, 'category'),
      yaxis: createAxisConfig('Revenue ($)', '$,.0f', 'linear'),
      barmode: revenueType === 'both' && chartType === 'bar' ? 'group' : undefined,
      showlegend: revenueType === 'both'
    };
  }, [selectedDepartment, revenueType, chartType, height, containerSize.width]);

  // Handle chart clicks
  const handlePlotlyClick = useCallback((data: Plotly.PlotMouseEvent) => {
    const point = data.points[0];
    if (point) {
      const clickData = {
        month: point.x,
        value: point.y,
        revenueType: point.data.name?.toLowerCase().includes('subscription') ? 'subscription' : 'usage',
        department: selectedDepartment,
        region: selectedRegion
      };
      
      chartCallbacks.handleChartInteraction({
        chartId: 'revenue-chart',
        type: 'click',
        data: clickData
      });
      
      onChartInteraction?.(clickData);
    }
  }, [chartCallbacks, selectedDepartment, selectedRegion, onChartInteraction]);

  // Handle chart hover
  const handlePlotlyHover = useCallback((data: Plotly.PlotMouseEvent) => {
    const point = data.points[0];
    if (point) {
      chartCallbacks.handleChartInteraction({
        chartId: 'revenue-chart',
        type: 'hover',
        data: {
          month: point.x,
          value: point.y,
          revenueType: point.data.name?.toLowerCase().includes('subscription') ? 'subscription' : 'usage'
        }
      });
    }
  }, [chartCallbacks]);

  // Resize observer to handle responsive behavior
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
    if (!plotRef.current || processedData.length === 0) return;
    
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
        filename: 'revenue-chart',
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
        console.error('Error creating revenue chart:', error);
        setIsLoading(false);
      });
    
    // Cleanup function
    return () => {
      if (plotRef.current) {
        (plotRef.current as any).removeAllListeners('plotly_click');
        (plotRef.current as any).removeAllListeners('plotly_hover');
      }
    };
  }, [processedData, revenueType, chartType, selectedDepartment, selectedRegion, height, containerSize.width]);

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

  if (processedData.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No Data Available</div>
          <div className="text-gray-400 text-sm">
            No revenue data found for the current filters
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
            Revenue Chart
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{formatNumber(processedData.length)} data points</span>
            <span>•</span>
            <span>{timeRange} range</span>
            <span>•</span>
            <span className="capitalize">{chartType} chart</span>
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
    </div>
  );
};

export default RevenueChart;