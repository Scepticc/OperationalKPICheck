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
  accentColor?: 'lime' | 'cyan' | 'violet' | 'amber';
}

function defaultFormat(val: number): string {
  return val.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

const accentMap = {
  lime:   { bar: 'bg-lime-500',   icon: 'text-lime-600 bg-lime-50' },
  cyan:   { bar: 'bg-cyan-500',   icon: 'text-cyan-600 bg-cyan-50' },
  violet: { bar: 'bg-violet-500', icon: 'text-violet-600 bg-violet-50' },
  amber:  { bar: 'bg-amber-500',  icon: 'text-amber-600 bg-amber-50' },
};

export default function KPICard({
  title,
  kpi,
  format = defaultFormat,
  higherIsBetter = true,
  unit = '',
  description,
  icon,
  accentColor = 'lime',
}: KPICardProps) {
  const current = kpi?.current ?? null;
  const change  = kpi?.change  ?? null;

  const isPositive = change !== null && change > 0;
  const isNegative = change !== null && change < 0;
  const isGood = higherIsBetter ? isPositive : isNegative;
  const isBad  = higherIsBetter ? isNegative : isPositive;

  const accent = accentMap[accentColor];

  return (
    <div className="kpi-card group animate-slide-up">
      {/* Accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity duration-300', accent.bar)} />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 leading-tight pr-2">
            {title}
          </p>
          {icon && (
            <div className={cn('p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-110', accent.icon)}>
              {icon}
            </div>
          )}
        </div>

        <div className="mb-3">
          <span className="text-2xl font-semibold text-navy-900 tabular-nums leading-none tracking-tight">
            {current !== null ? `${format(current)}${unit}` : '\u2014'}
          </span>
        </div>

        {change !== null ? (
          <div className={cn(
            'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full',
            isGood && 'bg-lime-50 text-lime-600',
            isBad  && 'bg-red-50 text-red-600',
            !isGood && !isBad && 'bg-gray-100 text-gray-500'
          )}>
            {isPositive ? <ArrowUp className="w-2.5 h-2.5" />
             : isNegative ? <ArrowDown className="w-2.5 h-2.5" />
             : <Minus className="w-2.5 h-2.5" />}
            {Math.abs(change).toFixed(1)}%
            <span className="font-normal text-[10px] opacity-60 ml-0.5">vs prev</span>
          </div>
        ) : (
          <div className="text-[10px] font-medium text-gray-400">No prior data</div>
        )}

        {description && (
          <p className="mt-2 text-[10px] text-gray-400 leading-snug">{description}</p>
        )}
      </div>
    </div>
  );
}
