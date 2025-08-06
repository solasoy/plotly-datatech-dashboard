import React, { useEffect, useRef, useState, useCallback } from 'react';
import Plotly from 'plotly.js-dist-min';
import { GeographicData } from '../../types/dashboard.types';
import { useChartCallbacks } from '../../hooks/useChartCallbacks';
import {
  defaultPlotlyLayout,
  getResponsiveHeight,
  formatNumber
} from '../../utils/plotlyHelpers';

export interface GeographicHeatmapProps {
  data: GeographicData[];
  selectedMetric: string;
  timePeriod: string;
  selectedCountries: string[];
  height?: number;
  className?: string;
  onChartInteraction?: (data: any) => void;
  onMetricChange?: (metric: string) => void;
  onTimePeriodChange?: (period: string) => void;
}

interface ProcessedMapData {
  locations: string[];
  values: number[];
  texts: string[];
  hoverTexts: string[];
  countries: GeographicData[];
}

// Available metrics for geographic visualization
export const GEOGRAPHIC_METRICS = [
  { key: 'q1_2023_revenue', label: 'Q1 2023 Revenue', format: '$,.0f', period: 'Q1 2023' },
  { key: 'q2_2023_revenue', label: 'Q2 2023 Revenue', format: '$,.0f', period: 'Q2 2023' },
  { key: 'q3_2023_revenue', label: 'Q3 2023 Revenue', format: '$,.0f', period: 'Q3 2023' },
  { key: 'q4_2023_revenue', label: 'Q4 2023 Revenue', format: '$,.0f', period: 'Q4 2023' },
  { key: 'customer_count', label: 'Customer Count', format: ',.0f', period: 'Current' },
  { key: 'growth_rate', label: 'Growth Rate', format: '.1%', period: 'YoY' }
];

// Time periods for animation
export const TIME_PERIODS = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'All'];

