import type { CarInsuranceRecord } from '@/types';

/**
 * CSV数据验证结果
 */
export type IssueLevel = 'error' | 'warning';

export interface IssueDetail {
  row: number; // 以1为基的行号（对应CSV可读行号）
  field?: string;
  level: IssueLevel;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recordCount: number;
  issues: IssueDetail[];
  skippedRows?: number;
}

/**
 * 字段配置
 */
interface FieldConfig {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
  validator?: (value: any) => boolean;
}

/**
 * 必需字段配置
 */
const REQUIRED_FIELDS: FieldConfig[] = [
  { name: 'snapshot_date', displayName: '快照日期', type: 'date', required: true },
  { name: 'policy_start_year', displayName: '保单起期年度', type: 'number', required: true },
  { name: 'week_number', displayName: '周次', type: 'number', required: true },
  { name: 'chengdu_branch', displayName: '成都分公司', type: 'string', required: true },
  { name: 'third_level_organization', displayName: '三级机构', type: 'string', required: true },
  { name: 'business_type_category', displayName: '业务类型分类', type: 'string', required: true },
  { name: 'customer_category_3', displayName: '客户三级分类', type: 'string', required: true },
  { name: 'insurance_type', displayName: '保险类型', type: 'string', required: true },
  { name: 'coverage_type', displayName: '险种', type: 'string', required: true },
  { name: 'renewal_status', displayName: '续期状态', type: 'string', required: true },
  { name: 'terminal_source', displayName: '终端来源', type: 'string', required: true },
  { name: 'is_new_energy_vehicle', displayName: '新能源车标识', type: 'boolean', required: true },
  { name: 'is_transferred_vehicle', displayName: '过户车标识', type: 'boolean', required: true },
  { name: 'vehicle_insurance_grade', displayName: '车险等级', type: 'string', required: false },
  { name: 'highway_risk_grade', displayName: '公路风险等级', type: 'string', required: false },
  { name: 'large_truck_score', displayName: '大货车分数', type: 'string', required: false },
  { name: 'small_truck_score', displayName: '小货车分数', type: 'string', required: false },
  {
    name: 'signed_premium_yuan',
    displayName: '签单保费',
    type: 'number',
    required: true,
    validator: (value: number) => value >= 0
  },
  {
    name: 'matured_premium_yuan',
    displayName: '满期保费',
    type: 'number',
    required: true,
    validator: (value: number) => value >= 0
  },
  {
    name: 'commercial_premium_before_discount_yuan',
    displayName: '商业险折前保费',
    type: 'number',
    required: false,
    validator: (value: number) => value >= 0
  },
  {
    name: 'policy_count',
    displayName: '保单件数',
    type: 'number',
    required: true,
    validator: (value: number) => value >= 0 && Number.isInteger(value)
  },
  {
    name: 'claim_case_count',
    displayName: '赔案件数',
    type: 'number',
    required: true,
    validator: (value: number) => value >= 0 && Number.isInteger(value)
  },
  {
    name: 'reported_claim_payment_yuan',
    displayName: '已报告赔款',
    type: 'number',
    required: true
  },
  {
    name: 'expense_amount_yuan',
    displayName: '费用金额',
    type: 'number',
    required: true,
    validator: (value: number) => value >= 0
  },
  {
    name: 'premium_plan_yuan',
    displayName: '保费计划',
    type: 'number',
    required: false,
    validator: (value: number) => value >= 0
  },
  {
    name: 'marginal_contribution_amount_yuan',
    displayName: '满期边际贡献额',
    type: 'number',
    required: true
  }
];

/**
 * 解析CSV文本为数据记录
 */
export function parseCSV(csvText: string): CarInsuranceRecord[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV文件格式不正确：缺少数据行');
  }

  // 解析表头
  const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/"/g, ''));
  const records: CarInsuranceRecord[] = [];

  // 解析数据行
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // 跳过空行

    try {
      const values = parseCSVLine(line);
      if (values.length !== headers.length) {
        console.warn(`第${i + 1}行字段数量不匹配，已跳过`);
        continue;
      }

      const record = parseRecord(headers, values);
      records.push(record);
    } catch (error) {
      // 放宽：单行解析失败不终止整体导入，记录警告并跳过该行
      console.warn(`第${i + 1}行数据解析失败（已跳过）:`, error);
      continue;
    }
  }

  return records;
}

/**
 * 更丰富的解析：返回成功记录与逐行问题列表（不抛错）。
 */
