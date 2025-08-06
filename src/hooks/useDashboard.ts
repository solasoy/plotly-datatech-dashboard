import { useState, useCallback, useMemo, useEffect } from 'react';
import { DashboardDatasets, DashboardState, DashboardFilters, DataImportState } from '../types/dashboard.types';
import { ExcelDatasets } from '../utils/excelImport';

// Callback system types
export type DashboardCallback = (state: DashboardState, previousState: DashboardState) => void;
export type FilterDependency = {
  trigger: keyof DashboardState;
  reset: (keyof DashboardState)[];
};

// Enhanced state management types
export interface StateTransaction {
  id: string;
  timestamp: number;
  updates: Partial<DashboardState>;
  source?: string;
}

interface UseDashboardReturn {
  // Data
  datasets: DashboardDatasets;
  importState: DataImportState;
  
  // Filters and State
  dashboardState: DashboardState;
  availableFilters: DashboardFilters;
  
  // Actions
  loadData: (excelData: ExcelDatasets) => void;
  updateDashboardState: (updates: Partial<DashboardState>, source?: string) => void;
  clearData: () => void;
  
  // Computed Data
  filteredData: DashboardDatasets;
  getFilterOptions: (filterType: string) => string[];
  
  // Enhanced State Management
  registerCallback: (id: string, callback: DashboardCallback) => void;
  unregisterCallback: (id: string) => void;
  saveState: (name: string) => void;
  loadState: (name: string) => boolean;
  getSavedStates: () => string[];
  resetToDefault: () => void;
  
  // State History
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  getStateHistory: () => StateTransaction[];
}

const initialDashboardState: DashboardState = {
  selectedTimeRange: '1Y',
  selectedRevenueType: 'subscription',
  selectedDepartment: 'all',
  selectedMetric: 'revenue',
  selectedIndustry: 'all',
  selectedRegion: 'all'
};

const initialDatasets: DashboardDatasets = {
  revenue: [],
  customer: [],
  performance: [],
  geographic: []
};

const initialImportState: DataImportState = {
  isImporting: false,
  hasData: false,
  error: null,
  lastImported: null,
  recordCounts: {
    revenue: 0,
    customer: 0,
    performance: 0,
    geographic: 0
  }
};

// Filter dependencies - when certain filters change, others may need to reset
const filterDependencies: FilterDependency[] = [
  {
    trigger: 'selectedRegion',
    reset: ['selectedIndustry'] // When region changes, reset industry filter
  },
  {
    trigger: 'selectedDepartment', 
    reset: ['selectedMetric'] // When department changes, reset metric if department-specific
  }
];

