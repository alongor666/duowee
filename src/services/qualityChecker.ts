import { InsuranceRecord } from "@/types/insurance";
import { computeBaseAggregates } from "@/services/metricCalculator";

export interface QualityItem {
  type: "denominator" | "abnormal" | "info";
  metric: string;
  detail: string;
}

export interface QualityReport {
  summary: { total: number; weeks: number };
  items: QualityItem[];
}

/**
 * 针对全量记录进行数据质量校验（导入时使用）
 */
export function buildQualityReport(records: InsuranceRecord[]): QualityReport {
  const items: QualityItem[] = [];
  const weeks = new Set(records.map((r) => r.week_number));
  const { sum_doc, sum_expired, sum_claim, sum_case, sum_policy, sum_expense_amount, sum_plan } = computeBaseAggregates(records);

  // 分母缺失/为0检查
  if (!sum_policy) items.push({ type: "denominator", metric: "单均保费", detail: "Σ保单件数=0，无法计算单均保费" });
  if (!sum_doc) items.push({ type: "denominator", metric: "费用率/满期出险率/变动成本率", detail: "Σ跟单保费=0，相关比率无法计算" });
  if (!sum_expired) items.push({ type: "denominator", metric: "满期赔付率/变动成本率", detail: "Σ满期净保费=0，相关比率无法计算" });
  if (!sum_plan) items.push({ type: "denominator", metric: "保费计划达成率", detail: "Σ保费计划=0，无法计算计划达成率" });

  // 异常比率范围：聚合后计算
  const expense_ratio = sum_doc ? sum_expense_amount / sum_doc : null;
  const expired_loss_ratio = sum_expired ? sum_claim / sum_expired : null;
  const variable_cost_ratio = expense_ratio != null && expired_loss_ratio != null ? expense_ratio + expired_loss_ratio : null;
  const marginal_contribution_ratio = variable_cost_ratio != null ? 1 - variable_cost_ratio : null;

  if (expired_loss_ratio != null && (expired_loss_ratio > 1 || expired_loss_ratio < 0))
    items.push({ type: "abnormal", metric: "满期赔付率", detail: `聚合结果${(expired_loss_ratio * 100).toFixed(1)}% 超出[0%,100%]` });
  if (expense_ratio != null && (expense_ratio > 0.5 || expense_ratio < 0))
    items.push({ type: "abnormal", metric: "费用率", detail: `聚合结果${(expense_ratio * 100).toFixed(1)}% 超出[0%,50%]` });
  if (variable_cost_ratio != null && (variable_cost_ratio > 1.5 || variable_cost_ratio < 0))
    items.push({ type: "abnormal", metric: "变动成本率", detail: `聚合结果${(variable_cost_ratio * 100).toFixed(1)}% 超出[0%,150%]` });
  if (marginal_contribution_ratio != null && (marginal_contribution_ratio < -0.5 || marginal_contribution_ratio > 1))
    items.push({ type: "abnormal", metric: "边际贡献率", detail: `聚合结果${(marginal_contribution_ratio * 100).toFixed(1)}% 超出[-50%,100%]` });

  return {
    summary: { total: records.length, weeks: weeks.size },
    items,
  };
}

