"use client";
import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { assessCompleteness } from "@/services/completeness";
import { InsuranceRecord } from "@/types/insurance";

function filterRecords(records: InsuranceRecord[], week: number | null, filters: any) {
  return records.filter((r) => {
    if (week != null && r.week_number !== week) return false;
    if (filters?.chengdu_branch?.length && !filters.chengdu_branch.includes(r.chengdu_branch)) return false;
    if (filters?.third_level_organization?.length && !filters.third_level_organization.includes(r.third_level_organization)) return false;
    if (filters?.insurance_type?.length && !filters.insurance_type.includes(r.insurance_type)) return false;
    return true;
  });
}

export default function DataAlerts() {
  const { state } = useApp();
  const { records, currentWeek, filters } = state;
  const cur = useMemo(() => filterRecords(records, currentWeek, filters), [records, currentWeek, filters]);
  const issues = useMemo(() => assessCompleteness(cur), [cur]);
  if (!issues.length) return null;

  return (
    <div className="rounded border border-amber-300 bg-amber-50 p-3">
      <div className="mb-1 text-sm font-medium text-amber-800">数据完整性提醒（基于字段对照表口径）</div>
      <ul className="list-disc space-y-1 pl-5 text-sm text-amber-700">
        {issues.map((it, idx) => (
          <li key={idx}>
            [{it.level === "error" ? "必需" : "建议"}] {it.metric} — {it.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

