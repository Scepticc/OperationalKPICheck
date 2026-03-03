'use client';

import { Filter, X } from 'lucide-react';
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

export default function FilterBar({
  filters,
  granularity,
  onGranularityChange,
  onClear,
}: FilterBarProps) {
  const hasActive = filters.some((f) => f.value !== '') || (granularity && granularity !== 'day');

  return (
    <div className="card px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </div>

        {filters.map((f) => (
          <div key={f.key} className="flex flex-col gap-0.5">
            <label className="text-xs text-slate-400 dark:text-slate-500">{f.label}</label>
            <div className="relative">
              <select
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className={cn(
                  'input text-sm pr-8 py-1.5 min-w-[140px] max-w-[200px]',
                  f.value && 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                )}
              >
                <option value="">All</option>
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {f.value && (
                <button
                  onClick={() => f.onChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {onGranularityChange && (
          <div className="flex flex-col gap-0.5">
            <label className="text-xs text-slate-400 dark:text-slate-500">Trend</label>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden text-sm">
              {(['day', 'week', 'month'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => onGranularityChange(g)}
                  className={cn(
                    'px-3 py-1.5 font-medium transition-colors capitalize',
                    granularity === g
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasActive && onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 mt-auto py-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
