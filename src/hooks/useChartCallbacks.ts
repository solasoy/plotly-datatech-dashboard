import { useEffect, useCallback, useRef } from 'react';
import { useDashboard } from './useDashboard';
import type { DashboardState } from '../types/dashboard.types';

export interface ChartInteraction {
  chartId: string;
  type: 'click' | 'hover' | 'selection' | 'filter';
  data: any;
  timestamp: number;
}

export interface CrossChartFilter {
  sourceChart: string;
  targetCharts: string[];
  filterField: string;
  filterValue: any;
}

export const useChartCallbacks = (chartId: string) => {
  const dashboard = useDashboard();
  const lastInteractionRef = useRef<ChartInteraction | null>(null);
  const activeFiltersRef = useRef<Map<string, CrossChartFilter>>(new Map());

  // Register this chart's callback with the dashboard
  useEffect(() => {
    const handleDashboardStateChange = (newState: DashboardState, previousState: DashboardState) => {
      // Check for relevant changes for this chart
      const changedFields = Object.keys(newState).filter(
        key => newState[key as keyof DashboardState] !== previousState[key as keyof DashboardState]
      );

      if (changedFields.length > 0) {
        console.log(`Chart ${chartId} received state changes:`, changedFields);
        // Chart-specific logic can be implemented here
      }
    };

    dashboard.registerCallback(chartId, handleDashboardStateChange);

    return () => {
      dashboard.unregisterCallback(chartId);
    };
  }, [chartId, dashboard]);

  // Handle chart interactions that should affect other charts
  const handleChartInteraction = useCallback((interaction: Omit<ChartInteraction, 'timestamp'>) => {
    const fullInteraction: ChartInteraction = {
      ...interaction,
      timestamp: Date.now()
    };

    lastInteractionRef.current = fullInteraction;

    // Process different types of interactions
    switch (interaction.type) {
      case 'click':
        handleChartClick(fullInteraction);
        break;
      case 'hover':
        handleChartHover(fullInteraction);
        break;
      case 'selection':
        handleChartSelection(fullInteraction);
        break;
      case 'filter':
        handleChartFilter(fullInteraction);
        break;
    }
  }, []);

  // Handle chart click interactions
  const handleChartClick = useCallback((interaction: ChartInteraction) => {
    // Example: If a revenue chart is clicked, filter by department
    if (interaction.chartId.includes('revenue') && interaction.data.department) {
      dashboard.updateDashboardState(
        { selectedDepartment: interaction.data.department },
        `chart_click_${interaction.chartId}`
      );
    }
    
    // Example: If a geographic chart is clicked, filter by region
    if (interaction.chartId.includes('geographic') && interaction.data.region) {
      dashboard.updateDashboardState(
        { selectedRegion: interaction.data.region },
        `chart_click_${interaction.chartId}`
      );
    }
  }, [dashboard]);

  // Handle chart hover interactions (for highlighting)
  const handleChartHover = useCallback((interaction: ChartInteraction) => {
    // Hover interactions typically don't change dashboard state
    // but can be used for visual highlighting across charts
    console.log(`Chart ${interaction.chartId} hover:`, interaction.data);
  }, []);

  // Handle chart selection interactions
  const handleChartSelection = useCallback((interaction: ChartInteraction) => {
    // Multi-select scenarios
    if (interaction.data.selectedItems && interaction.data.selectedItems.length > 0) {
      // Apply multi-selection filters
      const filterUpdates: Partial<DashboardState> = {};
      
      // Extract common filters from selected items
      const departments = interaction.data.selectedItems
        .map((item: any) => item.department)
        .filter(Boolean);
      
      if (departments.length > 0) {
        filterUpdates.selectedDepartment = departments[0]; // For simplicity, use first
      }
      
      dashboard.updateDashboardState(filterUpdates, `chart_selection_${interaction.chartId}`);
    }
  }, [dashboard]);

  // Handle chart filter interactions
  const handleChartFilter = useCallback((interaction: ChartInteraction) => {
    const filter: CrossChartFilter = {
      sourceChart: interaction.chartId,
      targetCharts: interaction.data.targetCharts || [],
      filterField: interaction.data.filterField,
      filterValue: interaction.data.filterValue
    };

    activeFiltersRef.current.set(interaction.chartId, filter);

    // Apply the filter to dashboard state
    const stateUpdates: Partial<DashboardState> = {};
    
    switch (filter.filterField) {
      case 'department':
        stateUpdates.selectedDepartment = filter.filterValue;
        break;
      case 'region':
        stateUpdates.selectedRegion = filter.filterValue;
        break;
      case 'industry':
        stateUpdates.selectedIndustry = filter.filterValue;
        break;
      case 'timeRange':
        stateUpdates.selectedTimeRange = filter.filterValue;
        break;
    }

    dashboard.updateDashboardState(stateUpdates, `chart_filter_${interaction.chartId}`);
  }, [dashboard]);

  // Clear filters from this chart
  const clearChartFilters = useCallback(() => {
    activeFiltersRef.current.delete(chartId);
    // Could also trigger a state update to clear related filters
  }, [chartId]);

  // Get active filters for this chart
  const getActiveFilters = useCallback(() => {
    return activeFiltersRef.current.get(chartId);
  }, [chartId]);

  // Check if this chart is being filtered by another chart
  const isFilteredByOtherChart = useCallback(() => {
    const allFilters = Array.from(activeFiltersRef.current.values());
    return allFilters.some(filter => 
      filter.targetCharts.includes(chartId) && filter.sourceChart !== chartId
    );
  }, [chartId]);

  return {
    handleChartInteraction,
    clearChartFilters,
    getActiveFilters,
    isFilteredByOtherChart,
    lastInteraction: lastInteractionRef.current,
    dashboardState: dashboard.dashboardState
  };
};

// Utility hook for chart highlighting
export const useChartHighlighting = (chartId: string) => {
  const { handleChartInteraction, dashboardState } = useChartCallbacks(chartId);

  const highlightData = useCallback((data: any) => {
    handleChartInteraction({
      chartId,
      type: 'hover',
      data: { highlightedData: data }
    });
  }, [chartId, handleChartInteraction]);

  const clearHighlight = useCallback(() => {
    handleChartInteraction({
      chartId,
      type: 'hover',
      data: { highlightedData: null }
    });
  }, [chartId, handleChartInteraction]);

  return {
    highlightData,
    clearHighlight,
    dashboardState
  };
};

// Utility hook for synchronized chart updates
export const useSynchronizedCharts = (chartIds: string[]) => {
  const dashboard = useDashboard();

  const synchronizeZoom = useCallback((zoomState: any) => {
    chartIds.forEach(id => {
      // This would typically trigger chart-specific zoom updates
      console.log(`Synchronizing zoom for chart ${id}:`, zoomState);
    });
  }, [chartIds]);

  const synchronizeTimeRange = useCallback((timeRange: string) => {
    dashboard.updateDashboardState(
      { selectedTimeRange: timeRange },
      'synchronized_charts'
    );
  }, [dashboard]);

  return {
    synchronizeZoom,
    synchronizeTimeRange,
    dashboardState: dashboard.dashboardState
  };
};