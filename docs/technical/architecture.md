# 车险变动成本明细分析系统 - 技术架构设计

> **主文档**: [PRD产品需求文档](../../prd.md) - 🎯 **核心入口**  
> **文档索引**: [完整文档导航](../index.md)  
> **本文档在主PRD中的位置**: [技术实现 > 技术架构详细说明](../../prd.md#🔧-技术实现)
> 
> **相关章节**: 主PRD第5章「技术规范」的详细展开

## 1. 系统架构概览

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                │
│   Web浏览器 │ 移动端浏览器 │ 平板浏览器                    │
├─────────────────────────────────────────────────────────────┤
│                        前端层                                │
│  Next.js 14 │ TypeScript │ Tailwind CSS │ Recharts        │
│  React Context │ React Hook Form │ React Query             │
├─────────────────────────────────────────────────────────────┤
│                        API网关层                             │
│   Nginx │ 负载均衡 │ 请求路由 │ 静态资源服务               │
├─────────────────────────────────────────────────────────────┤
│                        应用服务层                            │
│   Node.js │ Express │ TypeScript │ 业务逻辑处理             │
│   数据聚合 │ KPI计算 │ 缓存管理 │ 错误处理                 │
├─────────────────────────────────────────────────────────────┤
│                        数据处理层                            │
│  CSV Parser │ 数据验证 │ 内存缓存 │ 数据转换               │
│  聚合计算 │ 预运算 │ 增量更新 │ 数据压缩                 │
├─────────────────────────────────────────────────────────────┤
│                        存储层                                │
│  本地CSV文件 │ 文件系统 │ 临时缓存 │ 日志文件             │
├─────────────────────────────────────────────────────────────┤
│                        基础设施层                            │
│   Docker │ PM2 │ 监控告警 │ 日志收集 │ 备份恢复           │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 架构特点

#### 轻量化设计
- **无数据库依赖**: 直接基于CSV文件，降低运维复杂度
- **内存计算**: 数据加载到内存进行高速计算
- **文件系统存储**: 利用操作系统文件缓存机制

#### 高性能优化
- **分层缓存**: 浏览器缓存 + 应用缓存 + 文件系统缓存
- **预运算**: 关键指标预聚合，减少实时计算
- **增量加载**: 按时间窗口分片加载数据

#### 可扩展性
- **模块化设计**: 前后端分离，组件化开发
- **API标准化**: RESTful接口，支持版本管理
- **配置驱动**: 关键参数可配置，支持不同环境

## 2. 前端架构设计

### 2.1 技术栈架构

```
┌─────────────────────────────────────────────────────────────┐
│                        UI组件层                              │
│   页面组件 │ 业务组件 │ 基础组件 │ 图表组件               │
├─────────────────────────────────────────────────────────────┤
│                        状态管理层                            │
│  React Context │ useReducer │ 本地状态 │ 表单状态          │
├─────────────────────────────────────────────────────────────┤
│                        数据请求层                            │
│   React Query │ Axios │ 请求拦截 │ 错误处理              │
├─────────────────────────────────────────────────────────────┤
│                        路由导航层                            │
│  Next.js Router │ 动态路由 │ 路由守卫 │ 页面预加载        │
├─────────────────────────────────────────────────────────────┤
│                        样式主题层                            │
│  Tailwind CSS │ CSS Modules │ 主题变量 │ 响应式设计       │
├─────────────────────────────────────────────────────────────┤
│                        构建工具层                            │
│   Webpack 5 │ Babel │ TypeScript │ ESLint │ Prettier      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 组件架构设计

#### 页面级组件
- **DashboardPage**: 主仪表板页面
- **AnalysisPage**: 深度分析页面
- **SettingsPage**: 系统设置页面

#### 业务组件
- **KPICard**: KPI指标卡片
- **FilterPanel**: 筛选器面板
- **ChartContainer**: 图表容器
- **DataTable**: 数据表格
- **ExportPanel**: 导出功能面板

#### 基础组件
- **Button**: 按钮组件
- **Input**: 输入框组件
- **Select**: 下拉选择组件
- **Modal**: 模态框组件
- **Loading**: 加载状态组件

### 2.3 状态管理架构

```typescript
// 全局状态结构
interface GlobalState {
  // 用户状态
  user: {
    permissions: string[];
    preferences: UserPreferences;
  };
  
  // 应用状态
  app: {
    loading: boolean;
    error: string | null;
    theme: 'light' | 'dark';
  };
  
  // 数据状态
  data: {
    filters: FilterState;
    kpis: KPIData[];
    charts: ChartData[];
    cache: CacheState;
  };
  
  // 选择器状态
  selectors: {
    dimensions: DimensionSelectorState;
    metrics: MetricSelectorState;
    charts: ChartSelectorState;
  };
}
```

### 2.4 三大选择器组件技术实现

#### 2.4.1 维度选择器 (DimensionPicker)

**组件架构**:
```typescript
// 维度选择器状态接口
interface DimensionSelectorState {
  selectedDimensions: string[];  // 已选维度列表
  dimensionOrder: string[];      // 维度排序（影响分组优先级）
  cascadeSelections: Record<string, string[]>;  // 级联选择状态
  quickTemplates: DimensionTemplate[];  // 快捷模板
  recentCombinations: string[][];  // 最近使用的维度组合
}

// 维度选择器组件
class DimensionPicker extends React.Component {
  // 处理多选逻辑
  handleMultiSelect = (dimension: string) => {
    // 更新选中状态，支持排序
  };
  
  // 处理级联选择
  handleCascadeSelect = (parentDimension: string, childDimension: string) => {
    // chengdu_branch → third_level_organization 级联逻辑
  };
  
  // 应用快捷模板
  applyTemplate = (template: DimensionTemplate) => {
    // 应用预设的维度组合
  };
}
```

**核心特性实现**:
- **拖拽排序**: 使用 `react-beautiful-dnd` 实现维度排序
- **级联选择**: 基于数据字典实现 `chengdu_branch → third_level_organization` 联动
- **快捷模板**: 预设常用维度组合，支持一键应用
- **历史记录**: 本地存储最近使用的TOP5维度组合

#### 2.4.2 指标选择器 (MetricPicker)

**组件架构**:
```typescript
// 指标选择器状态接口
interface MetricSelectorState {
  selectedMetrics: string[];     // 已选指标
  metricConfigs: MetricConfig[]; // 指标配置（单位、精度等）
  derivedMetrics: DerivedMetric[]; // 衍生指标定义
  favoriteCollections: MetricCollection[]; // 收藏的指标集合
  comparisonSettings: ComparisonConfig; // 同比/环比设置
}

// 指标配置接口
interface MetricConfig {
  metricId: string;
  unit: 'yuan' | 'percent' | 'count' | 'ratio';
  precision: number;  // 小数位数
  showComparison: boolean;  // 是否显示同比/环比
  comparisonType: 'YoY' | 'WoW' | 'MoM';
}

// 指标选择器组件
class MetricPicker extends React.Component {
  // 处理指标选择
  handleMetricSelect = (metricId: string) => {
    // 更新选中状态，处理原子指标和衍生指标
  };
  
  // 配置指标显示
  configureMetric = (metricId: string, config: MetricConfig) => {
    // 设置单位、精度、同比环比等
  };
  
  // 管理收藏集合
  manageCollection = (collection: MetricCollection) => {
    // "经营三板斧" = [满期保费, 损失率, 综合成本率]
  };
}
```

**核心特性实现**:
- **动态单位转换**: 支持万元、百分比、次数等单位切换
- **精度控制**: 可配置小数位数，实时预览效果
- **同比环比**: 自动生成 Δ% 曲线，支持YoY/WoW/MoM切换
- **收藏集合**: 支持创建和管理常用指标组合

#### 2.4.3 多维度筛选系统 (MultiDimensionFilter)

**组件架构**:
```typescript
// 多维度筛选器状态接口
interface FilterState {
  activeFilters: Record<string, FilterValue[]>; // 当前激活的筛选条件
  availableDimensions: DimensionConfig[];       // 可用筛选维度
  filterHistory: FilterSnapshot[];             // 筛选历史记录
  quickFilters: QuickFilterTemplate[];         // 快捷筛选模板
}

// 筛选维度配置
interface DimensionConfig {
  key: string;           // 字段名
  label: string;         // 显示名称
  type: 'select' | 'multiSelect' | 'dateRange' | 'boolean';
  options?: FilterOption[]; // 可选值列表
  defaultValue?: any;    // 默认值
  dependencies?: string[]; // 依赖的其他维度
}

// 16个核心筛选维度定义
const FILTER_DIMENSIONS: DimensionConfig[] = [
  { key: 'week_number', label: '周序号', type: 'select' },
  { key: 'policy_start_year', label: '保单年度', type: 'select' },
  { key: 'business_type_category', label: '业务类型', type: 'multiSelect' },
  { key: 'chengdu_branch', label: '机构地域属性', type: 'select' },
  { key: 'third_level_organization', label: '三级机构', type: 'multiSelect' },
  { key: 'customer_category_3', label: '客户类别', type: 'multiSelect' },
  { key: 'insurance_type', label: '车险种类', type: 'multiSelect' },
  { key: 'is_new_energy_vehicle', label: '是否新能源车', type: 'boolean' },
  { key: 'coverage_type', label: '投保险别组合', type: 'multiSelect' },
  { key: 'is_transferred_vehicle', label: '是否过户车辆', type: 'boolean' },
  { key: 'renewal_status', label: '续保状态', type: 'multiSelect' },
  { key: 'vehicle_insurance_grade', label: '非营业客车风险评级', type: 'multiSelect' },
  { key: 'highway_risk_grade', label: '高速行驶风险评级', type: 'multiSelect' },
  { key: 'large_truck_score', label: '货车风险评级', type: 'multiSelect' },
  { key: 'small_truck_score', label: '小货车风险评级', type: 'multiSelect' },
  { key: 'terminal_source', label: '投保终端来源', type: 'multiSelect' }
];

// 多维度筛选器组件
class MultiDimensionFilter extends React.Component {
  // 应用筛选条件
  applyFilters = (filters: Record<string, FilterValue[]>) => {
    // 验证筛选条件的有效性
    // 更新全局状态
    // 触发数据重新加载
  };
  
  // 重置筛选条件
  resetFilters = () => {
    // 恢复到默认筛选状态
  };
  
  // 保存快捷筛选模板
  saveQuickFilter = (name: string, filters: Record<string, FilterValue[]>) => {
    // 保存常用筛选组合为模板
  };
}
```

**核心特性实现**:
- **弹窗交互**: 点击"筛选器"按钮触发模态框，支持多维度同时筛选
- **级联筛选**: 支持维度间的依赖关系，如选择机构后自动更新下级选项
- **快捷模板**: 预设常用筛选组合，如"成都本部+商业险+本周"等
- **筛选历史**: 记录最近使用的筛选条件，支持快速回退
- **数据验证**: 确保筛选条件的有效性，防止无效查询

#### 2.4.4 图表类型选择器 (ChartPicker)

**组件架构**:
```typescript
// 图表选择器状态接口
interface ChartSelectorState {
  selectedChartType: ChartType;
  fieldMappings: FieldMapping;   // 字段映射关系
  chartPreferences: ChartPreferences; // 图表偏好设置
  availableCharts: ChartOption[]; // 可用图表类型
}

// 字段映射接口
interface FieldMapping {
  x: string;      // X轴字段
  y: string[];    // Y轴字段（支持多个）
  color?: string; // 颜色字段
  size?: string;  // 大小字段（气泡图）
  facet?: string; // 分面字段
}

// 图表选择器组件
class ChartPicker extends React.Component {
  // 智能推荐图表类型
  recommendChartType = (dimensions: string[], metrics: string[]) => {
    // 基于维度和指标特征推荐合适的图表类型
    // 时间维度 → 折线图/面积图
    // 分类维度 → 点图/热力图
    // 层级数据 → 矩形树图
  };
  
  // 处理图表类型切换
  handleChartTypeChange = (newType: ChartType) => {
    // 切换图表类型，保持字段映射关系
  };
  
  // 配置字段映射
  configureFieldMapping = (mapping: FieldMapping) => {
    // 设置X/Y/Color/Size字段映射
  };
}
```

**核心特性实现**:
- **智能推荐**: 基于数据特征自动推荐最适合的图表类型
- **字段映射保持**: 切换图表类型时尽量保持已配置的字段映射
- **偏好记忆**: 记住用户的图表类型偏好，优先推荐
- **实时预览**: 提供图表类型的缩略图预览

#### 2.4.5 核心指标看板系统 (KPIDashboard)

**组件架构**:
```typescript
// KPI看板状态接口
interface KPIDashboardState {
  kpiData: KPIMetric[];           // 16个核心KPI数据
  currentWeek: number;            // 当前选择的周
  previousWeek: number;           // 对比周（前一周）
  gridLayout: GridLayout;         // 4x4网格布局配置
  loadingStates: Record<string, boolean>; // 各指标加载状态
}

// KPI指标数据结构
interface KPIMetric {
  id: string;                     // 指标ID
  name: string;                   // 指标名称
  currentValue: number;           // 当前值
  previousValue: number;          // 对比值（前一周）
  unit: string;                   // 单位
  precision: number;              // 小数位数
  changeAbsolute: number;         // 绝对变化值
  changePercentage: number;       // 百分比变化
  trend: 'up' | 'down' | 'stable'; // 趋势方向
  status: 'good' | 'warning' | 'danger'; // 状态评级
}

// 16个核心KPI指标定义
const CORE_KPI_METRICS: KPIMetricConfig[] = [
  { id: 'margin_contribution_rate', name: '边际贡献率', unit: '%', precision: 2, position: [0, 0] },
  { id: 'follow_up_premium', name: '跟单保费', unit: '万元', precision: 2, position: [0, 1] },
  { id: 'premium_time_progress_rate', name: '保费时间进度达成率', unit: '%', precision: 2, position: [0, 2] },
  { id: 'variable_cost_rate', name: '变动成本率', unit: '%', precision: 2, position: [0, 3] },
  { id: 'margin_contribution_amount', name: '边贡额', unit: '万元', precision: 2, position: [1, 0] },
  { id: 'matured_premium', name: '满期保费', unit: '万元', precision: 2, position: [1, 1] },
  { id: 'total_claims', name: '总赔款', unit: '万元', precision: 2, position: [1, 2] },
  { id: 'expense_amount', name: '费用额', unit: '万元', precision: 2, position: [1, 3] },
  { id: 'premium_maturity_rate', name: '保费满期率', unit: '%', precision: 2, position: [2, 0] },
  { id: 'policy_count', name: '保单件数', unit: '件', precision: 0, position: [2, 1] },
  { id: 'matured_loss_ratio', name: '满期赔付率', unit: '%', precision: 2, position: [2, 2] },
  { id: 'expense_ratio', name: '费用率', unit: '%', precision: 2, position: [2, 3] },
  { id: 'average_premium', name: '单均保费', unit: '元', precision: 2, position: [3, 0] },
  { id: 'reported_claims_count', name: '已报件数', unit: '件', precision: 0, position: [3, 1] },
  { id: 'average_claim_amount', name: '案均赔款', unit: '元', precision: 2, position: [3, 2] },
  { id: 'matured_claim_frequency', name: '满期出险率', unit: '%', precision: 2, position: [3, 3] }
];

// KPI看板组件
class KPIDashboard extends React.Component {
  // 加载KPI数据
  loadKPIData = async (week: number, filters: FilterState) => {
    // 基于筛选条件和选定周加载16个KPI指标数据
    // 同时加载前一周数据用于对比
  };
  
  // 计算周环比
  calculateWeekOverWeek = (current: number, previous: number) => {
    const changeAbsolute = current - previous;
    const changePercentage = previous !== 0 ? (changeAbsolute / previous) * 100 : 0;
    return { changeAbsolute, changePercentage };
  };
  
  // 渲染KPI卡片
  renderKPICard = (metric: KPIMetric) => {
    // 渲染单个KPI指标卡片
    // 包含指标名称、当前值、变化值和百分比
  };
  
  // 处理指标点击事件
  handleKPIClick = (metricId: string) => {
    // 点击KPI卡片时的交互逻辑
    // 可能触发详细分析或钻取
  };
}
```

**核心特性实现**:
- **4x4网格布局**: 固定16个KPI指标的网格位置，确保布局一致性
- **周环比对比**: 自动计算当前周与前一周的差异，显示绝对值和百分比变化
- **实时数据更新**: 基于筛选条件变化实时重新计算KPI数据
- **状态指示**: 通过颜色和图标显示指标的趋势和健康状态
- **精度控制**: 根据指标类型自动设置合适的小数位数
- **单位转换**: 支持万元、百分比、件数等不同单位的显示

#### 2.4.6 选择器间协调机制

**状态同步**:
```typescript
// 选择器协调器
class SelectorCoordinator {
  // 维度变更时更新可用指标
  onDimensionChange = (dimensions: string[]) => {
    const availableMetrics = this.getCompatibleMetrics(dimensions);
    this.updateMetricSelector(availableMetrics);
  };
  
  // 指标变更时推荐图表类型
  onMetricChange = (metrics: string[]) => {
    const recommendedCharts = this.recommendCharts(this.currentDimensions, metrics);
    this.updateChartSelector(recommendedCharts);
  };
  
  // 图表类型变更时验证字段映射
  onChartTypeChange = (chartType: ChartType) => {
    const validMappings = this.validateFieldMappings(chartType);
    this.updateFieldMappings(validMappings);
  };
}
```

**性能优化**:
- **防抖处理**: 用户快速操作时避免频繁重新计算
- **增量更新**: 只更新变化的部分，避免全量重渲染
- **虚拟滚动**: 大量选项时使用虚拟滚动提升性能
- **预加载**: 预加载常用的维度和指标组合

#### 2.4.7 AI智能洞察系统 (AIInsightEngine)

**组件架构**:
```typescript
// AI洞察引擎状态接口
interface AIInsightState {
  analysisResults: InsightReport[];     // 分析报告列表
  currentAnalysis: InsightReport | null; // 当前分析结果
  analysisHistory: InsightReport[];     // 历史分析记录
  isAnalyzing: boolean;                 // 分析进行状态
  analysisProgress: number;             // 分析进度
}

// 洞察报告数据结构
interface InsightReport {
  id: string;                          // 报告ID
  timestamp: Date;                     // 生成时间
  analysisType: 'cost_trend';          // 分析类型
  inputData: KPIMetric[];              // 输入的KPI数据
  filterContext: FilterState;          // 筛选上下文
  insights: {
    trendAnalysis: string;             // 趋势分析段落
    anomalyDetection: string;          // 异常识别段落
    businessRecommendations: string;   // 业务洞察段落
  };
  confidence: number;                  // 分析置信度
  dataQuality: 'high' | 'medium' | 'low'; // 数据质量评估
}

// AI分析引擎配置
interface AIAnalysisConfig {
  analysisPrompt: string;              // 分析提示词模板
  contextWindow: number;               // 上下文窗口大小
  temperature: number;                 // 生成温度参数
  maxTokens: number;                   // 最大token数
  retryAttempts: number;               // 重试次数
}

// AI智能洞察组件
class AIInsightEngine extends React.Component {
  // 触发成本趋势分析
  analyzeCostTrend = async (kpiData: KPIMetric[], filterContext: FilterState) => {
    this.setState({ isAnalyzing: true, analysisProgress: 0 });
    
    try {
      // 1. 数据预处理和特征提取
      const features = this.extractFeatures(kpiData);
      this.setState({ analysisProgress: 30 });
      
      // 2. 构建分析上下文
      const analysisContext = this.buildAnalysisContext(features, filterContext);
      this.setState({ analysisProgress: 50 });
      
      // 3. 调用AI分析服务
      const insights = await this.callAIAnalysisService(analysisContext);
      this.setState({ analysisProgress: 80 });
      
      // 4. 生成结构化报告
      const report = this.generateInsightReport(insights, kpiData, filterContext);
      this.setState({ analysisProgress: 100 });
      
      // 5. 更新状态和历史记录
      this.updateAnalysisResults(report);
      
    } catch (error) {
      this.handleAnalysisError(error);
    } finally {
      this.setState({ isAnalyzing: false });
    }
  };
  
  // 提取数据特征
  extractFeatures = (kpiData: KPIMetric[]) => {
    return {
      // 成本相关指标
      costMetrics: kpiData.filter(m => ['variable_cost_rate', 'expense_ratio', 'total_claims'].includes(m.id)),
      // 收入相关指标
      revenueMetrics: kpiData.filter(m => ['follow_up_premium', 'matured_premium'].includes(m.id)),
      // 效率相关指标
      efficiencyMetrics: kpiData.filter(m => ['margin_contribution_rate', 'premium_time_progress_rate'].includes(m.id)),
      // 变化趋势
      trends: kpiData.map(m => ({ id: m.id, change: m.changePercentage, trend: m.trend })),
      // 异常指标
      anomalies: kpiData.filter(m => Math.abs(m.changePercentage) > 10)
    };
  };
  
  // 构建分析上下文
  buildAnalysisContext = (features: any, filterContext: FilterState) => {
    return {
      timeContext: `分析周期：第${filterContext.week_number}周`,
      businessContext: this.getBusinessContext(filterContext),
      dataFeatures: features,
      analysisGoal: '识别成本变化趋势，发现异常点，提供业务优化建议'
    };
  };
  
  // 调用AI分析服务
  callAIAnalysisService = async (context: any) => {
    const prompt = this.buildAnalysisPrompt(context);
    
    const response = await fetch('/api/v1/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        config: this.getAIConfig()
      })
    });
    
    return await response.json();
  };
  
  // 构建分析提示词
  buildAnalysisPrompt = (context: any) => {
    return `
作为车险业务分析专家，请基于以下KPI数据进行深度分析：

${JSON.stringify(context, null, 2)}

请按以下结构生成分析报告：

1. 趋势分析（150-200字）：
   - 解读核心成本指标的变化趋势
   - 分析变化背后的可能原因
   - 识别关键驱动因素

2. 异常识别（100-150字）：
   - 识别数据中的显著异常点
   - 分析异常的可能原因
   - 评估异常的业务影响

3. 业务洞察（150-200字）：
   - 提供2-3个具体、可执行的优化建议
   - 建议应基于数据洞察且具有实操性
   - 预估建议实施后的预期效果

要求：
- 使用专业但易懂的中文表达
- 结合车险行业特点和业务逻辑
- 避免过于技术化的术语
- 确保建议的可操作性
    `;
  };
  
  // 生成洞察报告
  generateInsightReport = (insights: any, kpiData: KPIMetric[], filterContext: FilterState): InsightReport => {
    return {
      id: `insight_${Date.now()}`,
      timestamp: new Date(),
      analysisType: 'cost_trend',
      inputData: kpiData,
      filterContext,
      insights: {
        trendAnalysis: insights.trendAnalysis,
        anomalyDetection: insights.anomalyDetection,
        businessRecommendations: insights.businessRecommendations
      },
      confidence: insights.confidence || 0.85,
      dataQuality: this.assessDataQuality(kpiData)
    };
  };
  
  // 评估数据质量
  assessDataQuality = (kpiData: KPIMetric[]) => {
    const completeness = kpiData.filter(m => m.currentValue !== null).length / kpiData.length;
    const consistency = kpiData.filter(m => !isNaN(m.changePercentage)).length / kpiData.length;
    
    if (completeness > 0.9 && consistency > 0.9) return 'high';
    if (completeness > 0.7 && consistency > 0.7) return 'medium';
    return 'low';
  };
}
```

**核心特性实现**:
- **三段式分析**: 自动生成趋势分析、异常识别、业务洞察三个维度的报告
- **上下文感知**: 基于当前筛选条件和KPI数据提供针对性分析
- **进度反馈**: 实时显示AI分析进度，提升用户体验
- **历史记录**: 保存分析历史，支持对比和回顾
- **数据质量评估**: 自动评估输入数据质量，影响分析置信度
- **错误处理**: 完善的错误处理和重试机制

#### 2.4.8 数据导入系统 (DataImportSystem)

**组件架构**:
```typescript
// 数据导入状态接口
interface DataImportState {
  uploadProgress: number;              // 上传进度
  validationResults: ValidationResult[]; // 验证结果
  importHistory: ImportRecord[];       // 导入历史
  isUploading: boolean;               // 上传状态
  isValidating: boolean;              // 验证状态
  currentFile: File | null;           // 当前文件
}

