"use client";
import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { calculateKPIs } from "@/services/metricCalculator";
import { generateInsights } from "@/services/aiAnalyzer";

/**
 * AI洞察面板
 * 操作：点击按钮 -> 基于当前KPI结果生成三段式分析报告
 */
export default function AIInsights() {
  const { state } = useApp();
  const { records, filters, currentWeek, previousWeek } = state;
  const [text, setText] = useState<string>("");

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

  const analyze = () => {
    if (!kpi) {
      setText("请先导入数据并选择周次");
      return;
    }
    const res = generateInsights(kpi);
    setText(res.report);
  };

  return (
    <div className="card">
      <div className="card-header">AI智能洞察</div>
      <div className="card-body space-y-3">
        <button className="rounded bg-emerald-600 px-3 py-1.5 text-white hover:opacity-90" onClick={analyze}>
          分析成本趋势
        </button>
        {text && (
          <pre className="whitespace-pre-wrap rounded bg-slate-50 p-3 text-sm text-slate-700">{text}</pre>
        )}
      </div>
    </div>
  );
}
