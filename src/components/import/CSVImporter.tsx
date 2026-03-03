'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImportResult } from '@/types';

interface CSVImporterProps {
  type: 'outbound' | 'inbound';
  label: string;
  description: string;
  color: string;
}

type ImportState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: ImportResult }
  | { status: 'error'; message: string };

export default function CSVImporter({
  type,
  label,
  description,
  color,
}: CSVImporterProps) {
  const [state, setState] = useState<ImportState>({ status: 'idle' });
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setFileName(file.name);
    setState({ status: 'loading' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/import/${type}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ status: 'error', message: data.error ?? 'Import failed' });
      } else {
        setState({ status: 'success', result: data as ImportResult });
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
  }

  const isLoading = state.status === 'loading';

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{label}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Upload className="w-5 h-5" style={{ color }} />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => !isLoading && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
          dragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-700/30',
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
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Uploading & processing {fileName}…
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Drop your CSV here or{' '}
                <span className="text-blue-600 dark:text-blue-400">browse files</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Supports .csv files only
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      {state.status === 'success' && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                  Import complete
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {fileName}
                </p>
              </div>
            </div>
            <button onClick={reset} className="text-emerald-400 hover:text-emerald-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { label: 'Total rows', value: state.result.total },
              { label: 'Imported', value: state.result.inserted, color: 'text-emerald-700 dark:text-emerald-300' },
              { label: 'Duplicates skipped', value: state.result.skipped, color: 'text-amber-600 dark:text-amber-400' },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-slate-800 rounded-lg p-2.5 text-center border border-emerald-100 dark:border-emerald-800">
                <p className={cn('text-xl font-bold', s.color ?? 'text-slate-800 dark:text-slate-100')}>
                  {s.value.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {state.result.errors.length > 0 && (
            <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                Errors ({state.result.errors.length}):
              </p>
              <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-0.5 max-h-24 overflow-y-auto">
                {state.result.errors.map((e, i) => (
                  <li key={i} className="truncate">{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300 text-sm">Import failed</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{state.message}</p>
              </div>
            </div>
            <button onClick={reset} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {state.status === 'idle' && (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full btn-primary text-sm"
          style={{ backgroundColor: color }}
        >
          Select CSV File
        </button>
      )}
    </div>
  );
}
