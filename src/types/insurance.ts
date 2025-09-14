/**
 * 保险业务数据类型定义
 * 对齐《指标逻辑/字段对照表.md》字段与类型
 */

export type Text = string;
export type Int = number;
export type Bool = boolean;
export type Numeric = number; // numeric(18,4) 或 numeric(10,6) 统一用 number 表示
export type DateString = string; // YYYY-MM-DD

/**
 * 原子数据行（CSV标准化后）
 */
export interface InsuranceRecord {
  snapshot_date: DateString;
  week_number: Int;
  policy_start_year: Int;
  business_type_category: Text;
  chengdu_branch: Text;
  third_level_organization: Text;
  customer_category_3: Text;
  insurance_type: Text; // 商业险/交强险
  is_new_energy_vehicle: Bool;
  coverage_type: Text;
  is_transferred_vehicle: Bool;
  renewal_status: Text;
  vehicle_insurance_grade?: Text;
  highway_risk_grade?: Text;
  large_truck_score?: Text;
  small_truck_score?: Text;
  terminal_source?: Text;

  // 指标相关原子值（单位按字段对照表）
  documented_premium_in_10k: Numeric; // 万元
  average_premium_per_policy?: Numeric; // 元（可供校核）
  expired_net_premium_in_10k: Numeric; // 万元
  claim_frequency?: Numeric; // 小数（可供校核）
  case_count?: number; // 件（可推导）
  average_claim_payment?: Numeric; // 元（可供校核）
  total_claim_payment_in_10k: Numeric; // 万元
  expired_loss_ratio?: Numeric; // 小数（可供校核）
  expense_ratio: Numeric; // 小数（费用率）
  variable_cost_ratio?: Numeric; // 小数（可推导）
  commercial_auto_underwriting_factor?: Numeric; // 系数 商业险
  original_commercial_premium?: Numeric; // 万元（可推导）
  row_expense_amount_in_10k?: Numeric; // 万元（可推导）
  premium_plan?: Numeric; // 万元（外部/人工）
  plan_achievement_rate?: Numeric; // 小数（可推导）
  marginal_contribution_ratio?: Numeric; // 小数（可推导）
  marginal_contribution_amount_in_10k?: Numeric; // 万元（可推导）
  policy_count?: number; // 件（如提供，以用于单均等）
}

/**
 * 简单筛选条件（MVP阶段）
 */
export interface FilterState {
  week_number?: number; // 当前单周（主口径）
  chengdu_branch?: string[];
  third_level_organization?: string[];
  insurance_type?: string[];
}