export function parseCSVWithIssues(csvText: string): { records: CarInsuranceRecord[]; parseIssues: IssueDetail[]; skippedRows: number } {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    return { records: [], parseIssues: [{ row: 1, level: 'error', message: 'CSV文件格式不正确：缺少数据行' }], skippedRows: 0 };
  }

  const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/"/g, ''));
  const records: CarInsuranceRecord[] = [];
  const parseIssues: IssueDetail[] = [];
  let skippedRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const values = parseCSVLine(line);
      if (values.length !== headers.length) {
        parseIssues.push({ row: i + 1, level: 'error', message: `字段数量不匹配（期望${headers.length}列，实际${values.length}列）` });
        skippedRows++;
        continue;
      }
      try {
        const record = parseRecord(headers, values);
        records.push(record);
      } catch (e: any) {
        parseIssues.push({ row: i + 1, level: 'error', message: e?.message || '该行数据解析失败' });
        skippedRows++;
      }
    } catch (e: any) {
      parseIssues.push({ row: i + 1, level: 'error', message: e?.message || '该行数据解析失败' });
      skippedRows++;
    }
  }

  return { records, parseIssues, skippedRows };
}

/**
 * 解析CSV行，处理包含逗号和引号的字段
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // 处理双引号转义
        current += '"';
        i += 2;
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      result.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // 添加最后一个字段
  result.push(current);

  return result.map(field => field.trim().replace(/^"|"$/g, ''));
}

/**
 * 将CSV行数据解析为记录对象
 */
function parseRecord(headers: string[], values: string[]): CarInsuranceRecord {
  const record: any = {};

  headers.forEach((header, index) => {
    const value = values[index] || '';
    const fieldConfig = REQUIRED_FIELDS.find(f => f.name === header);

    if (!fieldConfig) {
      // 未知字段，跳过或记录警告
      return;
    }

    try {
      switch (fieldConfig.type) {
        case 'string':
          record[header] = value;
          break;

        case 'number':
          const numValue = value === '' ? 0 : parseFloat(value);
          if (isNaN(numValue)) {
            throw new Error(`${fieldConfig.displayName}必须是数字格式`);
          }
          record[header] = numValue;
          break;

        case 'boolean':
          const boolValue = value.toLowerCase() === 'true' ||
                           value === '1' ||
                           value.toLowerCase() === 'yes' ||
                           value.toLowerCase() === '是';
          record[header] = boolValue;
          break;

        case 'date':
          record[header] = value;
          break;

        default:
          record[header] = value;
      }

      // 自定义验证
      if (fieldConfig.validator && record[header] !== undefined) {
        if (!fieldConfig.validator(record[header])) {
          throw new Error(`${fieldConfig.displayName}值不符合要求`);
        }
      }

    } catch (error) {
      throw new Error(`字段 ${fieldConfig.displayName}: ${error}`);
    }
  });

  return record as CarInsuranceRecord;
}

/**
 * 验证CSV数据
 */
