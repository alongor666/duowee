import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Minus,
  CornerDownRight,
  BookmarkPlus
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { KPIAction, KPIMetric } from '@/types';
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
  const getCardStyle = () =>
    'kpi-card p-4 cursor-pointer transition-all duration-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2';

  const getAccentTone = () => {
    switch (changeType) {
      case 'positive':
        return 'bg-success/15 text-success';
      case 'negative':
        return 'bg-danger/15 text-danger';
      case 'warning':
        return 'bg-warning/15 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formattedValue = formatValue(value, unit);
  const formattedChange = change !== undefined ? formatChange(change, unit) : undefined;
  const formattedChangePercent =
    changePercent !== undefined ? formatChangePercent(changePercent) : undefined;

  const renderActionIcon = (action: KPIAction) => {
    switch (action.action) {
      case 'drilldown':
        return <CornerDownRight className="h-3.5 w-3.5" />;
      case 'pin':
        return <BookmarkPlus className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        getCardStyle(),
        {
          'border-l-[3px] border-l-success/70': changeType === 'positive',
          'border-l-[3px] border-l-danger/70': changeType === 'negative',
          'border-l-[3px] border-l-warning/70': changeType === 'warning',
          'border-l-[3px] border-l-muted': changeType === 'neutral'
        },
        className
      )}
      onClick={onClick}
      title={description}
    >
      <div className="flex flex-col h-full gap-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-end gap-2">
                <span className="text-[2.125rem] font-semibold leading-none text-foreground">
                  {formattedValue}
                </span>
                {unit && (
                  <span className="text-sm font-medium text-muted-foreground mb-0.5">
                    {unit}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary/80">
                {name}
              </p>
            </div>
            {(formattedChange || formattedChangePercent) && (
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', getAccentTone())}>
                {getChangeIcon()}
              </div>
            )}
          </div>

          {(formattedChange || formattedChangePercent) && (
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground/80">
              {formattedChangePercent && <span>{formattedChangePercent}</span>}
              {formattedChange && (
                <span>
                  {formattedChange}
                  {unit}
                </span>
              )}
              <span className="text-xs font-normal text-muted-foreground">vs 上期</span>
            </div>
          )}

          {metric.quickInsight && (
            <p className="text-sm font-medium leading-snug text-foreground/85">
              {metric.quickInsight}
            </p>
          )}
        </div>

        {metric.dimensionTags && metric.dimensionTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {metric.dimensionTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto space-y-3 border-t border-dashed border-border/70 pt-3">
          {previousValue !== undefined && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>上期值</span>
              <span>
                {formatValue(previousValue, unit)}
                {unit}
              </span>
            </div>
          )}

          {description && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          {metric.actions && metric.actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metric.actions.map(action => (
                <button
                  key={action.label}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
                  onClick={event => {
                    event.stopPropagation();
                    onClick?.();
                  }}
                >
                  {renderActionIcon(action)}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground/90">
              {metric.category === 'absolute' && '绝对值指标'}
              {metric.category === 'ratio' && '率值指标'}
              {metric.category === 'operational' && '运营指标'}
              {metric.category === 'commercial' && '商业险指标'}
            </span>
            <span className="text-xs font-medium text-muted-foreground/80">
              {changeType === 'positive' && '正向'}
              {changeType === 'negative' && '负向'}
              {changeType === 'warning' && '异常'}
              {changeType === 'neutral' && '稳定'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}