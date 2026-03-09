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
    <div className="card px-4 py-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-navy-500" />
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-navy-500">Filters</span>
        </div>

        <div className="w-px h-4 bg-gray-200 shrink-0" />

        {filters.map((f) => (
          <div key={f.key} className="relative">
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              title={f.label}
              className={cn(
                'h-8 pl-3 pr-7 text-xs rounded-lg border transition-all duration-200 appearance-none cursor-pointer font-medium',
                'bg-white focus:outline-none focus:ring-1 focus:ring-lime-500/30',
                f.value
                  ? 'border-lime-500/50 text-lime-700 bg-lime-50'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800'
              )}
            >
              <option value="">{f.label}: All</option>
              {f.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              <svg className="w-3 h-3 text-gray-400" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {f.value && (
              <button
                onClick={() => f.onChange('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-lime-500/60 hover:text-lime-600 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ))}

        {onGranularityChange && (
          <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden h-8 shrink-0 bg-gray-50">
            {(['day', 'week', 'month'] as const).map((g) => (
              <button
                key={g}
                onClick={() => onGranularityChange(g)}
                className={cn(
                  'h-full px-3 text-[11px] font-medium capitalize transition-all duration-200',
                  granularity === g
                    ? 'bg-lime-500 text-white shadow-md shadow-lime-500/20'
                    : 'text-gray-500 hover:text-navy-700'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {hasActive && onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors ml-auto"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
