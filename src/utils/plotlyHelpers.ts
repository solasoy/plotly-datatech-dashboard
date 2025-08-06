import Plotly from 'plotly.js-dist-min';

// Common Plotly.js configuration helpers

export interface PlotlyConfig {
  displayModeBar: boolean;
  modeBarButtonsToRemove?: string[];
  displaylogo: boolean;
  responsive: boolean;
  toImageButtonOptions?: {
    format: string;
    filename: string;
    height?: number;
    width?: number;
  };
}

export interface PlotlyLayout {
  title?: {
    text: string;
    font?: {
      size: number;
      color: string;
      family: string;
    };
    x?: number;
    y?: number;
  };
  xaxis?: Partial<Plotly.LayoutAxis>;
  yaxis?: Partial<Plotly.LayoutAxis>;
  showlegend?: boolean;
  legend?: Partial<Plotly.Legend>;
  margin?: Partial<Plotly.Margin>;
  paper_bgcolor?: string;
  plot_bgcolor?: string;
  font?: Partial<Plotly.Font>;
  hoverlabel?: Partial<Plotly.HoverLabel>;
  autosize?: boolean;
  height?: number;
  width?: number;
}

// Default configuration for all charts
export const defaultPlotlyConfig: PlotlyConfig = {
  displayModeBar: true,
  modeBarButtonsToRemove: [
    'pan2d',
    'lasso2d',
    'select2d',
    'autoScale2d',
    'hoverClosestCartesian',
    'hoverCompareCartesian',
    'toggleSpikelines'
  ],
  displaylogo: false,
  responsive: true,
  toImageButtonOptions: {
    format: 'png',
    filename: 'chart',
    height: 600,
    width: 800
  }
};

// Default layout configuration
export const defaultPlotlyLayout: Partial<PlotlyLayout> = {
  title: {
    text: '',
    font: {
      size: 18,
      color: '#1f2937', // gray-800
      family: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif'
    },
    x: 0.02,
    y: 0.95
  },
  showlegend: true,
  legend: {
    orientation: 'h',
    x: 0,
    y: 1.1,
    bgcolor: 'rgba(255,255,255,0.8)',
    bordercolor: '#e5e7eb',
    borderwidth: 1
  },
  margin: {
    l: 60,
    r: 40,
    b: 60,
    t: 80,
    pad: 4
  },
  paper_bgcolor: '#ffffff',
  plot_bgcolor: '#f9fafb', // gray-50
  font: {
    family: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
    size: 12,
    color: '#374151' // gray-700
  },
  hoverlabel: {
    bgcolor: '#1f2937',
    bordercolor: '#1f2937',
    font: {
      color: '#ffffff',
      family: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif'
    }
  },
  autosize: true
};

// Chart-specific color palettes
export const colorPalettes = {
  primary: [
    '#2563eb', // blue-600
    '#3b82f6', // blue-500
    '#1d4ed8', // blue-700
    '#60a5fa', // blue-400
    '#1e40af'  // blue-800
  ],
  revenue: [
    '#059669', // emerald-600 for subscription
    '#06b6d4', // cyan-500 for usage
    '#10b981', // emerald-500
    '#14b8a6', // teal-500
    '#0d9488'  // teal-600
  ],
  departments: [
    '#ef4444', // red-500 - Engineering
    '#f59e0b', // amber-500 - Sales
    '#8b5cf6', // violet-500 - Marketing
    '#06b6d4', // cyan-500 - Operations
    '#10b981', // emerald-500 - Finance
    '#f97316'  // orange-500 - HR
  ],
  performance: [
    '#22c55e', // green-500
    '#eab308', // yellow-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
  ],
  categorical: [
    '#2563eb', // blue-600
    '#059669', // emerald-600
    '#dc2626', // red-600
    '#ca8a04', // yellow-600
    '#9333ea', // purple-600
    '#c2410c', // orange-600
    '#0891b2', // cyan-600
    '#be123c', // rose-600
    '#4f46e5', // indigo-600
    '#0d9488', // teal-600
    '#7c2d12', // amber-800
    '#1e40af', // blue-800
    '#a855f7'  // purple-500
  ]
};

