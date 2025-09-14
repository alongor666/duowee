# 车险变动成本明细分析系统 - 术语表

> **主文档**: [PRD产品需求文档](../../prd.md) - 🎯 **核心入口**  
> **文档索引**: [完整文档导航](../index.md)  
> **本文档在主PRD中的位置**: [参考资料 > 术语表](../../prd.md#📖-参考资料)

## 业务术语

### 保险业务基础术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **跟单保费** | Documented Premium | 保险公司实际收取的保费收入，以万元为单位 | 核心收入指标 |
| **满期净保费** | Expired Net Premium | 扣除退保等因素后的实际有效保费 | 用于计算赔付率 |
| **变动成本** | Variable Cost | 随业务量变化的成本，包括赔款和费用 | 成本控制关键指标 |
| **边际贡献** | Marginal Contribution | 保费收入减去变动成本后的贡献额 | 盈利能力指标 |
| **满期出险率** | Claim Frequency | 保单期间内发生理赔的概率 | 风险评估指标 |
| **满期赔付率** | Loss Ratio | 赔款支出与保费收入的比率 | 核心风险指标 |
| **费用率** | Expense Ratio | 费用支出与保费收入的比率 | 成本控制指标 |
| **案均赔款** | Average Claim Amount | 每个理赔案件的平均赔付金额 | 理赔管理指标 |
| **单均保费** | Average Premium per Policy | 每张保单的平均保费金额 | 定价参考指标 |

### 车险专业术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **商业险** | Commercial Auto Insurance | 车辆商业保险，包括车损险、三者险等 | 主要险种 |
| **交强险** | Compulsory Traffic Insurance | 机动车交通事故责任强制保险 | 法定强制险种 |
| **自主定价系数** | Underwriting Factor | 保险公司根据风险评估确定的定价调整系数 | 定价工具 |
| **折前保费** | Original Premium | 未经自主定价系数调整的基础保费 | 定价基准 |
| **新能源车** | New Energy Vehicle | 电动车、混合动力车等新能源汽车 | 特殊车型分类 |
| **过户车辆** | Transferred Vehicle | 发生所有权转移的车辆 | 风险因子 |
| **续保状态** | Renewal Status | 保单的续保、转保、新保状态 | 客户分类维度 |

### 组织架构术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **三级机构** | Third Level Organization | 保险公司的三级组织架构单位 | 管理层级 |
| **成都分公司** | Chengdu Branch | 四川省成都市分公司 | 地域管理单位 |
| **中支** | Central Branch | 中心支公司，地市级机构 | 中级管理单位 |
| **客户类别** | Customer Category | 个人、企业、机关等客户分类 | 客户细分维度 |

## 技术术语

### 系统架构术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **仪表板** | Dashboard | 数据可视化展示界面 | 用户交互界面 |
| **多维分析** | Multi-dimensional Analysis | 按多个维度进行数据分析 | 分析方法 |
| **数据钻取** | Data Drill-down | 从汇总数据深入到明细数据 | 交互功能 |
| **实时计算** | Real-time Computing | 数据变化时即时重新计算 | 性能特性 |
| **缓存机制** | Caching Mechanism | 临时存储计算结果以提高性能 | 性能优化 |
| **响应式设计** | Responsive Design | 适配不同屏幕尺寸的界面设计 | UI设计原则 |
| **三大选择器系统** | Three Selector System | 维度选择器、指标选择器、图表类型选择器的组合 | 核心交互组件 |
| **维度选择器** | Dimension Picker | 用于选择分析维度的交互组件 | 数据分析工具 |
| **指标选择器** | Metric Picker | 用于选择分析指标的交互组件 | 数据分析工具 |
| **图表类型选择器** | Chart Type Picker | 用于选择可视化图表类型的交互组件 | 可视化工具 |
| **图表画布** | Chart Canvas | 图表渲染和交互的核心区域 | 可视化界面 |
| **联动刷选** | Linked Brushing | 多个图表间的交互式数据过滤 | 交互功能 |
| **智能标注** | Smart Annotation | 自动识别和标注数据异常点 | 智能分析功能 |
| **字段映射** | Field Mapping | 数据字段与图表元素的对应关系 | 数据绑定机制 |

### 数据处理术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **ETL** | Extract, Transform, Load | 数据提取、转换、加载过程 | 数据处理流程 |
| **数据清洗** | Data Cleansing | 识别和纠正数据中的错误 | 数据质量保证 |
| **数据校验** | Data Validation | 验证数据的准确性和完整性 | 质量控制 |
| **增量更新** | Incremental Update | 只更新变化的数据部分 | 性能优化策略 |
| **数据分片** | Data Sharding | 将大数据集分割成小块处理 | 性能优化技术 |
| **预聚合** | Pre-aggregation | 提前计算汇总数据 | 查询优化 |

### 前端技术术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **React** | React | Facebook开发的前端JavaScript库 | 前端框架 |
| **TypeScript** | TypeScript | 微软开发的JavaScript超集 | 编程语言 |
| **Ant Design** | Ant Design | 蚂蚁金服开发的React UI组件库 | UI组件库 |
| **ECharts** | ECharts | 百度开发的数据可视化图表库 | 图表库 |
| **Web Workers** | Web Workers | 浏览器后台线程技术 | 性能优化技术 |
| **PWA** | Progressive Web App | 渐进式Web应用 | 应用类型 |

### 后端技术术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **Node.js** | Node.js | 基于Chrome V8引擎的JavaScript运行时 | 后端运行环境 |
| **Express** | Express | Node.js的Web应用框架 | Web框架 |
| **PostgreSQL** | PostgreSQL | 开源关系型数据库管理系统 | 数据库 |
| **Redis** | Redis | 内存数据结构存储系统 | 缓存数据库 |
| **RESTful API** | RESTful API | 符合REST架构风格的Web API | 接口设计规范 |
| **JWT** | JSON Web Token | 用于身份验证的令牌标准 | 认证技术 |

## 指标计算术语

### 计算方法术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **加权平均** | Weighted Average | 根据权重计算的平均值 | 统计方法 |
| **同比** | Year-over-Year | 与去年同期相比的增长率 | 对比分析 |
| **环比** | Month-over-Month | 与上期相比的增长率 | 趋势分析 |
| **累计值** | Cumulative Value | 从期初到当前的累计数值 | 汇总统计 |
| **移动平均** | Moving Average | 一定期间内的平均值 | 趋势平滑 |
| **标准差** | Standard Deviation | 数据离散程度的度量 | 统计指标 |
| **北极星指标** | North Star Metric | 衡量产品核心价值和成功的关键指标 | 产品管理概念 |
| **分析路径** | Analysis Path | 从选择维度到导出结果的完整操作流程 | 用户操作流程 |
| **复用率** | Reuse Rate | 同一维度或指标被重复使用的频率 | 效率指标 |
| **端到端时间** | End-to-End Time | 从操作开始到完成的总耗时 | 性能指标 |

### 精度控制术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **数值精度** | Numeric Precision | 数值的有效位数 | 数据质量要求 |
| **四舍五入** | Rounding | 数值的舍入处理方法 | 计算规则 |
| **截断** | Truncation | 直接截取小数位的方法 | 计算规则 |
| **科学计数法** | Scientific Notation | 用指数形式表示数值 | 数值表示方法 |

## 业务流程术语

### 保险业务流程

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **承保** | Underwriting | 保险公司接受投保并签发保单的过程 | 业务流程 |
| **理赔** | Claims Processing | 保险事故发生后的赔付处理过程 | 业务流程 |
| **续保** | Renewal | 保单到期后继续投保的过程 | 业务流程 |
| **退保** | Surrender | 保单有效期内解除保险合同 | 业务流程 |
| **批改** | Endorsement | 保单有效期内修改保险条款 | 业务流程 |

### 数据分析流程

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **数据采集** | Data Collection | 从各业务系统收集原始数据 | 分析流程 |
| **数据整合** | Data Integration | 将多源数据合并统一 | 分析流程 |
| **指标计算** | Metric Calculation | 根据业务规则计算各项指标 | 分析流程 |
| **结果展示** | Result Presentation | 将分析结果可视化展示 | 分析流程 |
| **报告生成** | Report Generation | 生成标准化的分析报告 | 分析流程 |

### 图表可视化术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **折线图** | Line Chart | 用线条连接数据点显示趋势变化 | 时间序列分析首选 |
| **面积图** | Area Chart | 在折线图基础上填充区域显示量级 | 趋势+量级展示 |
| **点图/气泡图** | Scatter/Bubble Chart | 用点或气泡表示数据，支持三变量展示 | 类别对比分析 |
| **热力图** | Heatmap | 用颜色深浅表示数值大小的矩阵图 | 二维数据关系展示 |
| **箱线图** | Box Plot | 显示数据分布和异常值的统计图表 | 分布分析工具 |
| **矩形树图** | Treemap | 用嵌套矩形表示层级数据的占比关系 | 层级占比可视化 |
| **环形图** | Donut Chart | 中空的饼图，更美观的占比展示方式 | 结构占比展示 |
| **斜率图** | Slope Chart | 显示两个时间点间数值变化的图表 | 对比态势分析 |
| **平行坐标图** | Parallel Coordinates | 多维数据的平行轴线可视化 | 多指标对比分析 |
| **快捷模板** | Quick Template | 预设的常用维度指标组合 | 提高操作效率 |
| **收藏集** | Favorite Collection | 用户自定义的指标组合集合 | 个性化分析工具 |

### 核心指标看板术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **核心指标看板** | KPI Dashboard | 以4x4网格布局集中展示16个核心KPI指标的仪表板 | 基于单一周数据进行周环比分析 |
| **周环比** | Week-over-Week | 当前周与前一周数据的对比分析 | 显示绝对变化值和百分比变化 |
| **指标卡片** | KPI Card | 单个KPI指标的展示单元，包含名称、数值、变化趋势 | 支持状态指示和趋势可视化 |
| **网格布局** | Grid Layout | 4行4列的固定布局结构，确保指标展示的一致性 | 每个指标占据固定位置 |
| **趋势指示** | Trend Indicator | 通过颜色和图标显示指标的变化方向和健康状态 | 上升/下降/稳定三种状态 |
| **精度控制** | Precision Control | 根据指标类型自动设置合适的小数位数 | 确保数值显示的准确性和可读性 |

### AI智能洞察术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **AI智能洞察** | AI Insight Engine | 基于KPI数据自动生成业务分析报告的AI模块 | 提供三段式分析结构 |
| **趋势分析** | Trend Analysis | AI生成的第一段分析，解读核心成本指标的变化趋势 | 识别关键驱动因素和变化原因 |
| **异常识别** | Anomaly Detection | AI生成的第二段分析，识别数据中的显著异常点 | 分析异常原因和业务影响 |
| **业务洞察** | Business Insights | AI生成的第三段分析，提供具体可执行的优化建议 | 2-3个实操性强的改进建议 |
| **分析置信度** | Analysis Confidence | AI分析结果的可信度评分 | 基于数据质量和模型表现计算 |
| **上下文感知** | Context Awareness | AI基于当前筛选条件和业务场景提供针对性分析 | 确保分析结果的相关性 |
| **特征提取** | Feature Extraction | 从KPI数据中提取成本、收入、效率等关键特征 | 为AI分析提供结构化输入 |

### 数据导入术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **数据导入系统** | Data Import System | 支持用户上传周报数据的功能模块 | 包含验证、存储、索引更新 |
| **文件验证** | File Validation | 对上传文件进行格式、内容、质量的多层次检查 | 确保数据的完整性和准确性 |
| **导入历史** | Import History | 记录数据导入操作的历史记录 | 支持问题追溯和重新导入 |
| **路径规范** | Path Convention | 数据文件的标准存储路径格式 | /{年份}年保单/{年份}年保单截至{周次}周数据.csv |
| **验证结果** | Validation Result | 文件验证的详细结果，包含错误、警告、统计信息 | 指导用户修正数据问题 |
| **数据索引** | Data Index | 系统维护的数据文件索引，支持快速查找和访问 | 新数据导入后自动更新 |
| **临时存储** | Temporary Storage | 文件验证期间的临时存储位置 | 验证通过后移动到正式目录 |

## 质量控制术语

### 数据质量术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **数据完整性** | Data Completeness | 数据的完整程度 | 质量维度 |
| **数据准确性** | Data Accuracy | 数据的正确程度 | 质量维度 |
| **数据一致性** | Data Consistency | 数据的一致程度 | 质量维度 |
| **数据时效性** | Data Timeliness | 数据的及时程度 | 质量维度 |
| **数据有效性** | Data Validity | 数据的有效程度 | 质量维度 |

### 系统质量术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **可用性** | Availability | 系统正常运行的时间比例 | 性能指标 |
| **可靠性** | Reliability | 系统稳定运行的能力 | 质量指标 |
| **可扩展性** | Scalability | 系统处理增长负载的能力 | 架构特性 |
| **可维护性** | Maintainability | 系统易于维护和修改的程度 | 设计特性 |
| **安全性** | Security | 系统防护数据和功能的能力 | 安全特性 |

## 项目管理术语

### 项目阶段术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **需求分析** | Requirements Analysis | 分析和定义项目需求的阶段 | 项目阶段 |
| **系统设计** | System Design | 设计系统架构和详细方案的阶段 | 项目阶段 |
| **开发实现** | Development | 编码实现系统功能的阶段 | 项目阶段 |
| **测试验证** | Testing | 验证系统功能和性能的阶段 | 项目阶段 |
| **部署上线** | Deployment | 将系统部署到生产环境的阶段 | 项目阶段 |
| **运维支持** | Operations Support | 系统上线后的维护支持阶段 | 项目阶段 |

### 风险管理术语

| 术语 | 英文 | 定义 | 备注 |
|------|------|------|------|
| **风险识别** | Risk Identification | 识别项目可能面临的风险 | 风险管理 |
| **风险评估** | Risk Assessment | 评估风险的概率和影响程度 | 风险管理 |
| **风险缓解** | Risk Mitigation | 采取措施降低风险影响 | 风险管理 |
| **应急预案** | Contingency Plan | 风险发生时的应对方案 | 风险管理 |
| **风险监控** | Risk Monitoring | 持续监控风险状态变化 | 风险管理 |

---

## 缩写词汇表

| 缩写 | 全称 | 中文含义 |
|------|------|----------|
| **API** | Application Programming Interface | 应用程序编程接口 |
| **UI** | User Interface | 用户界面 |
| **UX** | User Experience | 用户体验 |
| **DB** | Database | 数据库 |
| **SQL** | Structured Query Language | 结构化查询语言 |
| **JSON** | JavaScript Object Notation | JavaScript对象表示法 |
| **HTTP** | HyperText Transfer Protocol | 超文本传输协议 |
| **HTTPS** | HTTP Secure | 安全超文本传输协议 |
| **CSS** | Cascading Style Sheets | 层叠样式表 |
| **HTML** | HyperText Markup Language | 超文本标记语言 |
| **DOM** | Document Object Model | 文档对象模型 |
| **SPA** | Single Page Application | 单页应用程序 |
| **MVC** | Model-View-Controller | 模型-视图-控制器 |
| **CRUD** | Create, Read, Update, Delete | 创建、读取、更新、删除 |
| **ORM** | Object-Relational Mapping | 对象关系映射 |
| **CDN** | Content Delivery Network | 内容分发网络 |
| **SSL** | Secure Sockets Layer | 安全套接字层 |
| **TLS** | Transport Layer Security | 传输层安全 |
| **JWT** | JSON Web Token | JSON网络令牌 |
| **RBAC** | Role-Based Access Control | 基于角色的访问控制 |
| **CI/CD** | Continuous Integration/Continuous Deployment | 持续集成/持续部署 |
| **DevOps** | Development Operations | 开发运维 |
| **SLA** | Service Level Agreement | 服务级别协议 |
| **KPI** | Key Performance Indicator | 关键绩效指标 |
| **ROI** | Return on Investment | 投资回报率 |
| **MVP** | Minimum Viable Product | 最小可行产品 |
| **POC** | Proof of Concept | 概念验证 |
| **UAT** | User Acceptance Testing | 用户验收测试 |

---

**维护说明**: 本术语表应随项目发展持续更新，确保术语定义的准确性和完整性。建议定期审查和补充新的业务术语和技术术语。