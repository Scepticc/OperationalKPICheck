'use client';

import { Sun, Moon, Calendar } from 'lucide-react';
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
  const { theme, toggleTheme, globalStartDate, globalEndDate, setGlobalDates } =
    useApp();
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
      setGlobalDates(
        format(tempStart, 'yyyy-MM-dd'),
        format(tempEnd, 'yyyy-MM-dd')
      );
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
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {/* Date range picker */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
              'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600',
              'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
            )}
          >
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>
              {format(new Date(globalStartDate), 'dd MMM yyyy')} –{' '}
              {format(new Date(globalEndDate), 'dd MMM yyyy')}
            </span>
          </button>

          {showPicker && (
            <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-[520px]">
              <div className="flex gap-4">
                {/* Presets */}
                <div className="w-36 shrink-0 space-y-1">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Presets
                  </p>
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p)}
                      className="w-full text-left px-2 py-1.5 text-sm rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1">
                  <div className="flex gap-4">
                    <div>
                      <p className="label mb-1">From</p>
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
                      <p className="label mb-1">To</p>
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
                    <button
                      onClick={applyDates}
                      className="btn-primary text-sm px-4 py-1.5"
                    >
                      Apply
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
          className={cn(
            'p-2 rounded-lg border transition-colors',
            'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600',
            'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
          )}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
