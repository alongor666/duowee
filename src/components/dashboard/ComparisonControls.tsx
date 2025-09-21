'use client';

import { useState } from 'react';
import { Calendar, TrendingUp, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDashboard } from '@/contexts/DashboardContext';
import type { ComparisonMode, TimePeriod } from '@/types';

export default function ComparisonControls() {
  const { state, updateComparison } = useDashboard();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentComparison = state.comparison;

  // 对比类型选项
  const comparisonTypes = [
    { type: 'yoy' as const, label: '同比', description: '与去年同期对比' },
    { type: 'wow' as const, label: '环比', description: '与上周期对比' },
    { type: 'custom' as const, label: '自定义', description: '选择任意时间段对比' }
  ];

  const handleComparisonToggle = () => {
    updateComparison({
      ...currentComparison,
      enabled: !currentComparison.enabled
    });
  };

  const handleTypeChange = (type: ComparisonMode['type']) => {
    const newComparison: ComparisonMode = {
      ...currentComparison,
      type,
      enabled: true
    };

    // 根据对比类型自动计算对比期
    if (type === 'yoy') {
      newComparison.comparePeriod = {
        year: currentComparison.currentPeriod.year - 1,
        weekStart: currentComparison.currentPeriod.weekStart,
        weekEnd: currentComparison.currentPeriod.weekEnd
      };
    } else if (type === 'wow') {
      newComparison.comparePeriod = {
        year: currentComparison.currentPeriod.year,
        weekStart: Math.max(1, currentComparison.currentPeriod.weekStart - 1),
        weekEnd: Math.max(1, currentComparison.currentPeriod.weekEnd - 1)
      };
    }

    updateComparison(newComparison);
  };

  const handlePeriodChange = (field: keyof TimePeriod, value: number) => {
    if (!currentComparison.comparePeriod) return;

    const newComparePeriod = {
      ...currentComparison.comparePeriod,
      [field]: value
    };

    updateComparison({
      ...currentComparison,
      comparePeriod: newComparePeriod
    });
  };

  return (
    <div className="space-y-4">
      {/* 对比控制标题 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">对比分析</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {/* 启用对比开关 */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleComparisonToggle}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            currentComparison.enabled ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-background transition-transform',
              currentComparison.enabled ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <span className="text-sm font-medium">
          启用对比分析
        </span>
        {currentComparison.enabled && (
          <TrendingUp className="h-4 w-4 text-success" />
        )}
      </div>

      {/* 对比类型选择 */}
      {currentComparison.enabled && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">
            对比类型
          </div>
          <div className="grid grid-cols-1 gap-2">
            {comparisonTypes.map(({ type, label, description }) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={cn(
                  'p-3 text-left rounded-lg border transition-all',
                  currentComparison.type === type
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-muted-foreground'
                )}
              >
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 自定义时间段选择 */}
      {currentComparison.enabled && currentComparison.type === 'custom' && isExpanded && (
        <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
          <div className="text-sm font-medium">对比期设置</div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">年度</label>
              <input
                type="number"
                value={currentComparison.comparePeriod?.year || new Date().getFullYear() - 1}
                onChange={(e) => handlePeriodChange('year', parseInt(e.target.value))}
                className="w-full mt-1 px-2 py-1 text-sm border rounded"
                min="2020"
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">起始周</label>
              <input
                type="number"
                value={currentComparison.comparePeriod?.weekStart || 1}
                onChange={(e) => handlePeriodChange('weekStart', parseInt(e.target.value))}
                className="w-full mt-1 px-2 py-1 text-sm border rounded"
                min="1"
                max="53"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">结束周</label>
            <input
              type="number"
              value={currentComparison.comparePeriod?.weekEnd || currentComparison.comparePeriod?.weekStart || 1}
              onChange={(e) => handlePeriodChange('weekEnd', parseInt(e.target.value))}
              className="w-full mt-1 px-2 py-1 text-sm border rounded"
              min={currentComparison.comparePeriod?.weekStart || 1}
              max="53"
            />
          </div>
        </div>
      )}

      {/* 当前设置概要 */}
      {currentComparison.enabled && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="text-sm">
            <div className="font-medium text-primary mb-1">
              当前对比设置
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                当前期: {currentComparison.currentPeriod.year}年
                第{currentComparison.currentPeriod.weekStart}
                {currentComparison.currentPeriod.weekEnd !== currentComparison.currentPeriod.weekStart &&
                  `-${currentComparison.currentPeriod.weekEnd}`}周
              </div>
              {currentComparison.comparePeriod && (
                <div>
                  对比期: {currentComparison.comparePeriod.year}年
                  第{currentComparison.comparePeriod.weekStart}
                  {currentComparison.comparePeriod.weekEnd !== currentComparison.comparePeriod.weekStart &&
                    `-${currentComparison.comparePeriod.weekEnd}`}周
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 重置按钮 */}
      {currentComparison.enabled && (
        <button
          onClick={() => updateComparison({ ...currentComparison, enabled: false })}
          className="w-full flex items-center justify-center space-x-2 p-2 text-sm text-muted-foreground hover:text-foreground border border-dashed rounded-lg"
        >
          <RotateCcw className="h-4 w-4" />
          <span>重置对比</span>
        </button>
      )}
    </div>
  );
}