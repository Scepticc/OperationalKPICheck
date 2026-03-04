'use client';

import { Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDateRangeOptions, cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  showDatePicker?: boolean;
}

export default function Header({ title, showDatePicker = true }: HeaderProps) {
  const { globalStartDate, globalEndDate, setGlobalDates } = useApp();
  const presets = getDateRangeOptions();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
      <h1 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h1>

      {showDatePicker && (
        <div className="flex items-center gap-2">
          {/* Quick presets */}
          <div className="hidden md:flex items-center gap-1">
            {presets.map((p) => {
              const isActive = globalStartDate === p.startDate && globalEndDate === p.endDate;
              return (
                <button
                  key={p.label}
                  onClick={() => setGlobalDates(p.startDate, p.endDate)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-gray-200 hidden md:block" />

          {/* Native date inputs */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="date"
              value={globalStartDate}
              onChange={(e) => e.target.value && setGlobalDates(e.target.value, globalEndDate)}
              className="input h-7 py-0 text-xs w-[130px] tabular-nums"
            />
            <span className="text-gray-400 text-xs">&ndash;</span>
            <input
              type="date"
              value={globalEndDate}
              onChange={(e) => e.target.value && setGlobalDates(globalStartDate, e.target.value)}
              className="input h-7 py-0 text-xs w-[130px] tabular-nums"
            />
          </div>
        </div>
      )}
    </header>
  );
}