// Chart animation configuration
export const animationConfig = {
  transition: {
    duration: 500,
    easing: 'cubic-in-out'
  },
  frame: {
    duration: 500,
    redraw: true
  }
};

// Responsive breakpoints for chart sizing
export const responsiveBreakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280
};

// Helper function to get responsive height based on container width
export const getResponsiveHeight = (containerWidth: number): number => {
  if (containerWidth <= responsiveBreakpoints.mobile) {
    return 300; // Mobile
  } else if (containerWidth <= responsiveBreakpoints.tablet) {
    return 350; // Tablet
  } else if (containerWidth <= responsiveBreakpoints.desktop) {
    return 400; // Desktop
  } else {
    return 450; // Wide screen
  }
};

// Helper function to format numbers for display
export const formatNumber = (value: number, type: 'currency' | 'percent' | 'number' = 'number'): string => {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    
    case 'percent':
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value / 100);
    
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
};

// Helper function to create custom hover templates
export const createHoverTemplate = (fields: { label: string; value: string; format?: 'currency' | 'percent' | 'number' }[]): string => {
  const lines = fields.map(field => {
    const format = field.format || 'number';
    let valueTemplate = field.value;
    
    if (format === 'currency') {
      valueTemplate = `$%{${field.value}:,.0f}`;
    } else if (format === 'percent') {
      valueTemplate = `%{${field.value}:.1f}%`;
    } else {
      valueTemplate = `%{${field.value}:,.0f}`;
    }
    
    return `<b>${field.label}:</b> ${valueTemplate}`;
  });
  
  return lines.join('<br>') + '<extra></extra>';
};

// Helper function to aggregate data by time period
export const aggregateByTimePeriod = (
  data: any[],
  dateField: string,
  valueFields: string[],
  period: 'month' | 'quarter' | 'year' = 'month'
): any[] => {
  const grouped = data.reduce((acc, item) => {
    const date = new Date(item[dateField]);
    let key: string;
    
    switch (period) {
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'year':
        key = date.getFullYear().toString();
        break;
      case 'month':
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (!acc[key]) {
      acc[key] = { [dateField]: key };
      valueFields.forEach(field => {
        acc[key][field] = 0;
      });
    }
    
    valueFields.forEach(field => {
      acc[key][field] += item[field] || 0;
    });
    
    return acc;
  }, {} as Record<string, any>);
  
  return Object.values(grouped).sort((a: any, b: any) => 
    a[dateField].localeCompare(b[dateField])
  );
};

// Helper function to filter data by time range
export const filterByTimeRange = (
  data: any[],
  dateField: string,
  timeRange: string
): any[] => {
  if (timeRange === 'ALL' || !timeRange) {
    return data;
  }
  
  const now = new Date();
  let cutoffDate = new Date();
  
  switch (timeRange) {
    case '6M':
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case '1Y':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    case '2Y':
      cutoffDate.setFullYear(now.getFullYear() - 2);
      break;
    default:
      return data;
  }
  
  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= cutoffDate;
  });
};

// Helper function to create axis configuration
export const createAxisConfig = (
  title: string,
  tickformat?: string,
  type: 'linear' | 'log' | 'date' | 'category' = 'linear'
): Partial<Plotly.LayoutAxis> => {
  return {
    title: {
      text: title,
      font: {
        size: 14,
        color: '#374151'
      }
    },
    tickfont: {
      size: 11,
      color: '#6b7280'
    },
    gridcolor: '#e5e7eb',
    gridwidth: 1,
    zeroline: true,
    zerolinecolor: '#d1d5db',
    zerolinewidth: 2,
    type,
    tickformat
  };
};