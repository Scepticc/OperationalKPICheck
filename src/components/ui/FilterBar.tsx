'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  key: string;
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

interface FilterBarProps {
  filters: FilterOption[];
  granularity?: string;
  onGranularityChange?: (g: string) => void;
  onClear?: () => void;
}

export default function FilterBar({ filters, granularity, onGranularityChange, onClear }: FilterBarProps) {
  const hasActive = filters.some((f) => f.value !== '') || (granularity && granularity !== 'day');

  return (
    <div className="bg-white dark:bg-[#0c1829] border border-slate-200 dark:border-[#162035] rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Label */}
        <div className="flex items-center gap-1.5 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
            Filters
          </span>
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-[#1d2f4d] shrink-0" />

        {/* Dropdowns */}
        {filters.map((f) => (
          <div key={f.key} className="relative">
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              title={f.label}
              className={cn(
                'h-8 pl-3 pr-7 text-xs rounded-lg border transition-all duration-150 appearance-none cursor-pointer font-medium',
                'bg-slate-50 dark:bg-[#0f1e36] text-slate-700 dark:text-slate-300',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/30',
                f.value
                  ? 'border-blue-400 dark:border-blue-600/70 bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-[#1d2f4d] hover:border-slate-300 dark:hover:border-[#243a5e]'
              )}
            >
              <option value="">{f.label}: All</option>
              {f.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {/* Custom arrow */}
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              <svg className="w-3 h-3 text-slate-400" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {f.value && (
              <button
                onClick={() => f.onChange('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        {/* Granularity toggle */}
        {onGranularityChange && (
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-[#1d2f4d] overflow-hidden h-8 shrink-0">
            {(['day', 'week', 'month'] as const).map((g) => (
              <button
                key={g}
                onClick={() => onGranularityChange(g)}
                className={cn(
                  'h-full px-3 text-xs font-semibold capitalize transition-all duration-150',
                  granularity === g
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 dark:bg-[#0f1e36] text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Clear */}
        {hasActive && onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-auto"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
