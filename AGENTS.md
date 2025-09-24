# 使用中文回复
# 代码与readme.md实时更新，代码变了readme.md随之更新，readme.md改变时，代码也跟着改变

## 设计体系与体验原则
- 信息架构优先：采用倒金字塔结构，核心指标置于视觉焦点，确保关键内容 5 秒内可理解。
- 渐进披露：复杂功能分层呈现，必要时通过步骤或分组降低界面负荷。
- 多维联动：筛选、图表、指标保持上下文一致，操作需即时反馈并支持键盘/触控快捷方式。
- 视觉语义：维护完整色彩语义（红=警告、绿=正常、蓝=中性），构建字体层级与适度留白。
- 数据可视化：趋势选折线、占比用饼/环、对比用柱、相关性用散点；遵循“数据墨水比”，突出异常点。
- 动效与性能：动效仅用于强化变化趋势；配合懒加载、虚拟滚动与缓存保障大数据性能。
- 响应式体验：图表自适应多端尺寸，支持浅色/深色主题与 4K/Retina 清晰度。
- 个性化与协作：仪表板可拖拽布局、保存视图、支持注释与分享，并提供数据解读提示与多格式导出。

# 仓库指南

## 项目结构与模块组织
- 源代码位于 `src/` 目录中。
  - `src/app/` — Next.js App Router 页面、`layout.tsx`、`globals.css`。
  - `src/components/` — UI 和仪表盘组件（PascalCase 命名法，`.tsx` 后缀）。
  - `src/contexts/` — React 上下文状态。
  - `src/utils/` — 纯工具函数（camelCase 命名法，`.ts` 后缀）。
  - `src/types/` — 共享的 TypeScript 类型定义。
- 关键配置文件：`.eslintrc.json`、`tsconfig.json` (路径别名 `@/*`)、`tailwind.config.js`、`next.config.js`。
- 静态资源在需要时放入 `public/` 目录（保持最小化；避免提交敏感数据）。

## 构建、测试和开发命令
- `npm run dev` — 启动 Next.js 开发服务器，地址为 `http://localhost:3000`。
- `npm run build` — 生成生产环境构建包。
- `npm start` — 运行构建后的应用。
- `npm run lint` — 使用 Next.js 核心 Web 指标规则进行代码检查。
- `./start.sh` — 交互式辅助脚本：检查 Node.js 版本、安装依赖、可选的构建步骤，并运行开发服务器。

## 编码风格与命名约定
- 已启用 TypeScript 严格模式；优先使用带类型的属性和返回值。使用路径别名 `@/...` 进行导入。
- 缩进：2个空格；保持代码行简洁，组件小巧。
- 组件：文件名和导出使用 PascalCase 命名法（例如 `KPICard.tsx`）。
- 工具函数：文件名和函数使用 camelCase 命名法（例如 `dataLoader.ts`）。
- CSS：在组件中优先使用 Tailwind CSS；共享样式位于 `src/app/globals.css`。
- 在推送代码前运行 `npm run lint`；在合理的情况下修复警告。

## 测试指南
- 尚未配置测试运行器。推荐技术栈：Jest + React Testing Library。
- 将测试文件放在 `src/__tests__/` 目录下，并在适当时将 `*.test.ts(x)` 文件与被测试文件并置。
- 目标是覆盖 `src/utils/` 中的关键逻辑以及筛选器/KPIs 的组件行为测试。
- 示例（添加 Jest 后）：`npm test -- src/__tests__/dataLoader.test.ts`。

## 提交与拉取请求指南
- 提交信息：使用清晰、祈使句式的主题（英文或中文）；在有用时添加范围。
  - 示例：`feat(dashboard): add KPI comparison controls` 或 `修复(utils): 修正满期赔付率计算`。
- 拉取请求（PR）必须包含：摘要、理由、UI 变更的前后截图、测试计划以及关联的 issue。
- 保持 PR 的专注性；倾向于更小、易于审查的变更。

## 安全与配置提示
- 不要提交机密信息或私有 CSV 文件。使用 `.env.local` 存储环境变量（已在 .gitignore 中忽略）。
- 大型或示例数据集应保留在本地；如果应用需要，运行时资源应放在 `public/` 目录下。

## AI代理特定指令
- 进行最小化、有针对性的更改；保留现有的模式和 TypeScript 类型。
- 遵守路径别名导入（`@/*`）和文件组织结构；倾向于在 `src/utils/` 中使用小而纯的工具函数。
- 当约定发生变化时，请更新本文件。

