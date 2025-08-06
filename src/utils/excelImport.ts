import * as XLSX from 'xlsx';
import { RevenueData, CustomerData, PerformanceData, GeographicData } from '../types/dashboard.types';

export interface ExcelDatasets {
  revenueData: RevenueData[];
  customerData: CustomerData[];
  performanceData: PerformanceData[];
  geographicData: GeographicData[];
}

export interface WorksheetInfo {
  name: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  preview: any[];
}

export class ExcelDataImporter {
  private workbook: XLSX.WorkBook | null = null;
  private worksheets: Map<string, WorksheetInfo> = new Map();

  async loadExcelFile(file: File): Promise<Map<string, WorksheetInfo>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          this.workbook = XLSX.read(data, { type: 'binary' });
          this.parseWorksheets();
          resolve(this.worksheets);
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };

      reader.readAsBinaryString(file);
    });
  }

  private parseWorksheets(): void {
    if (!this.workbook) {
      throw new Error('No workbook loaded');
    }

    this.worksheets.clear();

    this.workbook.SheetNames.forEach(sheetName => {
      const worksheet = this.workbook!.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        return;
      }

      // Get column headers (first row)
      const headers = (jsonData[0] as string[]) || [];
      const dataRows = jsonData.slice(1);
      
      // Create preview (first 5 rows)
      const preview = dataRows.slice(0, 5).map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = (row as any[])[index] || null;
        });
        return obj;
      });

      const worksheetInfo: WorksheetInfo = {
        name: sheetName,
        rowCount: dataRows.length,
        columnCount: headers.length,
        columns: headers,
        preview: preview
      };

      this.worksheets.set(sheetName, worksheetInfo);
    });
  }

  getWorksheetData(sheetName: string): any[] {
    if (!this.workbook) {
      throw new Error('No workbook loaded');
    }

    const worksheet = this.workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Worksheet '${sheetName}' not found`);
    }

    return XLSX.utils.sheet_to_json(worksheet);
  }

  // Type-safe data extraction methods
  getRevenueData(sheetName: string): RevenueData[] {
    const rawData = this.getWorksheetData(sheetName);
    
    return rawData.map((row: any) => ({
      month: this.parseStringField(row.month || row.Month || ''),
      subscription_revenue: this.parseNumberField(row.subscription_revenue || row['Subscription Revenue'] || 0),
      usage_revenue: this.parseNumberField(row.usage_revenue || row['Usage Revenue'] || 0),
      product_line: this.parseStringField(row.product_line || row['Product Line'] || ''),
      department: this.parseStringField(row.department || row.Department || ''),
      region: this.parseStringField(row.region || row.Region || '')
    }));
  }

  getCustomerData(sheetName: string): CustomerData[] {
    const rawData = this.getWorksheetData(sheetName);
    
    return rawData.map((row: any) => ({
      industry: this.parseStringField(row.industry || row.Industry || ''),
      region: this.parseStringField(row.region || row.Region || ''),
      customer_count: this.parseNumberField(row.customer_count || row['Customer Count'] || 0),
      total_revenue: this.parseNumberField(row.total_revenue || row['Total Revenue'] || 0),
      avg_monthly_spend: this.parseNumberField(row.avg_monthly_spend || row['Avg Monthly Spend'] || 0),
      churn_rate: this.parseNumberField(row.churn_rate || row['Churn Rate'] || 0)
    }));
  }

  getPerformanceData(sheetName: string): PerformanceData[] {
    const rawData = this.getWorksheetData(sheetName);
    
    return rawData.map((row: any) => ({
      employee_id: this.parseStringField(row.employee_id || row['Employee ID'] || ''),
      name: this.parseStringField(row.name || row.Name || ''),
      department: this.parseStringField(row.department || row.Department || ''),
      performance_score: this.parseNumberField(row.performance_score || row['Performance Score'] || 0),
      projects_completed: this.parseNumberField(row.projects_completed || row['Projects Completed'] || 0),
      team_size: this.parseNumberField(row.team_size || row['Team Size'] || 0),
      budget_managed: this.parseNumberField(row.budget_managed || row['Budget Managed'] || 0),
      years_experience: this.parseNumberField(row.years_experience || row['Years Experience'] || 0),
      satisfaction_score: this.parseNumberField(row.satisfaction_score || row['Satisfaction Score'] || 0)
    }));
  }

  getGeographicData(sheetName: string): GeographicData[] {
    const rawData = this.getWorksheetData(sheetName);
    
    return rawData.map((row: any) => ({
      country: this.parseStringField(row.country || row.Country || ''),
      country_code: this.parseStringField(row.country_code || row['Country Code'] || ''),
      latitude: this.parseNumberField(row.latitude || row.Latitude || 0),
      longitude: this.parseNumberField(row.longitude || row.Longitude || 0),
      q1_2023_revenue: this.parseNumberField(row.q1_2023_revenue || row['Q1 2023 Revenue'] || 0),
      q2_2023_revenue: this.parseNumberField(row.q2_2023_revenue || row['Q2 2023 Revenue'] || 0),
      q3_2023_revenue: this.parseNumberField(row.q3_2023_revenue || row['Q3 2023 Revenue'] || 0),
      q4_2023_revenue: this.parseNumberField(row.q4_2023_revenue || row['Q4 2023 Revenue'] || 0),
      customer_count: this.parseNumberField(row.customer_count || row['Customer Count'] || 0),
      growth_rate: this.parseNumberField(row.growth_rate || row['Growth Rate'] || 0)
    }));
  }

  // Auto-detect and load all datasets
  async loadAllDatasets(): Promise<ExcelDatasets> {
    if (!this.workbook) {
      throw new Error('No workbook loaded');
    }

    const datasets: ExcelDatasets = {
      revenueData: [],
      customerData: [],
      performanceData: [],
      geographicData: []
    };

    // Try to auto-detect worksheets by name patterns
    for (const [sheetName, info] of this.worksheets.entries()) {
      const lowerSheetName = sheetName.toLowerCase();
      
      try {
        if (lowerSheetName.includes('revenue')) {
          datasets.revenueData = this.getRevenueData(sheetName);
          console.log(`Loaded ${datasets.revenueData.length} revenue records from '${sheetName}'`);
        } else if (lowerSheetName.includes('customer')) {
          datasets.customerData = this.getCustomerData(sheetName);
          console.log(`Loaded ${datasets.customerData.length} customer records from '${sheetName}'`);
        } else if (lowerSheetName.includes('performance') || lowerSheetName.includes('employee')) {
          datasets.performanceData = this.getPerformanceData(sheetName);
          console.log(`Loaded ${datasets.performanceData.length} performance records from '${sheetName}'`);
        } else if (lowerSheetName.includes('geographic') || lowerSheetName.includes('geo') || lowerSheetName.includes('country')) {
          datasets.geographicData = this.getGeographicData(sheetName);
          console.log(`Loaded ${datasets.geographicData.length} geographic records from '${sheetName}'`);
        }
      } catch (error) {
        console.warn(`Failed to parse worksheet '${sheetName}':`, error);
      }
    }

    return datasets;
  }

  // Utility methods for data type conversion
  private parseStringField(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }

  private parseNumberField(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  // Get summary statistics
  getSummary(): { [worksheetName: string]: WorksheetInfo } {
    const summary: { [worksheetName: string]: WorksheetInfo } = {};
    this.worksheets.forEach((info, name) => {
      summary[name] = info;
    });
    return summary;
  }
}