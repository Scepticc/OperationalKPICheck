'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, RefreshCw, ArrowUpCircle, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImportResult } from '@/types';

interface CSVImporterProps {
  type: 'outbound' | 'inbound';
  label: string;
  description: string;
  accent: 'blue' | 'emerald';
}

type ImportState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: ImportResult }
  | { status: 'error'; message: string };

const accentStyles = {
  blue: {
    border: 'border-blue-600/30',
    bg: 'bg-blue-600/5',
    text: 'text-blue-600',
    badge: 'bg-blue-600/10 text-blue-700',
    icon: 'bg-blue-600/10',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  emerald: {
    border: 'border-emerald-600/30',
    bg: 'bg-emerald-600/5',
    text: 'text-emerald-600',
    badge: 'bg-emerald-600/10 text-emerald-700',
    icon: 'bg-emerald-600/10',
    button: 'bg-emerald-600 hover:bg-emerald-700',
  },
};

export default function CSVImporter({
  type,
  label,
  description,
  accent,
}: CSVImporterProps) {
  const [state, setState] = useState<ImportState>({ status: 'idle' });
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const styles = accentStyles[accent];

  async function uploadFile(file: File) {
    setFileName(file.name);
    setState({ status: 'loading' });
    setShowDuplicates(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/import/${type}`, {
        method: 'POST',
        body: formData,
      });
      const text = await res.text();
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(text);
      } catch {
        setState({ status: 'error', message: `Server error: ${text.slice(0, 300)}` });
        return;
      }
      if (!res.ok) {
        setState({ status: 'error', message: (data.error as string) ?? 'Import failed' });
      } else {
        setState({ status: 'success', result: data as unknown as ImportResult });
      }
    } catch (err) {
      setState({ status: 'error', message: String(err) });
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) uploadFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  }

  function reset() {
    setState({ status: 'idle' });
    setFileName(null);
    setShowDuplicates(false);
  }

  const isLoading = state.status === 'loading';

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className={cn('px-5 py-4 border-b border-slate-100', styles.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', styles.icon)}>
              <Upload className={cn('w-4 h-4', styles.text)} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>
          {state.status !== 'idle' && (
            <button onClick={reset} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Drop zone */}
        <div
          onClick={() => !isLoading && fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer',
            dragOver
              ? cn(styles.border, styles.bg)
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50',
            isLoading && 'cursor-not-allowed opacity-60'
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              <div>
                <p className="text-sm font-medium text-slate-600">Processing...</p>
                <p className="text-xs text-slate-400 mt-0.5">{fileName}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-slate-300" />
              <div>
                <p className="text-sm text-slate-600">
                  Drop CSV file here or <span className={styles.text}>browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  .csv files only
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Success Result */}
        {state.status === 'success' && (
          <div className="space-y-3">
            {/* Summary bar */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200/60">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-sm font-medium text-emerald-800">Import complete</span>
              <span className="text-xs text-emerald-600 ml-auto">{fileName}</span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total', value: state.result.total, color: 'text-slate-700' },
                { label: 'New', value: state.result.inserted, color: 'text-emerald-600' },
                { label: 'Updated', value: state.result.updated, color: 'text-blue-600' },
                { label: 'Errors', value: state.result.errors.length, color: state.result.errors.length > 0 ? 'text-red-600' : 'text-slate-400' },
              ].map((s) => (
                <div key={s.label} className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <p className={cn('text-lg font-bold tabular-nums', s.color)}>
                    {s.value.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Duplicate review */}
            {state.result.duplicates.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowDuplicates(!showDuplicates)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-amber-50/50 hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileWarning className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700">
                      {state.result.duplicates.length} duplicate{state.result.duplicates.length > 1 ? 's' : ''} found
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-amber-600 px-1.5 py-0.5 rounded bg-amber-100">
                      {state.result.updated} updated
                    </span>
                    <svg className={cn('w-3 h-3 text-amber-500 transition-transform', showDuplicates && 'rotate-180')} viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>

                {showDuplicates && (
                  <div className="max-h-48 overflow-y-auto border-t border-slate-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-3 py-1.5 text-left font-semibold text-slate-500">Row</th>
                          <th className="px-3 py-1.5 text-left font-semibold text-slate-500">Key</th>
                          <th className="px-3 py-1.5 text-right font-semibold text-slate-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {state.result.duplicates.map((d, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="px-3 py-1.5 text-slate-600 tabular-nums">{d.row}</td>
                            <td className="px-3 py-1.5 text-slate-500 font-mono truncate max-w-[200px]">{d.key}</td>
                            <td className="px-3 py-1.5 text-right">
                              <span className={cn(
                                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold',
                                d.action === 'updated'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-500'
                              )}>
                                {d.action === 'updated' ? <RefreshCw className="w-2.5 h-2.5" /> : null}
                                {d.action}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Errors */}
            {state.result.errors.length > 0 && (
              <div className="rounded-lg border border-red-200/60 bg-red-50/50 p-3">
                <p className="text-xs font-semibold text-red-700 mb-1.5">
                  Errors ({state.result.errors.length}):
                </p>
                <ul className="text-xs text-red-600 space-y-0.5 max-h-24 overflow-y-auto font-mono">
                  {state.result.errors.map((e, i) => (
                    <li key={i} className="truncate">{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Import another */}
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              Import another file
            </button>
          </div>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <div className="rounded-lg border border-red-200/60 bg-red-50/50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-red-800">Import failed</p>
                <p className="text-xs text-red-600 mt-1 break-words">{state.message}</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