// Generate unique transaction ID
const generateTransactionId = (): string => {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useDashboard = (): UseDashboardReturn => {
  const [datasets, setDatasets] = useState<DashboardDatasets>(initialDatasets);
  const [dashboardState, setDashboardState] = useState<DashboardState>(initialDashboardState);
  const [importState, setImportState] = useState<DataImportState>(initialImportState);
  
  // Enhanced state management
  const [callbacks, setCallbacks] = useState<Map<string, DashboardCallback>>(new Map());
  const [stateHistory, setStateHistory] = useState<StateTransaction[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [savedStates, setSavedStates] = useState<Map<string, DashboardState>>(new Map());

  // Load data from Excel import
  const loadData = useCallback((excelData: ExcelDatasets) => {
    const newDatasets: DashboardDatasets = {
      revenue: excelData.revenueData,
      customer: excelData.customerData,
      performance: excelData.performanceData,
      geographic: excelData.geographicData
    };

    setDatasets(newDatasets);
    setImportState({
      isImporting: false,
      hasData: true,
      error: null,
      lastImported: new Date(),
      recordCounts: {
        revenue: excelData.revenueData.length,
        customer: excelData.customerData.length,
        performance: excelData.performanceData.length,
        geographic: excelData.geographicData.length
      }
    });

    console.log('Dashboard data loaded:', {
      revenue: excelData.revenueData.length,
      customer: excelData.customerData.length,
      performance: excelData.performanceData.length,
      geographic: excelData.geographicData.length
    });
  }, []);

  // Enhanced update dashboard state with callbacks, dependencies, and history
  const updateDashboardState = useCallback((updates: Partial<DashboardState>, source?: string) => {
    setDashboardState(prev => {
      const newState = { ...prev };
      let finalUpdates = { ...updates };
      
      // Apply filter dependencies
      Object.keys(updates).forEach(key => {
        const dependency = filterDependencies.find(dep => dep.trigger === key);
        if (dependency) {
          dependency.reset.forEach(resetKey => {
            if (resetKey === 'selectedMetric') {
              finalUpdates[resetKey] = 'revenue'; // Reset to default
            } else if (resetKey === 'selectedIndustry') {
              finalUpdates[resetKey] = 'all'; // Reset to all
            }
          });
        }
      });
      
      // Apply all updates
      Object.assign(newState, finalUpdates);
      
      // Create state transaction for history
      const transaction: StateTransaction = {
        id: generateTransactionId(),
        timestamp: Date.now(),
        updates: finalUpdates,
        source
      };
      
      // Update history (remove any future history if we're not at the end)
      setStateHistory(history => {
        const newHistory = history.slice(0, currentHistoryIndex + 1);
        return [...newHistory, transaction];
      });
      setCurrentHistoryIndex(idx => idx + 1);
      
      // Trigger callbacks
      callbacks.forEach(callback => {
        try {
          callback(newState, prev);
        } catch (error) {
          console.error('Dashboard callback error:', error);
        }
      });
      
      return newState;
    });
  }, [callbacks, currentHistoryIndex]);

  // Clear all data
  const clearData = useCallback(() => {
    setDatasets(initialDatasets);
    setDashboardState(initialDashboardState);
    setImportState(initialImportState);
  }, []);

  // Compute available filter options from current data
  const availableFilters: DashboardFilters = useMemo(() => {
    const filters: DashboardFilters = {
      timeRange: ['6M', '1Y', '2Y', 'All Time'],
      departments: [],
      regions: [],
      industries: [],
      productLines: []
    };

    // Extract unique values from datasets
    if (datasets.revenue.length > 0) {
      filters.departments = [...new Set(datasets.revenue.map(d => d.department))].filter(Boolean);
      filters.regions = [...new Set([
        ...datasets.revenue.map(d => d.region),
        ...datasets.customer.map(d => d.region)
      ])].filter(Boolean);
      filters.productLines = [...new Set(datasets.revenue.map(d => d.product_line))].filter(Boolean);
    }

    if (datasets.customer.length > 0) {
      filters.industries = [...new Set(datasets.customer.map(d => d.industry))].filter(Boolean);
    }

    return filters;
  }, [datasets]);

  // Apply filters to get filtered datasets
  const filteredData: DashboardDatasets = useMemo(() => {
    const filtered: DashboardDatasets = { ...datasets };

    // Apply department filter
    if (dashboardState.selectedDepartment !== 'all') {
      filtered.revenue = filtered.revenue.filter(d => 
        d.department === dashboardState.selectedDepartment
      );
      filtered.performance = filtered.performance.filter(d => 
        d.department === dashboardState.selectedDepartment
      );
    }

    // Apply region filter
    if (dashboardState.selectedRegion !== 'all') {
      filtered.revenue = filtered.revenue.filter(d => 
        d.region === dashboardState.selectedRegion
      );
      filtered.customer = filtered.customer.filter(d => 
        d.region === dashboardState.selectedRegion
      );
    }

    // Apply industry filter
    if (dashboardState.selectedIndustry !== 'all') {
      filtered.customer = filtered.customer.filter(d => 
        d.industry === dashboardState.selectedIndustry
      );
    }

    // Apply time range filter (for revenue data)
    if (dashboardState.selectedTimeRange !== 'All Time') {
      const monthsToInclude = dashboardState.selectedTimeRange === '6M' ? 6 : 
                            dashboardState.selectedTimeRange === '1Y' ? 12 : 24;
      
      // This is a simplified time filter - in reality you'd parse dates properly
      filtered.revenue = filtered.revenue.slice(-monthsToInclude);
    }

    return filtered;
  }, [datasets, dashboardState]);

  // Get available options for a specific filter
  const getFilterOptions = useCallback((filterType: string): string[] => {
    switch (filterType) {
      case 'departments':
        return ['all', ...availableFilters.departments];
      case 'regions':
        return ['all', ...availableFilters.regions];
      case 'industries':
        return ['all', ...availableFilters.industries];
      case 'productLines':
        return ['all', ...availableFilters.productLines];
      case 'timeRange':
        return availableFilters.timeRange;
      case 'revenueType':
        return ['subscription', 'usage'];
      case 'metrics':
        return ['revenue', 'customer_count', 'performance_score', 'growth_rate'];
      default:
        return [];
    }
  }, [availableFilters]);

  // Enhanced State Management Functions
  
  // Callback registration system
  const registerCallback = useCallback((id: string, callback: DashboardCallback) => {
    setCallbacks(prev => new Map(prev.set(id, callback)));
  }, []);

  const unregisterCallback = useCallback((id: string) => {
    setCallbacks(prev => {
      const newCallbacks = new Map(prev);
      newCallbacks.delete(id);
      return newCallbacks;
    });
  }, []);

  // State persistence
  const saveState = useCallback((name: string) => {
    setSavedStates(prev => new Map(prev.set(name, { ...dashboardState })));
    // Also save to localStorage
    try {
      localStorage.setItem(`dashboard_state_${name}`, JSON.stringify(dashboardState));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }, [dashboardState]);

  const loadState = useCallback((name: string): boolean => {
    // Try to load from memory first
    const memoryState = savedStates.get(name);
    if (memoryState) {
      setDashboardState(memoryState);
      return true;
    }
    
    // Try to load from localStorage
    try {
      const savedState = localStorage.getItem(`dashboard_state_${name}`);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setDashboardState(parsedState);
        return true;
      }
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
    }
    
    return false;
  }, [savedStates]);

  const getSavedStates = useCallback((): string[] => {
    const memoryKeys = Array.from(savedStates.keys());
    
    // Also check localStorage
    const localStorageKeys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('dashboard_state_')) {
          localStorageKeys.push(key.replace('dashboard_state_', ''));
        }
      }
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
    }
    
    // Combine and deduplicate
    return Array.from(new Set([...memoryKeys, ...localStorageKeys]));
  }, [savedStates]);

  const resetToDefault = useCallback(() => {
    const transaction: StateTransaction = {
      id: generateTransactionId(),
      timestamp: Date.now(),
      updates: initialDashboardState,
      source: 'reset'
    };
    
    setDashboardState(initialDashboardState);
    setStateHistory(prev => [...prev, transaction]);
    setCurrentHistoryIndex(prev => prev + 1);
  }, []);

  // State History Functions
  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < stateHistory.length - 1;

  const undo = useCallback(() => {
    if (canUndo) {
      const previousIndex = currentHistoryIndex - 1;
      
      // Reconstruct state by applying all transactions up to previous index
      let reconstructedState = { ...initialDashboardState };
      for (let i = 0; i <= previousIndex; i++) {
        Object.assign(reconstructedState, stateHistory[i].updates);
      }
      
      setDashboardState(reconstructedState);
      setCurrentHistoryIndex(previousIndex);
    }
  }, [canUndo, currentHistoryIndex, stateHistory]);

  const redo = useCallback(() => {
    if (canRedo) {
      const nextIndex = currentHistoryIndex + 1;
      const transaction = stateHistory[nextIndex];
      
      setDashboardState(prev => ({ ...prev, ...transaction.updates }));
      setCurrentHistoryIndex(nextIndex);
    }
  }, [canRedo, currentHistoryIndex, stateHistory]);

  const getStateHistory = useCallback((): StateTransaction[] => {
    return [...stateHistory];
  }, [stateHistory]);

  // Load saved states from localStorage on mount
  useEffect(() => {
    try {
      const savedStateMap = new Map<string, DashboardState>();
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('dashboard_state_')) {
          const stateName = key.replace('dashboard_state_', '');
          const savedState = localStorage.getItem(key);
          if (savedState) {
            savedStateMap.set(stateName, JSON.parse(savedState));
          }
        }
      }
      setSavedStates(savedStateMap);
    } catch (error) {
      console.warn('Failed to load saved states from localStorage:', error);
    }
  }, []);

  return {
    datasets,
    importState,
    dashboardState,
    availableFilters,
    loadData,
    updateDashboardState,
    clearData,
    filteredData,
    getFilterOptions,
    
    // Enhanced State Management
    registerCallback,
    unregisterCallback,
    saveState,
    loadState,
    getSavedStates,
    resetToDefault,
    
    // State History
    canUndo,
    canRedo,
    undo,
    redo,
    getStateHistory
  };
};