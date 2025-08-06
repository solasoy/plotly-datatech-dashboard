# Hackathon Project: Custom dashboard that mimics Ploty Dash using Cursor AI

## 🎯 Project Overview

Create a modern, interactive dashboard application that mimics Plotly Dash functionality using React/TypeScript and Cursor AI. Build a business intelligence dashboard that showcases multiple interactive visualization types using real-world business scenarios.

## 🏆 Challenge Goals

- **Primary**: Build a functional dashboard with 3-4 different interactive plot types
- **Secondary**: Implement reactive component system similar to Plotly Dash callbacks  
- **Advanced**: Integrate Python script execution engine for custom data transformations
- **Bonus**: Add advanced features like data filtering, export capabilities, or real-time updates

## 🛠 Tech Stack Requirements

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Plotly.js (vanilla JavaScript library)
- **Python Engine**: Pyodide (WebAssembly-based Python in browser)
- **Code Editor**: Monaco Editor for Python script editing
- **Build Tool**: Vite or Create React App
- **AI Assistant**: Cursor AI for code generation and debugging
- **Package Manager**: npm or yarn

## 📊 Business Scenario: "DataTech Solutions Inc."

You're building a dashboard for DataTech Solutions Inc., a mid-sized SaaS company that provides data analytics services to retail clients. The dashboard will help executives and analysts monitor business performance across multiple dimensions.

### Company Context
- **Industry**: B2B SaaS Analytics Platform
- **Revenue Model**: Monthly subscriptions + usage-based pricing
- **Client Base**: 450+ retail companies
- **Team Size**: 120 employees across 4 departments
- **Geographic Presence**: North America, Europe, Asia-Pacific

## 📈 Required Visualization Types

### 1. Revenue Analytics (Bar/Line Chart)
**Data Source**: Monthly revenue breakdown by product line
**Interactive Features**: 
- Toggle between revenue types (subscription vs usage)
- Time range selector (6M, 1Y, 2Y, All Time)
- Department filter dropdown

### 2. Customer Distribution (Pie/Donut Chart)
**Data Source**: Customer segmentation by industry and region
**Interactive Features**:
- Drill-down from industry to region
- Toggle between customer count and revenue share
- Hover tooltips with detailed metrics

### 3. Performance Metrics (Scatter Plot)
**Data Source**: Employee performance vs team productivity
**Interactive Features**:
- Department color coding
- Adjustable axis metrics (performance score, projects completed, etc.)
- Size bubbles by team size or budget

### 4. Geographic Sales (Heatmap/Choropleth)
**Data Source**: Sales performance by region/country
**Interactive Features**:
- Zoom and pan capabilities
- Time animation slider
- Metric selection (revenue, customer count, growth rate)

## 🐍 Python Script Execution Engine

### Core Python Integration Features
**Execution Environment**: Browser-based Python using Pyodide WebAssembly
**Supported Libraries**: pandas, numpy, scipy, matplotlib, scikit-learn, and 100+ packages
**Security**: Sandboxed execution with resource limits and timeout protection

### Python Engine Capabilities

#### 1. **Custom Data Transformations**
- Write Python scripts to transform dashboard data in real-time
- Add computed columns with complex business logic
- Perform statistical analyses and data aggregation
- Create custom metrics and KPIs

**Example Use Cases**:
```python
# Calculate year-over-year growth rates
df['yoy_growth'] = df.groupby('product')['revenue'].pct_change(12) * 100

# Add customer tier classifications
df['tier'] = pd.cut(df['revenue'], bins=[0, 1000, 5000, float('inf')], 
                   labels=['Bronze', 'Silver', 'Gold'])

# Perform correlation analysis
correlation_matrix = df[numeric_columns].corr()
```

#### 2. **Advanced Analytics Integration**
- Machine learning predictions directly in the browser
- Statistical modeling and forecasting
- Custom visualization generation
- Data quality assessments and outlier detection

#### 3. **Interactive Code Editor**
- Monaco Editor with Python syntax highlighting
- Auto-completion for data columns and pandas methods
- Real-time error checking and suggestions
- Script templates for common transformations

#### 4. **Data Flow Integration**
- Seamless access to all dashboard data as pandas DataFrames
- Automatic synchronization of computed results back to charts
- Support for multiple data sources and joins
- Live preview of transformations as you type

## 🗂 Fake Business Data Structure

#### Data is provided in different tabs of the following excel spreadsheet: datatech_solutions_dataset.xlsx
#### The data structure is as follows:

### Revenue Data (24 months)
```json
{
  "revenue_data": [
    {
      "month": "2023-01",
      "subscription_revenue": 245000,
      "usage_revenue": 89000,
      "product_line": "Analytics Pro",
      "department": "Enterprise Sales",
      "region": "North America"
    },
    {
      "month": "2023-01",
      "subscription_revenue": 156000,
      "usage_revenue": 67000,
      "product_line": "Insights Basic",
      "department": "SMB Sales",
      "region": "North America"
    }
    // ... continues for 24 months across 3 product lines
  ]
}
```

