import { InsuranceRecord } from "@/types/insurance";
import { KPIResult, MetricKey, MetricValue } from "@/types/metrics";
import { calcDelta, safeDivide, sumBy, roundTo } from "@/utils/calculations";

/**
 * 指标计算引擎
 * 规则：先聚合后计算；统一精度；分母为0返回null；部分指标按特定口径。
 */

export interface CalcOptions {
  week: number; // 当前周
  previousWeek: number; // 上一周
  filters?: {
    chengdu_branch?: string[];
    third_level_organization?: string[];
    insurance_type?: string[];
  };
}

/**
 * 过滤记录集（根据周与可选维度）
 */
function filterRecords(records: InsuranceRecord[], week: number, filters?: CalcOptions["filters"]) {
  return records.filter((r) => {
    if (r.week_number !== week) return false;
    if (filters?.chengdu_branch && filters.chengdu_branch.length > 0) {
      if (!filters.chengdu_branch.includes(r.chengdu_branch)) return false;
    }
    if (filters?.insurance_type && filters.insurance_type.length > 0) {
      if (!filters.insurance_type.includes(r.insurance_type)) return false;
    }
    if (filters?.third_level_organization && filters.third_level_organization.length > 0) {
      if (!filters.third_level_organization.includes(r.third_level_organization)) return false;
    }
    return true;
  });
}

/**
 * 基于聚合后的绝对值，统一计算16项KPI
 */
export interface BaseAggregates {
  sum_doc: number;
  sum_expired: number;
  sum_claim: number;
  sum_case: number;
  sum_policy: number;
  sum_expense_amount: number;
  sum_plan: number;
  sum_commercial_original: number; // 仅商业险
}

/**
 * 计算基础聚合（分子/分母）供指标复核使用
 */
export function computeBaseAggregates(records: InsuranceRecord[]): BaseAggregates {
  const sum_doc = sumBy(records, (x) => x.documented_premium_in_10k);
  const sum_expired = sumBy(records, (x) => x.expired_net_premium_in_10k);
  const sum_claim = sumBy(records, (x) => x.total_claim_payment_in_10k);
  const sum_policy = sumBy(records, (x) => x.policy_count);
  // 赔案件数优先用行级值，缺失则按行推导
  const sum_case = records.reduce((acc, r) => {
    let c = r.case_count;
    if (!(typeof c === "number" && isFinite(c))) {
      const denom = r.average_claim_payment ?? 0;
      if (denom) {
        const derived = (r.total_claim_payment_in_10k * 10000) / denom;
        if (isFinite(derived)) c = Math.round(derived);
      }
    }
    if (typeof c === "number" && isFinite(c)) return acc + c;
    return acc;
  }, 0);
  const sum_expense_amount = sumBy(records, (x) => x.row_expense_amount_in_10k);
  const sum_plan = sumBy(records, (x) => x.premium_plan);
  const sum_commercial_original = records
    .filter((r) => r.insurance_type === "商业险")
    .reduce((acc, r) => {
      let v = r.original_commercial_premium;
      if (!(typeof v === "number" && isFinite(v))) {
        const denom = r.commercial_auto_underwriting_factor ?? 0;
        if (denom) {
          const derived = r.documented_premium_in_10k / denom;
          if (isFinite(derived)) v = derived;
        }
      }
      if (typeof v === "number" && isFinite(v)) return acc + v;
      return acc;
    }, 0);
  return { sum_doc, sum_expired, sum_claim, sum_case, sum_policy, sum_expense_amount, sum_plan, sum_commercial_original };
}

