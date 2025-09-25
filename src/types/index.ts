// 车险数据源字段类型定义
export interface CarInsuranceRecord {
  snapshot_date: string;
  policy_start_year: number;
  week_number: number;
  chengdu_branch: string;
  third_level_organization: string;
  business_type_category: string;
  customer_category_3: string;
  insurance_type: string;
  coverage_type: string;
  renewal_status: string;
  terminal_source: string;
  is_new_energy_vehicle: boolean;
  is_transferred_vehicle: boolean;
  vehicle_insurance_grade: string;
  highway_risk_grade: string;
  large_truck_score: string;
  small_truck_score: string;
  signed_premium_yuan: number;
  matured_premium_yuan: number;
  commercial_premium_before_discount_yuan: number;
  policy_count: number;
  claim_case_count: number;
  reported_claim_payment_yuan: number;
  expense_amount_yuan: number;
  premium_plan_yuan: number;
  marginal_contribution_amount_yuan: number;
}

// 聚合后的数据类型
export interface AggregatedData {
  signed_premium: number;
  matured_premium: number;
  commercial_premium_before_discount: number;
  policy_count: number;
  claim_case_count: number;
  reported_claim_payment: number;
  expense_amount: number;
  premium_plan: number;
  marginal_contribution_amount: number;
}

// KPI指标类型
export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  changeType: 'positive' | 'negative' | 'neutral' | 'warning';
  unit: string;
  formula?: string;
  category: 'absolute' | 'ratio' | 'operational' | 'commercial';
  description?: string;
}

// 筛选器配置类型
export interface FilterConfig {
  id: string;
  name: string;
  type: 'select' | 'multiSelect' | 'dateRange' | 'numberRange';
  options?: FilterOption[];
  value: any;
  required?: boolean;
  placeholder?: string;
}

export interface FilterOption {
  label: string;
  value: string | number | boolean;
  count?: number;
}

// 筛选器状态类型
export interface FilterState {
  policy_start_year: number[];
  week_number: number[];
  third_level_organization: string[];
  insurance_type: string[];
  coverage_type: string[];
  business_type_category: string[];
  customer_category_3: string[];
  renewal_status: string[];
  terminal_source: string[];
  is_new_energy_vehicle: boolean | null;
  is_transferred_vehicle: boolean | null;
  vehicle_insurance_grade: string[];
  highway_risk_grade: string[];
  large_truck_score: string[];
  small_truck_score: string[];
}

// 对比分析类型
export interface ComparisonMode {
  type: 'yoy' | 'wow' | 'custom'; // year-over-year, week-over-week, custom
  currentPeriod: TimePeriod;
  comparePeriod?: TimePeriod;
  enabled: boolean;
}

export interface TimePeriod {
  year: number;
  weekStart: number;
  weekEnd: number;
}

// 仪表板状态类型
export interface DashboardState {
  data: CarInsuranceRecord[];
  aggregatedData: AggregatedData;
  kpiMetrics: KPIMetric[];
  filters: FilterState;
  comparison: ComparisonMode;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  importSources: ImportSourceMeta[];
}

// 元数据类型
export interface DataCatalog {
  file_paths: Record<string, Record<string, string>>;
  missing_weeks: Record<string, number[]>;
  scan_time: string;
  total_files: number;
}

export interface AvailableYears {
  years: number[];
  last_updated: string;
}

export interface AvailableWeeks {
  [year: string]: number[];
}

export interface FieldDictionary {
  version: string;
  dimensions: DimensionField[];
  measures: MeasureField[];
  formulas: Record<string, string>;
}

export interface DimensionField {
  name: string;
  display_name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  description: string;
  values?: string[];
}

export interface MeasureField {
  name: string;
  display_name: string;
  unit: string;
  description: string;
  format?: string;
}

// 组件属性类型
export interface KPICardProps {
  metric: KPIMetric;
  onClick?: () => void;
  className?: string;
}

export interface FilterPanelProps {
  filters: FilterConfig[];
  values: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export interface DashboardGridProps {
  metrics: KPIMetric[];
  loading?: boolean;
  onMetricClick?: (metric: KPIMetric) => void;
}

// 数据加载和处理相关类型
export interface DataLoadResult {
  data: CarInsuranceRecord[];
  metadata: {
    totalRows: number;
    dateRange: {
      start: string;
      end: string;
    };
    availableWeeks: number[];
    errors: string[];
  };
}

export interface CalculationResult {
  metrics: KPIMetric[];
  aggregated: AggregatedData;
  errors: string[];
}

// 导出和分享相关类型
export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'image';
  includeCharts: boolean;
  includeFilters: boolean;
  dateRange?: TimePeriod;
}

export interface ShareConfig {
  url: string;
  filters: FilterState;
  comparison: ComparisonMode;
  expires?: Date;
}

export interface ImportSourceMeta {
  fileName: string;
  rowCount: number;
  years: number[];
  weeks: number[];
  uploadedAt: string;
}

export interface StoredImportSnapshot {
  createdAt: string;
  records: CarInsuranceRecord[];
  sources: ImportSourceMeta[];
  warnings?: string[];
}

// 用户设置类型
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'zh-CN' | 'en-US';
  defaultFilters: Partial<FilterState>;
  dashboardLayout: 'grid' | 'list';
  autoRefresh: boolean;
  refreshInterval: number; // 分钟
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}
