import { KPIResult, MetricValue } from "@/types/metrics";

/**
 * AI分析引擎（规则版MVP）
 * 功能：基于KPI与阈值规则，生成三段式分析报告与异常提示
 */

export interface InsightResult {
  anomalies: string[];
  report: string; // 三段式中文报告
}

/**
 * 异常检测：返回异常描述数组
 */
function detectAnomalies(metrics: MetricValue[]): string[] {
  const get = (k: string) => metrics.find((m) => m.key === (k as any));
  const res: string[] = [];

  const loss = get("expired_loss_ratio")?.current ?? null;
  if (loss != null && (loss > 1 || loss < 0)) {
    res.push(`满期赔付率异常：${(loss * 100).toFixed(1)}%`);
  }

  const expense = get("expense_ratio")?.current ?? null;
  if (expense != null && (expense > 0.5 || expense < 0)) {
    res.push(`费用率异常：${(expense * 100).toFixed(1)}%`);
  }

  const vcr = get("variable_cost_ratio")?.current ?? null;
  if (vcr != null && (vcr > 1.5 || vcr < 0)) {
    res.push(`变动成本率异常：${(vcr * 100).toFixed(1)}%`);
  }

  const mcr = get("marginal_contribution_ratio")?.current ?? null;
  if (mcr != null && (mcr < -0.5 || mcr > 1)) {
    res.push(`边际贡献率异常：${(mcr * 100).toFixed(1)}%`);
  }

  return res;
}

/**
 * 生成三段式报告（趋势、异常、洞察）
 */
export function generateInsights(kpi: KPIResult): InsightResult {
  const metrics = kpi.metrics;
  const anomalies = detectAnomalies(metrics);

  const get = (k: string) => metrics.find((m) => m.key === (k as any));

  // 简单趋势判断：跟单保费、满期赔付率、变动成本率环比
  const dp = get("documented_premium_in_10k");
  const elr = get("expired_loss_ratio");
  const vcr = get("variable_cost_ratio");

  const trend: string[] = [];
  if (dp?.deltaPct != null) trend.push(`跟单保费环比${dp.deltaPct >= 0 ? "上升" : "下降"} ${(Math.abs(dp.deltaPct) * 100).toFixed(1)}%`);
  if (elr?.deltaPct != null) trend.push(`满期赔付率环比${elr.deltaPct >= 0 ? "上升" : "下降"} ${(Math.abs(elr.deltaPct) * 100).toFixed(1)}%`);
  if (vcr?.deltaPct != null) trend.push(`变动成本率环比${vcr.deltaPct >= 0 ? "上升" : "下降"} ${(Math.abs(vcr.deltaPct) * 100).toFixed(1)}%`);

  const trendText = trend.length > 0 ? `趋势分析：${trend.join("；")}。` : "趋势分析：数据不足，无法判定。";

  const anomalyText = anomalies.length > 0 ? `异常识别：${anomalies.join("；")}。` : "异常识别：当前未识别到显著异常。";

  const suggestions: string[] = [];
  if ((elr?.current ?? 0) > 0.7) suggestions.push("聚焦高赔付机构/险种，开展专项风险排查与核保核赔联动");
  if ((vcr?.current ?? 0) > 0.8) suggestions.push("优化费用投放结构与渠道策略，控制变动成本");
  if ((get("plan_achievement_rate")?.current ?? 1) < 0.8) suggestions.push("加速保费计划落地，强化重点机构与渠道的推进");
  if (suggestions.length === 0) suggestions.push("保持当前节奏，关注关键指标波动，持续优化组合结构");

  const insightText = `业务洞察：${suggestions.join("；")}。`;

  return {
    anomalies,
    report: [trendText, anomalyText, insightText].join("\n"),
  };
}

