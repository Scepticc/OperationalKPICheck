'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  X,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends object> {
  columns: ColumnDef<T>[];
  fetchUrl: string;
  extraParams?: Record<string, string>;
  dateColumn?: string;
}

interface FetchState<T> {
  data: T[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

function SortIcon({ col, currentCol, dir }: { col: string; currentCol: string; dir: 'asc' | 'desc' }) {
  if (col !== currentCol) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
  return dir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-blue-600" />
    : <ChevronDown className="w-3 h-3 text-blue-600" />;
}

export default function DataTable<T extends object>({
  columns,
  fetchUrl,
  extraParams,
  dateColumn,
}: DataTableProps<T>) {
  const [state, setState] = useState<FetchState<T>>({
    data: [], total: 0, totalPages: 0, loading: false, error: null,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [searchInput, setSearchInput] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Stable string to avoid infinite loops from new object references on each render
  const extraParamsJson = JSON.stringify(extraParams ?? {});
  const prevExtraParamsRef = useRef(extraParamsJson);

  const fetchData = useCallback(async (pg: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const extra = JSON.parse(extraParamsJson) as Record<string, string>;
      const qp = new URLSearchParams({
        page: String(pg),
        pageSize: String(pageSize),
        search,
        sortCol,
        sortDir,
        ...extra,
      });
      if (dateStart) qp.set('startDate', dateStart);
      if (dateEnd) qp.set('endDate', dateEnd);

      const res = await fetch(`${fetchUrl}?${qp}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setState({ data: json.data ?? [], total: json.total ?? 0, totalPages: json.totalPages ?? 0, loading: false, error: null });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: String(err) }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUrl, pageSize, search, sortCol, sortDir, extraParamsJson, dateStart, dateEnd]);

  useEffect(() => {
    let pg = page;
    if (prevExtraParamsRef.current !== extraParamsJson) {
      prevExtraParamsRef.current = extraParamsJson;
      pg = 1;
      setPage(1);
    }
    fetchData(pg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  function handleSort(key: string) {
    if (sortCol === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(key); setSortDir('desc'); }
    setPage(1);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchData(newPage);
  }

  function clearDateFilter() {
    setDateStart('');
    setDateEnd('');
    setPage(1);
  }

  function renderCell(row: T, col: ColumnDef<T>) {
    if (col.render) return col.render(row);
    const val = row[col.key as keyof T];
    if (val === null || val === undefined) return <span className="text-gray-300">{'\u2014'}</span>;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val) && col.key.toString().includes('date')) {
      return formatDate(val);
    }
    return String(val);
  }

  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, state.total);
  const hasDateFilter = dateStart || dateEnd;

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              className="input pl-7 w-56 h-7 py-0 text-xs"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary h-7 px-2.5 py-0 text-xs">Go</button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        {dateColumn && (
          <div className="flex items-center gap-1.5 ml-auto">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="date"
              value={dateStart}
              onChange={(e) => { setDateStart(e.target.value); setPage(1); }}
              className={cn('input h-7 py-0 text-xs w-32', dateStart && 'border-blue-500/50 bg-blue-50')}
            />
            <span className="text-gray-400 text-xs">&ndash;</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => { setDateEnd(e.target.value); setPage(1); }}
              className={cn('input h-7 py-0 text-xs w-32', dateEnd && 'border-blue-500/50 bg-blue-50')}
            />
            {hasDateFilter && (
              <button onClick={clearDateFilter} className="text-gray-400 hover:text-red-500 transition-colors p-0.5" title="Clear date filter">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div className={cn('flex items-center gap-2 text-xs text-gray-400', !dateColumn && 'ml-auto')}>
          <span>Rows:</span>
          <select
            className="input h-7 py-0 pr-6 text-xs"
            value={pageSize}
            onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}
          >
            {[25, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={cn('table-th', col.width && `w-${col.width}`)}
                    onClick={() => col.sortable !== false && handleSort(String(col.key))}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable !== false && (
                        <SortIcon col={String(col.key)} currentCol={sortCol} dir={sortDir} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {state.loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : state.error ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-sm text-red-500">
                    Error: {state.error}
                  </td>
                </tr>
              ) : state.data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-sm text-gray-400">
                    No results found
                  </td>
                </tr>
              ) : (
                state.data.map((row, i) => (
                  <tr key={((row as Record<string, unknown>).id as string | number) ?? i} className="table-row">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="table-td">
                        {renderCell(row, col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400 tabular-nums">
            {state.total > 0 ? `${start.toLocaleString()}\u2013${end.toLocaleString()} of ${state.total.toLocaleString()}` : 'No results'}
          </p>
          <div className="flex items-center gap-0.5">
            {[
              { icon: <ChevronsLeft className="w-3.5 h-3.5" />,  action: () => handlePageChange(1),                                     disabled: page === 1 },
              { icon: <ChevronLeft  className="w-3.5 h-3.5" />,  action: () => handlePageChange(Math.max(1, page - 1)),                  disabled: page === 1 },
              { icon: <ChevronRight className="w-3.5 h-3.5" />,  action: () => handlePageChange(Math.min(state.totalPages, page + 1)),   disabled: page >= state.totalPages },
              { icon: <ChevronsRight className="w-3.5 h-3.5" />, action: () => handlePageChange(state.totalPages),                       disabled: page >= state.totalPages },
            ].map((btn, idx) => (
              <button
                key={idx}
                className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                onClick={btn.action}
                disabled={btn.disabled}
              >
                {btn.icon}
              </button>
            ))}
            <span className="text-xs text-gray-400 px-2 tabular-nums">
              {page} / {state.totalPages || 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
