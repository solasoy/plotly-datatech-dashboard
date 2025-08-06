# DataTech Dashboard - Plotly Dash Clone

A modern, interactive business intelligence dashboard built with React, TypeScript, and Plotly.js. This project is a feature-rich clone of Plotly Dash with enhanced state management, cross-component communication, and Python execution capabilities.

## 🚀 Features

### Core Dashboard Features
- **Interactive Charts**: Revenue charts, customer pie charts, performance scatter plots, and geographic visualizations
- **Advanced State Management**: Undo/redo functionality, state persistence, and transaction tracking  
- **Cross-Component Communication**: Chart-to-chart interactions and synchronized filtering
- **Responsive Controls**: Date range pickers, filter dropdowns, and metric selectors
- **Python Execution Engine**: Run Python scripts with Pyodide for data analysis

### Enhanced State Management
- 🔄 **Undo/Redo**: Full state history with transaction replay
- 💾 **Persistence**: Save/load dashboard configurations to localStorage
- 🔗 **Cross-Communication**: Chart interactions affect other components
- 🎯 **Smart Dependencies**: Automatic filter cascading (region → industry, department → metric)
- 📊 **Comprehensive Logging**: State change tracking and debugging

### UI/UX Features
- **Tailwind CSS**: Modern, responsive design
- **TypeScript**: Full type safety and IntelliSense support
- **Multiple Layouts**: Horizontal, vertical, and sidebar control layouts
- **Accessibility**: WCAG 2.1 AA compliance features
- **Professional Styling**: Clean, business-focused interface

## 🛠️ Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS 4.x
- **Charts**: Plotly.js (vanilla JavaScript library)
- **Python Engine**: Pyodide (WebAssembly-based Python execution)
- **Code Editor**: Monaco Editor for Python script editing
- **Build Tool**: Vite
- **Package Manager**: npm
- **Icons**: Heroicons React

## 🏗️ Project Structure

```
src/
├── components/
│   ├── charts/              # Chart components (future)
│   ├── controls/            # Interactive control components
│   │   ├── DateRangePicker.tsx
│   │   ├── FilterDropdown.tsx
│   │   ├── MetricSelector.tsx
│   │   ├── ControlPanel.tsx
│   │   └── index.ts
│   ├── data/               # Data import/export components
│   ├── layout/             # Layout components (backup)
│   └── python/             # Python execution components
├── hooks/
│   ├── useDashboard.ts     # Enhanced state management
│   ├── useChartCallbacks.ts # Cross-component communication
│   ├── usePython.ts        # Python execution hook
│   └── index.ts
├── types/
│   ├── dashboard.types.ts  # Dashboard type definitions
│   └── python.types.ts     # Python execution types
├── utils/
│   └── excelImport.ts      # Data import utilities
└── workers/
    └── python.worker.ts    # Python Web Worker
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd datatech-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

## 📖 Usage

### Basic Dashboard Usage

```typescript
import { useDashboard } from './hooks';
import { ControlPanel } from './components/controls';

function MyDashboard() {
  const dashboard = useDashboard();
  
  const handleStateChange = (updates) => {
    dashboard.updateDashboardState(updates, 'user-interaction');
  };

  return (
    <ControlPanel
      state={dashboard.dashboardState}
      onStateChange={handleStateChange}
      layout="horizontal"
    />
  );
}
```

### Enhanced State Management

```typescript
// Save current state
dashboard.saveState('my-configuration');

// Load saved state
dashboard.loadState('my-configuration');

// Undo/Redo
dashboard.undo();
dashboard.redo();

// Register callbacks for state changes
dashboard.registerCallback('my-component', (newState, prevState) => {
  console.log('State changed:', newState);
});
```

### Cross-Component Communication

```typescript
import { useChartCallbacks } from './hooks';

function MyChart() {
  const callbacks = useChartCallbacks('revenue-chart');
  
  const handleChartClick = (data) => {
    callbacks.handleChartInteraction({
      chartId: 'revenue-chart',
      type: 'click',
      data: { department: data.department }
    });
  };
}
```

## 🎨 Component Library

### Control Components

#### DateRangePicker
```typescript
<DateRangePicker
  value="1Y"
  onChange={(range) => console.log(range)}
  options={[
    { label: '6 Months', value: '6M' },
    { label: '1 Year', value: '1Y' }
  ]}
/>
```

#### FilterDropdown
```typescript
<FilterDropdown
  label="Department"
  value="engineering"
  options={departmentOptions}
  onChange={(dept) => setDepartment(dept)}
  multiSelect={false}
/>
```

#### MetricSelector
```typescript
<MetricSelector
  selectedMetric="revenue"
  availableMetrics={REVENUE_METRICS}
  onMetricChange={(metric) => setMetric(metric)}
  layout="buttons" // or "tabs" | "grid"
/>
```

## 🏃‍♂️ Development Progress

### ✅ Completed (Phase 1-2)
- [x] Project setup and configuration
- [x] TypeScript interfaces and type definitions
- [x] Control components (DateRangePicker, FilterDropdown, MetricSelector)
- [x] Enhanced state management with undo/redo
- [x] Cross-component communication system
- [x] State persistence and restoration
- [x] Python execution engine setup
- [x] Comprehensive demo components

### 🚧 In Progress (Phase 3)
- [ ] Chart components (Revenue, Customer, Performance, Geographic)
- [ ] Chart interactivity and cross-filtering
- [ ] Data visualization with Plotly.js
- [ ] Mock data generation

### 📋 Planned (Phase 4-6)
- [ ] Python-JavaScript data bridge
- [ ] Advanced chart interactions
- [ ] Performance optimizations
- [ ] UI/UX polish and animations
- [ ] Export capabilities (CSV/PDF)
- [ ] Dark/light theme support

## 🧪 Demo Components

The project includes comprehensive demo components to showcase functionality:

- **ControlPanelDemo**: Interactive control component testing
- **EnhancedStateDemo**: Advanced state management features
- **Python execution demos**: Pyodide integration testing

Access demos by importing and using the demo components in your application.

## 📝 Type Safety

The project is fully typed with TypeScript. Key interfaces:

```typescript
interface DashboardState {
  selectedTimeRange: string;
  selectedRevenueType: 'subscription' | 'usage';
  selectedDepartment: string;
  selectedMetric: string;
  selectedIndustry: string;
  selectedRegion: string;
}

interface StateTransaction {
  id: string;
  timestamp: number;
  updates: Partial<DashboardState>;
  source?: string;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

See the [work plan.md](./work%20plan.md) file for detailed development phases and timeline.

---

**Built with ❤️ using React, TypeScript, and Plotly.js**