// 导入记录数据结构
interface ImportRecord {
  id: string;                         // 导入ID
  timestamp: Date;                    // 导入时间
  fileName: string;                   // 文件名
  filePath: string;                   // 存储路径
  policyYear: number;                 // 起保年度
  weekNumber: number;                 // 周序号
  recordCount: number;                // 记录数量
  status: 'success' | 'failed' | 'partial'; // 导入状态
  validationErrors: ValidationError[]; // 验证错误
  processingTime: number;             // 处理时间(ms)
}

// 文件验证结果
interface ValidationResult {
  isValid: boolean;                   // 是否有效
  errors: ValidationError[];          // 错误列表
  warnings: ValidationWarning[];      // 警告列表
  summary: {
    totalRows: number;                // 总行数
    validRows: number;                // 有效行数
    errorRows: number;                // 错误行数
    duplicateRows: number;            // 重复行数
  };
}

// 数据导入组件
class DataImportSystem extends React.Component {
  // 处理文件上传
  handleFileUpload = async (file: File, policyYear: number, weekNumber: number) => {
    this.setState({ isUploading: true, uploadProgress: 0 });
    
    try {
      // 1. 文件基础验证
      this.validateFileBasics(file);
      this.setState({ uploadProgress: 10 });
      
      // 2. 上传文件到临时目录
      const tempPath = await this.uploadToTemp(file);
      this.setState({ uploadProgress: 30 });
      
      // 3. 数据格式验证
      const validationResult = await this.validateFileContent(tempPath);
      this.setState({ uploadProgress: 60, isValidating: true });
      
      // 4. 如果验证通过，移动到正式目录
      if (validationResult.isValid) {
        const finalPath = this.generateFinalPath(policyYear, weekNumber);
        await this.moveToFinalLocation(tempPath, finalPath);
        this.setState({ uploadProgress: 90 });
        
        // 5. 更新数据索引
        await this.updateDataIndex(finalPath, policyYear, weekNumber);
        this.setState({ uploadProgress: 100 });
        
        // 6. 记录导入历史
        this.recordImportHistory(file, finalPath, policyYear, weekNumber, validationResult);
        
      } else {
        // 验证失败，清理临时文件
        await this.cleanupTempFile(tempPath);
        throw new Error('文件验证失败');
      }
      
    } catch (error) {
      this.handleImportError(error);
    } finally {
      this.setState({ isUploading: false, isValidating: false });
    }
  };
  
