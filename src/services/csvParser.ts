/**
 * CSV解析模块（无第三方依赖的简化实现）
 * 功能：解析用户上传的CSV文本，返回表头与行数据（字符串字典）
 * 说明：该解析器支持常见CSV，但对复杂引号/转义场景支持有限。
 */

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * 解析CSV文本
 * @param text CSV文件文本
 * @returns { headers, rows }
 */
export function parseCSV(text: string): CSVParseResult {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const headers = splitLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    const cells = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return { headers, rows };
}

/**
 * 简单的按逗号分割，同时支持双引号包裹（不支持嵌套引号的极端情况）
 */
function splitLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // 转义双引号
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map((s) => s.trim());
}