### Customer Segmentation Data
```json
{
  "customer_data": [
    {
      "industry": "Retail Fashion",
      "region": "North America",
      "customer_count": 87,
      "total_revenue": 1240000,
      "avg_monthly_spend": 14250,
      "churn_rate": 0.05
    },
    {
      "industry": "Electronics",
      "region": "Europe",
      "customer_count": 63,
      "total_revenue": 980000,
      "avg_monthly_spend": 15550,
      "churn_rate": 0.03
    }
    // ... 12 industries × 3 regions
  ]
}
```

### Employee Performance Data
```json
{
  "performance_data": [
    {
      "employee_id": "EMP001",
      "name": "Sarah Chen",
      "department": "Engineering",
      "performance_score": 8.7,
      "projects_completed": 12,
      "team_size": 6,
      "budget_managed": 450000,
      "years_experience": 5.2,
      "satisfaction_score": 4.1
    }
    // ... 120 employees across 4 departments
  ]
}
```

### Geographic Sales Data
```json
{
  "geographic_data": [
    {
      "country": "United States",
      "country_code": "US",
      "latitude": 39.8283,
      "longitude": -98.5795,
      "q1_2023_revenue": 1450000,
      "q2_2023_revenue": 1620000,
      "q3_2023_revenue": 1580000,
      "q4_2023_revenue": 1750000,
      "customer_count": 187,
      "growth_rate": 0.23
    }
    // ... 15 countries
  ]
}
```

## 🏗 Project Structure

```
dashboard-app/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── CustomerPieChart.tsx
│   │   │   ├── PerformanceScatter.tsx
│   │   │   └── GeographicHeatmap.tsx
│   │   ├── controls/
│   │   │   ├── DateRangePicker.tsx
│   │   │   ├── FilterDropdown.tsx
│   │   │   └── MetricSelector.tsx
│   │   ├── python/
│   │   │   ├── PythonEditor.tsx        // Monaco-based code editor
│   │   │   ├── PythonConsole.tsx       // Output and error display
│   │   │   ├── DataPreview.tsx         // Result visualization
│   │   │   ├── ModuleManager.tsx       // Package installation UI
│   │   │   └── ScriptTemplates.tsx     // Pre-built script library
│   │   └── layout/
│   │       ├── Dashboard.tsx
│   │       ├── Sidebar.tsx
│   │       └── Header.tsx
│   ├── hooks/
│   │   ├── useDashboard.ts
│   │   ├── useChartData.ts
│   │   ├── useFilters.ts
│   │   ├── usePython.ts               // Pyodide management
│   │   └── useScriptExecution.ts      // Script runner
│   ├── workers/
│   │   └── python.worker.ts           // Web Worker for Pyodide
│   ├── data/
│   │   ├── mockData.ts
│   │   └── dataTransforms.ts
│   ├── lib/
│   │   ├── pythonBridge.ts            // Data conversion utilities
│   │   └── scriptTemplates.ts         // Predefined Python scripts
│   ├── types/
│   │   ├── dashboard.types.ts
│   │   └── python.types.ts            // Python engine interfaces
│   └── utils/
│       ├── plotlyHelpers.ts
│       └── dataUtils.ts
├── public/
└── package.json
```

## 🚀 Development Phases

### Phase 1: Setup & Foundation 
1. **Environment Setup**
   - Initialize React/TypeScript project with Vite
   - Install dependencies: `plotly.js`, `tailwindcss`, `date-fns`
   - Configure Tailwind CSS

2. **Data Layer**
   - Create mock data generators
   - Set up TypeScript interfaces
   - Implement data transformation utilities

3. **Basic Layout**
   - Create responsive dashboard layout
   - Implement header and sidebar components
   - Set up routing structure (if multi-page)

### Phase 2: Core Visualization Components 
1. **Revenue Chart Component**
   - Implement bar/line chart with Plotly.js
   - Add time range selector
   - Create toggle for revenue types

2. **Customer Pie Chart**
   - Build donut chart with drill-down capability
   - Implement hover interactions
   - Add legend with custom styling

3. **Performance Scatter Plot**
   - Create bubble chart with size encoding
   - Add department color coding
   - Implement axis metric selection

4. **Geographic Visualization**
   - Build choropleth map or heatmap
   - Add zoom and pan functionality
   - Implement time animation

### Phase 2.5: Python Execution Engine (3-4 hours)
1. **Pyodide Integration**
   - Set up WebAssembly Python runtime
   - Create Web Worker for non-blocking execution
   - Install data science packages (pandas, numpy, scipy)

2. **Python Editor Interface**
   - Implement Monaco Editor with Python syntax highlighting
   - Add auto-completion for data columns and methods
   - Create script templates library

3. **Data Bridge Implementation**
   - Build JavaScript/Python data conversion utilities
   - Enable real-time data synchronization
   - Add computed column integration with existing charts

4. **Security & Performance**
   - Implement execution sandboxing and resource limits
   - Add error handling and timeout protection
   - Optimize for large dataset processing

### Phase 3: Interactivity & State Management 
1. **Reactive System**
   - Implement central state management
   - Create callback system for component interactions
   - Add cross-chart filtering capabilities

2. **Control Components**
   - Build reusable filter components
   - Implement date range picker
   - Add metric selection dropdowns