  // 生成最终存储路径
  generateFinalPath = (policyYear: number, weekNumber: number) => {
    return `data/${policyYear}年保单/${policyYear}年保单截至${weekNumber}周数据.csv`;
  };
  
  // 验证文件基础信息
  validateFileBasics = (file: File) => {
    // 检查文件类型
    if (!file.name.endsWith('.csv')) {
      throw new Error('只支持CSV格式文件');
    }
    
    // 检查文件大小（限制100MB）
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('文件大小不能超过100MB');
    }
  };
  
  // 验证文件内容
  validateFileContent = async (filePath: string): Promise<ValidationResult> => {
    const response = await fetch('/api/v1/data/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath })
    });
    
    return await response.json();
  };
  
  // 上传到临时目录
  uploadToTemp = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/v1/data/upload-temp', {
      method: 'POST',
      body: formData,
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        this.setState({ uploadProgress: Math.min(progress * 0.3, 30) });
      }
    });
    
    const result = await response.json();
    return result.tempPath;
  };
  
  // 移动到最终位置
  moveToFinalLocation = async (tempPath: string, finalPath: string) => {
    await fetch('/api/v1/data/move-final', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempPath, finalPath })
    });
  };
  
  // 更新数据索引
  updateDataIndex = async (filePath: string, policyYear: number, weekNumber: number) => {
    await fetch('/api/v1/data/update-index', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, policyYear, weekNumber })
    });
  };
  
  // 记录导入历史
  recordImportHistory = (file: File, filePath: string, policyYear: number, weekNumber: number, validation: ValidationResult) => {
    const record: ImportRecord = {
      id: `import_${Date.now()}`,
      timestamp: new Date(),
      fileName: file.name,
      filePath,
      policyYear,
      weekNumber,
      recordCount: validation.summary.validRows,
      status: validation.isValid ? 'success' : 'partial',
      validationErrors: validation.errors,
      processingTime: Date.now() - this.importStartTime
    };
    
    this.setState(prevState => ({
      importHistory: [record, ...prevState.importHistory.slice(0, 9)] // 保留最近10条记录
    }));
  };
  
  // 获取导入历史
  getImportHistory = () => {
    return this.state.importHistory;
  };
  
  // 重新导入
  retryImport = async (record: ImportRecord) => {
    // 基于历史记录重新尝试导入
  };
}
```

**核心特性实现**:
- **弹窗交互**: 点击"导入数据"按钮触发上传对话框，指定年度和周次
- **文件验证**: 多层次验证包括格式、大小、内容结构和数据质量
- **进度反馈**: 实时显示上传、验证、处理各阶段进度
- **路径规范**: 严格按照`/{年份}年保单/{年份}年保单截至{周次}周数据.csv`格式存储
- **错误处理**: 详细的错误信息和恢复建议
- **历史记录**: 保存导入历史，支持重新导入和问题追溯
- **数据索引**: 自动更新数据索引，确保新数据立即可用

## 3. 后端架构设计

### 3.1 服务架构

```
┌─────────────────────────────────────────────────────────────┐
│                        API路由层                             │
│   /api/v1/aggregate │ /api/v1/kpi │ /api/v1/export         │
├─────────────────────────────────────────────────────────────┤
│                        中间件层                              │
│  认证中间件 │ 日志中间件 │ 错误处理 │ 请求限流             │
├─────────────────────────────────────────────────────────────┤
│                        业务服务层                            │
│  聚合服务 │ KPI计算服务 │ 导出服务 │ 缓存服务             │
├─────────────────────────────────────────────────────────────┤
│                        数据访问层                            │
│  CSV读取器 │ 数据解析器 │ 数据验证器 │ 缓存管理器         │
├─────────────────────────────────────────────────────────────┤
│                        工具层                                │
│  日志工具 │ 配置管理 │ 错误处理 │ 性能监控               │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 数据处理架构

