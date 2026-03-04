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
    <header className="flex items-center justify-between px-6 py-3.5 bg-navy-950/50 border-b border-navy-800/40 shrink-0 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold text-white tracking-tight">{title}</h1>
        <div className="h-4 w-px bg-navy-700/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse-slow" />
        <span className="text-[10px] text-lime-500/60 font-medium uppercase tracking-wider">Live</span>
      </div>

      {showDatePicker && (
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 bg-navy-900/60 rounded-lg p-1 border border-navy-800/40">
            {presets.map((p) => {
              const isActive = globalStartDate === p.startDate && globalEndDate === p.endDate;
              return (
                <button
                  key={p.label}
                  onClick={() => setGlobalDates(p.startDate, p.endDate)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all',
                    isActive
                      ? 'bg-lime-500 text-navy-950 shadow-md shadow-lime-500/20'
                      : 'text-gray-500 hover:text-lime-400 hover:bg-navy-800/60'
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-navy-800/40 hidden md:block" />

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-lime-500/50 shrink-0" />
            <input
              type="date"
              value={globalStartDate}
              onChange={(e) => e.target.value && setGlobalDates(e.target.value, globalEndDate)}
              className="input h-7 py-0 text-xs w-[130px] tabular-nums"
            />
            <span className="text-navy-600 text-xs">&ndash;</span>
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
