# 车险变动成本明细分析系统

一个基于 Next.js 的智能化车险变动成本分析平台，通过AI驱动的数据洞察，帮助保险公司实现精准的成本控制和业务优化。采用前后端分离架构和轻量化设计理念，无数据库依赖，直接处理CSV文件。

**项目愿景**: 构建一个智能化的车险变动成本分析平台，通过AI驱动的数据洞察，帮助保险公司实现精准的成本控制和业务优化。

**北极星指标**: 提升保险公司变动成本分析效率300%，降低人工分析成本80%。

## 🎯 项目特色

### 正确的计算逻辑
- **比率重新计算**: 所有比率基于聚合后的绝对值重新计算，确保准确性
- **变动成本率**: (费用金额 ÷ 跟单保费) + (总赔款 ÷ 满期净保费)
- **满期赔付率**: 总赔款求和 ÷ 满期保费求和
- **满期率**: 满期保费求和 ÷ 跟单保费求和

### 多维度筛选系统
- **16个筛选维度**: 保单年度、数据周期、业务类型、三级机构、客户类别、车险种类、能源类型、险别组合、续保状态、地区、渠道、产品、客户类型、风险等级、保单状态、理赔状态
- **三大选择器**: 维度选择器、指标选择器、图表类型选择器
- **智能筛选**: 支持搜索和批量选择
- **预设模板**: 快速筛选预设（新能源车、商业险重点等）
- **自定义保存**: 保存个人筛选偏好

### 功能架构
#### 四层架构设计：
- **数据层**: CSV文件处理、数据验证、类型转换
- **业务逻辑层**: 指标计算引擎、数据聚合、筛选逻辑
- **交互层**: 三大选择器系统、图表画布、联动刷选
- **智能服务层**: AI分析引擎、智能洞察、预警系统

#### 核心功能模块：
- **核心指标看板**: 4x4网格布局展示16个核心指标
- **图表画布与交互**: 字段映射、联动刷选、智能标注、导出功能
- **AI智能洞察**: 数据变化分析、趋势预测、异常检测
- **数据导入与集成**: CSV文件上传、数据验证、错误处理

## 📊 核心功能

### 🤖 AI智能洞察功能
- **数据变化分析**: 自动识别关键指标的异常变化
- **趋势预测**: 基于历史数据预测未来趋势
- **异常检测**: 智能识别数据异常和风险点
- **成本分析洞察**: 深度分析成本结构和优化建议
- **业绩对比**: 多维度业绩对比和排名分析
- **风险预警**: 实时监控风险指标并提供预警

### 16个核心指标体系
#### 保费类指标 (4个)
- **跟单保费**: 保险公司承保的保费总额
- **满期净保费**: 实际到期的净保费收入
- **单均保费**: 平均每张保单的保费金额
- **商业险折前保费**: 商业险优惠前的保费金额

#### 赔款类指标 (4个)
- **总赔款**: 保险公司支付的赔款总额
- **案均赔款**: 平均每个理赔案件的赔款金额
- **赔案件数**: 发生理赔的案件总数
- **已决赔款**: 已经结案的赔款金额

#### 成本类指标 (4个)
- **费用金额**: 运营和管理费用总额
- **边际贡献额**: 保费收入减去变动成本的金额
- **保费计划**: 预设的保费收入目标
- **最终保费**: 经过调整后的最终保费金额

#### 效率类指标 (4个)
- **满期赔付率**: 赔款与保费的比率
- **变动成本率**: 变动成本占保费的比率
- **边际贡献率**: 边际贡献占保费的比率
- **保费计划达成率**: 实际保费与计划保费的比率

### 📈 图表组件库
- **趋势图**: 时间序列数据趋势展示，支持多指标对比
- **贡献图**: 各维度贡献比例分析，饼图+环形图
- **排名图**: 水平/垂直条形图，支持排序切换
- **帕累托图**: 80/20原则分析，组合图表展示
- **比例图**: 堆积条形图/面积图，构成比例分析
- **气泡图**: 多维散点图，支持象限分析

