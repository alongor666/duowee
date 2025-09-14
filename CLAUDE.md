# CLAUDE.md

车险变动成本明细分析系统 · 仓库指南

## AI代理指令与全局设定

本文件用于为AI代理提供项目相关的全局设定和特定指令。请将所有与AI开发直接相关的配置、要求和偏好在此处进行维护。

### AI代理角色与职责
- 作为世界顶级的架构师和编程专家，提供高质量的代码和架构设计，确保系统性能和可扩展性。
- 作为世界顶级的麦肯锡专家，提供专业的业务分析和战略建议，优化车险成本管理流程。
- 作为世界顶级的车险经营大师和精算师，确保业务逻辑的准确性和专业性，符合行业规范。
- 作为Supabase专家，善于描述和理解数据结构，确保数据库设计合理高效。
- 专注于构建智能化车险变动成本明细分析平台，实现数据驱动的精准决策支持。

### AI开发通用规则
- 生成代码时必须添加详细的中文函数级注释，说明功能、参数和返回值。
- 所有交互和文档必须使用中文，确保沟通无歧义。
- 将PRD和README视为活文档，随功能迭代及时更新内容，保持文档与系统同步。
- 涉及操作步骤时，必须提供清晰、完整且符合最佳实践的详细说明，确保可执行性。

## 项目概述

基于Next.js的智能化车险变动成本分析平台，通过AI驱动的数据洞察实现精准成本控制。

**核心目标**:
- 成本核算自动化：统一数据标准，实现变动成本自动精准核算
- 风险智能预警：实时监控关键指标，提前识别高风险业务单元
- 决策支持可视化：多维度交互式分析仪表盘，提供直观决策依据

**北极星指标**: 一次分析路径全流程完成时间 ≤ 30秒

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **图表**: Recharts
- **状态管理**: React Context API + useReducer
- **数据处理**: DataProcessor + DataMapper + CSV解析
- **API层**: 统一dataService服务层

## 开发命令

```bash
# 初始化项目
npx create-next-app@latest . --typescript --tailwind --eslint --app

# 开发
npm run dev

# 构建
npm run build

# 生产
npm run start
```

## 核心架构

### 四层架构设计
1. **数据层**: CSV处理、数据验证、类型转换
2. **业务逻辑层**: 指标计算引擎、数据聚合、筛选逻辑
3. **交互层**: 三大选择器系统、图表画布、联动刷选
4. **智能服务层**: AI分析引擎、智能洞察、预警系统

### 目录结构
```
src/
├── components/          # React组件
│   ├── dashboard/      # 仪表板组件
│   │   ├── KPIGrid.tsx # 4x4指标网格
│   │   └── AIInsights.tsx # AI洞察面板
│   ├── selectors/      # 选择器组件
│   │   ├── DimensionSelector.tsx # 维度选择器
│   │   ├── MetricSelector.tsx    # 指标选择器
│   │   └── ChartSelector.tsx     # 图表选择器
│   ├── charts/         # 图表组件
│   │   └── ChartCanvas.tsx # 图表画布
│   └── common/         # 通用组件
│       ├── DataLoader.tsx # 数据加载
│       └── MetricCard.tsx # 指标卡片
├── services/           # 业务逻辑
│   ├── dataProcessor.ts # 数据处理
│   ├── metricCalculator.ts # 指标计算
│   ├── aiAnalyzer.ts   # AI分析引擎
│   └── csvParser.ts    # CSV解析
├── types/              # TypeScript类型定义
│   ├── insurance.ts    # 保险业务类型
│   └── metrics.ts      # 指标类型定义
└── utils/              # 工具函数
    ├── calculations.ts # 计算工具
    └── formatters.ts   # 格式化工具
```

## 核心功能模块

### 16个核心指标体系
严格按照 [指标计算逻辑](./指标逻辑/字段对照表.md) 中定义的指标体系：

**保费类指标 (4个)**:
1. **跟单保费(万元)** = Σ(documented_premium_in_10k)
2. **满期净保费(万元)** = Σ(expired_net_premium_in_10k)
3. **单均保费(元)** = (Σ(documented_premium_in_10k) × 10000) ÷ Σ(policy_count)
4. **商业险折前保费(万元)** = Σ(documented_premium_in_10k ÷ commercial_auto_underwriting_factor) [仅商业险]

**赔款类指标 (4个)**:
5. **总赔款(万元)** = Σ(total_claim_payment_in_10k)
6. **案均赔款(元)** = (Σ(total_claim_payment_in_10k) × 10000) ÷ Σ(case_count)
7. **赔案件数(件)** = (total_claim_payment_in_10k × 10000) ÷ average_claim_payment
8. **满期出险率** = (Σ(case_count) ÷ Σ(policy_count)) × (Σ(expired_net_premium_in_10k) ÷ Σ(documented_premium_in_10k))

**成本类指标 (4个)**:
9. **费用金额(万元)** = documented_premium_in_10k × expense_ratio
10. **边际贡献额(万元)** = Σ(expired_net_premium_in_10k) × marginal_contribution_ratio
11. **保费计划(万元)** = Σ(premium_plan) [人工录入/外部导入]
12. **费用率** = Σ(row_expense_amount_in_10k) ÷ Σ(documented_premium_in_10k)

