"use client";
import React from "react";
import { useApp } from "@/context/AppContext";

/**
 * 图表类型选择器（占位）
 * 默认推荐折线/面积/点图，MVP先保留占位UI
 */
export default function ChartSelector() {
  const { state, dispatch } = useApp();
  const type = state.chartType;
  return (
    <div className="card">
      <div className="card-body flex items-center gap-2 text-sm">
        <span>图表：</span>
        <select
          value={type}
          onChange={(e) => dispatch({ type: "SET_CHART_TYPE", payload: e.target.value as any })}
          className="h-9 rounded border border-slate-300 px-2"
        >
          <option value="line">折线图</option>
          <option value="area">面积图</option>
          <option value="scatter">点图</option>
          <option value="heatmap">热力图</option>
          <option value="box">箱线图</option>
        </select>
      </div>
    </div>
  );
}
