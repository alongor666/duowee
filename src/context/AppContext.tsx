"use client";
import React, { createContext, useContext, useMemo, useReducer } from "react";
import { InsuranceRecord, FilterState } from "@/types/insurance";

/**
 * 全局状态管理（Context + useReducer）
 * 内容：数据集、筛选条件、当前周与上一周、KPI结果缓存等（MVP简化版）
 */

interface State {
  records: InsuranceRecord[];
  filters: FilterState;
  currentWeek: number | null;
  previousWeek: number | null;
  chartType: "line" | "area" | "scatter";
  selectedMetric: import("@/types/metrics").MetricKey;
}

type Action =
  | { type: "SET_DATA"; payload: { records: InsuranceRecord[] } }
  | { type: "SET_WEEKS"; payload: { currentWeek: number; previousWeek: number } }
  | { type: "SET_FILTERS"; payload: Partial<FilterState> }
  | { type: "SET_CHART_TYPE"; payload: State["chartType"] }
  | { type: "SET_SELECTED_METRIC"; payload: State["selectedMetric"] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DATA": {
      return { ...state, records: action.payload.records };
    }
    case "SET_WEEKS": {
      return { ...state, currentWeek: action.payload.currentWeek, previousWeek: action.payload.previousWeek };
    }
    case "SET_FILTERS": {
      return { ...state, filters: { ...state.filters, ...action.payload } };
    }
    case "SET_CHART_TYPE": {
      return { ...state, chartType: action.payload };
    }
    case "SET_SELECTED_METRIC": {
      return { ...state, selectedMetric: action.payload };
    }
    default:
      return state;
  }
}

const AppContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    records: [],
    filters: {},
    currentWeek: null,
    previousWeek: null,
    chartType: "line",
    selectedMetric: "documented_premium_in_10k",
  });

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
