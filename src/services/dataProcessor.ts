import { InsuranceRecord } from "@/types/insurance";
import { toBool } from "@/utils/calculations";

/**
 * 数据处理模块
 * 功能：将CSV解析得到的行（string -> string）映射为标准化的 InsuranceRecord，并做基础类型转换与推导字段补全。
 */

/**
 * 将一行通用字典映射到 InsuranceRecord（字段名需与字段对照表对应）
 * @param row 原始行字典
 */
export function mapRowToRecord(row: Record<string, string>): InsuranceRecord {
  // 字段名可能来自中文或英文，尝试多种键取值
  const get = (keys: string[], d: string = "") => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== "") return row[k];
    }
    return d;
  };

  const n = (keys: string[], d = 0): number => {
    const v = parseFloat(get(keys, ""));
    return isFinite(v) ? v : d;
  };

  const i = (keys: string[], d = 0): number => {
    const v = parseInt(get(keys, ""), 10);
    return isFinite(v) ? v : d;
  };

  // 比率字段解析：支持带百分号的字符串（如 "5%" → 0.05）
  const nr = (keys: string[], d = 0): number => {
    const raw = get(keys, "");
    if (!raw) return d;
    const trimmed = raw.trim();
    if (trimmed.endsWith("%")) {
      const v = parseFloat(trimmed.replace(/%/g, ""));
      return isFinite(v) ? v / 100 : d;
    }
    const v = parseFloat(trimmed);
    return isFinite(v) ? v : d;
  };

  const record: InsuranceRecord = {
    snapshot_date: get(["snapshot_date", "数据统计刷新日期"]),
    week_number: i(["week_number", "周序号"]),
    policy_start_year: i(["policy_start_year", "保单年度"]),
    business_type_category: get(["business_type_category", "业务类型"]),
    chengdu_branch: get(["chengdu_branch", "机构地域属性"]),
    third_level_organization: get(["third_level_organization", "三级机构"]),
    customer_category_3: get(["customer_category_3", "客户类别"]),
    insurance_type: get(["insurance_type", "车险种类"]),
    is_new_energy_vehicle: toBool(get(["is_new_energy_vehicle", "是否新能源车"])),
    coverage_type: get(["coverage_type", "投保险别组合"]),
    is_transferred_vehicle: toBool(get(["is_transferred_vehicle", "是否过户车辆"])),
    renewal_status: get(["renewal_status", "续保状态"]),
    vehicle_insurance_grade: get(["vehicle_insurance_grade", "非营业客车风险评级"], ""),
    highway_risk_grade: get(["highway_risk_grade", "高速行驶风险评级"], ""),
    large_truck_score: get(["large_truck_score", "货车风险评级"], ""),
    small_truck_score: get(["small_truck_score", "小货车风险评级"], ""),
    terminal_source: get(["terminal_source", "投保终端来源"], ""),

    documented_premium_in_10k: n(["documented_premium_in_10k", "跟单保费"]),
    average_premium_per_policy: n(["average_premium_per_policy", "单均保费"]),
    expired_net_premium_in_10k: n(["expired_net_premium_in_10k", "满期净保费"]),
    claim_frequency: nr(["claim_frequency", "满期出险率"]),
    case_count: i(["case_count", "赔案件数"]),
    average_claim_payment: n(["average_claim_payment", "案均赔款"]),
    total_claim_payment_in_10k: n(["total_claim_payment_in_10k", "总赔款"]),
    expired_loss_ratio: nr(["expired_loss_ratio", "满期赔付率"]),
    expense_ratio: nr(["expense_ratio", "费用率"]),
    variable_cost_ratio: nr(["variable_cost_ratio", "变动成本率"]),
    commercial_auto_underwriting_factor: n(["commercial_auto_underwriting_factor", "商业险自主定价系数"]),
    original_commercial_premium: n(["original_commercial_premium", "商业险折前保费"]),
    row_expense_amount_in_10k: n(["row_expense_amount_in_10k", "费用金额"]),
    premium_plan: n(["premium_plan", "保费计划"]),
    plan_achievement_rate: nr(["plan_achievement_rate", "保费计划达成率"]),
    marginal_contribution_ratio: nr(["marginal_contribution_ratio", "边际贡献率"]),
    marginal_contribution_amount_in_10k: n(["marginal_contribution_amount_in_10k", "边际贡献额"]),
    policy_count: i(["policy_count", "保单件数"]),
  };

  // 推导型字段补全（行级）：费用金额（万元） = 签单保费（万元） × 费用率
  if (!isFinite(record.row_expense_amount_in_10k ?? NaN)) {
    record.row_expense_amount_in_10k = record.documented_premium_in_10k * (record.expense_ratio ?? 0);
  }

  // 商业险折前保费（万元） = 商业险签单保费 ÷ 自主定价系数（仅商业险）
  if (
    record.insurance_type === "商业险" &&
    (!isFinite(record.original_commercial_premium ?? NaN)) &&
    isFinite(record.commercial_auto_underwriting_factor ?? NaN) &&
    (record.commercial_auto_underwriting_factor ?? 0) !== 0
  ) {
    record.original_commercial_premium = record.documented_premium_in_10k / (record.commercial_auto_underwriting_factor as number);
  }

  // 赔案件数推导（件）= (总赔款 × 10000) ÷ 案均赔款（若未提供）
  if (!isFinite(record.case_count ?? NaN)) {
    const denom = record.average_claim_payment ?? 0;
    if (denom) {
      const derived = (record.total_claim_payment_in_10k * 10000) / denom;
      if (isFinite(derived)) record.case_count = Math.round(derived);
    }
  }

  return record;
}

/**
 * 将解析后的CSV行映射为标准记录集
 */
export function mapRows(rows: Record<string, string>[]): InsuranceRecord[] {
  return rows.map(mapRowToRecord);
}
