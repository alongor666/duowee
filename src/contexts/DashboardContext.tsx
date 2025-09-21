'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type {
  DashboardState,
  CarInsuranceRecord,
  FilterState,
  ComparisonMode,
  KPIMetric,
  AggregatedData
} from '@/types';
import {
  loadDataByPeriod,
  filterData,
  createDefaultFilters,
  validateDataQuality
} from '@/utils/dataLoader';
import { aggregateData, calculateKPIMetrics } from '@/utils/calculations';

// Action类型定义
type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: CarInsuranceRecord[] }
  | { type: 'SET_FILTERS'; payload: FilterState }
  | { type: 'SET_COMPARISON'; payload: ComparisonMode }
  | { type: 'SET_KPI_METRICS'; payload: KPIMetric[] }
  | { type: 'SET_AGGREGATED_DATA'; payload: AggregatedData }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_LAST_UPDATED'; payload: Date };

// 初始状态
const initialState: DashboardState = {
  data: [],
  aggregatedData: {
    signed_premium: 0,
    matured_premium: 0,
    commercial_premium_before_discount: 0,
    policy_count: 0,
    claim_case_count: 0,
    reported_claim_payment: 0,
    expense_amount: 0,
    premium_plan: 0,
    marginal_contribution_amount: 0,
  },
  kpiMetrics: [],
  filters: createDefaultFilters(),
  comparison: {
    type: 'wow',
    currentPeriod: {
      year: new Date().getFullYear(),
      weekStart: getWeekNumber(new Date()),
      weekEnd: getWeekNumber(new Date())
    },
    enabled: false
  },
  loading: false,
  error: null,
  lastUpdated: null
};

// Reducer函数
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_DATA':
      return { ...state, data: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: action.payload };

    case 'SET_COMPARISON':
      return { ...state, comparison: action.payload };

    case 'SET_KPI_METRICS':
      return { ...state, kpiMetrics: action.payload };

    case 'SET_AGGREGATED_DATA':
      return { ...state, aggregatedData: action.payload };

    case 'RESET_FILTERS':
      return { ...state, filters: createDefaultFilters() };

    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload };

    default:
      return state;
  }
}

// Context接口
interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  loadData: (year: number, weekStart: number, weekEnd?: number) => Promise<void>;
  loadDataFromRecords: (records: CarInsuranceRecord[]) => Promise<void>;
  updateFilters: (filters: FilterState) => void;
  updateComparison: (comparison: ComparisonMode) => void;
  resetFilters: () => void;
  refreshData: () => Promise<void>;
  exportData: (format: 'csv' | 'excel') => void;
}

// 创建Context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider组件属性
interface DashboardProviderProps {
  children: ReactNode;
}

