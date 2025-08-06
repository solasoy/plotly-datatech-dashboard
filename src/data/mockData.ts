import { RevenueData, CustomerData, PerformanceData, GeographicData } from '../types/dashboard.types';

// Mock data generators for realistic business patterns

// Generate 24 months of revenue data
export const generateRevenueData = (): RevenueData[] => {
  const data: RevenueData[] = [];
  const departments = ['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance', 'HR'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  const productLines = ['Platform', 'Analytics', 'API Services', 'Professional Services'];
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 24);
  
  for (let monthOffset = 0; monthOffset < 24; monthOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + monthOffset);
    const monthStr = currentDate.toISOString().slice(0, 7); // YYYY-MM format
    
    departments.forEach(dept => {
      regions.forEach(region => {
        productLines.forEach(productLine => {
          // Create seasonal and growth patterns
          const seasonalFactor = 1 + 0.2 * Math.sin((monthOffset * Math.PI * 2) / 12);
          const growthFactor = 1 + (monthOffset * 0.05); // 5% monthly growth trend
          const randomVariation = 0.8 + Math.random() * 0.4; // ±20% random variation
          
          // Base revenue amounts vary by department and region
          const baseSubscription = getDepartmentBase(dept) * getRegionMultiplier(region) * 1000;
          const baseUsage = baseSubscription * 0.3; // Usage is typically 30% of subscription
          
          const subscription_revenue = Math.round(
            baseSubscription * seasonalFactor * growthFactor * randomVariation
          );
          
          const usage_revenue = Math.round(
            baseUsage * seasonalFactor * growthFactor * randomVariation * (1 + Math.random() * 0.5)
          );
          
          data.push({
            month: monthStr,
            subscription_revenue,
            usage_revenue,
            product_line: productLine,
            department: dept,
            region
          });
        });
      });
    });
  }
  
  return data;
};

// Generate customer data across 12 industries × 4 regions
export const generateCustomerData = (): CustomerData[] => {
  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 
    'Retail', 'Energy', 'Education', 'Transportation',
    'Media', 'Government', 'Real Estate', 'Telecommunications'
  ];
  
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  
  return industries.flatMap(industry => 
    regions.map(region => {
      const baseCustomers = getIndustryCustomerBase(industry);
      const regionMultiplier = getRegionMultiplier(region);
      const customer_count = Math.round(baseCustomers * regionMultiplier * (0.7 + Math.random() * 0.6));
      
      const avg_monthly_spend = Math.round(
        getIndustrySpendBase(industry) * regionMultiplier * (0.8 + Math.random() * 0.4)
      );
      
      return {
        industry,
        region,
        customer_count,
        total_revenue: customer_count * avg_monthly_spend * 12,
        avg_monthly_spend,
        churn_rate: Math.round((0.02 + Math.random() * 0.08) * 100) / 100 // 2-10% churn
      };
    })
  );
};

// Generate performance data for 120 employees across departments
export const generatePerformanceData = (): PerformanceData[] => {
  const departments = ['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance', 'HR'];
  const names = [
    'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown',
    'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'Jack Anderson',
    'Kate Roberts', 'Liam Thompson', 'Maya Patel', 'Noah Garcia', 'Olivia Martinez'
  ];
  
  const data: PerformanceData[] = [];
  let employeeId = 1000;
  
  departments.forEach(department => {
    const deptSize = Math.floor(15 + Math.random() * 10); // 15-25 people per dept
    
    for (let i = 0; i < deptSize; i++) {
      const name = names[Math.floor(Math.random() * names.length)] + ` ${Math.floor(Math.random() * 1000)}`;
      const years_experience = Math.floor(1 + Math.random() * 15);
      const team_size = Math.floor(3 + Math.random() * 12);
      
      // Performance correlates somewhat with experience
      const experienceFactor = Math.min(years_experience / 10, 1);
      const performance_score = Math.round(
        (60 + experienceFactor * 30 + Math.random() * 20) * 10
      ) / 10;
      
      const projects_completed = Math.floor(
        (2 + performance_score / 20) * (1 + Math.random() * 0.5)
      );
      
      const budget_managed = Math.round(
        getDepartmentBudgetBase(department) * 
        (0.5 + Math.random() * 1.5) * 
        (1 + years_experience / 20)
      );
      
      const satisfaction_score = Math.round(
        (3.0 + Math.random() * 2.0 + performance_score / 25) * 10
      ) / 10;
      
      data.push({
        employee_id: (employeeId++).toString(),
        name,
        department,
        performance_score,
        projects_completed,
        team_size,
        budget_managed,
        years_experience,
        satisfaction_score: Math.min(satisfaction_score, 5.0)
      });
    }
  });
  
  return data;
};