#### 数据加载策略
```typescript
// 数据加载管理器
class DataLoader {
  private cache: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  
  // 按需加载数据
  async loadData(timeRange: TimeRange): Promise<RawData[]> {
    const cacheKey = this.getCacheKey(timeRange);
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 检查是否正在加载
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }
    
    // 开始加载
    const loadPromise = this.doLoadData(timeRange);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const data = await loadPromise;
      this.cache.set(cacheKey, data);
      return data;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }
}
```

#### 聚合计算引擎
```typescript
// 聚合计算引擎
class AggregationEngine {
  // 多维度聚合
  aggregate(
    data: RawData[],
    dimensions: string[],
    metrics: string[]
  ): AggregatedData[] {
    // 1. 数据分组
    const groups = this.groupByDimensions(data, dimensions);
    
    // 2. 指标计算
    return groups.map(group => {
      const result: any = {};
      
      // 复制维度值
      dimensions.forEach(dim => {
        result[dim] = group.key[dim];
      });
      
      // 计算指标
      metrics.forEach(metric => {
        result[metric] = this.calculateMetric(group.records, metric);
      });
      
      return result;
    });
  }
}
```

## 4. 数据存储架构

### 4.1 文件组织结构

```
data/
├── raw/                    # 原始CSV数据
│   ├── 2023/
│   │   ├── week_01.csv
│   │   ├── week_02.csv
│   │   └── ...
│   └── 2024/
│       ├── week_01.csv
│       └── ...
├── processed/              # 预处理数据
│   ├── aggregated/
│   │   ├── monthly_summary.json
│   │   └── weekly_kpis.json
│   └── cache/
│       ├── filter_cache.json
│       └── dimension_cache.json
└── config/                 # 配置文件
    ├── field_mapping.json
    └── calculation_rules.json
```

