"use client";
import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";

/**
 * 维度选择器（MVP简版）
 * 维度：机构(chengdu_branch) 多选、险种(insurance_type) 多选；周切换
 */
export default function DimensionSelector() {
  const { state, dispatch } = useApp();
  const { records, currentWeek, previousWeek, filters } = state;
  const [open, setOpen] = useState(false);

  const branches = Array.from(new Set(records.map((r) => r.chengdu_branch))).filter(Boolean);
  const insTypes = Array.from(new Set(records.map((r) => r.insurance_type))).filter(Boolean);
  const thirdLevelsAll = Array.from(new Set(records.map((r) => r.third_level_organization))).filter(Boolean);
  const thirdLevels = useMemo(() => {
    const selBranches = filters.chengdu_branch?.length ? new Set(filters.chengdu_branch) : null;
    const vals = records
      .filter((r) => (selBranches ? selBranches.has(r.chengdu_branch) : true))
      .map((r) => r.third_level_organization)
      .filter(Boolean);
    return Array.from(new Set(vals));
  }, [records, filters.chengdu_branch]);
  const weeks = Array.from(new Set(records.map((r) => r.week_number))).sort((a, b) => a - b);

  const toggle = () => setOpen((v) => !v);

  const apply = () => setOpen(false);

  const updateWeek = (wk: number) => {
    dispatch({ type: "SET_WEEKS", payload: { currentWeek: wk, previousWeek: Math.max(1, wk - 1) } });
  };

  const toggleArr = (arr: string[] | undefined, v: string): string[] => {
    const a = new Set(arr ?? []);
    if (a.has(v)) a.delete(v);
    else a.add(v);
    return Array.from(a);
  };

  return (
    <div className="card">
      <div className="card-body flex items-center gap-2">
        <button className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50" onClick={toggle}>
          筛选器
        </button>
        <div className="text-xs text-slate-500">周：{currentWeek ?? "-"}（上周：{previousWeek ?? "-"}）</div>
      </div>

      {open && (
        <div className="border-t border-slate-100 p-3 text-sm">
          <div className="mb-2 font-medium text-slate-600">时间维度</div>
          <div className="flex flex-wrap gap-2">
            {weeks.map((w) => (
              <button
                key={w}
                className={`rounded border px-2 py-1 ${w === currentWeek ? "border-brand text-brand" : "border-slate-300"}`}
                onClick={() => updateWeek(w)}
              >
                周 {w}
              </button>
            ))}
          </div>

          <div className="mt-4 mb-2 font-medium text-slate-600">组织：机构</div>
          <div className="flex flex-wrap gap-2">
            {branches.map((b) => (
              <button
                key={b}
                className={`rounded border px-2 py-1 ${filters.chengdu_branch?.includes(b) ? "border-brand text-brand" : "border-slate-300"}`}
                onClick={() => dispatch({ type: "SET_FILTERS", payload: { chengdu_branch: toggleArr(filters.chengdu_branch, b) } })}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="mt-4 mb-2 font-medium text-slate-600">业务：险种</div>
          <div className="flex flex-wrap gap-2">
            {insTypes.map((t) => (
              <button
                key={t}
                className={`rounded border px-2 py-1 ${filters.insurance_type?.includes(t) ? "border-brand text-brand" : "border-slate-300"}`}
                onClick={() => dispatch({ type: "SET_FILTERS", payload: { insurance_type: toggleArr(filters.insurance_type, t) } })}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-4 mb-2 font-medium text-slate-600">组织：三级机构</div>
          <div className="flex flex-wrap gap-2">
            {(thirdLevels.length ? thirdLevels : thirdLevelsAll).map((c) => (
              <button
                key={c}
                className={`rounded border px-2 py-1 ${filters.third_level_organization?.includes(c) ? "border-brand text-brand" : "border-slate-300"}`}
                onClick={() =>
                  dispatch({ type: "SET_FILTERS", payload: { third_level_organization: toggleArr(filters.third_level_organization, c) } })
                }
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <button className="rounded bg-brand px-3 py-1.5 text-white" onClick={apply}>
              应用筛选
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
