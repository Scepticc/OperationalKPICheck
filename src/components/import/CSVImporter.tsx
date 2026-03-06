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
  | { status: 'loading'; progress?: string }
  | { status: 'success'; result: ImportResult }
  | { status: 'error'; message: string };

const BATCH_SIZE = 300;

const accentStyles = {
  lime: {
    border: 'border-lime-500/40',
    bg: 'bg-lime-50',
    text: 'text-lime-600',
    badge: 'bg-lime-50 text-lime-600',
    icon: 'bg-lime-50',
    button: 'bg-lime-500 hover:bg-lime-400',
  },
  cyan: {
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    badge: 'bg-cyan-50 text-cyan-600',
    icon: 'bg-cyan-50',
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
    setState({ status: 'loading', progress: 'Reading file...' });
    setShowDuplicates(false);

    try {
      let text = await file.text();
      // Strip BOM if present
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

      // Split into lines, keeping header separate
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        setState({ status: 'error', message: 'CSV file has no data rows' });
        return;
      }

      const headerLine = lines[0];
      const dataLines = lines.slice(1);
      const totalRows = dataLines.length;
      const totalBatches = Math.ceil(totalRows / BATCH_SIZE);

      let totalInserted = 0;
      let totalUpdated = 0;
      const allErrors: string[] = [];
      const allDuplicates: { row: number; key: string; action: 'updated' | 'skipped' }[] = [];

      for (let i = 0; i < totalBatches; i++) {
        const batchStart = i * BATCH_SIZE;
        const batchDataLines = dataLines.slice(batchStart, batchStart + BATCH_SIZE);

        setState({
          status: 'loading',
          progress: `Uploading batch ${i + 1} of ${totalBatches} (${Math.min(batchStart + BATCH_SIZE, totalRows)}/${totalRows} rows)...`,
        });

        // Reconstruct a mini CSV: header + batch data lines
        const csvChunk = headerLine + '\n' + batchDataLines.join('\n');

        const res = await fetch(`/api/import/${type}/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvChunk, batchIndex: batchStart }),
        });

        const responseText = await res.text();
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(responseText);
        } catch {
          setState({ status: 'error', message: `Server error on batch ${i + 1}: ${responseText.slice(0, 300)}` });
          return;
        }

        if (!res.ok) {
          setState({ status: 'error', message: (data.error as string) ?? `Batch ${i + 1} failed` });
          return;
        }

        totalInserted += (data.inserted as number) ?? 0;
        totalUpdated += (data.updated as number) ?? 0;
        if (Array.isArray(data.errors)) allErrors.push(...(data.errors as string[]));
        if (Array.isArray(data.duplicates)) allDuplicates.push(...(data.duplicates as { row: number; key: string; action: 'updated' | 'skipped' }[]));
      }

      const result: ImportResult = {
        inserted: totalInserted,
        updated: totalUpdated,
        skipped: totalRows - totalInserted - totalUpdated - allErrors.length,
        total: totalRows,
        errors: allErrors.slice(0, 20),
        duplicates: allDuplicates.slice(0, 100),
      };

      setState({ status: 'success', result });
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
      <div className={cn('px-5 py-4 border-b border-gray-200', styles.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', styles.icon)}>
              <Upload className={cn('w-4 h-4', styles.text)} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-navy-900">{label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
          </div>
          {state.status !== 'idle' && !isLoading && (
            <button onClick={reset} className="text-gray-400 hover:text-gray-600 transition-colors">
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
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
            isLoading && 'cursor-not-allowed opacity-60'
          )}
        >
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} disabled={isLoading} />

          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-lime-500 rounded-full animate-spin" />
              <div>
                <p className="text-sm font-medium text-gray-700">Processing...</p>
                <p className="text-xs text-gray-500 mt-0.5">{state.status === 'loading' && state.progress ? state.progress : fileName}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-gray-300" />
              <div>
                <p className="text-sm text-gray-500">
                  Drop CSV file here or <span className={styles.text}>browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">.csv files only</p>
              </div>
            </div>
          )}
        </div>

        {/* Success Result */}
        {state.status === 'success' && (
          <div className="space-y-3 animate-slide-up">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-lime-50 border border-lime-200">
              <CheckCircle className="w-4 h-4 text-lime-600 shrink-0" />
              <span className="text-sm font-medium text-lime-700">Import complete</span>
              <span className="text-xs text-lime-500 ml-auto">{fileName}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total', value: state.result.total, color: 'text-navy-900' },
                { label: 'New', value: state.result.inserted, color: 'text-lime-600' },
                { label: 'Updated', value: state.result.updated, color: 'text-cyan-600' },
                { label: 'Errors', value: state.result.errors.length, color: state.result.errors.length > 0 ? 'text-red-500' : 'text-gray-400' },
              ].map((s) => (
                <div key={s.label} className="text-center p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                  <p className={cn('text-lg font-bold tabular-nums', s.color)}>{s.value.toLocaleString()}</p>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Duplicate review */}
            {state.result.duplicates.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowDuplicates(!showDuplicates)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-amber-50 hover:bg-amber-100/80 transition-colors"
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
                  <div className="max-h-48 overflow-y-auto border-t border-gray-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-1.5 text-left font-semibold text-gray-500">Row</th>
                          <th className="px-3 py-1.5 text-left font-semibold text-gray-500">Key</th>
                          <th className="px-3 py-1.5 text-right font-semibold text-gray-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {state.result.duplicates.map((d, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-1.5 text-gray-600 tabular-nums">{d.row}</td>
                            <td className="px-3 py-1.5 text-gray-500 font-mono truncate max-w-[200px]">{d.key}</td>
                            <td className="px-3 py-1.5 text-right">
                              <span className={cn(
                                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                                d.action === 'updated'
                                  ? 'bg-cyan-50 text-cyan-600'
                                  : 'bg-gray-100 text-gray-500'
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
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-semibold text-red-600 mb-1.5">Errors ({state.result.errors.length}):</p>
                <ul className="text-xs text-red-500 space-y-0.5 max-h-24 overflow-y-auto font-mono">
                  {state.result.errors.map((e, i) => <li key={i} className="truncate">{e}</li>)}
                </ul>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-500 hover:text-lime-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              Import another file
            </button>
          </div>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 animate-slide-up">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-red-600">Import failed</p>
                <p className="text-xs text-red-500 mt-1 break-words">{state.message}</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
