'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
}

interface FetchState<T> {
  data: T[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

function SortIcon({
  col,
  currentCol,
  dir,
}: {
  col: string;
  currentCol: string;
  dir: 'asc' | 'desc';
}) {
  if (col !== currentCol) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />;
  return dir === 'asc' ? (
    <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
  ) : (
    <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
  );
}

export default function DataTable<T extends object>({
  columns,
  fetchUrl,
  extraParams = {},
}: DataTableProps<T>) {
  const [state, setState] = useState<FetchState<T>>({
    data: [],
    total: 0,
    totalPages: 0,
    loading: false,
    error: null,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [searchInput, setSearchInput] = useState('');

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        sortCol,
        sortDir,
        ...extraParams,
      });
      const res = await fetch(`${fetchUrl}?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setState({
        data: json.data ?? [],
        total: json.total ?? 0,
        totalPages: json.totalPages ?? 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: String(err),
      }));
    }
  }, [fetchUrl, page, pageSize, search, sortCol, sortDir, extraParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 when extraParams change
  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(extraParams)]); // eslint-disable-line

  function handleSort(key: string) {
    if (sortCol === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(key);
      setSortDir('desc');
    }
    setPage(1);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function renderCell(row: T, col: ColumnDef<T>) {
    if (col.render) return col.render(row);
    const val = row[col.key as keyof T];
    if (val === null || val === undefined) return <span className="text-slate-400">—</span>;
    // Date formatting
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val) && col.key.toString().includes('date')) {
      return formatDate(val);
    }
    return String(val);
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, state.total);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9 w-72"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary text-sm px-3 py-2">
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </form>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Rows per page:</span>
          <select
            className="input py-1 pr-8"
            value={pageSize}
            onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}
          >
            {[25, 50, 100, 200].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={cn('table-th', col.width && `w-${col.width}`)}
                    onClick={() => col.sortable !== false && handleSort(String(col.key))}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable !== false && (
                        <SortIcon
                          col={String(col.key)}
                          currentCol={sortCol}
                          dir={sortDir}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {state.loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : state.error ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-red-500">
                    Error: {state.error}
                  </td>
                </tr>
              ) : state.data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                    No data found
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {state.total > 0
              ? `Showing ${start}–${end} of ${state.total.toLocaleString()} rows`
              : 'No results'}
          </p>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm px-2 text-slate-600 dark:text-slate-300">
              Page {page} of {state.totalPages || 1}
            </span>
            <button
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(state.totalPages, p + 1))}
              disabled={page >= state.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
              onClick={() => setPage(state.totalPages)}
              disabled={page >= state.totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
