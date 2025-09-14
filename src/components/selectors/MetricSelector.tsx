"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MetricKey } from "@/types/metrics";

/**
 * 指标选择器（占位）
 * MVP：提供环比开关/单位提示，后续扩展收藏与排序
 */
export default function MetricSelector() {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [yoy, setYoy] = useState(false);
  const [wow, setWow] = useState(true);

  const metrics: { key: MetricKey; name: string }[] = [
    { key: "documented_premium_in_10k", name: "跟单保费(万元)" },
    { key: "expired_net_premium_in_10k", name: "满期净保费(万元)" },
    { key: "average_premium_per_policy", name: "单均保费(元)" },
    { key: "total_claim_payment_in_10k", name: "总赔款(万元)" },
    { key: "average_claim_payment", name: "案均赔款(元)" },
    { key: "case_count", name: "赔案件数(件)" },
    { key: "expired_loss_ratio", name: "满期赔付率" },
    { key: "expense_ratio", name: "费用率" },
    { key: "variable_cost_ratio", name: "变动成本率" },
    { key: "marginal_contribution_ratio", name: "边际贡献率" },
    { key: "plan_achievement_rate", name: "保费计划达成率" },
  ];

  return (
    <div className="card">
      <div className="card-body flex items-center gap-2">
        <button className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50" onClick={() => setOpen((v) => !v)}>
          指标
        </button>
        {open && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span>数值：</span>
              <select
                className="h-9 rounded border border-slate-300 px-2"
                value={state.selectedMetric}
                onChange={(e) => dispatch({ type: "SET_SELECTED_METRIC", payload: e.target.value as MetricKey })}
              >
                {metrics.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mr-3 inline-flex items-center gap-1">
                <input type="checkbox" checked={yoy} onChange={(e) => setYoy(e.target.checked)} /> 同比
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" checked={wow} onChange={(e) => setWow(e.target.checked)} /> 环比
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
