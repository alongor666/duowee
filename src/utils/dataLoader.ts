import type {
  CarInsuranceRecord,
  FilterState,
  DataLoadResult,
  DataCatalog,
  AvailableYears,
  AvailableWeeks
} from '@/types';

/**
 * 将可能为空的评级字段统一转换为可用于比较的值
 */
function normalizeGradeValue(value?: string | null): string {
  if (!value || value.trim() === '') {
    return '未评级';
  }
  return value.trim();
}

/**
 * 判断筛选值是否匹配评级字段（支持“未评级”选项）
 */
function matchesWithUnrated(selected: string[], value?: string | null): boolean {
  if (!selected || selected.length === 0) {
    return true;
  }
  const normalized = normalizeGradeValue(value);
  return selected.includes(normalized);
}

/**
 * 构建带有预设排序的筛选选项列表，可选地在存在空值时追加“未评级”
 */
function buildOrderedOptions(values: Array<string | null | undefined>, order?: string[], includeUnrated = false): string[] {
  const normalized = values.map(value => value?.trim() ?? '');
  const unique = new Set<string>();
  let hasEmpty = false;

  normalized.forEach(value => {
    if (!value) {
      if (includeUnrated) {
        hasEmpty = true;
      }
      return;
    }
    unique.add(value);
  });

  let sorted: string[];

  if (order && order.length > 0) {
    const ordered = order.filter(item => unique.has(item));
    const remaining = Array.from(unique)
      .filter(item => !order.includes(item))
      .sort((a, b) => a.localeCompare(b, 'zh-CN'));
    sorted = [...ordered, ...remaining];
  } else {
    sorted = Array.from(unique).sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }

  if (includeUnrated && hasEmpty && !unique.has('未评级')) {
    sorted.push('未评级');
  }

  return sorted;
}

/**
 * 加载CSV数据文件
 */
export async function loadCSVData(filePath: string): Promise<CarInsuranceRecord[]> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`加载数据文件失败: ${response.statusText}`);
    }

    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('加载CSV数据失败:', error);
    throw error;
  }
}

/**
 * 解析CSV文本为数据记录
 */
function parseCSV(csvText: string): CarInsuranceRecord[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV文件格式不正确');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const records: CarInsuranceRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`第${i + 1}行数据格式不正确，跳过`);
      continue;
    }

    try {
      const record = parseRecord(headers, values);
      records.push(record);
    } catch (error) {
      console.warn(`第${i + 1}行数据解析失败:`, error);
    }
  }

  return records;
}

/**
 * 解析CSV行，处理包含逗号的字段
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * 将CSV行数据解析为记录对象
 */
