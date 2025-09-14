"use client";
import React from "react";
import { MetricValue } from "@/types/metrics";
import { format10k, formatRate, formatCurrencyYuan, formatInteger } from "@/utils/formatters";

/**
 * 指标卡片组件
 * 展示：名称、当前值、环比差额与百分比
 */
export default function MetricCard({ metric }: { metric: MetricValue }) {
  const isRate = metric.key.endsWith("ratio") || metric.key === "claim_frequency" || metric.key === "plan_achievement_rate";
  const isCount = metric.key === "case_count";
  const isYuan = metric.key === "average_claim_payment" || metric.key === "average_premium_per_policy";

  const formatValue = (v: number | null) => {
    if (isRate) return formatRate(v);
    if (isCount) return formatInteger(v);
    if (isYuan) return formatCurrencyYuan(v);
    return format10k(v);
  };

  const deltaPctText = metric.deltaPct == null ? "-" : `${(metric.deltaPct * 100).toFixed(1)}%`;
  const trendColor = metric.deltaPct == null ? "" : metric.deltaPct >= 0 ? "text-rose-600" : "text-emerald-600";
  const deltaAbsText = (() => {
    if (metric.deltaAbs == null) return "-";
    if (isRate) return `${(metric.deltaAbs * 100).toFixed(1)}%`;
    if (isCount) return Math.round(metric.deltaAbs).toLocaleString();
    if (isYuan) return Math.round(metric.deltaAbs).toLocaleString();
    return metric.deltaAbs.toFixed(2);
  })();

  const abnormal = (() => {
    const v = metric.current;
    switch (metric.key) {
      case "expired_loss_ratio":
        return v != null && (v > 1 || v < 0);
      case "expense_ratio":
        return v != null && (v > 0.5 || v < 0);
      case "variable_cost_ratio":
        return v != null && (v > 1.5 || v < 0);
      case "marginal_contribution_ratio":
        return v != null && (v < -0.5 || v > 1);
      default:
        return false;
    }
  })();

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>{metric.name}</span>
          {abnormal && <span className="inline-flex items-center rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">异常</span>}
        </div>
        <div className="mt-1 text-2xl font-semibold">{formatValue(metric.current)}</div>
        <div className="mt-1 text-xs text-slate-500">
          上周：{formatValue(metric.previous)}
        </div>
        <div className={`mt-1 text-xs ${trendColor}`}>
          环比：{deltaAbsText}（{deltaPctText}）
        </div>
      </div>
    </div>
  );
}
