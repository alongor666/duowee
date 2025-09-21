import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ErrorDisplayProps {
  error: string;
  className?: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ error, className, onRetry }: ErrorDisplayProps) {
  return (
    <div className={cn(
      'rounded-lg border border-destructive/50 bg-destructive/10 p-4',
      className
    )}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-destructive mb-1">
            数据加载错误
          </h3>
          <p className="text-sm text-destructive/80">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm text-destructive hover:text-destructive/80 underline"
            >
              重试
            </button>
          )}
        </div>
      </div>
    </div>
  );
}