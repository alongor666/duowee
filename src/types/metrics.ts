/**
 * KPI 指标类型定义（16项）
 */

export type MetricKey =
  | "documented_premium_in_10k" // 跟单保费(万元)
  | "expired_net_premium_in_10k" // 满期净保费(万元)
  | "average_premium_per_policy" // 单均保费(元)
  | "original_commercial_premium" // 商业险折前保费(万元)
  | "total_claim_payment_in_10k" // 总赔款(万元)
  | "average_claim_payment" // 案均赔款(元)
  | "case_count" // 赔案件数(件)
  | "claim_frequency" // 满期出险率
  | "row_expense_amount_in_10k" // 费用金额(万元)
  | "marginal_contribution_amount_in_10k" // 边际贡献额(万元)
  | "premium_plan" // 保费计划(万元)
  | "expense_ratio" // 费用率
  | "expired_loss_ratio" // 满期赔付率
  | "variable_cost_ratio" // 变动成本率
  | "marginal_contribution_ratio" // 边际贡献率
  | "plan_achievement_rate"; // 保费计划达成率

export interface MetricValue {
  key: MetricKey;
  name: string; // 展示名
  unit?: string; // 单位提示
  current: number | null; // 当前周
  previous: number | null; // 上一周
  deltaAbs: number | null; // 绝对变化
  deltaPct: number | null; // 百分比变化（上一周为基准）
}

export interface KPIResult {
  week: number | null;
  metrics: MetricValue[];
}

