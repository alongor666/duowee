import { InsuranceRecord } from "@/types/insurance";
import { computeBaseAggregates } from "@/services/metricCalculator";

export interface CompletenessIssue {
  level: "error" | "warn";
  metric: string;
  message: string;
}

/**
 * 依据字段对照表口径，检查当前记录集是否具备计算各指标所需的基础数据。
 * 返回需要提醒用户补齐的数据项。
 */
export function assessCompleteness(records: InsuranceRecord[]): CompletenessIssue[] {
  const issues: CompletenessIssue[] = [];
  if (!records.length) return [{ level: "error", metric: "全部", message: "当前过滤条件下无数据，请导入或更换筛选" }];

  const { sum_doc, sum_expired, sum_claim, sum_case, sum_policy, sum_expense_amount, sum_plan, sum_commercial_original } =
    computeBaseAggregates(records);

  // 1) 单均保费需要 Σ保单件数>0
  if (!sum_policy) {
    issues.push({ level: "error", metric: "单均保费", message: "缺少保单件数（policy_count）以计算单均保费" });
  }

  // 2) 商业险折前保费需要商业险自主定价系数或已给折前保费
  const commercialRows = records.filter((r) => r.insurance_type === "商业险");
  if (commercialRows.length > 0) {
    const okRows = commercialRows.filter((r) =>
      (typeof r.original_commercial_premium === "number" && isFinite(r.original_commercial_premium)) ||
      (typeof r.commercial_auto_underwriting_factor === "number" && isFinite(r.commercial_auto_underwriting_factor) && r.commercial_auto_underwriting_factor !== 0)
    );
    if (okRows.length === 0 && sum_doc > 0) {
      issues.push({ level: "error", metric: "商业险折前保费", message: "缺少商业险自主定价系数或折前保费，无法计算" });
    }
  }

  // 3) 满期出险率需要 Σ保单件数>0 且 Σ跟单保费>0 且 Σ满期净保费>0；
  if (!sum_policy || !sum_doc || !sum_expired) {
    issues.push({ level: "error", metric: "满期出险率", message: "分母缺失：需 Σ保单件数、Σ跟单保费、Σ满期净保费" });
  } else {
    // 若 Σ总赔款>0 但 Σ赔案件数==0 且无法从案均推导，则提示
    if (sum_claim > 0 && sum_case === 0) {
      const rowsWithCaseOrAvg = records.filter((r) =>
        (typeof r.case_count === "number" && isFinite(r.case_count)) ||
        (typeof r.average_claim_payment === "number" && isFinite(r.average_claim_payment) && r.average_claim_payment !== 0)
      );
      if (rowsWithCaseOrAvg.length === 0) {
        issues.push({ level: "warn", metric: "满期出险率", message: "缺少赔案件数与案均，无法推导赔案件数，出险率可能为0" });
      }
    }
  }

  // 4) 费用率与费用金额
  //   - 费用率需要 Σ跟单保费>0，且需能得到费用金额（来自行级 row_expense_amount 或 行级 费用率×签单保费 推导）
  if (!sum_doc) {
    issues.push({ level: "error", metric: "费用率/费用金额", message: "缺少 Σ跟单保费 作为分母" });
  } else {
    if (sum_expense_amount === 0 && sum_doc > 0) {
      const rowsWithExpense = records.filter((r) =>
        (typeof r.row_expense_amount_in_10k === "number" && isFinite(r.row_expense_amount_in_10k) && r.row_expense_amount_in_10k !== 0) ||
        (typeof r.expense_ratio === "number" && isFinite(r.expense_ratio))
      );
      if (rowsWithExpense.length === 0) {
        issues.push({ level: "error", metric: "费用率/费用金额", message: "缺少费用金额或费用率，无法计算相关指标" });
      }
    }
  }

  // 5) 满期赔付率需要 Σ满期净保费>0
  if (!sum_expired && sum_claim > 0) {
    issues.push({ level: "error", metric: "满期赔付率", message: "缺少 Σ满期净保费 作为分母" });
  }

  // 6) 保费计划达成率需要 Σ保费计划>0
  if (!sum_plan && sum_doc > 0) {
    issues.push({ level: "warn", metric: "保费计划达成率", message: "缺少保费计划（premium_plan），无法计算达成率" });
  }

  return issues;
}