### 🎯 AI智能洞察功能
- **数据变化分析**: 自动识别关键指标的异常变化
- **趋势预测**: 基于历史数据预测未来趋势
- **异常检测**: 智能识别数据异常和风险点
- **成本分析洞察**: 深度分析成本结构和优化建议
- **业绩对比**: 多维度业绩对比和排名分析
- **风险预警**: 实时监控风险指标并提供预警

## 🛠 技术栈

- **前端框架**: Next.js 14 (App Router)
- **开发语言**: TypeScript
- **样式方案**: Tailwind CSS  
- **图表库**: Recharts
- **状态管理**: React Context API + useReducer
- **数据处理**: 自研DataProcessor + DataMapper
- **API层**: 统一dataService服务层
- **构建工具**: Next.js 内置工具链

## 项目结构

```
src/
├── app/                      # Next.js App Router
│   ├── dashboard/           # 仪表板页面
│   ├── api/data/           # 数据API路由
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页
├── components/              # React组件库
│   ├── dashboard/          # 仪表板组件
│   │   └── views/         # 5个分析视图
│   ├── charts/            # 6种图表组件
│   ├── filters/           # 筛选器组件
│   ├── kpi/              # KPI指标组件
│   ├── layout/           # 布局组件
│   └── ui/               # 基础UI组件
├── contexts/              # React Context
│   └── DashboardContext.tsx
├── services/              # 服务层
│   └── dataService.ts    # API服务
├── types/                # TypeScript类型
│   └── index.ts          # 完整类型定义
├── utils/                # 数据处理层
│   ├── dataProcessor.ts  # 核心计算逻辑
│   ├── dataMapper.ts     # 数据映射
│   ├── csvImporter.ts    # CSV导入
│   └── apiClient.ts      # API客户端
└── 数据字典.json           # 数据字段定义
```

## 快速开始

### 环境要求
- Node.js 18.17 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd car-insurance-dashboard
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

4. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建和部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## 配置说明

### 环境变量
创建 `.env.local` 文件配置环境变量：

```env
# API 配置
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_API_KEY=your_api_key

# AI 服务配置
NEXT_PUBLIC_AI_ENDPOINT=https://ai-service.example.com
```

### 数据源配置
数据源配置位于 `src/data/` 目录：
- `context2AI.json`: AI 助手上下文配置
- 其他配置文件可根据需要添加

## 开发指南

### 组件开发
- 使用 TypeScript 进行类型安全开发
- 遵循 React Hooks 最佳实践
- 组件应当是纯函数组件
- 使用 Tailwind CSS 进行样式开发

### 状态管理
使用 React Context API 进行全局状态管理：
```typescript
import { useDashboard } from '@/contexts/DashboardContext';

function MyComponent() {
  const { state, updateFilters } = useDashboard();
  // 组件逻辑
}
```

### 图表开发
基于 Recharts 库开发图表组件：
- 所有图表组件放在 `src/components/charts/` 目录
- 支持响应式设计
- 提供交互功能（悬停、点击、缩放等）

### AI 助手集成
AI 助手通过 `context2AI.json` 配置文件定义上下文捕获规则：
- 定义触发条件
- 配置数据捕获规则
- 设置 AI 提示模板

## API 接口

### 数据接口规范
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

interface InsuranceDataRequest {
  filters: FilterOptions;
  pagination?: {
    page: number;
    limit: number;
  };
}
```

### 主要接口
- `GET /api/dashboard/kpi` - 获取 KPI 数据
- `GET /api/dashboard/trends` - 获取趋势数据
- `GET /api/dashboard/analytics` - 获取分析数据
- `POST /api/ai/insights` - AI 洞察分析

## 性能优化

### 已实施的优化
- Next.js 自动代码分割
- 图片优化和懒加载
- CSS 优化和压缩
- 组件懒加载

### 建议的优化
- 使用 React.memo 优化组件重渲染
- 实现虚拟滚动处理大数据集
- 添加服务端缓存
- 使用 CDN 加速静态资源

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

此项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如遇到问题或需要帮助，请通过以下方式联系：
- 创建 GitHub Issue
- 发送邮件至：support@example.com

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新详情。