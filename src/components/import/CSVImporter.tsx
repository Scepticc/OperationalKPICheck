'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, RefreshCw, ArrowUpCircle, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImportResult } from '@/types';

interface CSVImporterProps {
  type: 'outbound' | 'inbound';
  label: string;
  description: string;
  accent: 'lime' | 'cyan';
}

type ImportState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: ImportResult }
  | { status: 'error'; message: string };

const accentStyles = {
  lime: {
    border: 'border-lime-500/30',
    bg: 'bg-lime-500/5',
    text: 'text-lime-400',
    badge: 'bg-lime-500/10 text-lime-400',
    icon: 'bg-lime-500/10',
    button: 'bg-lime-500 hover:bg-lime-400',
  },
  cyan: {
    border: 'border-cyan-400/30',
    bg: 'bg-cyan-400/5',
    text: 'text-cyan-400',
    badge: 'bg-cyan-400/10 text-cyan-400',
    icon: 'bg-cyan-400/10',
    button: 'bg-cyan-500 hover:bg-cyan-400',
  },
};

export default function CSVImporter({ type, label, description, accent }: CSVImporterProps) {
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
      const res = await fetch(`/api/import/${type}`, { method: 'POST', body: formData });
      const text = await res.text();
      let data: Record<string, unknown>;
      try { data = JSON.parse(text); } catch {
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
      <div className={cn('px-5 py-4 border-b border-navy-800/40', styles.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', styles.icon)}>
              <Upload className={cn('w-4 h-4', styles.text)} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
          </div>
          {state.status !== 'idle' && (
            <button onClick={reset} className="text-gray-500 hover:text-gray-300 transition-colors">
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
            'relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer',
            dragOver
              ? cn(styles.border, styles.bg)
              : 'border-navy-700/40 hover:border-navy-600/60 hover:bg-navy-800/20',
            isLoading && 'cursor-not-allowed opacity-60'
          )}
        >
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} disabled={isLoading} />

          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-navy-700 border-t-lime-500 rounded-full animate-spin" />
              <div>
                <p className="text-sm font-medium text-gray-300">Processing...</p>
                <p className="text-xs text-gray-600 mt-0.5">{fileName}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-navy-600" />
              <div>
                <p className="text-sm text-gray-400">
                  Drop CSV file here or <span className={styles.text}>browse</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">.csv files only</p>
              </div>
            </div>
          )}
        </div>

        {/* Success Result */}
        {state.status === 'success' && (
          <div className="space-y-3 animate-slide-up">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-lime-500/10 border border-lime-500/20">
              <CheckCircle className="w-4 h-4 text-lime-500 shrink-0" />
              <span className="text-sm font-medium text-lime-400">Import complete</span>
              <span className="text-xs text-lime-500/60 ml-auto">{fileName}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total', value: state.result.total, color: 'text-white' },
                { label: 'New', value: state.result.inserted, color: 'text-lime-400' },
                { label: 'Updated', value: state.result.updated, color: 'text-cyan-400' },
                { label: 'Errors', value: state.result.errors.length, color: state.result.errors.length > 0 ? 'text-red-400' : 'text-gray-600' },
              ].map((s) => (
                <div key={s.label} className="text-center p-2.5 rounded-lg bg-navy-800/40 border border-navy-700/30">
                  <p className={cn('text-lg font-bold tabular-nums', s.color)}>{s.value.toLocaleString()}</p>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Duplicate review */}
            {state.result.duplicates.length > 0 && (
              <div className="border border-navy-700/40 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowDuplicates(!showDuplicates)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileWarning className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400">
                      {state.result.duplicates.length} duplicate{state.result.duplicates.length > 1 ? 's' : ''} found
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-amber-400/80 px-1.5 py-0.5 rounded bg-amber-500/10">
                      {state.result.updated} updated
                    </span>
                    <svg className={cn('w-3 h-3 text-amber-400/50 transition-transform', showDuplicates && 'rotate-180')} viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>

                {showDuplicates && (
                  <div className="max-h-48 overflow-y-auto border-t border-navy-700/40">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-navy-800/40">
                          <th className="px-3 py-1.5 text-left font-semibold text-gray-500">Row</th>
                          <th className="px-3 py-1.5 text-left font-semibold text-gray-500">Key</th>
                          <th className="px-3 py-1.5 text-right font-semibold text-gray-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-800/40">
                        {state.result.duplicates.map((d, i) => (
                          <tr key={i} className="hover:bg-navy-800/20">
                            <td className="px-3 py-1.5 text-gray-400 tabular-nums">{d.row}</td>
                            <td className="px-3 py-1.5 text-gray-500 font-mono truncate max-w-[200px]">{d.key}</td>
                            <td className="px-3 py-1.5 text-right">
                              <span className={cn(
                                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                                d.action === 'updated'
                                  ? 'bg-cyan-400/10 text-cyan-400'
                                  : 'bg-gray-500/10 text-gray-500'
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
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs font-semibold text-red-400 mb-1.5">Errors ({state.result.errors.length}):</p>
                <ul className="text-xs text-red-400/80 space-y-0.5 max-h-24 overflow-y-auto font-mono">
                  {state.result.errors.map((e, i) => <li key={i} className="truncate">{e}</li>)}
                </ul>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-500 hover:text-lime-400 border border-navy-700/40 rounded-lg hover:bg-navy-800/40 transition-all"
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              Import another file
            </button>
          </div>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 animate-slide-up">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-red-400">Import failed</p>
                <p className="text-xs text-red-400/70 mt-1 break-words">{state.message}</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/5 transition-all"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