### 4.2 缓存策略

#### 多层缓存架构
```typescript
// 缓存管理器
class CacheManager {
  private memoryCache: Map<string, any> = new Map();
  private diskCache: DiskCache;
  private maxMemorySize: number = 100 * 1024 * 1024; // 100MB
  
  // L1缓存：内存缓存（最快）
  getFromMemory(key: string): any {
    return this.memoryCache.get(key);
  }
  
  // L2缓存：磁盘缓存（中等速度）
  async getFromDisk(key: string): Promise<any> {
    return this.diskCache.get(key);
  }
  
  // L3缓存：重新计算（最慢）
  async computeAndCache(key: string, computeFn: () => any): Promise<any> {
    const result = await computeFn();
    
    // 写入多层缓存
    this.memoryCache.set(key, result);
    await this.diskCache.set(key, result);
    
    return result;
  }
}
```

## 5. 性能优化架构

### 5.1 前端性能优化

#### 代码分割策略
```typescript
// 路由级代码分割
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));

// 组件级代码分割
const HeavyChart = lazy(() => import('./components/HeavyChart'));

// 条件加载
const AdminPanel = lazy(() => 
  import('./components/AdminPanel').then(module => ({
    default: module.AdminPanel
  }))
);
```

#### 虚拟滚动实现
```typescript
// 大数据表格虚拟滚动
class VirtualTable {
  private visibleRange: { start: number; end: number };
  private itemHeight: number = 40;
  private containerHeight: number;
  
  calculateVisibleItems(scrollTop: number): void {
    const start = Math.floor(scrollTop / this.itemHeight);
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    const end = Math.min(start + visibleCount + 5, this.totalItems); // 5个缓冲项
    
    this.visibleRange = { start, end };
  }
}
```

