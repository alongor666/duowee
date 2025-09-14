"use client";
import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import MetricCard from "@/components/common/MetricCard";
import { calculateKPIs } from "@/services/metricCalculator";

/**
 * KPI 网格（4x4）
 * 数据逻辑：基于筛选器与当前周/上一周进行聚合后计算
 */
export default function KPIGrid() {
  const { state } = useApp();
  const { records, filters, currentWeek, previousWeek } = state;

  const kpi = useMemo(() => {
    if (!records.length || !currentWeek || !previousWeek) return null;
    return calculateKPIs(records, {
      week: currentWeek,
      previousWeek,
      filters: {
        chengdu_branch: filters.chengdu_branch,
        third_level_organization: filters.third_level_organization,
        insurance_type: filters.insurance_type,
      },
    });
  }, [records, filters, currentWeek, previousWeek]);

  if (!kpi) {
    return (
      <div className="card">
        <div className="card-body text-sm text-slate-500">请先导入CSV数据（并选择周次）。</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {kpi.metrics.map((m) => (
        <MetricCard key={m.key} metric={m} />
      ))}
    </div>
  );
}