export function validateCSVData(records: CarInsuranceRecord[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const issues: IssueDetail[] = [];

  if (records.length === 0) {
    errors.push('数据文件为空');
    return { isValid: false, errors, warnings, recordCount: 0, issues, skippedRows: 0 };
  }

  // 检查必需字段
  const sampleRecord = records[0];
  const missingFields = REQUIRED_FIELDS
    .filter(field => field.required)
    .filter(field => !(field.name in sampleRecord))
    .map(field => field.displayName);

  if (missingFields.length > 0) {
    const msg = `缺少必需字段: ${missingFields.join(', ')}`;
    errors.push(msg);
    issues.push({ row: 1, level: 'error', message: msg });
  }

  // 数据质量检查
  let invalidRecords = 0;
  const fieldStats: Record<string, { nullCount: number; negativeCount: number }> = {};

  records.forEach((record, index) => {
    let recordHasError = false;

    // 检查必需字段是否为空
    REQUIRED_FIELDS.filter(f => f.required).forEach(field => {
      const value = record[field.name as keyof CarInsuranceRecord];
      if (value === undefined || value === null || value === '') {
        errors.push(`第${index + 1}行: ${field.displayName}不能为空`);
        recordHasError = true;
      }
    });

    // 检查数值字段
    const numericFields = [
      'signed_premium_yuan',
      'matured_premium_yuan',
      'policy_count',
      'claim_case_count',
      'reported_claim_payment_yuan',
      'expense_amount_yuan'
    ];
    numericFields.forEach(fieldName => {
      const value = record[fieldName as keyof CarInsuranceRecord] as number;

      if (!fieldStats[fieldName]) {
        fieldStats[fieldName] = { nullCount: 0, negativeCount: 0 };
      }

      if (value === undefined || value === null || isNaN(value)) {
        fieldStats[fieldName].nullCount++;
        issues.push({ row: index + 2, field: fieldName, level: 'warning', message: '数值为空或非法' });
      } else if (value < 0) {
        fieldStats[fieldName].negativeCount++;
        if (fieldName === 'policy_count' || fieldName === 'claim_case_count') {
          const msg = `第${index + 1}行: ${fieldName}不能为负数`;
          errors.push(msg);
          issues.push({ row: index + 2, field: fieldName, level: 'error', message: '不可为负数' });
          recordHasError = true;
        } else {
          issues.push({ row: index + 2, field: fieldName, level: 'warning', message: '出现负值（可能为冲销）' });
        }
      }
    });

  // 业务逻辑检查
  // 说明：赔案件数大于保单件数在部分业务场景（旧案跨期、并案等）可视为正常，因此不作为问题提示。

    if (recordHasError) {
      invalidRecords++;
    }
  });

  // 生成数据质量警告
  Object.entries(fieldStats).forEach(([fieldName, stats]) => {
    const config = REQUIRED_FIELDS.find(f => f.name === fieldName);
    if (config && stats.negativeCount > 0) {
      warnings.push(`${config.displayName}有${stats.negativeCount}条负值记录`);
    }
    if (config && stats.nullCount > 0) {
      warnings.push(`${config.displayName}有${stats.nullCount}条空值记录`);
    }
  });

  // 数据范围检查
  const years = records.map(r => r.policy_start_year).filter(Boolean);
  const weeks = records.map(r => r.week_number).filter(Boolean);

  if (years.length > 0) {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const currentYear = new Date().getFullYear();

    if (minYear < 2020 || maxYear > currentYear + 1) {
      warnings.push(`保单年度范围异常: ${minYear}-${maxYear}`);
    }
  }

  if (weeks.length > 0) {
    const minWeek = Math.min(...weeks);
    const maxWeek = Math.max(...weeks);

    if (minWeek < 1 || maxWeek > 53) {
      warnings.push(`周次范围异常: ${minWeek}-${maxWeek}`);
    }
  }

  // 重复数据检查
  const uniqueKeys = new Set();
  let duplicateCount = 0;

  records.forEach((record, index) => {
    const key = `${record.policy_start_year}-${record.week_number}-${record.third_level_organization}-${record.insurance_type}`;
    if (uniqueKeys.has(key)) {
      duplicateCount++;
    } else {
      uniqueKeys.add(key);
    }
  });

  if (duplicateCount > 0) {
    warnings.push(`发现${duplicateCount}条可能重复的记录`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recordCount: records.length,
    issues,
  };
}

/**
 * 生成数据验证报告
 */
export function generateValidationReport(result: ValidationResult): string {
  let report = `数据验证报告\n`;
  report += `=================\n`;
  report += `记录总数: ${result.recordCount}\n`;
  report += `验证状态: ${result.isValid ? '通过' : '失败'}\n\n`;

  if (typeof result.skippedRows === 'number') {
    report += `解析阶段跳过行数: ${result.skippedRows}\n\n`;
  }

  if (result.errors.length > 0) {
    report += `错误 (${result.errors.length}项):\n`;
    result.errors.forEach((error, index) => {
      report += `${index + 1}. ${error}\n`;
    });
    report += '\n';
  }

  if (result.warnings.length > 0) {
    report += `警告 (${result.warnings.length}项):\n`;
    result.warnings.forEach((warning, index) => {
      report += `${index + 1}. ${warning}\n`;
    });
    report += '\n';
  }

  if (result.issues && result.issues.length > 0) {
    report += `问题明细 (${result.issues.length} 条):\n`;
    result.issues.slice(0, 1000).forEach((iss, idx) => {
      const loc = iss.field ? `第${iss.row}行 [${iss.field}]` : `第${iss.row}行`;
      report += `${idx + 1}. [${iss.level.toUpperCase()}] ${loc}: ${iss.message}\n`;
    });
    if (result.issues.length > 1000) report += `… 仅显示前 1000 条\n`;
    report += '\n';
  }

  if (result.isValid) {
    report += `✅ 数据验证通过，可以进行导入。\n`;
  } else {
    report += `❌ 数据验证失败，请修复错误后重新上传。\n`;
  }

  return report;
}

/**
 * 下载验证报告
 */
export function downloadValidationReport(result: ValidationResult, filename: string = '数据验证报告.txt') {
  const report = generateValidationReport(result);
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
