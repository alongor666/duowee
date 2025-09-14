/**
 * 格式化工具函数
 */

export function format10k(n: number | null): string {
  if (n == null) return "-";
  // 展示取整（万元/元）
  return Math.round(n).toLocaleString();
}

export function formatCurrencyYuan(n: number | null): string {
  if (n == null) return "-";
  return Math.round(n).toLocaleString();
}

export function formatRate(n: number | null): string {
  if (n == null) return "-";
  // 展示保留1位小数（x100转为%）
  return `${(n * 100).toFixed(1)}%`;
}

export function formatInteger(n: number | null): string {
  if (n == null) return "-";
  return Math.round(n).toLocaleString();
}

