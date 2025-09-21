import type { CarInsuranceRecord, AggregatedData, KPIMetric } from '@/types';

/**
 * 聚合原始数据
 */
export function aggregateData(records: CarInsuranceRecord[]): AggregatedData {
  return records.reduce(
    (acc, record) => ({
      signed_premium: acc.signed_premium + (record.signed_premium_yuan || 0),
      matured_premium: acc.matured_premium + (record.matured_premium_yuan || 0),
      commercial_premium_before_discount:
        acc.commercial_premium_before_discount + (record.commercial_premium_before_discount_yuan || 0),
      policy_count: acc.policy_count + (record.policy_count || 0),
      claim_case_count: acc.claim_case_count + (record.claim_case_count || 0),
      reported_claim_payment: acc.reported_claim_payment + (record.reported_claim_payment_yuan || 0),
      expense_amount: acc.expense_amount + (record.expense_amount_yuan || 0),
      premium_plan: acc.premium_plan + (record.premium_plan_yuan || 0),
      marginal_contribution_amount: acc.marginal_contribution_amount + (record.marginal_contribution_amount_yuan || 0),
    }),
    {
      signed_premium: 0,
      matured_premium: 0,
      commercial_premium_before_discount: 0,
      policy_count: 0,
      claim_case_count: 0,
      reported_claim_payment: 0,
      expense_amount: 0,
      premium_plan: 0,
      marginal_contribution_amount: 0,
    }
  );
}

/**
 * 计算所有KPI指标
 */