function computeAggregates(records: InsuranceRecord[]) {
  // 若无记录，返回全 NULL，避免误将“无数据”显示为 0
  if (!records || records.length === 0) {
    return {
      documented_premium_in_10k: null,
      expired_net_premium_in_10k: null,
      average_premium_per_policy: null,
      original_commercial_premium: null,
      total_claim_payment_in_10k: null,
      average_claim_payment: null,
      case_count: null,
      claim_frequency: null,
      row_expense_amount_in_10k: null,
      marginal_contribution_amount_in_10k: null,
      premium_plan: null,
      expense_ratio: null,
      expired_loss_ratio: null,
      variable_cost_ratio: null,
      marginal_contribution_ratio: null,
      plan_achievement_rate: null,
    } as any;
  }

  const { sum_doc, sum_expired, sum_claim, sum_case, sum_policy, sum_expense_amount, sum_plan, sum_commercial_original } = computeBaseAggregates(records);

  // 费用率：Σ(费用金额) ÷ Σ(跟单保费)
  const expense_ratio = safeDivide(sum_expense_amount, sum_doc);

  // 满期赔付率：Σ(总赔款) ÷ Σ(满期净保费)
  const expired_loss_ratio = safeDivide(sum_claim, sum_expired);

  // 变动成本率 = (Σ费用金额/Σ跟单保费) + (Σ总赔款/Σ满期净保费)
  const variable_cost_ratio =
    expense_ratio != null && expired_loss_ratio != null
      ? expense_ratio + expired_loss_ratio
      : null;

  // 边际贡献率 = 1 - 变动成本率
  const marginal_contribution_ratio =
    variable_cost_ratio != null ? 1 - variable_cost_ratio : null;

  // 边际贡献额（万元）= Σ满期净保费 × 边际贡献率
  const marginal_contribution_amount_in_10k =
    marginal_contribution_ratio != null ? sum_expired * marginal_contribution_ratio : null;

  // 单均保费（元）= (Σ跟单保费 × 10000) ÷ Σ保单件数
  const average_premium_per_policy = safeDivide(sum_doc * 10000, sum_policy);

  // 案均赔款（元）= (Σ总赔款 × 10000) ÷ Σ赔案件数
  const average_claim_payment = safeDivide(sum_claim * 10000, sum_case);

  // 满期出险率 = (Σ赔案件数 ÷ Σ保单件数) × (Σ满期净保费 ÷ Σ跟单保费)
  const part1 = safeDivide(sum_case, sum_policy);
  const part2 = safeDivide(sum_expired, sum_doc);
  const claim_frequency = part1 != null && part2 != null ? part1 * part2 : null;

  // 保费计划达成率 = Σ跟单保费 ÷ Σ保费计划
  const plan_achievement_rate = safeDivide(sum_doc, sum_plan);

  return {
    documented_premium_in_10k: roundTo(sum_doc, 4),
    expired_net_premium_in_10k: roundTo(sum_expired, 4),
    average_premium_per_policy: average_premium_per_policy == null ? null : roundTo(average_premium_per_policy, 4),
    original_commercial_premium: roundTo(sum_commercial_original, 4),
    total_claim_payment_in_10k: roundTo(sum_claim, 4),
    average_claim_payment: average_claim_payment == null ? null : roundTo(average_claim_payment, 4),
    case_count: Math.round(sum_case),
    claim_frequency: claim_frequency == null ? null : roundTo(claim_frequency, 6),
    row_expense_amount_in_10k: roundTo(sum_expense_amount, 4),
    marginal_contribution_amount_in_10k: marginal_contribution_amount_in_10k == null ? null : roundTo(marginal_contribution_amount_in_10k, 4),
    premium_plan: roundTo(sum_plan, 4),
    expense_ratio: expense_ratio == null ? null : roundTo(expense_ratio, 6),
    expired_loss_ratio: expired_loss_ratio == null ? null : roundTo(expired_loss_ratio, 6),
    variable_cost_ratio: variable_cost_ratio == null ? null : roundTo(variable_cost_ratio, 6),
    marginal_contribution_ratio: marginal_contribution_ratio == null ? null : roundTo(marginal_contribution_ratio, 6),
    plan_achievement_rate: plan_achievement_rate == null ? null : roundTo(plan_achievement_rate, 6),
  };
}

/**
 * 计算KPI（当前周与上一周），并生成指标值与环比
 */
export function calculateKPIs(records: InsuranceRecord[], options: CalcOptions): KPIResult {
  const { week, previousWeek, filters } = options;
  const curr = computeAggregates(filterRecords(records, week, filters));
  const prev = computeAggregates(filterRecords(records, previousWeek, filters));

  const defs: { key: MetricKey; name: string; unit?: string }[] = [
    { key: "documented_premium_in_10k", name: "跟单保费(万元)" },
    { key: "expired_net_premium_in_10k", name: "满期净保费(万元)" },
    { key: "average_premium_per_policy", name: "单均保费(元)" },
    { key: "original_commercial_premium", name: "商业险折前保费(万元)" },
    { key: "total_claim_payment_in_10k", name: "总赔款(万元)" },
    { key: "average_claim_payment", name: "案均赔款(元)" },
    { key: "case_count", name: "赔案件数(件)" },
    { key: "claim_frequency", name: "满期出险率" },
    { key: "row_expense_amount_in_10k", name: "费用金额(万元)" },
    { key: "marginal_contribution_amount_in_10k", name: "边际贡献额(万元)" },
    { key: "premium_plan", name: "保费计划(万元)" },
    { key: "expense_ratio", name: "费用率" },
    { key: "expired_loss_ratio", name: "满期赔付率" },
    { key: "variable_cost_ratio", name: "变动成本率" },
    { key: "marginal_contribution_ratio", name: "边际贡献率" },
    { key: "plan_achievement_rate", name: "保费计划达成率" },
  ];

  const metrics: MetricValue[] = defs.map((d) => {
    const current = (curr as any)[d.key] ?? null;
    const previous = (prev as any)[d.key] ?? null;
    const { abs, pct } = calcDelta(previous, current);
    return {
      key: d.key,
      name: d.name,
      unit: d.unit,
      current,
      previous,
      deltaAbs: abs,
      deltaPct: pct,
    };
  });

  return {
    week,
    metrics,
  };
}
