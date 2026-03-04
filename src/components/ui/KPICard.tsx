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
  lime:   { bar: 'bg-lime-500',   icon: 'text-lime-400 bg-lime-500/10' },
  cyan:   { bar: 'bg-cyan-400',   icon: 'text-cyan-400 bg-cyan-400/10' },
  violet: { bar: 'bg-violet-400', icon: 'text-violet-400 bg-violet-400/10' },
  amber:  { bar: 'bg-amber-400',  icon: 'text-amber-400 bg-amber-400/10' },
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
      {/* Accent glow bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-[2px] opacity-30 group-hover:opacity-80 transition-opacity duration-300', accent.bar)} />
      {/* Corner glow effect */}
      <div className={cn('absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500', accent.bar)} />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 leading-tight pr-2">
            {title}
          </p>
          {icon && (
            <div className={cn('p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-110', accent.icon)}>
              {icon}
            </div>
          )}
        </div>

        <div className="mb-3">
          <span className="text-2xl font-extrabold text-white tabular-nums leading-none tracking-tight">
            {current !== null ? `${format(current)}${unit}` : '\u2014'}
          </span>
        </div>

        {change !== null ? (
          <div className={cn(
            'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full',
            isGood && 'bg-lime-500/15 text-lime-400',
            isBad  && 'bg-red-500/15 text-red-400',
            !isGood && !isBad && 'bg-gray-500/10 text-gray-500'
          )}>
            {isPositive ? <ArrowUp className="w-2.5 h-2.5" />
             : isNegative ? <ArrowDown className="w-2.5 h-2.5" />
             : <Minus className="w-2.5 h-2.5" />}
            {Math.abs(change).toFixed(1)}%
            <span className="font-normal text-[10px] opacity-60 ml-0.5">vs prev</span>
          </div>
        ) : (
          <div className="text-[10px] font-medium text-gray-600">No prior data</div>
        )}

        {description && (
          <p className="mt-2 text-[10px] text-gray-600 leading-snug">{description}</p>
        )}
      </div>
    </div>
  );
}