3. **Data Synchronization**
   - Connect all charts to central state
   - Implement real-time data updates
   - Add loading and error states

### Phase 4: Polish & Advanced Features (45 minutes)
1. **UI/UX Enhancements**
   - Improve responsive design
   - Add smooth transitions and animations
   - Implement dark/light theme toggle

2. **Advanced Features**
   - Add data export functionality (CSV/PDF)
   - Implement bookmark/save view feature
   - Add chart annotation capabilities

3. **Performance Optimization**
   - Optimize chart rendering performance
   - Implement lazy loading for large datasets
   - Add chart caching mechanisms

## 🎨 Design Requirements

### Visual Design
- **Color Scheme**: Professional blue/gray palette with accent colors
- **Typography**: Clean, readable fonts (Inter or similar)
- **Layout**: Card-based design with proper spacing
- **Responsive**: Mobile-first approach with breakpoints

### User Experience
- **Intuitive Navigation**: Clear visual hierarchy
- **Fast Interactions**: Sub-200ms response times
- **Accessibility**: WCAG 2.1 AA compliance
- **Error Handling**: Graceful degradation and user feedback

## 🧪 Using Cursor AI Effectively

### Prompt Strategies
1. **Component Generation**
   ```
   Create a React TypeScript component for a Plotly.js bar chart that shows monthly revenue data with the following features:
   - Toggle between subscription and usage revenue
   - Time range selector
   - Responsive design with Tailwind CSS
   ```

2. **Data Transformation**
   ```
   Generate a TypeScript utility function that transforms raw revenue data into the format needed for Plotly.js bar charts, including grouping by month and product line
   ```

3. **State Management**
   ```
   Create a React hook that manages dashboard state and implements a callback system similar to Plotly Dash, where changes to input components automatically update dependent charts
   ```

### Debugging with Cursor
- Use Cursor to explain error messages and suggest fixes
- Ask for code optimization suggestions
- Request alternative implementation approaches
- Get help with TypeScript type definitions

## 📋 Deliverables Checklist

### Core Requirements (Must Have)
- [ ] 4 different interactive chart types implemented
- [ ] Responsive dashboard layout
- [ ] Basic filtering and interaction capabilities
- [ ] Clean, professional UI design
- [ ] TypeScript implementation with proper types

### Advanced Features (Nice to Have)
- [ ] Cross-chart filtering and highlighting
- [ ] Data export functionality
- [ ] Animation and smooth transitions
- [ ] Dark/light theme support
- [ ] Performance optimization techniques

### Presentation Ready
- [ ] Demo-ready with sample scenarios
- [ ] Code documentation and comments
- [ ] README with setup instructions
- [ ] Deployed version (Vercel/Netlify)

## 🏅 Judging Criteria

1. **Functionality**
   - Chart interactivity and responsiveness
   - Data filtering and cross-chart communication
   - Error handling and edge cases

2. **Design & UX**
   - Visual appeal and professional appearance
   - User experience and intuitive interactions
   - Responsive design implementation

3. **Innovation**
   - Creative use of Plotly.js features
   - Unique interaction patterns
   - Advanced dashboard capabilities

## 🎉 Bonus Challenges

### Advanced Python Features
- **Custom Python Modules**: Allow users to upload and import custom Python packages
- **GPU Acceleration**: Implement WebGPU support for numerical computations
- **Jupyter Integration**: Export Python scripts as downloadable Jupyter notebooks
- **Advanced ML**: Implement scikit-learn, TensorFlow.js integration for machine learning

### Technical Challenges
- **Real-time Data**: Implement WebSocket connection for live updates
- **AI Integration**: Add natural language query interface for generating Python scripts
- **Performance**: Handle datasets with 100k+ data points through optimized data structures
- **Distributed Computing**: Implement Web Workers pool for parallel Python execution

### Creative Challenges
- **Storytelling**: Create guided dashboard tours with Python-generated insights
- **Gamification**: Add achievement system for data exploration and Python mastery
- **Collaboration**: Implement sharing and commenting features for Python scripts
- **Mobile App**: Create companion mobile experience with simplified Python editor

## 📚 Resources & References

### Documentation
- [Plotly.js Documentation](https://plotly.com/javascript/)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Inspiration
- [Observable Notebooks](https://observablehq.com/)
- [Tableau Public Gallery](https://public.tableau.com/gallery)
- [D3.js Examples](https://observablehq.com/@d3/gallery)

### Data Visualization Best Practices
- Choose appropriate chart types for data relationships
- Maintain consistent color schemes across charts
- Provide clear labels and legends
- Optimize for both desktop and mobile viewing

## ⚡ Quick Start Commands

```bash
# Create new React TypeScript project
npm create vite@latest dashboard-app -- --template react-ts
cd dashboard-app

# Install core dependencies
npm install plotly.js @types/plotly.js date-fns lodash
npm install -D tailwindcss postcss autoprefixer @types/lodash

# Install Python execution engine
npm install pyodide @monaco-editor/react monaco-editor

# Configure Tailwind CSS
npx tailwindcss init -p

# Start development server
npm run dev
```

