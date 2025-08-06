import { PythonScriptTemplate } from '../types/python.types';

export const PYTHON_SCRIPT_TEMPLATES: PythonScriptTemplate[] = [
  // Data Transformation Templates
  {
    id: 'basic-stats',
    name: 'Basic Statistics',
    description: 'Calculate basic statistics for numerical columns',
    category: 'data-transformation',
    tags: ['statistics', 'analysis', 'summary'],
    code: `# Basic statistics for the dataset
print("Dataset shape:", df.shape)
print("\\nBasic info:")
print(df.info())

print("\\nStatistical summary:")
print(df.describe())

# Display first few rows
print("\\nFirst 5 rows:")
print(df.head())

# Check for missing values
print("\\nMissing values:")
print(df.isnull().sum())
`
  },
  {
    id: 'add-calculated-column',
    name: 'Add Calculated Column',
    description: 'Create new columns based on existing data',
    category: 'data-transformation',
    tags: ['columns', 'calculation', 'transform'],
    code: `# Example: Add a calculated column
# Modify this to match your data structure

# Example 1: Calculate total revenue (if you have revenue columns)
# df['total_revenue'] = df['subscription_revenue'] + df['usage_revenue']

# Example 2: Create categorical column based on values
# df['revenue_tier'] = pd.cut(df['total_revenue'], 
#                            bins=[0, 1000, 5000, float('inf')], 
#                            labels=['Low', 'Medium', 'High'])

# Example 3: Calculate percentage change
# df['revenue_growth'] = df['revenue'].pct_change() * 100

# Example 4: Create flag/indicator column
# df['high_performer'] = df['performance_score'] > 8.0

print("New columns added successfully!")
print(f"Dataset now has {df.shape[1]} columns")
print(df.head())
`
  },
  {
    id: 'data-cleaning',
    name: 'Data Cleaning',
    description: 'Clean and preprocess data',
    category: 'data-transformation',
    tags: ['cleaning', 'preprocessing', 'quality'],
    code: `# Data cleaning operations

# 1. Remove duplicates
initial_rows = len(df)
df = df.drop_duplicates()
print(f"Removed {initial_rows - len(df)} duplicate rows")

# 2. Handle missing values
print("\\nMissing values before cleaning:")
print(df.isnull().sum())

# Fill numeric columns with median
numeric_columns = df.select_dtypes(include=['number']).columns
df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].median())

# Fill text columns with 'Unknown'
text_columns = df.select_dtypes(include=['object']).columns
df[text_columns] = df[text_columns].fillna('Unknown')

print("\\nMissing values after cleaning:")
print(df.isnull().sum())

# 3. Remove outliers (optional - using IQR method)
# for col in numeric_columns:
#     Q1 = df[col].quantile(0.25)
#     Q3 = df[col].quantile(0.75)
#     IQR = Q3 - Q1
#     lower_bound = Q1 - 1.5 * IQR
#     upper_bound = Q3 + 1.5 * IQR
#     df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]

print(f"\\nCleaned dataset shape: {df.shape}")
`
  },

  // Analysis Templates
  {
    id: 'correlation-analysis',
    name: 'Correlation Analysis',
    description: 'Analyze correlations between numerical variables',
    category: 'analysis',
    tags: ['correlation', 'relationships', 'statistics'],
    code: `# Correlation analysis
import numpy as np

# Select only numeric columns
numeric_df = df.select_dtypes(include=[np.number])

if numeric_df.empty:
    print("No numeric columns found for correlation analysis")
else:
    # Calculate correlation matrix
    correlation_matrix = numeric_df.corr()
    
    print("Correlation Matrix:")
    print(correlation_matrix.round(3))
    
    # Find strong correlations (> 0.7 or < -0.7)
    print("\\nStrong correlations (|correlation| > 0.7):")
    
    # Get pairs of strongly correlated variables
    strong_corrs = []
    for i in range(len(correlation_matrix.columns)):
        for j in range(i+1, len(correlation_matrix.columns)):
            corr_value = correlation_matrix.iloc[i, j]
            if abs(corr_value) > 0.7:
                strong_corrs.append((
                    correlation_matrix.columns[i],
                    correlation_matrix.columns[j],
                    corr_value
                ))
    
    if strong_corrs:
        for var1, var2, corr in strong_corrs:
            print(f"{var1} <-> {var2}: {corr:.3f}")
    else:
        print("No strong correlations found")
        
    # Summary statistics for numeric columns
    print("\\nSummary statistics for numeric columns:")
    print(numeric_df.describe().round(2))
`
  },
  {
    id: 'group-analysis',
    name: 'Group Analysis',
    description: 'Analyze data by groups and categories',
    category: 'analysis',
    tags: ['groupby', 'aggregation', 'categories'],
    code: `# Group analysis - modify column names to match your data

# Example 1: Analysis by category
# Replace 'category_column' with actual column name from your data
category_columns = df.select_dtypes(include=['object']).columns.tolist()
numeric_columns = df.select_dtypes(include=['number']).columns.tolist()

if category_columns and numeric_columns:
    # Use first categorical column for grouping
    group_col = category_columns[0]
    value_col = numeric_columns[0] if numeric_columns else None
    
    print(f"Group analysis by '{group_col}':")
    
    if value_col:
        grouped = df.groupby(group_col)[value_col].agg([
            'count', 'mean', 'median', 'std', 'min', 'max'
        ]).round(2)
        
        print(grouped)
        
        # Calculate percentages
        print(f"\\nDistribution of '{group_col}':")
        counts = df[group_col].value_counts()
        percentages = (counts / len(df) * 100).round(1)
        
        for category, count in counts.items():
            pct = percentages[category]
            print(f"{category}: {count} ({pct}%)")
    
    # Cross-tabulation if multiple categorical columns exist
    if len(category_columns) >= 2:
        print(f"\\nCross-tabulation: {category_columns[0]} vs {category_columns[1]}:")
        crosstab = pd.crosstab(df[category_columns[0]], df[category_columns[1]], margins=True)
        print(crosstab)
        
else:
    print("Need both categorical and numeric columns for group analysis")
    print(f"Categorical columns: {category_columns}")
    print(f"Numeric columns: {numeric_columns}")
`
  },

  // Visualization Templates
  {
    id: 'simple-plots',
    name: 'Simple Plots',
    description: 'Create basic visualizations',
    category: 'visualization',
    tags: ['plots', 'charts', 'matplotlib'],
    code: `# Simple plotting examples
import matplotlib.pyplot as plt

# Get numeric columns for plotting
numeric_columns = df.select_dtypes(include=['number']).columns.tolist()

if len(numeric_columns) >= 1:
    # Histogram of first numeric column
    col = numeric_columns[0]
    plt.figure(figsize=(8, 6))
    plt.hist(df[col].dropna(), bins=20, alpha=0.7)
    plt.title(f'Distribution of {col}')
    plt.xlabel(col)
    plt.ylabel('Frequency')
    plt.show()
    
    print(f"Created histogram for {col}")
    
    if len(numeric_columns) >= 2:
        # Scatter plot of first two numeric columns
        col1, col2 = numeric_columns[0], numeric_columns[1]
        plt.figure(figsize=(8, 6))
        plt.scatter(df[col1], df[col2], alpha=0.6)
        plt.xlabel(col1)
        plt.ylabel(col2)
        plt.title(f'{col1} vs {col2}')
        plt.show()
        
        print(f"Created scatter plot: {col1} vs {col2}")

else:
    print("No numeric columns available for plotting")
    print(f"Available columns: {df.columns.tolist()}")

# Display summary
print(f"\\nDataset summary: {df.shape[0]} rows, {df.shape[1]} columns")
`
  },

  // Custom Templates
  {
    id: 'time-series-analysis',
    name: 'Time Series Analysis',
    description: 'Analyze time-based data patterns',
    category: 'analysis',
    tags: ['time-series', 'trends', 'dates'],
    code: `# Time series analysis
# Assumes you have a date column - modify column name as needed

date_columns = []
for col in df.columns:
    if 'date' in col.lower() or 'time' in col.lower() or 'month' in col.lower():
        date_columns.append(col)

if date_columns:
    date_col = date_columns[0]
    print(f"Using date column: {date_col}")
    
    # Convert to datetime if not already
    try:
        df[date_col] = pd.to_datetime(df[date_col])
        
        # Sort by date
        df = df.sort_values(date_col)
        
        # Basic time series info
        print(f"Date range: {df[date_col].min()} to {df[date_col].max()}")
        print(f"Number of time periods: {df[date_col].nunique()}")
        
        # Get numeric columns for analysis
        numeric_columns = df.select_dtypes(include=['number']).columns.tolist()
        
        if numeric_columns:
            value_col = numeric_columns[0]
            
            # Group by time period and calculate metrics
            df['year_month'] = df[date_col].dt.to_period('M')
            monthly_stats = df.groupby('year_month')[value_col].agg([
                'sum', 'mean', 'count'
            ]).round(2)
            
            print(f"\\nMonthly statistics for {value_col}:")
            print(monthly_stats.head(10))
            
            # Calculate growth rates
            monthly_stats['growth_rate'] = monthly_stats['sum'].pct_change() * 100
            
            print(f"\\nGrowth rates (month-over-month):")
            print(monthly_stats[['sum', 'growth_rate']].tail(6))
            
    except Exception as e:
        print(f"Error processing dates: {e}")
        
else:
    print("No date columns found. Available columns:")
    print(df.columns.tolist())
`
  },
  {
    id: 'custom-template',
    name: 'Custom Script Template',
    description: 'Start with a blank template for custom analysis',
    category: 'custom',
    tags: ['custom', 'blank', 'template'],
    code: `# Custom Python script
# The dashboard data is available as 'df' (pandas DataFrame)

# 1. Explore your data
print("Dataset Info:")
print(f"Shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print("\\nFirst few rows:")
print(df.head())

# 2. Add your custom analysis here
# Example operations:
# - df['new_column'] = df['existing_column'] * 2
# - filtered_df = df[df['column'] > value]
# - grouped = df.groupby('category').mean()
# - df.plot(kind='scatter', x='col1', y='col2')

# 3. Your results will be automatically displayed
print("\\nCustom analysis complete!")
`
  }
];

export const getTemplatesByCategory = (category: string): PythonScriptTemplate[] => {
  return PYTHON_SCRIPT_TEMPLATES.filter(template => template.category === category);
};

export const getTemplateById = (id: string): PythonScriptTemplate | undefined => {
  return PYTHON_SCRIPT_TEMPLATES.find(template => template.id === id);
};

export const searchTemplates = (query: string): PythonScriptTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return PYTHON_SCRIPT_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const TEMPLATE_CATEGORIES = [
  { id: 'data-transformation', name: 'Data Transformation', icon: '🔄' },
  { id: 'analysis', name: 'Analysis', icon: '📊' },
  { id: 'visualization', name: 'Visualization', icon: '📈' },
  { id: 'custom', name: 'Custom', icon: '⚡' }
];