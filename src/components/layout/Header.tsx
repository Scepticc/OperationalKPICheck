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
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
      <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        {/* Date range picker */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-100',
              'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
              'text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
              showPicker && 'border-blue-500 dark:border-blue-500 ring-1 ring-blue-500/20'
            )}
          >
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="tabular-nums">
              {format(new Date(globalStartDate), 'dd MMM yyyy')}
              <span className="text-gray-400 mx-1">-</span>
              {format(new Date(globalEndDate), 'dd MMM yyyy')}
            </span>
            <ChevronDown className={cn(
              'w-3 h-3 text-gray-400 transition-transform duration-150',
              showPicker && 'rotate-180'
            )} />
          </button>

          {showPicker && (
            <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-[520px]">
              <div className="flex gap-4">
                {/* Presets */}
                <div className="w-32 shrink-0">
                  <p className="label mb-2">Quick select</p>
                  <div className="space-y-0.5">
                    {presets.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => applyPreset(p)}
                        className="w-full text-left px-2 py-1.5 text-xs rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
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
                  <div className="flex justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={() => setShowPicker(false)} className="btn-secondary mr-2 py-1.5 px-3 text-xs">
                      Cancel
                    </button>
                    <button onClick={applyDates} className="btn-primary py-1.5 px-4 text-xs">
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
          className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-100"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
}
