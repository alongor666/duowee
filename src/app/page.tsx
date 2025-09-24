'use client';

import { Suspense, useState } from 'react';
import { Upload } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import FilterPanel from '@/components/filters/FilterPanel';
import ComparisonControls from '@/components/dashboard/ComparisonControls';
import DataImport from '@/components/data/DataImport';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

export default function HomePage() {
  const { state } = useDashboard();
  const [showDataImport, setShowDataImport] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 页面标题和说明 */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground">
            车险业务概况
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            车险变动成本明细分析 - 核心指标监控看板
          </p>
        </div>

        {/* 数据导入按钮 */}
        <button
          onClick={() => setShowDataImport(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Upload className="h-4 w-4" />
          <span>导入数据</span>
        </button>
      </div>

      {/* 筛选和对比控制面板 */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Suspense fallback={<div>加载筛选器...</div>}>
            <FilterPanel />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <ComparisonControls />
        </div>
      </div>

      {/* 数据导入模态框 */}
      {showDataImport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <DataImport onClose={() => setShowDataImport(false)} />
            </div>
          </div>
        </div>
      )}

      {/* 主要内容区域 */}
      <div className="space-y-6">
        {/* 错误显示 */}
        {state.error && (
          <ErrorDisplay error={state.error} />
        )}

        {/* 加载状态 */}
        {state.loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* KPI看板 */}
        {!state.loading && !state.error && state.data.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">
                核心指标看板
              </h2>
              {state.lastUpdated && (
                <div className="text-sm text-muted-foreground">
                  最后更新: {state.lastUpdated.toLocaleString('zh-CN')}
                </div>
              )}
            </div>

            <Suspense fallback={<LoadingSpinner />}>
              <DashboardGrid />
            </Suspense>
          </div>
        )}

        {/* 数据概要信息 */}
        {!state.loading && !state.error && state.data.length > 0 && (
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">数据概要</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">数据记录</div>
                <div className="text-2xl font-bold">
                  {state.data.length.toLocaleString('zh-CN')}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">机构数量</div>
                <div className="text-2xl font-bold">
                  {new Set(state.data.map(r => r.third_level_organization)).size}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">险种类型</div>
                <div className="text-2xl font-bold">
                  {new Set(state.data.map(r => r.coverage_type)).size}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">时间范围</div>
                <div className="text-lg font-bold">
                  {Math.min(...state.data.map(r => r.week_number))} -
                  {Math.max(...state.data.map(r => r.week_number))}周
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!state.loading && !state.error && state.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-6">
              <Upload className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">欢迎使用车险多维分析系统</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              请点击&ldquo;导入数据&rdquo;按钮上传CSV格式的车险数据文件，开始您的数据分析之旅
            </p>
            <button
              onClick={() => setShowDataImport(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span>导入数据</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
