// Dashboard Data Types
export interface RevenueData {
  month: string;
  subscription_revenue: number;
  usage_revenue: number;
  product_line: string;
  department: string;
  region: string;
}

export interface CustomerData {
  industry: string;
  region: string;
  customer_count: number;
  total_revenue: number;
  avg_monthly_spend: number;
  churn_rate: number;
}

export interface PerformanceData {
  employee_id: string;
  name: string;
  department: string;
  performance_score: number;
  projects_completed: number;
  team_size: number;
  budget_managed: number;
  years_experience: number;
  satisfaction_score: number;
}

export interface GeographicData {
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  q1_2023_revenue: number;
  q2_2023_revenue: number;
  q3_2023_revenue: number;
  q4_2023_revenue: number;
  customer_count: number;
  growth_rate: number;
}

// Dashboard State Management
export interface DashboardState {
  selectedTimeRange: string;
  selectedRevenueType: 'subscription' | 'usage';
  selectedDepartment: string;
  selectedMetric: string;
  selectedIndustry: string;
  selectedRegion: string;
}

export interface DashboardFilters {
  timeRange: string[];
  departments: string[];
  regions: string[];
  industries: string[];
  productLines: string[];
}

// Data Import Types
export interface DataImportState {
  isImporting: boolean;
  hasData: boolean;
  error: string | null;
  lastImported: Date | null;
  recordCounts: {
    revenue: number;
    customer: number;
    performance: number;
    geographic: number;
  };
}

// Chart Configuration Types
export interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';
  dataSource: keyof DashboardDatasets;
  xAxis?: string;
  yAxis?: string;
  colorBy?: string;
  sizeBy?: string;
  filters?: string[];
}

export interface DashboardDatasets {
  revenue: RevenueData[];
  customer: CustomerData[];
  performance: PerformanceData[];
  geographic: GeographicData[];
}

// Control Component Types
export interface DropdownOption {
  label: string;
  value: string;
}

export interface MetricOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface ControlState {
  timeRange: string;
  department: string;
  region: string;
  industry: string;
  metric: string;
  revenueType: 'subscription' | 'usage';
}