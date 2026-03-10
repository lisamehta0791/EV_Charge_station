import { cn } from '@/lib/utils';
import { Battery, BatteryCharging } from 'lucide-react';

interface BatteryIndicatorProps {
  percentage: number;
  isCharging?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BatteryIndicator({ percentage, isCharging = false, size = 'lg' }: BatteryIndicatorProps) {
  const getBatteryColor = () => {
    if (percentage < 20) return 'bg-[hsl(var(--battery-low))]';
    if (percentage < 50) return 'bg-[hsl(var(--battery-medium))]';
    return 'bg-[hsl(var(--battery-high))]';
  };

  const getTextColor = () => {
    if (percentage < 20) return 'text-[hsl(var(--battery-low))]';
    if (percentage < 50) return 'text-[hsl(var(--battery-medium))]';
    return 'text-[hsl(var(--battery-high))]';
  };

  const sizeClasses = {
    sm: 'h-24 w-48',
    md: 'h-32 w-64',
    lg: 'h-40 w-80',
  };

  const textSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn('relative rounded-2xl border-4 border-muted-foreground/30 p-2', sizeClasses[size])}>
        {/* Battery tip */}
        <div className="absolute -right-3 top-1/2 h-8 w-3 -translate-y-1/2 rounded-r-md bg-muted-foreground/30" />
        
        {/* Battery fill */}
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-muted">
          <div
            className={cn(
              'absolute inset-y-0 left-0 transition-all duration-1000',
              getBatteryColor(),
              isCharging && 'animate-pulse'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Percentage text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', textSizeClasses[size], getTextColor())}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        {isCharging ? (
          <>
            <BatteryCharging className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Charging...</span>
          </>
        ) : (
          <>
            <Battery className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Not charging</span>
          </>
        )}
      </div>
    </div>
  );
}