function parseRecord(headers: string[], values: string[]): CarInsuranceRecord {
  const record: any = {};

  headers.forEach((header, index) => {
    const value = values[index]?.replace(/"/g, '') || '';

    switch (header) {
      case 'snapshot_date':
        record.snapshot_date = value;
        break;
      case 'policy_start_year':
        record.policy_start_year = parseInt(value) || 0;
        break;
      case 'week_number':
        record.week_number = parseInt(value) || 0;
        break;
      case 'chengdu_branch':
        record.chengdu_branch = value;
        break;
      case 'third_level_organization':
        record.third_level_organization = value;
        break;
      case 'business_type_category':
        record.business_type_category = value;
        break;
      case 'customer_category_3':
        record.customer_category_3 = value;
        break;
      case 'insurance_type':
        record.insurance_type = value;
        break;
      case 'coverage_type':
        record.coverage_type = value;
        break;
      case 'renewal_status':
        record.renewal_status = value;
        break;
      case 'terminal_source':
        record.terminal_source = value;
        break;
      case 'is_new_energy_vehicle':
        record.is_new_energy_vehicle = value.toLowerCase() === 'true' || value === '1';
        break;
      case 'is_transferred_vehicle':
        record.is_transferred_vehicle = value.toLowerCase() === 'true' || value === '1';
        break;
      case 'vehicle_insurance_grade':
        record.vehicle_insurance_grade = value;
        break;
      case 'highway_risk_grade':
        record.highway_risk_grade = value;
        break;
      case 'large_truck_score':
        record.large_truck_score = value;
        break;
      case 'small_truck_score':
        record.small_truck_score = value;
        break;
      case 'signed_premium_yuan':
        record.signed_premium_yuan = parseFloat(value) || 0;
        break;
      case 'matured_premium_yuan':
        record.matured_premium_yuan = parseFloat(value) || 0;
        break;
      case 'commercial_premium_before_discount_yuan':
        record.commercial_premium_before_discount_yuan = parseFloat(value) || 0;
        break;
      case 'policy_count':
        record.policy_count = parseInt(value) || 0;
        break;
      case 'claim_case_count':
        record.claim_case_count = parseInt(value) || 0;
        break;
      case 'reported_claim_payment_yuan':
        record.reported_claim_payment_yuan = parseFloat(value) || 0;
        break;
      case 'expense_amount_yuan':
        record.expense_amount_yuan = parseFloat(value) || 0;
        break;
      case 'premium_plan_yuan':
        record.premium_plan_yuan = parseFloat(value) || 0;
        break;
      case 'marginal_contribution_amount_yuan':
        record.marginal_contribution_amount_yuan = parseFloat(value) || 0;
        break;
    }
  });

  return record as CarInsuranceRecord;
}

/**
 * 应用筛选器过滤数据
 */
export function filterData(records: CarInsuranceRecord[], filters: FilterState): CarInsuranceRecord[] {
  return records.filter(record => {
    // 年度筛选
    if (filters.policy_start_year.length > 0 && !filters.policy_start_year.includes(record.policy_start_year)) {
      return false;
    }

    // 周次筛选
    if (filters.week_number.length > 0 && !filters.week_number.includes(record.week_number)) {
      return false;
    }

    // 机构层级筛选
    if (filters.chengdu_branch.length > 0 && !filters.chengdu_branch.includes(record.chengdu_branch)) {
      return false;
    }

    // 机构筛选
    if (filters.third_level_organization.length > 0 && !filters.third_level_organization.includes(record.third_level_organization)) {
      return false;
    }

    // 保险类型筛选
    if (filters.insurance_type.length > 0 && !filters.insurance_type.includes(record.insurance_type)) {
      return false;
    }

    // 险种筛选
    if (filters.coverage_type.length > 0 && !filters.coverage_type.includes(record.coverage_type)) {
      return false;
    }

    // 业务类型筛选
    if (filters.business_type_category.length > 0 && !filters.business_type_category.includes(record.business_type_category)) {
      return false;
    }

    // 客户分类筛选
    if (filters.customer_category_3.length > 0 && !filters.customer_category_3.includes(record.customer_category_3)) {
      return false;
    }

    // 续期状态筛选
    if (filters.renewal_status.length > 0 && !filters.renewal_status.includes(record.renewal_status)) {
      return false;
    }

    // 终端来源筛选
    if (filters.terminal_source.length > 0 && !filters.terminal_source.includes(record.terminal_source)) {
      return false;
    }

    // 新能源车筛选
    if (filters.is_new_energy_vehicle !== null && record.is_new_energy_vehicle !== filters.is_new_energy_vehicle) {
      return false;
    }

    // 过户车筛选
    if (filters.is_transferred_vehicle !== null && record.is_transferred_vehicle !== filters.is_transferred_vehicle) {
      return false;
    }

    // 车险等级筛选
    if (!matchesWithUnrated(filters.vehicle_insurance_grade, record.vehicle_insurance_grade)) {
      return false;
    }

    // 公路风险等级筛选
    if (!matchesWithUnrated(filters.highway_risk_grade, record.highway_risk_grade)) {
      return false;
    }

    // 大货车评分筛选
    if (!matchesWithUnrated(filters.large_truck_score, record.large_truck_score)) {
      return false;
    }

    // 小货车评分筛选
    if (!matchesWithUnrated(filters.small_truck_score, record.small_truck_score)) {
      return false;
    }

    return true;
  });
}

/**
 * 加载元数据文件
 */
export async function loadMetadata(): Promise<{
  catalog: DataCatalog;
  availableYears: AvailableYears;
  availableWeeks: AvailableWeeks;
}> {
  try {
    const [catalogResponse, yearsResponse, weeksResponse] = await Promise.all([
      fetch('/data/metadata/data_catalog.json'),
      fetch('/data/metadata/available_years.json'),
      fetch('/data/metadata/available_weeks.json')
    ]);

    if (!catalogResponse.ok || !yearsResponse.ok || !weeksResponse.ok) {
      throw new Error('加载元数据文件失败');
    }

    const [catalog, availableYears, availableWeeks] = await Promise.all([
      catalogResponse.json(),
      yearsResponse.json(),
      weeksResponse.json()
    ]);

    return { catalog, availableYears, availableWeeks };
  } catch (error) {
    console.error('加载元数据失败:', error);
    throw error;
  }
}

/**
 * 获取可用的筛选选项
 */
export function getFilterOptions(records: CarInsuranceRecord[]) {
  const options = {
    policy_start_year: [...new Set(records.map(r => r.policy_start_year).filter(year => year > 0))].sort((a, b) => a - b),
    week_number: [...new Set(records.map(r => r.week_number).filter(week => week > 0))].sort((a, b) => a - b),
    chengdu_branch: buildOrderedOptions(records.map(r => r.chengdu_branch)),
    third_level_organization: buildOrderedOptions(records.map(r => r.third_level_organization)),
    insurance_type: buildOrderedOptions(records.map(r => r.insurance_type)),
    coverage_type: buildOrderedOptions(records.map(r => r.coverage_type)),
    business_type_category: buildOrderedOptions(records.map(r => r.business_type_category)),
    customer_category_3: buildOrderedOptions(records.map(r => r.customer_category_3)),
    renewal_status: buildOrderedOptions(records.map(r => r.renewal_status)),
    terminal_source: buildOrderedOptions(records.map(r => r.terminal_source)),
    vehicle_insurance_grade: buildOrderedOptions(records.map(r => r.vehicle_insurance_grade), ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'X'], true),
    highway_risk_grade: buildOrderedOptions(records.map(r => r.highway_risk_grade), ['A', 'B', 'C', 'D', 'E', 'X'], true),
    large_truck_score: buildOrderedOptions(records.map(r => r.large_truck_score), ['A', 'B', 'C', 'D', 'E', 'X'], true),
    small_truck_score: buildOrderedOptions(records.map(r => r.small_truck_score), ['A', 'B', 'C', 'D', 'E', 'X'], true),
  };

  return options;
}