export function calculateKPIMetrics(data: AggregatedData, previousData?: AggregatedData): KPIMetric[] {
  const metrics: KPIMetric[] = [];

  // 第一行：绝对值指标（万元、件）
  metrics.push(
    createKPIMetric(
      'signed_premium',
      '签单保费',
      data.signed_premium / 10000, // 转换为万元
      previousData ? previousData.signed_premium / 10000 : undefined,
      '万元',
      'absolute',
      'SUM(signed_premium_yuan)'
    ),
    createKPIMetric(
      'matured_premium',
      '满期保费',
      data.matured_premium / 10000,
      previousData ? previousData.matured_premium / 10000 : undefined,
      '万元',
      'absolute',
      'SUM(matured_premium_yuan)'
    ),
    createKPIMetric(
      'policy_count',
      '保单件数',
      data.policy_count,
      previousData ? previousData.policy_count : undefined,
      '件',
      'absolute',
      'SUM(policy_count)'
    ),
    createKPIMetric(
      'claim_case_count',
      '赔案件数',
      data.claim_case_count,
      previousData ? previousData.claim_case_count : undefined,
      '件',
      'absolute',
      'SUM(claim_case_count)'
    )
  );

  // 第二行：核心率值指标（%）
  const maturedLossRatio = safeDiv(data.reported_claim_payment, data.matured_premium) * 100;
  const expenseRatio = safeDiv(data.expense_amount, data.signed_premium) * 100;
  const variableCostRatio = safeDiv(data.expense_amount + data.reported_claim_payment, data.signed_premium) * 100;
  const marginalContributionRatio = safeDiv(data.marginal_contribution_amount, data.matured_premium) * 100;

  const prevMaturedLossRatio = previousData ? safeDiv(previousData.reported_claim_payment, previousData.matured_premium) * 100 : undefined;
  const prevExpenseRatio = previousData ? safeDiv(previousData.expense_amount, previousData.signed_premium) * 100 : undefined;
  const prevVariableCostRatio = previousData ? safeDiv(previousData.expense_amount + previousData.reported_claim_payment, previousData.signed_premium) * 100 : undefined;
  const prevMarginalContributionRatio = previousData ? safeDiv(previousData.marginal_contribution_amount, previousData.matured_premium) * 100 : undefined;

  metrics.push(
    createKPIMetric(
      'matured_loss_ratio',
      '满期赔付率',
      maturedLossRatio,
      prevMaturedLossRatio,
      '%',
      'ratio',
      'SUM(reported_claim_payment_yuan) / NULLIF(SUM(matured_premium_yuan), 0) * 100',
      'negative' // 赔付率上升是负面的
    ),
    createKPIMetric(
      'expense_ratio',
      '费用率',
      expenseRatio,
      prevExpenseRatio,
      '%',
      'ratio',
      'SUM(expense_amount_yuan) / NULLIF(SUM(signed_premium_yuan), 0) * 100',
      'negative' // 费用率上升是负面的
    ),
    createKPIMetric(
      'variable_cost_ratio',
      '变动成本率',
      variableCostRatio,
      prevVariableCostRatio,
      '%',
      'ratio',
      'SUM(expense_amount_yuan + reported_claim_payment_yuan) / NULLIF(SUM(signed_premium_yuan), 0) * 100',
      'negative' // 成本率上升是负面的
    ),
    createKPIMetric(
      'marginal_contribution_ratio',
      '满期边际贡献率',
      marginalContributionRatio,
      prevMarginalContributionRatio,
      '%',
      'ratio',
      'SUM(marginal_contribution_amount_yuan) / NULLIF(SUM(matured_premium_yuan), 0) * 100'
    )
  );

  // 第三行：运营指标
  const claimFrequency = safeDiv(data.claim_case_count, data.policy_count) * safeDiv(data.matured_premium, data.signed_premium) * 100;
  const avgPremium = safeDiv(data.signed_premium, data.policy_count);
  const avgClaimAmount = safeDiv(data.reported_claim_payment, data.claim_case_count);
  const marginalContributionAmount = data.marginal_contribution_amount / 10000;

  const prevClaimFrequency = previousData ? safeDiv(previousData.claim_case_count, previousData.policy_count) * safeDiv(previousData.matured_premium, previousData.signed_premium) * 100 : undefined;
  const prevAvgPremium = previousData ? safeDiv(previousData.signed_premium, previousData.policy_count) : undefined;
  const prevAvgClaimAmount = previousData ? safeDiv(previousData.reported_claim_payment, previousData.claim_case_count) : undefined;
  const prevMarginalContributionAmount = previousData ? previousData.marginal_contribution_amount / 10000 : undefined;

  metrics.push(
    createKPIMetric(
      'claim_frequency',
      '满期出险率',
      claimFrequency,
      prevClaimFrequency,
      '%',
      'operational',
      'SUM(claim_case_count) / NULLIF(SUM(policy_count), 0) * (SUM(matured_premium_yuan) / NULLIF(SUM(signed_premium_yuan), 0)) * 100',
      'negative' // 出险率上升是负面的
    ),
    createKPIMetric(
      'avg_premium',
      '单均保费',
      avgPremium,
      prevAvgPremium,
      '元',
      'operational',
      'SUM(signed_premium_yuan) / NULLIF(SUM(policy_count), 0)'
    ),
    createKPIMetric(
      'avg_claim_amount',
      '案均赔款',
      avgClaimAmount,
      prevAvgClaimAmount,
      '元',
      'operational',
      'SUM(reported_claim_payment_yuan) / NULLIF(SUM(claim_case_count), 0)',
      'negative' // 案均赔款上升是负面的
    ),
    createKPIMetric(
      'marginal_contribution_amount',
      '满期边际贡献额',
      marginalContributionAmount,
      prevMarginalContributionAmount,
      '万元',
      'operational',
      'SUM(marginal_contribution_amount_yuan)'
    )
  );

  // 第四行：商业险专项指标
  const commercialPremiumBeforeDiscount = data.commercial_premium_before_discount / 10000;
  const commercialAutoCoeff = safeDiv(data.signed_premium, data.commercial_premium_before_discount);
  const reportedClaimPayment = data.reported_claim_payment / 10000;
  const expenseAmount = data.expense_amount / 10000;

  const prevCommercialPremiumBeforeDiscount = previousData ? previousData.commercial_premium_before_discount / 10000 : undefined;
  const prevCommercialAutoCoeff = previousData ? safeDiv(previousData.signed_premium, previousData.commercial_premium_before_discount) : undefined;
  const prevReportedClaimPayment = previousData ? previousData.reported_claim_payment / 10000 : undefined;
  const prevExpenseAmount = previousData ? previousData.expense_amount / 10000 : undefined;

  metrics.push(
    createKPIMetric(
      'commercial_premium_before_discount',
      '商业险折前保费',
      commercialPremiumBeforeDiscount,
      prevCommercialPremiumBeforeDiscount,
      '万元',
      'commercial',
      'SUM(commercial_premium_before_discount_yuan)'
    ),
    createKPIMetric(
      'commercial_auto_coeff',
      '商业险自主系数',
      commercialAutoCoeff,
      prevCommercialAutoCoeff,
      '',
      'commercial',
      'SUM(signed_premium_yuan) / NULLIF(SUM(commercial_premium_before_discount_yuan), 0)'
    ),
    createKPIMetric(
      'reported_claim_payment',
      '已报告赔款',
      reportedClaimPayment,
      prevReportedClaimPayment,
      '万元',
      'commercial',
      'SUM(reported_claim_payment_yuan)',
      'negative' // 赔款增加是负面的
    ),
    createKPIMetric(
      'expense_amount',
      '费用金额',
      expenseAmount,
      prevExpenseAmount,
      '万元',
      'commercial',
      'SUM(expense_amount_yuan)',
      'negative' // 费用增加是负面的
    )
  );

  return metrics;
}

