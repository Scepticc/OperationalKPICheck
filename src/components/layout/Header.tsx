'use client';

import { Sun, Moon, Calendar, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { cn, getDateRangeOptions } from '@/lib/utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { theme, toggleTheme, globalStartDate, globalEndDate, setGlobalDates } = useApp();
  const [showPicker, setShowPicker] = useState(false);
  const [tempStart, setTempStart] = useState<Date | null>(new Date(globalStartDate));
  const [tempEnd, setTempEnd] = useState<Date | null>(new Date(globalEndDate));
  const pickerRef = useRef<HTMLDivElement>(null);
  const presets = getDateRangeOptions();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showPicker]);

  function applyDates() {
    if (tempStart && tempEnd) {
      setGlobalDates(format(tempStart, 'yyyy-MM-dd'), format(tempEnd, 'yyyy-MM-dd'));
    }
    setShowPicker(false);
  }

  function applyPreset(preset: { startDate: string; endDate: string }) {
    setGlobalDates(preset.startDate, preset.endDate);
    setTempStart(new Date(preset.startDate));
    setTempEnd(new Date(preset.endDate));
    setShowPicker(false);
  }

  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-white dark:bg-[#0c1829] border-b border-slate-200 dark:border-[#162035] shrink-0">
      {/* Page title */}
      <h1 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        {/* Date range picker */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              'bg-slate-50 dark:bg-[#0f1e36] border border-slate-200 dark:border-[#1d2f4d]',
              'text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#243a5e]',
              showPicker && 'border-blue-400 dark:border-blue-600 ring-2 ring-blue-500/20'
            )}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="tabular-nums">
              {format(new Date(globalStartDate), 'dd MMM yyyy')}
              <span className="text-slate-400 dark:text-slate-600 mx-1.5">–</span>
              {format(new Date(globalEndDate), 'dd MMM yyyy')}
            </span>
            <ChevronDown className={cn(
              'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
              showPicker && 'rotate-180'
            )} />
          </button>

          {showPicker && (
            <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-[#0c1829] rounded-xl shadow-2xl border border-slate-200 dark:border-[#1d2f4d] p-4 w-[520px]">
              <div className="flex gap-4">
                {/* Presets */}
                <div className="w-36 shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-2.5">
                    Quick select
                  </p>
                  <div className="space-y-0.5">
                    {presets.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => applyPreset(p)}
                        className="w-full text-left px-2.5 py-1.5 text-sm rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0f1e36] hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calendars */}
                <div className="flex-1">
                  <div className="flex gap-3">
                    <div>
                      <p className="label mb-2">From</p>
                      <DatePicker
                        selected={tempStart}
                        onChange={(d) => setTempStart(d)}
                        selectsStart
                        startDate={tempStart}
                        endDate={tempEnd}
                        inline
                      />
                    </div>
                    <div>
                      <p className="label mb-2">To</p>
                      <DatePicker
                        selected={tempEnd}
                        onChange={(d) => setTempEnd(d)}
                        selectsEnd
                        startDate={tempStart}
                        endDate={tempEnd}
                        minDate={tempStart ?? undefined}
                        inline
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button onClick={applyDates} className="btn-primary px-5">
                      Apply range
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-slate-200 dark:border-[#1d2f4d] bg-slate-50 dark:bg-[#0f1e36] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-[#243a5e] transition-all duration-150"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