/**
 * 创建默认筛选状态
 */
export function createDefaultFilters(): FilterState {
  return {
    policy_start_year: [],
    week_number: [],
    chengdu_branch: [],
    third_level_organization: [],
    insurance_type: [],
    coverage_type: [],
    business_type_category: [],
    customer_category_3: [],
    renewal_status: [],
    terminal_source: [],
    is_new_energy_vehicle: null,
    is_transferred_vehicle: null,
    vehicle_insurance_grade: [],
    highway_risk_grade: [],
    large_truck_score: [],
    small_truck_score: [],
  };
}

/**
 * 根据文件名生成数据加载结果
 */
export async function loadDataByPeriod(year: number, weekStart: number, weekEnd?: number): Promise<DataLoadResult> {
  const errors: string[] = [];
  let allRecords: CarInsuranceRecord[] = [];

  try {
    const { catalog } = await loadMetadata();
    const yearFiles = catalog.file_paths[year.toString()];

    if (!yearFiles) {
      throw new Error(`未找到${year}年的数据文件`);
    }

    const endWeek = weekEnd || weekStart;
    const filesToLoad: string[] = [];

    for (let week = weekStart; week <= endWeek; week++) {
      const fileName = `${year}保单第${week}周变动成本明细表.csv`;
      if (yearFiles[week.toString()]) {
        filesToLoad.push(yearFiles[week.toString()]);
      } else {
        errors.push(`缺失第${week}周数据`);
      }
    }

    // 并行加载所有文件
    const loadPromises = filesToLoad.map(filePath => loadCSVData(filePath));
    const results = await Promise.allSettled(loadPromises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allRecords.push(...result.value);
      } else {
        errors.push(`加载文件失败: ${filesToLoad[index]} - ${result.reason}`);
      }
    });

    // 生成元数据
    const dates = allRecords.map(r => r.snapshot_date).filter(Boolean);
    const weeks = [...new Set(allRecords.map(r => r.week_number))].sort();

    return {
      data: allRecords,
      metadata: {
        totalRows: allRecords.length,
        dateRange: {
          start: dates.length > 0 ? dates.sort()[0] : '',
          end: dates.length > 0 ? dates.sort()[dates.length - 1] : ''
        },
        availableWeeks: weeks,
        errors
      }
    };
  } catch (error) {
    errors.push(`数据加载失败: ${error}`);
    return {
      data: [],
      metadata: {
        totalRows: 0,
        dateRange: { start: '', end: '' },
        availableWeeks: [],
        errors
      }
    };
  }
}

/**
 * 验证数据质量
 */
export function validateDataQuality(records: CarInsuranceRecord[]): string[] {
  const issues: string[] = [];

  if (records.length === 0) {
    issues.push('数据为空');
    return issues;
  }

  // 检查必需字段
  const requiredFields = ['policy_start_year', 'week_number', 'signed_premium_yuan'];
  requiredFields.forEach(field => {
    const invalidCount = records.filter(r => !r[field as keyof CarInsuranceRecord]).length;
    if (invalidCount > 0) {
      issues.push(`${field}字段有${invalidCount}条记录为空`);
    }
  });

  // 检查负值
  const amountFields = ['signed_premium_yuan', 'matured_premium_yuan', 'policy_count'];
  amountFields.forEach(field => {
    const negativeCount = records.filter(r => (r[field as keyof CarInsuranceRecord] as number) < 0).length;
    if (negativeCount > 0) {
      issues.push(`${field}字段有${negativeCount}条记录为负值`);
    }
  });

  // 检查数据分布
  const totalRecords = records.length;
  const uniqueOrgs = new Set(records.map(r => r.third_level_organization)).size;

  if (uniqueOrgs < 2) {
    issues.push('机构数据分布过于集中');
  }

  if (totalRecords < 100) {
    issues.push('数据量偏少，可能影响分析准确性');
  }

  return issues;
}