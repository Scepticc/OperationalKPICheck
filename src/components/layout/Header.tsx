'use client';

import { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDateRangeOptions, cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  showDatePicker?: boolean;
  showExport?: boolean;
}

export default function Header({ title, showDatePicker = true, showExport = true }: HeaderProps) {
  const { globalStartDate, globalEndDate, setGlobalDates } = useApp();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const params = new URLSearchParams({ startDate: globalStartDate, endDate: globalEndDate });
      const res = await fetch(`/api/export?${params}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `operational-kpi-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  }
  const presets = getDateRangeOptions();

  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-200 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-medium text-navy-900 tracking-tight">{title}</h1>
        <div className="h-4 w-px bg-gray-200" />
        <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse-slow" />
        <span className="text-[10px] text-lime-600 font-medium uppercase tracking-wider">Live</span>
      </div>

      {showDatePicker && (
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1 border border-gray-200">
            {presets.map((p) => {
              const isActive = globalStartDate === p.startDate && globalEndDate === p.endDate;
              return (
                <button
                  key={p.label}
                  onClick={() => setGlobalDates(p.startDate, p.endDate)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
                    isActive
                      ? 'bg-lime-500 text-white shadow-md shadow-lime-500/20'
                      : 'text-gray-500 hover:text-navy-700 hover:bg-white'
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-gray-200 hidden md:block" />

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-navy-500 shrink-0" />
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

          {showExport && (
            <>
              <div className="w-px h-5 bg-gray-200" />
              <button
                onClick={handleExport}
                disabled={exporting}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border',
                  exporting
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100'
                )}
              >
                <Download className="w-3.5 h-3.5" />
                {exporting ? 'Exporting...' : 'Export Excel'}
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
