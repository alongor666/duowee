"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { computeBaseAggregates } from "@/services/metricCalculator";
import { loadDataset, getLatestId } from "@/services/storage";

function ValidateInner() {
  const { state, dispatch } = useApp();
  const { records } = state;
  const [week, setWeek] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (records.length === 0) {
        try {
          const id = getLatestId();
          if (id) {
            const data = await loadDataset(id);
            if (data) {
              dispatch({ type: "SET_DATA", payload: { records: data.records } });
              const weeks = Array.from(new Set(data.records.map((r) => r.week_number))).sort((a, b) => a - b);
              const wk = weeks[weeks.length - 1] ?? null;
              setWeek(wk);
              if (wk) dispatch({ type: "SET_WEEKS", payload: { currentWeek: wk, previousWeek: Math.max(1, wk - 1) } });
            }
          }
        } catch (e: any) {
          setError(e?.message || "加载本地数据失败");
        }
      } else {
        const weeks = Array.from(new Set(records.map((r) => r.week_number))).sort((a, b) => a - b);
        setWeek(weeks[weeks.length - 1] ?? null);
      }
    })();
  }, [records.length]);

  const weeks = useMemo(() => Array.from(new Set(records.map((r) => r.week_number))).sort((a, b) => a - b), [records]);
  const filtered = useMemo(() => (week ? records.filter((r) => r.week_number === week) : []), [records, week]);
  const agg = useMemo(() => computeBaseAggregates(filtered), [filtered]);

  const expense_ratio = agg.sum_doc ? agg.sum_expense_amount / agg.sum_doc : null;
  const expired_loss_ratio = agg.sum_expired ? agg.sum_claim / agg.sum_expired : null;
  const variable_cost_ratio = expense_ratio != null && expired_loss_ratio != null ? expense_ratio + expired_loss_ratio : null;
  const marginal_contribution_ratio = variable_cost_ratio != null ? 1 - variable_cost_ratio : null;
  const average_premium_per_policy = agg.sum_policy ? (agg.sum_doc * 10000) / agg.sum_policy : null;
  const claim_frequency = (() => {
    const p1 = agg.sum_policy ? agg.sum_case / agg.sum_policy : null;
    const p2 = agg.sum_doc ? agg.sum_expired / agg.sum_doc : null;
    return p1 != null && p2 != null ? p1 * p2 : null;
  })();

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">数据口径校核</div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">周次：</span>
        <select className="h-9 rounded border border-slate-300 px-2" value={week ?? ""} onChange={(e) => setWeek(Number(e.target.value))}>
          <option value="" disabled>
            选择周
          </option>
          {weeks.map((w) => (
            <option key={w} value={w}>
              周 {w}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="card-header">聚合明细（分子/分母）</div>
        <div className="card-body overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-1">指标</th>
                <th className="py-1">分子</th>
                <th className="py-1">分母</th>
                <th className="py-1">结果</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1">费用率</td>
                <td className="py-1">Σ费用金额={agg.sum_expense_amount.toFixed(4)} 万元</td>
                <td className="py-1">Σ跟单保费={agg.sum_doc.toFixed(4)} 万元</td>
                <td className="py-1">{expense_ratio == null ? "-" : (expense_ratio * 100).toFixed(2) + "%"}</td>
              </tr>
              <tr>
                <td className="py-1">满期赔付率</td>
                <td className="py-1">Σ总赔款={agg.sum_claim.toFixed(4)} 万元</td>
                <td className="py-1">Σ满期净保费={agg.sum_expired.toFixed(4)} 万元</td>
                <td className="py-1">{expired_loss_ratio == null ? "-" : (expired_loss_ratio * 100).toFixed(2) + "%"}</td>
              </tr>
              <tr>
                <td className="py-1">变动成本率</td>
                <td className="py-1">费用率 + 满期赔付率</td>
                <td className="py-1">-</td>
                <td className="py-1">{variable_cost_ratio == null ? "-" : (variable_cost_ratio * 100).toFixed(2) + "%"}</td>
              </tr>
              <tr>
                <td className="py-1">边际贡献率</td>
                <td className="py-1">1 - 变动成本率</td>
                <td className="py-1">-</td>
                <td className="py-1">{marginal_contribution_ratio == null ? "-" : (marginal_contribution_ratio * 100).toFixed(2) + "%"}</td>
              </tr>
              <tr>
                <td className="py-1">单均保费</td>
                <td className="py-1">Σ跟单保费×10000={Math.round(agg.sum_doc * 10000).toLocaleString()} 元</td>
                <td className="py-1">Σ保单件数={Math.round(agg.sum_policy).toLocaleString()} 件</td>
                <td className="py-1">{average_premium_per_policy == null ? "-" : Math.round(average_premium_per_policy).toLocaleString() + " 元"}</td>
              </tr>
              <tr>
                <td className="py-1">满期出险率</td>
                <td className="py-1">(Σ赔案件数/Σ保单件数)×(Σ满期净保费/Σ跟单保费)</td>
                <td className="py-1">-</td>
                <td className="py-1">{claim_frequency == null ? "-" : (claim_frequency * 100).toFixed(2) + "%"}</td>
              </tr>
              <tr>
                <td className="py-1">商业险折前保费</td>
                <td className="py-1">Σ(商业险跟单保费 ÷ 自主定价系数)</td>
                <td className="py-1">-</td>
                <td className="py-1">{agg.sum_commercial_original.toFixed(4)} 万元</td>
              </tr>
              <tr>
                <td className="py-1">保费计划达成率</td>
                <td className="py-1">Σ跟单保费={agg.sum_doc.toFixed(4)} 万元</td>
                <td className="py-1">Σ保费计划={agg.sum_plan.toFixed(4)} 万元</td>
                <td className="py-1">{agg.sum_plan ? ((agg.sum_doc / agg.sum_plan) * 100).toFixed(2) + "%" : "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ValidatePage() {
  return (
    <AppProvider>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <ValidateInner />
      </div>
    </AppProvider>
  );
}

