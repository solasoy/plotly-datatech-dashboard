# Claude.md - DataTech Dashboard Project

## Project Overview
You are helping to build a Plotly Dash clone using React/TypeScript, Plotly.js, and Tailwind CSS. This is an interactive business intelligence dashboard for DataTech Solutions Inc.

## Tech Stack
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Plotly.js (vanilla JavaScript library)
- **Build Tool**: Vite
- **Package Manager**: npm

## Project Structure
```
src/
├── components/
│   ├── charts/
│   │   ├── RevenueChart.tsx
│   │   ├── CustomerPieChart.tsx
│   │   ├── PerformanceScatter.tsx
│   │   └── GeographicHeatmap.tsx
│   ├── controls/
│   │   ├── DateRangePicker.tsx
│   │   ├── FilterDropdown.tsx
│   │   └── MetricSelector.tsx
│   └── layout/
│       ├── Dashboard.tsx
│       ├── Sidebar.tsx
│       └── Header.tsx
├── hooks/
│   ├── useDashboard.ts
│   ├── useChartData.ts
│   └── useFilters.ts
├── data/
│   ├── mockData.ts
│   └── dataTransforms.ts
├── types/
│   └── dashboard.types.ts
├── utils/
│   ├── plotlyHelpers.ts
│   └── dataUtils.ts
└── styles/
    └── globals.css
```

## Key Interfaces
When working with this project, use these TypeScript interfaces:

```typescript
interface RevenueData {
  month: string;
  subscription_revenue: number;
  usage_revenue: number;
  product_line: string;
  department: string;
  region: string;
}

interface CustomerData {
  industry: string;
  region: string;
  customer_count: number;
  total_revenue: number;
  avg_monthly_spend: number;
  churn_rate: number;
}

interface PerformanceData {
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

interface GeographicData {
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

interface DashboardState {
  selectedTimeRange: string;
  selectedRevenueType: 'subscription' | 'usage';
  selectedDepartment: string;
  selectedMetric: string;
  selectedIndustry: string;
  selectedRegion: string;
}
```

## Chart Components Requirements

### 1. Revenue Chart (RevenueChart.tsx)
- Implement bar/line chart toggle
- Time range selection (6M, 1Y, 2Y, All Time)
- Revenue type toggle (subscription vs usage)
- Department filter integration
- Interactive tooltips and legends

### 2. Customer Pie Chart (CustomerPieChart.tsx)
- Donut chart visualization
- Industry to region drill-down capability
- Toggle between customer count and revenue share
- Interactive hover tooltips
- Custom legend with Tailwind styling

### 3. Performance Scatter Plot (PerformanceScatter.tsx)
- Bubble chart with size encoding
- Department color coding
- Adjustable axis metrics
- Interactive point selection
- Performance correlation analysis

### 4. Geographic Heatmap (GeographicHeatmap.tsx)
- Choropleth map or heatmap visualization
- Zoom and pan capabilities
- Time animation slider
- Metric selection (revenue, customer count, growth rate)
- Country-level detail view

## Styling Guidelines

Use this color scheme:
```css
--primary-blue: #2563eb;
--secondary-blue: #1d4ed8;
--accent-blue: #3b82f6;
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-800: #1f2937;
--gray-900: #111827;
```

Typography:
- Font: Inter (Google Fonts)
- Headings: 24px, 20px, 18px, 16px
- Body: 14px, 12px
- Weights: 400, 500, 600, 700

## State Management Pattern
Use React hooks for state management:
```typescript
const useDashboard = () => {
  const [state, setState] = useState<DashboardState>(initialState);
  const updateState = (updates: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };
  return { state, updateState };
};
```

## Plotly.js Integration
- Use vanilla Plotly.js library (not react-plotly.js)
- Create reusable plot configuration helpers
- Implement responsive sizing
- Handle plot updates efficiently

## Commands
```bash
# Run development server
npm run dev

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Build for production
npm run build
```

## Implementation Priorities
1. Set up project structure and TypeScript configuration
2. Create mock data generators with realistic business patterns
3. Build basic layout components (Dashboard, Header, Sidebar)
4. Implement chart components one by one
5. Add interactivity and cross-chart communication
6. Polish UI/UX with animations and transitions
7. Optimize performance for large datasets

## Key Features to Implement
- Reactive callback system similar to Plotly Dash
- Cross-chart filtering and highlighting
- Responsive design for all screen sizes
- Data export capabilities (CSV/PDF)
- Theme toggle (dark/light mode)
- Loading states and error handling
- Accessibility features (WCAG 2.1 AA compliance)

## Performance Considerations
- Implement chart rendering optimization
- Use data caching mechanisms
- Add lazy loading for large datasets
- Debounce filter updates
- Optimize memory usage with proper cleanup

## Testing Requirements
- Component unit tests
- Integration tests for chart interactions
- Cross-browser compatibility testing
- Performance testing with large datasets
- Accessibility testing

When implementing features, always:
- Follow TypeScript best practices
- Use Tailwind CSS utilities for styling
- Ensure responsive design
- Add proper error handling
- Include loading states
- Make components reusable
- Document complex logic