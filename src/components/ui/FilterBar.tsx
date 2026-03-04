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
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Filters
          </span>
        </div>

        <div className="w-px h-4 bg-gray-200 shrink-0" />

        {filters.map((f) => (
          <div key={f.key} className="relative">
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              title={f.label}
              className={cn(
                'h-7 pl-2.5 pr-6 text-xs rounded-md border transition-colors duration-100 appearance-none cursor-pointer font-medium',
                'bg-gray-50 text-gray-700',
                'focus:outline-none focus:ring-1 focus:ring-blue-500/30',
                f.value
                  ? 'border-blue-500/50 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <option value="">{f.label}: All</option>
              {f.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
              <svg className="w-3 h-3 text-gray-400" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {f.value && (
              <button
                onClick={() => f.onChange('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ))}

        {onGranularityChange && (
          <div className="flex items-center rounded-md border border-gray-200 overflow-hidden h-7 shrink-0">
            {(['day', 'week', 'month'] as const).map((g) => (
              <button
                key={g}
                onClick={() => onGranularityChange(g)}
                className={cn(
                  'h-full px-2.5 text-[11px] font-semibold capitalize transition-colors duration-100',
                  granularity === g
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-500 hover:text-gray-700'
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
            className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors ml-auto"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
