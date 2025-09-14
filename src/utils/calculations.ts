/**
 * 计算工具函数
 * 说明：提供安全的四则运算、求和、精度控制，统一处理分母为0等异常
 */

/**
 * 安全除法：分母为0时返回 null
 */
export function safeDivide(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  if (!isFinite(numerator) || !isFinite(denominator)) return null;
  return numerator / denominator;
}

/**
 * 按字段求和（忽略 null/NaN）
 */
export function sumBy<T>(arr: T[], pick: (x: T) => number | undefined | null): number {
  return arr.reduce((acc, cur) => {
    const v = pick(cur);
    if (typeof v === "number" && isFinite(v)) {
      return acc + v;
    }
    return acc;
  }, 0);
}

/**
 * 取小数位（四舍五入）
 * scale 用于 numeric(18,4)、numeric(10,6) 等
 */
export function roundTo(n: number, scale: number): number {
  const f = Math.pow(10, scale);
  return Math.round(n * f) / f;
}

/**
 * 计算环比变化（上一期为基准）
 */
export function calcDelta(prev: number | null, curr: number | null): { abs: number | null; pct: number | null } {
  if (prev == null || curr == null) return { abs: null, pct: null };
  const abs = curr - prev;
  const pct = prev === 0 ? null : abs / prev;
  return { abs, pct };
}

/**
 * 将布尔/字符串转换为布尔
 */
export function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "1" || s === "是";
  }
  return false;
}