### 5.2 后端性能优化

#### 数据预聚合
```typescript
// 预聚合任务调度器
class PreAggregationScheduler {
  private tasks: PreAggregationTask[] = [];
  
  // 注册预聚合任务
  registerTask(task: PreAggregationTask): void {
    this.tasks.push(task);
  }
  
  // 执行预聚合
  async runPreAggregation(): Promise<void> {
    for (const task of this.tasks) {
      try {
        const result = await task.execute();
        await this.savePreAggregatedData(task.key, result);
        console.log(`预聚合完成: ${task.name}`);
      } catch (error) {
        console.error(`预聚合失败: ${task.name}`, error);
      }
    }
  }
}
```

## 6. 安全架构

### 6.1 数据安全
- **访问控制**: 基于角色的权限管理
- **数据脱敏**: 敏感数据展示脱敏处理
- **审计日志**: 完整的操作日志记录
- **数据备份**: 定期数据备份和恢复机制

### 6.2 应用安全
- **输入验证**: 严格的输入参数验证
- **XSS防护**: 输出内容转义和CSP策略
- **CSRF防护**: Token验证机制
- **请求限流**: API请求频率限制

## 7. 监控架构

### 7.1 性能监控
```typescript
// 性能监控器
class PerformanceMonitor {
  // 记录API响应时间
  recordAPILatency(endpoint: string, duration: number): void {
    const metric = {
      timestamp: Date.now(),
      endpoint,
      duration,
      type: 'api_latency'
    };
    
    this.sendMetric(metric);
  }
  
  // 记录内存使用
  recordMemoryUsage(): void {
    const usage = process.memoryUsage();
    const metric = {
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      type: 'memory_usage'
    };
    
    this.sendMetric(metric);
  }
}
```

### 7.2 业务监控
- **用户行为**: 页面访问、功能使用统计
- **数据质量**: 数据完整性、准确性监控
- **系统健康**: 服务可用性、错误率监控
- **性能指标**: 响应时间、吞吐量监控

---

**文档版本**: v1.0  
**最后更新**: 2025-01-16  
**维护人员**: 技术团队