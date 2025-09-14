"use client";
import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { calculateKPIs } from "@/services/metricCalculator";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

/**
 * 图表画布（Recharts）
 * - X: 周序号
 * - Y: 选中指标（先聚合后计算的当前值）
 * - 仅折线/面积/点图：其余类型显示占位
 */
export default function ChartCanvas() {
  const { state } = useApp();
  const { records, filters, chartType, selectedMetric } = state;

  const data = useMemo(() => {
    if (!records.length) return [] as { week: number; value: number | null }[];
    const weeks = Array.from(new Set(records.map((r) => r.week_number))).sort((a, b) => a - b);
    return weeks.map((wk) => {
      const kpi = calculateKPIs(records, {
        week: wk,
        previousWeek: Math.max(1, wk - 1),
        filters: {
          chengdu_branch: filters.chengdu_branch,
          insurance_type: filters.insurance_type,
        },
      });
      const mv = kpi.metrics.find((m) => m.key === selectedMetric);
      return { week: wk, value: mv?.current ?? null };
    });
  }, [records, filters, selectedMetric]);

  const isRate = [
    "expense_ratio",
    "expired_loss_ratio",
    "variable_cost_ratio",
    "marginal_contribution_ratio",
    "claim_frequency",
    "plan_achievement_rate",
  ].includes(selectedMetric);

  const renderChart = () => {
    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tickFormatter={(v) => `周${v}`} />
            <YAxis tickFormatter={(v) => (isRate ? `${(v * 100).toFixed(0)}%` : `${v}`)} />
            <Tooltip formatter={(v: any) => (isRate ? `${(v * 100).toFixed(1)}%` : v)} labelFormatter={(l) => `周${l}`} />
            <Legend />
            <Line type="monotone" dataKey="value" name="当前值" stroke="#0ea5e9" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    if (chartType === "area") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tickFormatter={(v) => `周${v}`} />
            <YAxis tickFormatter={(v) => (isRate ? `${(v * 100).toFixed(0)}%` : `${v}`)} />
            <Tooltip formatter={(v: any) => (isRate ? `${(v * 100).toFixed(1)}%` : v)} labelFormatter={(l) => `周${l}`} />
            <Legend />
            <Area type="monotone" dataKey="value" name="当前值" stroke="#0ea5e9" fillOpacity={1} fill="url(#c)" />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    if (chartType === "scatter") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" name="周" tickFormatter={(v) => `周${v}`} />
            <YAxis dataKey="value" name="值" tickFormatter={(v) => (isRate ? `${(v * 100).toFixed(0)}%` : `${v}`)} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v: any) => (isRate ? `${(v * 100).toFixed(1)}%` : v)} labelFormatter={(l) => `周${l}`} />
            <Legend />
            <Scatter data={data} name="当前值" fill="#0ea5e9" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
    return (
      <div className="flex h-full items-center justify-center text-slate-400">该图表类型将在下一版实现</div>
    );
  };

  return (
    <div className="card h-80">
      <div className="card-header flex items-center justify-between">
        <span>图表画布</span>
        <button
          className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
          onClick={() => {
            // 导出当前序列为 CSV，并附带口径版本与过滤条件
            const lines: string[] = [];
            const caliber = "caliber_version=2025-09-10"; // 与 指标逻辑/字段对照表.md 对齐
            const filtersInfo = `filters=branch:${(filters.chengdu_branch||[]).join("|")};org:${(filters.third_level_organization||[]).join("|")};type:${(filters.insurance_type||[]).join("|")}`;
            lines.push(`# ${caliber}`);
            lines.push(`# ${filtersInfo}`);
            lines.push(`week,value`);
            data.forEach((d) => lines.push(`${d.week},${d.value ?? ""}`));
            const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `chart_${selectedMetric}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          导出CSV
        </button>
      </div>
      <div className="card-body h-full">{renderChart()}</div>
    </div>
  );
}
