'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
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
  accentColor?: 'blue' | 'emerald' | 'violet' | 'amber';
}

function defaultFormat(val: number): string {
  return val.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

const accentMap = {
  blue:    { bar: 'bg-blue-500',    icon: 'text-blue-400 bg-blue-500/10 dark:bg-blue-500/[0.08]' },
  emerald: { bar: 'bg-emerald-500', icon: 'text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/[0.08]' },
  violet:  { bar: 'bg-violet-500',  icon: 'text-violet-400 bg-violet-500/10 dark:bg-violet-500/[0.08]' },
  amber:   { bar: 'bg-amber-500',   icon: 'text-amber-400 bg-amber-500/10 dark:bg-amber-500/[0.08]' },
};

export default function KPICard({
  title,
  kpi,
  format = defaultFormat,
  higherIsBetter = true,
  unit = '',
  description,
  icon,
  accentColor = 'blue',
}: KPICardProps) {
  const current = kpi?.current ?? null;
  const change  = kpi?.change  ?? null;

  const isPositive = change !== null && change > 0;
  const isNegative = change !== null && change < 0;
  const isGood = higherIsBetter ? isPositive : isNegative;
  const isBad  = higherIsBetter ? isNegative : isPositive;

  const accent = accentMap[accentColor];

  return (
    <div className="kpi-card group">
      {/* Thin accent bar on top */}
      <div className={cn('absolute top-0 left-0 right-0 h-[2px] rounded-t-xl opacity-60 group-hover:opacity-100 transition-opacity', accent.bar)} />

      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 leading-tight pr-2">
          {title}
        </p>
        {icon && (
          <div className={cn('p-1.5 rounded-lg shrink-0', accent.icon)}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-3">
        <span className="text-[28px] font-bold text-slate-900 dark:text-slate-50 tabular-nums leading-none tracking-tight">
          {current !== null ? `${format(current)}${unit}` : '—'}
        </span>
      </div>

      {/* Change badge */}
      {change !== null ? (
        <div className={cn(
          'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full',
          isGood && 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
          isBad  && 'bg-red-500/10 text-red-500 dark:text-red-400',
          !isGood && !isBad && 'bg-slate-100 dark:bg-[#0f1e36] text-slate-400 dark:text-slate-600'
        )}>
          {isPositive ? <ArrowUp className="w-2.5 h-2.5" />
           : isNegative ? <ArrowDown className="w-2.5 h-2.5" />
           : <Minus className="w-2.5 h-2.5" />}
          {Math.abs(change).toFixed(1)}%
          <span className="font-normal text-[10px] opacity-70 ml-0.5">vs prev</span>
        </div>
      ) : (
        <div className="badge badge-gray text-[11px]">No prior data</div>
      )}

      {description && (
        <p className="mt-2.5 text-[11px] text-slate-400 dark:text-slate-700 leading-snug">{description}</p>
      )}
    </div>
  );
}
