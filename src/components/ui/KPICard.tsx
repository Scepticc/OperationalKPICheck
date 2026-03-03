'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPIValue } from '@/types';

interface KPICardProps {
  title: string;
  kpi: KPIValue | null | undefined;
  format?: (val: number) => string;
  higherIsBetter?: boolean;
  unit?: string;
  description?: string;
  icon?: React.ReactNode;
}

function defaultFormat(val: number): string {
  return val.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

export default function KPICard({
  title,
  kpi,
  format = defaultFormat,
  higherIsBetter = true,
  unit = '',
  description,
  icon,
}: KPICardProps) {
  const current = kpi?.current ?? null;
  const change = kpi?.change ?? null;

  const isPositive = change !== null && change > 0;
  const isNegative = change !== null && change < 0;
  const isGood = higherIsBetter ? isPositive : isNegative;
  const isBad = higherIsBetter ? isNegative : isPositive;

  return (
    <div className="kpi-card group hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-tight">
          {title}
        </p>
        {icon && (
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {current !== null ? `${format(current)}${unit}` : '—'}
        </span>
      </div>

      {/* Change badge */}
      {change !== null ? (
        <div
          className={cn(
            'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
            isGood && 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
            isBad && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            !isGood && !isBad && 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : isNegative ? (
            <TrendingDown className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          {Math.abs(change).toFixed(1)}% vs prev period
        </div>
      ) : (
        <div className="badge badge-gray text-xs">No comparison data</div>
      )}

      {description && (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{description}</p>
      )}
    </div>
  );
}
