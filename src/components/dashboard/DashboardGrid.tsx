'use client';

import { useDashboard } from '@/contexts/DashboardContext';
import KPICard from '@/components/kpi/KPICard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { KPIMetric } from '@/types';

interface DashboardGridProps {
  onMetricClick?: (metric: KPIMetric) => void;
  className?: string;
}

export default function DashboardGrid({ onMetricClick, className }: DashboardGridProps) {
  const { state } = useDashboard();
  const { kpiMetrics, loading } = state;

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="dashboard-grid">
        {Array.from({ length: 16 }).map((_, index) => (
          <div
            key={index}
            className="kpi-card p-4 animate-pulse"
          >
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-8 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 按照PRD要求的4×4矩阵布局排列指标
  const getOrderedMetrics = (): KPIMetric[] => {
    // 按照指标ID的特定顺序排列，确保符合PRD中的布局
    const order = [
      // 第一行：绝对值指标
      'signed_premium',
      'matured_premium',
      'policy_count',
      'claim_case_count',

      // 第二行：核心率值指标
      'matured_loss_ratio',
      'expense_ratio',
      'variable_cost_ratio',
      'marginal_contribution_ratio',

      // 第三行：运营指标
      'claim_frequency',
      'avg_premium',
      'avg_claim_amount',
      'marginal_contribution_amount',

      // 第四行：商业险专项指标
      'commercial_premium_before_discount',
      'commercial_auto_coeff',
      'reported_claim_payment',
      'expense_amount'
    ];

    return order.map(id =>
      kpiMetrics.find(metric => metric.id === id)
    ).filter(Boolean) as KPIMetric[];
  };

  const orderedMetrics = getOrderedMetrics();

  // 如果没有数据，显示空状态
  if (orderedMetrics.length === 0) {
    return (
      <div className="dashboard-grid">
        {Array.from({ length: 16 }).map((_, index) => (
          <div
            key={index}
            className="kpi-card p-4 border-dashed"
          >
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
              <div className="text-muted-foreground text-sm">
                暂无数据
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleMetricClick = (metric: KPIMetric) => {
    if (onMetricClick) {
      onMetricClick(metric);
    } else {
      // 默认行为：显示详细信息
      console.log('点击指标:', metric);
      // 这里可以打开详情模态框或跳转到详情页面
    }
  };

  return (
    <div className={`dashboard-grid ${className || ''}`}>
      {orderedMetrics.map((metric, index) => (
        <div
          key={metric.id}
          className="grid-item"
          style={{
            animationDelay: `${index * 50}ms`
          }}
        >
          <KPICard
            metric={metric}
            onClick={() => handleMetricClick(metric)}
            className="h-full animate-slide-in"
          />
        </div>
      ))}

      {/* 填充空白位置（如果指标少于16个） */}
      {orderedMetrics.length < 16 &&
        Array.from({ length: 16 - orderedMetrics.length }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="kpi-card p-4 border-dashed opacity-50"
          >
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
              <div className="text-muted-foreground text-xs">
                待扩展指标
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

// 指标分组标题组件
export function MetricGroupHeaders() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div className="text-center">
        <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
          绝对值指标
        </h3>
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
          核心率值指标
        </h3>
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
          运营指标
        </h3>
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
          商业险专项指标
        </h3>
      </div>
    </div>
  );
}