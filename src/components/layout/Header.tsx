'use client';

import { Sun, Moon, Calendar, ChevronDown, Database, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useState, useRef, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { cn, getDateRangeOptions } from '@/lib/utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface HeaderProps {
  title: string;
  showDatePicker?: boolean;
}

interface FullRangeResponse {
  startDate: string | null;
  endDate: string | null;
}

/** Safely parse a YYYY-MM-DD string without timezone shift */
function safeParse(dateStr: string): Date {
  const d = parseISO(dateStr);
  return isValid(d) ? d : new Date();
}

export default function Header({ title, showDatePicker = true }: HeaderProps) {
  const { theme, toggleTheme, globalStartDate, globalEndDate, setGlobalDates } = useApp();
  const [showPicker, setShowPicker] = useState(false);
  const [tempStart, setTempStart] = useState<Date | null>(safeParse(globalStartDate));
  const [tempEnd, setTempEnd] = useState<Date | null>(safeParse(globalEndDate));
  const [fullRange, setFullRange] = useState<FullRangeResponse | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const presets = getDateRangeOptions();

  useEffect(() => {
    fetch('/api/date-range')
      .then((r) => r.json())
      .then((d: FullRangeResponse) => {
        if (d?.startDate && d?.endDate) {
          setFullRange(d);
        }
      })
      .catch(() => setFullRange(null));
  }, []);

  useEffect(() => {
    setTempStart(safeParse(globalStartDate));
    setTempEnd(safeParse(globalEndDate));
  }, [globalStartDate, globalEndDate]);

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
    if (!tempStart || !tempEnd) return;
    const start = tempStart <= tempEnd ? tempStart : tempEnd;
    const end = tempStart <= tempEnd ? tempEnd : tempStart;
    setGlobalDates(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
    setShowPicker(false);
  }

  function applyPreset(preset: { startDate: string; endDate: string }) {
    setGlobalDates(preset.startDate, preset.endDate);
    setShowPicker(false);
  }

  function applyWholeData() {
    if (!fullRange?.startDate || !fullRange?.endDate) return;
    setGlobalDates(fullRange.startDate, fullRange.endDate);
    setShowPicker(false);
  }

  const displayStart = safeParse(globalStartDate);
  const displayEnd = safeParse(globalEndDate);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Financial Control Cockpit</p>
        <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {showDatePicker && (
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
                {format(displayStart, 'dd MMM yyyy')}
                <span className="text-gray-400 mx-1">–</span>
                {format(displayEnd, 'dd MMM yyyy')}
              </span>
              <ChevronDown className={cn('w-3 h-3 text-gray-400 transition-transform duration-150', showPicker && 'rotate-180')} />
            </button>

            {showPicker && (
              <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-[560px]">
                <div className="flex gap-4">
                  <div className="w-40 shrink-0 border-r border-gray-100 dark:border-gray-800 pr-4">
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

                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <button
                        onClick={applyWholeData}
                        disabled={!fullRange?.startDate || !fullRange?.endDate}
                        className="w-full text-left px-2 py-1.5 text-xs rounded-md flex items-center gap-1.5 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      >
                        <Database className="w-3 h-3" />
                        Whole dataset
                      </button>
                      <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <ShieldAlert className="w-2.5 h-2.5" />
                        Board-level reporting range
                      </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex gap-3">
                      <div>
                        <p className="label mb-2">From</p>
                        <DatePicker selected={tempStart} onChange={(d) => setTempStart(d)} selectsStart startDate={tempStart} endDate={tempEnd} inline />
                      </div>
                      <div>
                        <p className="label mb-2">To</p>
                        <DatePicker selected={tempEnd} onChange={(d) => setTempEnd(d)} selectsEnd startDate={tempStart} endDate={tempEnd} minDate={tempStart ?? undefined} inline />
                      </div>
                    </div>
                    <div className="flex justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 gap-2">
                      <button onClick={() => setShowPicker(false)} className="btn-secondary py-1.5 px-3 text-xs">Cancel</button>
                      <button onClick={applyDates} className="btn-primary py-1.5 px-4 text-xs">Apply</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