export const GeographicHeatmap: React.FC<GeographicHeatmapProps> = ({
  data,
  selectedMetric,
  timePeriod,
  selectedCountries,
  height,
  className = '',
  onChartInteraction,
  onMetricChange: _onMetricChange,
  onTimePeriodChange: _onTimePeriodChange
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  
  const chartCallbacks = useChartCallbacks('geographic-heatmap');

  // Get unique countries (for potential future use)
  // const countries = Array.from(new Set(data.map(item => item.country))).sort();

  // Process data based on selected metric and time period
  const processedData = React.useMemo((): ProcessedMapData => {
    let filtered = [...data];
    
    // Apply country filter
    if (selectedCountries.length > 0) {
      filtered = filtered.filter(item => selectedCountries.includes(item.country));
    }
    
    // Calculate metric values based on selection
    const locations = filtered.map(item => item.country_code);
    let values: number[];
    
    // Handle time-based metrics and aggregations
    if (timePeriod === 'All') {
      if (selectedMetric.includes('revenue')) {
        values = filtered.map(item => 
          item.q1_2023_revenue + item.q2_2023_revenue + 
          item.q3_2023_revenue + item.q4_2023_revenue
        );
      } else {
        values = filtered.map(item => (item as any)[selectedMetric] || 0);
      }
    } else {
      // Map time period to metric key
      const periodMetricMap: Record<string, string> = {
        'Q1 2023': 'q1_2023_revenue',
        'Q2 2023': 'q2_2023_revenue',
        'Q3 2023': 'q3_2023_revenue',
        'Q4 2023': 'q4_2023_revenue'
      };
      
      const metricKey = periodMetricMap[timePeriod] || selectedMetric;
      values = filtered.map(item => (item as any)[metricKey] || 0);
    }
    
    // Generate text labels for countries
    const texts = filtered.map(item => item.country);
    
    // Generate hover text with detailed information
    const currentMetric = GEOGRAPHIC_METRICS.find(m => m.key === selectedMetric);
    const hoverTexts = filtered.map((item, index) => {
      const baseInfo = [
        `<b>${item.country}</b>`,
        `${currentMetric?.label}: ${formatNumber(values[index])}`
      ];
      
      if (timePeriod === 'All' && selectedMetric.includes('revenue')) {
        baseInfo.push(
          `Q1: ${formatNumber(item.q1_2023_revenue)}`,
          `Q2: ${formatNumber(item.q2_2023_revenue)}`,
          `Q3: ${formatNumber(item.q3_2023_revenue)}`,
          `Q4: ${formatNumber(item.q4_2023_revenue)}`
        );
      }
      
      baseInfo.push(
        `Customers: ${formatNumber(item.customer_count)}`,
        `Growth Rate: ${(item.growth_rate * 100).toFixed(1)}%`
      );
      
      return baseInfo.join('<br>');
    });
    
    return {
      locations,
      values,
      texts,
      hoverTexts,
      countries: filtered
    };
  }, [data, selectedMetric, timePeriod, selectedCountries]);

  // Create Plotly choropleth map trace
  const createTrace = useCallback((): Partial<Plotly.PlotData> => {
    // Create more distinctive color scales based on metric
    let colorScale;
    
    if (selectedMetric === 'growth_rate') {
      // Custom color scale for growth rates (red to green through yellow)
      colorScale = [
        [0, '#dc2626'],    // red for low/negative growth
        [0.3, '#f59e0b'],  // amber for moderate growth
        [0.6, '#84cc16'],  // lime for good growth
        [1, '#16a34a']     // green for high growth
      ];
    } else if (selectedMetric === 'customer_count') {
      // Distinctive color scale for customer count (purple to pink to yellow)
      colorScale = [
        [0, '#f3f4f6'],    // very light gray for minimal
        [0.2, '#e0e7ff'],  // light indigo
        [0.4, '#8b5cf6'],  // violet
        [0.6, '#ec4899'],  // pink
        [0.8, '#f59e0b'],  // amber
        [1, '#eab308']     // yellow for highest
      ];
    } else {
      // Revenue color scale (blue to green to orange to red)
      colorScale = [
        [0, '#f8fafc'],    // very light gray for low revenue
        [0.15, '#dbeafe'], // light blue
        [0.3, '#3b82f6'],  // blue
        [0.5, '#10b981'],  // emerald
        [0.7, '#f59e0b'],  // amber
        [0.85, '#ef4444'], // red
        [1, '#dc2626']     // dark red for highest revenue
      ];
    }
    
    // Ensure all values are valid numbers
    const validValues = processedData.values.map(val => {
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    });
    
    // Use log scaling for better distribution of values with large ranges
    const nonZeroValues = validValues.filter(v => v > 0);
    
    let scaledValues: number[];
    let minThreshold: number;
    let maxThreshold: number;
    
    if (nonZeroValues.length === 0) {
      // All values are 0, use original values
      scaledValues = validValues;
      minThreshold = 0;
      maxThreshold = 1;
    } else {
      // Apply logarithmic scaling to spread out the values better
      const minVal = Math.min(...nonZeroValues);
      const maxVal = Math.max(...nonZeroValues);
      
      scaledValues = validValues.map(val => {
        if (val <= 0) return 0;
        // Use log scale but ensure minimum visibility
        const logMin = Math.log(minVal);
        const logMax = Math.log(maxVal);
        const logVal = Math.log(val);
        
        // Normalize to 0-100 range
        if (logMax === logMin) return 50; // All non-zero values are the same
        return ((logVal - logMin) / (logMax - logMin)) * 100;
      });
      
      minThreshold = 0;
      maxThreshold = 100;
    }
    
    return {
      type: 'choropleth',
      locationmode: 'ISO-3',
      locations: processedData.locations,
      z: scaledValues, // Use scaled values for better color distribution
      colorscale: colorScale as any, // Type assertion for custom color scales
      zmin: minThreshold,
      zmax: maxThreshold,
      text: processedData.texts,
      hovertemplate: processedData.hoverTexts.map(text => text + '<extra></extra>'),
      hoverlabel: {
        bgcolor: '#ffffff',
        bordercolor: '#e5e7eb',
        font: { color: '#374151', size: 12 }
      },
      showscale: true,
      colorbar: {
        title: {
          text: GEOGRAPHIC_METRICS.find(m => m.key === selectedMetric)?.label || selectedMetric,
          font: { size: 12, color: '#374151' }
        },
        thickness: 20,
        len: 0.8,
        x: 1.02,
        y: 0.5,
        tickfont: { size: 10, color: '#374151' },
        tickformat: selectedMetric === 'growth_rate' ? '.1%' : 
                   selectedMetric.includes('revenue') ? '$,.0s' : ',.0f',
        tickmode: 'linear',
        nticks: 6
      },
      marker: {
        line: {
          color: '#ffffff',
          width: 0.5
        }
      }
    };
  }, [processedData, selectedMetric]);

  // Create chart layout
  const createLayout = useCallback((): Partial<Plotly.Layout> => {
    const chartHeight = height || getResponsiveHeight(containerSize.width);
    const currentMetric = GEOGRAPHIC_METRICS.find(m => m.key === selectedMetric);
    
    return {
      ...defaultPlotlyLayout,
      title: {
        ...defaultPlotlyLayout.title,
        text: `Global ${currentMetric?.label} - ${timePeriod}`,
        x: 0.5,
        xanchor: 'center'
      },
      height: chartHeight,
      geo: {
        showframe: false,
        showcoastlines: true,
        coastlinecolor: '#e5e7eb',
        showland: true,
        landcolor: '#f9fafb',
        showocean: true,
        oceancolor: '#f0f9ff',
        showlakes: true,
        lakecolor: '#f0f9ff',
        showrivers: false,
        projection: { type: 'natural earth' },
        bgcolor: 'rgba(0,0,0,0)'
      },
      dragmode: 'pan'
    };
  }, [selectedMetric, timePeriod, height, containerSize.width]);

  // Handle chart clicks for country selection
  const handlePlotlyClick = useCallback((data: Plotly.PlotMouseEvent) => {
    const point = data.points[0];
    if (point) {
      const countryData = processedData.countries[point.pointIndex];
      const clickData = {
        country: countryData,
        metric: selectedMetric,
        value: (point as any).z,
        timePeriod
      };
      
      chartCallbacks.handleChartInteraction({
        chartId: 'geographic-heatmap',
        type: 'click',
        data: clickData
      });
      
      onChartInteraction?.(clickData);
    }
  }, [processedData, selectedMetric, timePeriod, chartCallbacks, onChartInteraction]);

  // Handle chart hover
  const handlePlotlyHover = useCallback((data: Plotly.PlotMouseEvent) => {
    const point = data.points[0];
    if (point) {
      chartCallbacks.handleChartInteraction({
        chartId: 'geographic-heatmap',
        type: 'hover',
        data: {
          country: processedData.countries[point.pointIndex],
          value: (point as any).z,
          metric: selectedMetric
        }
      });
    }
  }, [processedData, selectedMetric, chartCallbacks]);

  // Animation function for time periods
  const animateTimePeriods = useCallback(async () => {
    if (!plotRef.current || isAnimating) return;
    
    setIsAnimating(true);
    const periods = TIME_PERIODS.slice(0, -1); // Exclude 'All'
    
    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];
      
      // Calculate values for this period
      const periodMetricMap: Record<string, string> = {
        'Q1 2023': 'q1_2023_revenue',
        'Q2 2023': 'q2_2023_revenue', 
        'Q3 2023': 'q3_2023_revenue',
        'Q4 2023': 'q4_2023_revenue'
      };
      
      const metricKey = periodMetricMap[period] || selectedMetric;
      const newValues = processedData.countries.map(item => (item as any)[metricKey] || 0);
      
      // Update chart data
      await Plotly.restyle(plotRef.current, {
        z: [newValues]
      }, 0);
      
      // Update title
      await Plotly.relayout(plotRef.current, {
        title: { text: `Global Revenue - ${period}` }
      });
      
      // Wait before next frame
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsAnimating(false);
  }, [processedData, selectedMetric, isAnimating]);

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
    if (!plotRef.current || processedData.locations.length === 0) return;
    
    setIsLoading(true);
    
    const trace = createTrace();
    const layout = createLayout();
    const config = {
      displayModeBar: true,
      displaylogo: false,
      responsive: true,
      modeBarButtonsToRemove: [
        'lasso2d' as const,
        'select2d' as const,
        'autoScale2d' as const,
        'hoverClosestGeo' as const
      ],
      toImageButtonOptions: {
        format: 'png' as const,
        filename: 'geographic-heatmap',
        height: 600,
        width: 1000
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
        console.error('Error creating geographic heatmap:', error);
        setIsLoading(false);
      });
    
    // Cleanup function
    return () => {
      if (plotRef.current) {
        (plotRef.current as any).removeAllListeners('plotly_click');
        (plotRef.current as any).removeAllListeners('plotly_hover');
      }
    };
  }, [processedData, selectedMetric, timePeriod, selectedCountries, height, containerSize.width]);

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

  if (processedData.locations.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No Data Available</div>
          <div className="text-gray-400 text-sm">
            No geographic data found for the current filters
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Data length: {data.length}, Selected countries: {selectedCountries.length}
          </div>
        </div>
      </div>
    );
  }


  // Debug the data
  React.useEffect(() => {
    console.log('Geographic Debug Info:', {
      dataLength: data.length,
      processedLocations: processedData.locations,
      processedValues: processedData.values,
      selectedMetric,
      timePeriod,
      sampleData: data[0]
    });
  }, [data, processedData, selectedMetric, timePeriod]);

  return (
    <div className={`relative bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Chart Header with Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Geographic Heatmap
          </h3>
          <div className="flex items-center space-x-3">
            {/* Animation Control */}
            <button
              onClick={animateTimePeriods}
              disabled={isAnimating || !selectedMetric.includes('revenue')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                isAnimating
                  ? 'bg-orange-100 text-orange-700 cursor-not-allowed'
                  : selectedMetric.includes('revenue')
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAnimating ? '⏸️ Animating...' : '▶️ Animate Quarters'}
            </button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{formatNumber(processedData.locations.length)} countries</span>
              <span>•</span>
              <span className="capitalize">{timePeriod}</span>
              <span>•</span>
              <span>{GEOGRAPHIC_METRICS.find(m => m.key === selectedMetric)?.label}</span>
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
              <span className="text-gray-600">Loading map...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={plotRef}
          className="w-full"
          style={{ minHeight: height || 500 }}
        />
      </div>
      
      {/* Chart Instructions */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-2">
          🌍 Click and drag to pan the map. Click on countries for details. 
          Use the animation button to see quarterly revenue progression.
        </div>
      </div>
    </div>
  );
};

export default GeographicHeatmap;