// Provider组件
export function DashboardProvider({ children }: DashboardProviderProps) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  /**
   * 加载数据
   */
  const loadData = async (year: number, weekStart: number, weekEnd?: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log(`开始加载数据: ${year}年第${weekStart}${weekEnd ? `-${weekEnd}` : ''}周`);

      const result = await loadDataByPeriod(year, weekStart, weekEnd);

      if (result.metadata.errors.length > 0) {
        console.warn('数据加载警告:', result.metadata.errors);
      }

      // 数据质量检查
      const qualityIssues = validateDataQuality(result.data);
      if (qualityIssues.length > 0) {
        console.warn('数据质量问题:', qualityIssues);
      }

      dispatch({ type: 'SET_DATA', payload: result.data });
      dispatch({ type: 'SET_LAST_UPDATED', payload: new Date() });

      // 计算聚合数据和KPI指标
      await updateCalculations(result.data, state.filters, state.comparison);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '数据加载失败';
      console.error('数据加载错误:', error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * 从记录数组直接加载数据
   */
  const loadDataFromRecords = async (records: CarInsuranceRecord[]) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log(`开始加载导入数据: ${records.length} 条记录`);

      // 数据质量检查
      const qualityIssues = validateDataQuality(records);
      if (qualityIssues.length > 0) {
        console.warn('数据质量问题:', qualityIssues);
      }

      dispatch({ type: 'SET_DATA', payload: records });
      dispatch({ type: 'SET_LAST_UPDATED', payload: new Date() });

      // 重置筛选器为默认状态
      const defaultFilters = createDefaultFilters();
      dispatch({ type: 'SET_FILTERS', payload: defaultFilters });

      // 计算聚合数据和KPI指标
      await updateCalculations(records, defaultFilters, state.comparison);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '数据导入失败';
      console.error('数据导入错误:', error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * 更新筛选器
   */
  const updateFilters = (filters: FilterState) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });

    // 重新计算基于新筛选器的数据
    updateCalculations(state.data, filters, state.comparison);
  };

  /**
   * 更新对比模式
   */
  const updateComparison = async (comparison: ComparisonMode) => {
    dispatch({ type: 'SET_COMPARISON', payload: comparison });

    // 如果启用对比，需要重新计算指标
    if (comparison.enabled) {
      await updateCalculations(state.data, state.filters, comparison);
    }
  };

  /**
   * 重置筛选器
   */
  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
    updateCalculations(state.data, createDefaultFilters(), state.comparison);
  };

  /**
   * 刷新数据
   */
  const refreshData = async () => {
    const { currentPeriod } = state.comparison;
    await loadData(currentPeriod.year, currentPeriod.weekStart, currentPeriod.weekEnd);
  };

  /**
   * 导出数据
   */
  const exportData = (format: 'csv' | 'excel') => {
    try {
      const filteredData = filterData(state.data, state.filters);

      if (format === 'csv') {
        exportToCSV(filteredData, state.kpiMetrics);
      } else {
        // Excel导出功能留待后续实现
        console.log('Excel导出功能待开发');
      }
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  /**
   * 更新计算结果
   */
  const updateCalculations = async (
    data: CarInsuranceRecord[],
    filters: FilterState,
    comparison: ComparisonMode
  ) => {
    try {
      // 筛选当前期数据
      const filteredData = filterData(data, filters);
      const aggregated = aggregateData(filteredData);

      let previousAggregated: AggregatedData | undefined;

      // 如果启用对比模式，加载对比期数据
      if (comparison.enabled && comparison.comparePeriod) {
        try {
          const compareResult = await loadDataByPeriod(
            comparison.comparePeriod.year,
            comparison.comparePeriod.weekStart,
            comparison.comparePeriod.weekEnd
          );
          const compareFiltered = filterData(compareResult.data, filters);
          previousAggregated = aggregateData(compareFiltered);
        } catch (error) {
          console.warn('对比期数据加载失败:', error);
        }
      }

      // 计算KPI指标
      const metrics = calculateKPIMetrics(aggregated, previousAggregated);

      dispatch({ type: 'SET_AGGREGATED_DATA', payload: aggregated });
      dispatch({ type: 'SET_KPI_METRICS', payload: metrics });

    } catch (error) {
      console.error('计算更新失败:', error);
      dispatch({ type: 'SET_ERROR', payload: '数据计算失败' });
    }
  };

  // 初始化加载
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentWeek = getWeekNumber(new Date());

    // 加载当前周数据
    loadData(currentYear, Math.max(1, currentWeek - 1)); // 加载上周数据，避免当周数据未更新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 监听筛选器变化
  useEffect(() => {
    if (state.data.length > 0) {
      updateCalculations(state.data, state.filters, state.comparison);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filters, state.comparison.enabled]);

  const contextValue: DashboardContextType = {
    state,
    dispatch,
    loadData,
    loadDataFromRecords,
    updateFilters,
    updateComparison,
    resetFilters,
    refreshData,
    exportData
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

// Hook for using the context
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

// 工具函数

/**
 * 获取当前周数
 */
function getWeekNumber(date: Date): number {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfYear = ((today.getTime() - onejan.getTime() + 86400000) / 86400000);
  return Math.ceil(dayOfYear / 7);
}

/**
 * 导出为CSV
 */
function exportToCSV(data: CarInsuranceRecord[], metrics: KPIMetric[]) {
  // KPI指标CSV内容
  const kpiHeaders = ['指标名称', '当前值', '单位', '变化值', '变化率', '变化性质'];
  const kpiRows = metrics.map(metric => [
    metric.name,
    metric.value.toString(),
    metric.unit,
    metric.change?.toString() || '',
    metric.changePercent ? `${metric.changePercent}%` : '',
    metric.changeType
  ]);

  const kpiCsv = [kpiHeaders, ...kpiRows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // 原始数据CSV内容
  if (data.length > 0) {
    const dataHeaders = Object.keys(data[0]);
    const dataRows = data.map(record =>
      dataHeaders.map(header => `"${record[header as keyof CarInsuranceRecord]}"`)
    );

    const dataCsv = [dataHeaders, ...dataRows]
      .map(row => row.join(','))
      .join('\n');

    // 下载文件
    downloadCSV(kpiCsv, `车险KPI指标_${formatDate(new Date())}.csv`);
    downloadCSV(dataCsv, `车险明细数据_${formatDate(new Date())}.csv`);
  } else {
    downloadCSV(kpiCsv, `车险KPI指标_${formatDate(new Date())}.csv`);
  }
}

/**
 * 下载CSV文件
 */
function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * 格式化日期
 */
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}