import { TrendingUp, TrendingDown, AlertTriangle, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { KPIMetric } from '@/types';
import { formatValue, formatChange, formatChangePercent } from '@/utils/calculations';

interface KPICardProps {
  metric: KPIMetric;
  onClick?: () => void;
  className?: string;
}

export default function KPICard({ metric, onClick, className }: KPICardProps) {
  const {
    name,
    value,
    previousValue,
    change,
    changePercent,
    changeType,
    unit,
    description
  } = metric;

  // 图标选择
  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-danger" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // 卡片样式
  const getCardStyle = () => {
    const baseStyle = 'kpi-card p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]';

    switch (changeType) {
      case 'positive':
        return `${baseStyle} positive`;
      case 'negative':
        return `${baseStyle} negative`;
      case 'warning':
        return `${baseStyle} warning`;
      default:
        return baseStyle;
    }
  };

  // 变化值颜色
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const formattedValue = formatValue(value, unit);
  const formattedChange = change !== undefined ? formatChange(change, unit) : undefined;
  const formattedChangePercent = changePercent !== undefined ? formatChangePercent(changePercent) : undefined;

  return (
    <div
      className={cn(getCardStyle(), className)}
      onClick={onClick}
      title={description}
    >
      {/* 指标名称 */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground leading-tight">
          {name}
        </h3>
        {(change !== undefined || changePercent !== undefined) && (
          <div className="flex items-center space-x-1">
            {getChangeIcon()}
          </div>
        )}
      </div>

      {/* 当前值 */}
      <div className="mb-2">
        <div className="text-2xl font-bold text-foreground animate-counter">
          {formattedValue}
          {unit && (
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* 变化信息 */}
      {(formattedChange || formattedChangePercent) && (
        <div className="space-y-1">
          {formattedChange && (
            <div className={cn('text-sm font-medium', getChangeColor())}>
              {formattedChange} {unit}
            </div>
          )}
          {formattedChangePercent && (
            <div className={cn('text-xs', getChangeColor())}>
              {formattedChangePercent}
            </div>
          )}
        </div>
      )}

      {/* 对比期信息 */}
      {previousValue !== undefined && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            对比期: {formatValue(previousValue, unit)} {unit}
          </div>
        </div>
      )}

      {/* 变化性质标识 */}
      <div className="mt-2 flex items-center justify-between">
        <div className={cn('text-xs px-2 py-1 rounded', {
          'bg-success/10 text-success': changeType === 'positive',
          'bg-danger/10 text-danger': changeType === 'negative',
          'bg-warning/10 text-warning': changeType === 'warning',
          'bg-muted/50 text-muted-foreground': changeType === 'neutral'
        })}>
          {changeType === 'positive' && '正向'}
          {changeType === 'negative' && '负向'}
          {changeType === 'warning' && '异常'}
          {changeType === 'neutral' && '稳定'}
        </div>

        {/* 类别标识 */}
        <div className="text-xs text-muted-foreground">
          {metric.category === 'absolute' && '绝对值'}
          {metric.category === 'ratio' && '率值'}
          {metric.category === 'operational' && '运营'}
          {metric.category === 'commercial' && '商业险'}
        </div>
      </div>
    </div>
  );
}