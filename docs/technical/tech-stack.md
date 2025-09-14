# 车险变动成本明细分析系统 - 技术栈规范

> **主文档**: [PRD产品需求文档](../../prd.md) - 🎯 **核心入口**  
> **文档索引**: [完整文档导航](../index.md)  
> **本文档在主PRD中的位置**: [技术实现 > 技术栈规范](../../prd.md#🔧-技术实现)
> 
> **相关章节**: 主PRD第5章「技术规范」中技术栈选型的详细展开

## 1. 技术选型原则

### 1.1 选型标准
- **成熟稳定**: 选择经过大规模生产验证的技术栈
- **性能优先**: 优先考虑高性能、低延迟的技术方案
- **生态完善**: 选择社区活跃、文档完善的技术
- **团队匹配**: 考虑团队技术栈熟悉度和学习成本
- **长期维护**: 选择有长期支持和发展前景的技术

### 1.2 技术决策矩阵

| 技术领域 | 候选方案 | 最终选择 | 选择理由 |
|----------|----------|----------|----------|
| **前端框架** | React, Vue, Angular | React + Next.js | 生态成熟、SSR支持、团队熟悉 |
| **状态管理** | Redux, Zustand, Context | React Context | 轻量级、学习成本低、满足需求 |
| **样式方案** | CSS Modules, Styled-components, Tailwind | Tailwind CSS | 开发效率高、一致性好 |
| **图表库** | D3.js, Chart.js, Recharts | Recharts | React生态、声明式、易用 |
| **后端框架** | Express, Koa, Fastify | Express | 成熟稳定、中间件丰富 |
| **数据存储** | MySQL, PostgreSQL, MongoDB | CSV文件 | 轻量级、无运维成本 |

## 2. 前端技术栈

### 2.1 核心框架

#### Next.js 14.x
```json
{
  "name": "Next.js",
  "version": "^14.0.0",
  "description": "React全栈框架",
  "features": [
    "服务端渲染(SSR)",
    "静态站点生成(SSG)",
    "API路由",
    "自动代码分割",
    "内置优化"
  ],
  "configuration": {
    "typescript": true,
    "eslint": true,
    "tailwindcss": true,
    "src": true
  }
}
```

**配置文件 (next.config.js)**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用实验性功能
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['csv-parser']
  },
  
  // 性能优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  // 图片优化
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif']
  },
  
  // 输出配置
  output: 'standalone',
  
  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  }
};

module.exports = nextConfig;
```

#### TypeScript 5.x
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

### 2.2 UI和样式

#### Tailwind CSS 3.x
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // 品牌色彩
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        // 功能色彩
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
};
```

#### 组件库选择
```typescript
// 推荐的UI组件库
interface UILibraryRecommendation {
  name: string;
  usage: string;
  reason: string;
}

const uiLibraries: UILibraryRecommendation[] = [
  {
    name: "Headless UI",
    usage: "无样式交互组件",
    reason: "与Tailwind完美集成，可访问性好"
  },
  {
    name: "Radix UI",
    usage: "复杂交互组件",
    reason: "无样式、可访问性、可定制性强"
  },
  {
    name: "Lucide React",
    usage: "图标库",
    reason: "轻量级、图标丰富、树摇优化"
  }
];
```

### 2.3 数据可视化

#### Recharts 2.8.x
```typescript
// 图表组件配置
interface ChartConfig {
  responsive: boolean;
  maintainAspectRatio: boolean;
  theme: 'light' | 'dark';
  colors: string[];
}

const defaultChartConfig: ChartConfig = {
  responsive: true,
  maintainAspectRatio: false,
  theme: 'light',
  colors: [
    '#3b82f6', // 蓝色
    '#10b981', // 绿色
    '#f59e0b', // 黄色
    '#ef4444', // 红色
    '#8b5cf6', // 紫色
    '#06b6d4'  // 青色
  ]
};

// 图表主题配置
const chartTheme = {
  light: {
    background: '#ffffff',
    text: '#374151',
    grid: '#f3f4f6',
    axis: '#9ca3af'
  },
  dark: {
    background: '#1f2937',
    text: '#f9fafb',
    grid: '#374151',
    axis: '#6b7280'
  }
};
```

### 2.4 状态管理

#### React Context + useReducer
```typescript
// 全局状态类型定义
interface AppState {
  user: UserState;
  filters: FilterState;
  data: DataState;
  ui: UIState;
}

// Context Provider 设计
const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
} | null>(null);

// 自定义Hook
function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}

// 状态更新器
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload
        }
      };
    default:
      return state;
  }
}
```

### 2.5 开发工具链

#### ESLint配置
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-console": "warn"
  },
  "ignorePatterns": ["node_modules/", ".next/", "out/"]
}
```

#### Prettier配置
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## 3. 后端技术栈

### 3.1 核心框架

#### Node.js + Express
```typescript
// 服务器配置
interface ServerConfig {
  port: number;
  cors: {
    origin: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

const serverConfig: ServerConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  cors: {
    origin: [
      'http://localhost:3000',
      'https://your-domain.com'
    ],
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 限制每个IP 15分钟内最多100个请求
  }
};
```

#### 中间件配置
```typescript
// Express应用配置
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

const app = express();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors(serverConfig.cors));