// Generate geographic data for 15 countries
export const generateGeographicData = (): GeographicData[] => {
  const countries = [
    { country: 'United States', country_code: 'US', latitude: 39.8283, longitude: -98.5795 },
    { country: 'Canada', country_code: 'CA', latitude: 56.1304, longitude: -106.3468 },
    { country: 'United Kingdom', country_code: 'GB', latitude: 55.3781, longitude: -3.4360 },
    { country: 'Germany', country_code: 'DE', latitude: 51.1657, longitude: 10.4515 },
    { country: 'France', country_code: 'FR', latitude: 46.2276, longitude: 2.2137 },
    { country: 'Japan', country_code: 'JP', latitude: 36.2048, longitude: 138.2529 },
    { country: 'Australia', country_code: 'AU', latitude: -25.2744, longitude: 133.7751 },
    { country: 'Singapore', country_code: 'SG', latitude: 1.3521, longitude: 103.8198 },
    { country: 'Brazil', country_code: 'BR', latitude: -14.2350, longitude: -51.9253 },
    { country: 'Mexico', country_code: 'MX', latitude: 23.6345, longitude: -102.5528 },
    { country: 'India', country_code: 'IN', latitude: 20.5937, longitude: 78.9629 },
    { country: 'South Korea', country_code: 'KR', latitude: 35.9078, longitude: 127.7669 },
    { country: 'Netherlands', country_code: 'NL', latitude: 52.1326, longitude: 5.2913 },
    { country: 'Spain', country_code: 'ES', latitude: 40.4637, longitude: -3.7492 },
    { country: 'Sweden', country_code: 'SE', latitude: 60.1282, longitude: 18.6435 }
  ];
  
  return countries.map(countryInfo => {
    const baseRevenue = getCountryRevenueBase(countryInfo.country);
    const growthTrend = -0.1 + Math.random() * 0.3; // -10% to +20% growth
    
    const q1_2023_revenue = Math.round(baseRevenue * (0.8 + Math.random() * 0.4));
    const q2_2023_revenue = Math.round(q1_2023_revenue * (1.05 + Math.random() * 0.1));
    const q3_2023_revenue = Math.round(q2_2023_revenue * (1.03 + Math.random() * 0.14));
    const q4_2023_revenue = Math.round(q3_2023_revenue * (1.08 + Math.random() * 0.12));
    
    return {
      ...countryInfo,
      q1_2023_revenue,
      q2_2023_revenue,
      q3_2023_revenue,
      q4_2023_revenue,
      customer_count: Math.floor(baseRevenue / (800 + Math.random() * 400)),
      growth_rate: Math.round(growthTrend * 1000) / 10 // One decimal place
    };
  });
};

// Helper functions for realistic data patterns

function getDepartmentBase(dept: string): number {
  const bases = {
    'Engineering': 150,
    'Sales': 120,
    'Marketing': 80,
    'Operations': 100,
    'Finance': 90,
    'HR': 60
  };
  return bases[dept as keyof typeof bases] || 100;
}

function getRegionMultiplier(region: string): number {
  const multipliers = {
    'North America': 1.5,
    'Europe': 1.2,
    'Asia Pacific': 1.0,
    'Latin America': 0.7
  };
  return multipliers[region as keyof typeof multipliers] || 1.0;
}

function getIndustryCustomerBase(industry: string): number {
  const bases = {
    'Technology': 500,
    'Healthcare': 300,
    'Finance': 400,
    'Manufacturing': 250,
    'Retail': 600,
    'Energy': 150,
    'Education': 200,
    'Transportation': 180,
    'Media': 220,
    'Government': 100,
    'Real Estate': 160,
    'Telecommunications': 120
  };
  return bases[industry as keyof typeof bases] || 200;
}

function getIndustrySpendBase(industry: string): number {
  const bases = {
    'Technology': 2500,
    'Healthcare': 1800,
    'Finance': 3200,
    'Manufacturing': 1400,
    'Retail': 1200,
    'Energy': 2800,
    'Education': 800,
    'Transportation': 1600,
    'Media': 2000,
    'Government': 1500,
    'Real Estate': 1100,
    'Telecommunications': 2200
  };
  return bases[industry as keyof typeof bases] || 1500;
}

function getDepartmentBudgetBase(department: string): number {
  const bases = {
    'Engineering': 500000,
    'Sales': 300000,
    'Marketing': 250000,
    'Operations': 400000,
    'Finance': 200000,
    'HR': 150000
  };
  return bases[department as keyof typeof bases] || 250000;
}

function getCountryRevenueBase(country: string): number {
  const bases = {
    'United States': 2000000,
    'Canada': 400000,
    'United Kingdom': 600000,
    'Germany': 800000,
    'France': 500000,
    'Japan': 700000,
    'Australia': 300000,
    'Singapore': 250000,
    'Brazil': 400000,
    'Mexico': 200000,
    'India': 350000,
    'South Korea': 300000,
    'Netherlands': 250000,
    'Spain': 200000,
    'Sweden': 150000
  };
  return bases[country as keyof typeof bases] || 200000;
}

// Export default datasets for quick access
export const mockDatasets = {
  revenue: generateRevenueData(),
  customer: generateCustomerData(),
  performance: generatePerformanceData(),
  geographic: generateGeographicData()
};