**效率类指标 (4个)**:
13. **满期赔付率** = Σ(total_claim_payment_in_10k) ÷ Σ(expired_net_premium_in_10k)
14. **变动成本率** = (Σ(row_expense_amount_in_10k) ÷ Σ(documented_premium_in_10k)) + (Σ(total_claim_payment_in_10k) ÷ Σ(expired_net_premium_in_10k))
15. **边际贡献率** = (1 - variable_cost_ratio)
16. **保费计划达成率** = Σ(documented_premium_in_10k) ÷ Σ(premium_plan)

### 三大选择器系统

#### 维度选择器
- **时间维度**: snapshot_date、week_number、policy_start_year
- **组织维度**: chengdu_branch、third_level_organization
- **业务维度**: business_type_category、customer_category_3、insurance_type
- **其他维度**: coverage_type、renewal_status、terminal_source等

#### 指标选择器
- **原子指标**: documented_premium_in_10k、expired_net_premium_in_10k等
- **衍生指标**: combined_ratio、claim_intensity等
- **功能**: 单位调整、同比环比开关、指标收藏集

#### 图表选择器
- **推荐类型**: 折线图、面积图、点图、热力图、箱线图
- **交互**: 字段映射、联动刷选、智能标注

## 核心业务逻辑

### 计算规则
- **先聚合后计算**: 所有比率指标基于聚合后绝对值重新计算
- **口径统一**: 严格按照字段对照表中的口径共识执行计算
  - 满期出险率统一口径：(赔案件数 ÷ 保单件数) × (满期净保费 ÷ 跟单保费)
  - 变动成本率统一口径：(费用金额 ÷ 跟单保费) + (总赔款 ÷ 满期净保费)
  - 商业险自主定价系数仅适用于insurance_type = '商业险'，保费加权计算，保留4位小数
- **满期赔付率**: 总赔款求和 ÷ 满期净保费求和
- **边际贡献率**: (边际贡献额 ÷ 满期净保费) × 100

### 统一精度要求

严格遵循 [指标计算逻辑](./指标逻辑/字段对照表.md) 中的精度规范：

- **绝对值类**（保费、赔款、费用、边际贡献额）：numeric(18,4)，展示取整，单位万元或元
- **率/比率类**（满期出险率、满期赔付率、费用率、变动成本率、边际贡献率、保费计划达成率）：numeric(10,6)，存库为小数，展示保留1位小数
- **件数类**（policy_count, case_count）：bigint，展示为整数
- **系数类**（commercial_auto_underwriting_factor）：numeric(12,6)，展示保留4位小数

### 异常值处理规则

- 分母为0时返回NULL或0
- 结果超出合理区间（如成本率>100%或贡献率<0）需提示校验

### AI智能分析

**异常检测机制**:
- 满期赔付率 > 100% 或 < 0% 时标记异常
- 费用率 > 50% 或 < 0% 时标记异常
- 变动成本率 > 150% 或 < 0% 时标记异常
- 边际贡献率 < -50% 或 > 100% 时标记异常
- 分母为0的指标自动返回NULL并提示数据缺失

**三段式分析报告**:
1. **趋势分析**: 解读核心成本指标变化趋势及原因
2. **异常识别**: 识别显著异常点并分析可能原因
3. **业务洞察**: 提供2-3个具体可执行的优化建议

## 开发要求

### 代码规范
- 中文注释，完整TypeScript类型定义
- 遵循Next.js最佳实践，纯函数组件
- 使用Tailwind CSS样式开发

### 数据处理
- CSV文件直接处理，无数据库依赖
- 严格按照 [指标计算逻辑](./指标逻辑/字段对照表.md) 执行
- 口径统一：严格按照字段对照表中的口径共识执行计算
- 异常值处理：分母为0时返回NULL或0，结果超出合理区间需提示校验

### 性能标准
- 单文件加载 < 5秒
- KPI计算 < 1秒
- 页面首次渲染 < 3秒

## 重要文档

- **产品需求**: `./prd.md` - 完整功能规范和验收标准
- **指标逻辑**: `./指标逻辑/字段对照表.md` - 16个核心指标计算逻辑
- **技术文档**: `./docs/` - 架构设计、实施计划、风险管理
- **项目说明**: `./README.md` - 项目整体介绍

## MVP开发重点

### Phase 1: 核心功能（2周内完成）
1. **数据加载模块**: CSV文件读取、类型转换、数据验证
2. **指标计算引擎**: 16个核心指标计算逻辑实现
3. **核心指标看板**: 4x4网格布局，三大选择器系统
4. **AI智能洞察**: 三段式分析报告，异常检测
5. **数据验证**: 与现有计算验证报告对比确保准确性

### 交付标准
- **代码**: 完整源代码，中文注释，单元测试
- **文档**: 开发说明，API文档，部署指南
- **验证**: 计算结果对比，性能测试，功能演示