// 请求限流
app.use(rateLimit(serverConfig.rateLimit));

// 压缩响应
app.use(compression());

// 解析JSON
app.use(express.json({ limit: '10mb' }));

// 解析URL编码
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### 3.2 数据处理

#### CSV处理库
```typescript
// CSV解析配置
import csv from 'csv-parser';
import fs from 'fs';

interface CSVParserConfig {
  separator: string;
  headers: boolean;
  skipEmptyLines: boolean;
  encoding: string;
}

const csvConfig: CSVParserConfig = {
  separator: ',',
  headers: true,
  skipEmptyLines: true,
  encoding: 'utf8'
};

// CSV读取器
class CSVReader {
  async readFile(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csv(csvConfig))
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }
}
```

### 3.3 缓存策略

#### 内存缓存
```typescript
// LRU缓存实现
class LRUCache<T> {
  private cache = new Map<string, T>();
  private maxSize: number;
  
  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }
  
  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 移到最前面（最近使用）
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

## 4. 数据存储

### 4.1 文件系统存储

#### 目录结构规范
```
data/
├── raw/                    # 原始CSV数据
│   ├── 2023/
│   │   ├── week_01.csv     # 命名规范：week_XX.csv
│   │   ├── week_02.csv
│   │   └── ...
│   └── 2024/
│       └── ...
├── processed/              # 预处理数据
│   ├── aggregated/         # 聚合数据
│   │   ├── monthly/        # 按月聚合
│   │   ├── weekly/         # 按周聚合
│   │   └── daily/          # 按日聚合
│   └── cache/              # 缓存数据
│       ├── filters/        # 筛选器缓存
│       └── kpis/           # KPI缓存
└── config/                 # 配置文件
    ├── field_mapping.json  # 字段映射
    ├── kpi_definitions.json # KPI定义
    └── validation_rules.json # 验证规则
```

#### 文件命名规范
```typescript
// 文件命名工具
class FileNamingUtil {
  // 生成周数据文件名
  static getWeekFileName(year: number, week: number): string {
    return `week_${week.toString().padStart(2, '0')}.csv`;
  }
  
  // 生成缓存文件名
  static getCacheFileName(type: string, params: any): string {
    const hash = this.generateHash(params);
    return `${type}_${hash}.json`;
  }
  
  // 生成聚合文件名
  static getAggregateFileName(dimensions: string[], timeRange: string): string {
    const dimStr = dimensions.sort().join('_');
    return `agg_${dimStr}_${timeRange}.json`;
  }
}
```

### 4.2 数据验证

#### 数据质量检查
```typescript
// 数据验证器
class DataValidator {
  // 验证CSV数据格式
  validateCSVData(data: any[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 检查必需字段
    const requiredFields = ['policy_id', 'start_date', 'premium'];
    for (const field of requiredFields) {
      if (!data.every(row => row[field] !== undefined)) {
        errors.push(`缺少必需字段: ${field}`);
      }
    }
    
    // 检查数据类型
    data.forEach((row, index) => {
      if (isNaN(parseFloat(row.premium))) {
        warnings.push(`第${index + 1}行保费数据格式错误`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
```

## 5. 测试规范

### 5.1 测试框架

#### Jest配置
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};

module.exports = createJestConfig(customJestConfig);
```

### 5.2 测试策略

#### 单元测试
```typescript
// 组件测试示例
import { render, screen, fireEvent } from '@testing-library/react';
import { KPICard } from '@/components/KPICard';

describe('KPICard', () => {
  const mockProps = {
    title: '保单件数',
    value: 12345,
    unit: '件',
    trend: 5.2,
    loading: false
  };
  
  it('应该正确渲染KPI数据', () => {
    render(<KPICard {...mockProps} />);
    
    expect(screen.getByText('保单件数')).toBeInTheDocument();
    expect(screen.getByText('12,345')).toBeInTheDocument();
    expect(screen.getByText('件')).toBeInTheDocument();
  });
  
  it('应该显示趋势指标', () => {
    render(<KPICard {...mockProps} />);
    
    expect(screen.getByText('↗ 5.2%')).toBeInTheDocument();
  });
});
```

#### 集成测试
```typescript
// API测试示例
import request from 'supertest';
import app from '@/server/app';

describe('API集成测试', () => {
  describe('GET /api/v1/kpi', () => {
    it('应该返回KPI数据', async () => {
      const response = await request(app)
        .get('/api/v1/kpi')
        .query({
          filters: JSON.stringify({
            policy_start_year: [2024],
            business_type_category: ['商业险']
          })
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('kpis');
      expect(Array.isArray(response.body.data.kpis)).toBe(true);
    });
  });
});
```

## 6. 部署规范

### 6.1 Docker配置

#### Dockerfile
```dockerfile
# 多阶段构建
FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./data:/app/data:ro
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
```

### 6.2 环境配置

#### 环境变量
```bash
# .env.production
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
DATA_PATH=/app/data
CACHE_SIZE=100
LOG_LEVEL=info

# 安全配置
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret

# 监控配置
MONITORING_ENABLED=true
METRICS_PORT=9090
```

---

**文档版本**: v1.0  
**最后更新**: 2025-01-16  
**维护人员**: 技术团队