/**
 * 创建KPI指标对象
 */
function createKPIMetric(
  id: string,
  name: string,
  value: number,
  previousValue: number | undefined,
  unit: string,
  category: KPIMetric['category'],
  formula: string,
  defaultChangeType: 'positive' | 'negative' = 'positive'
): KPIMetric {
  let change: number | undefined;
  let changePercent: number | undefined;
  let changeType: KPIMetric['changeType'] = 'neutral';

  if (previousValue !== undefined && !isNaN(previousValue) && previousValue !== 0) {
    change = value - previousValue;
    changePercent = (change / Math.abs(previousValue)) * 100;

    // 根据变化方向和指标性质确定变化类型
    if (Math.abs(changePercent) > 20) {
      changeType = 'warning'; // 变化幅度超过20%视为异常
    } else if (change > 0) {
      changeType = defaultChangeType; // 增长对某些指标是正面的，对某些是负面的
    } else if (change < 0) {
      changeType = defaultChangeType === 'positive' ? 'negative' : 'positive';
    }
  }

  return {
    id,
    name,
    value: Number(value.toFixed(2)),
    previousValue: previousValue ? Number(previousValue.toFixed(2)) : undefined,
    change: change ? Number(change.toFixed(2)) : undefined,
    changePercent: changePercent ? Number(changePercent.toFixed(2)) : undefined,
    changeType,
    unit,
    formula,
    category
  };
}

/**
 * 安全除法，避免除零错误
 */
function safeDiv(numerator: number, denominator: number): number {
  if (denominator === 0 || isNaN(denominator) || isNaN(numerator)) {
    return 0;
  }
  return numerator / denominator;
}

/**
 * 格式化数值显示
 */
export function formatValue(value: number, unit: string): string {
  if (isNaN(value)) return '--';

  switch (unit) {
    case '万元':
      return value.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    case '元':
      return value.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    case '%':
      return value.toFixed(1);
    case '件':
      return value.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    case '':
      return value.toFixed(3);
    default:
      return value.toFixed(2);
  }
}

/**
 * 格式化变化值显示
 */
export function formatChange(change: number, unit: string): string {
  if (isNaN(change)) return '';

  const prefix = change > 0 ? '+' : '';
  return prefix + formatValue(Math.abs(change), unit);
}

/**
 * 格式化变化百分比显示
 */
export function formatChangePercent(changePercent: number): string {
  if (isNaN(changePercent)) return '';

  const prefix = changePercent > 0 ? '+' : '';
  return `${prefix}${changePercent.toFixed(1)}%`;
}