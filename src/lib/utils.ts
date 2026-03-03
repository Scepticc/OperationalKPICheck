import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';

// ─── Class merging ────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function getDefaultDateRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = subDays(end, 30);
  return {
    startDate: format(startOfDay(start), 'yyyy-MM-dd'),
    endDate: format(endOfDay(end), 'yyyy-MM-dd'),
  };
}

export function getPreviousPeriod(
  startDate: string,
  endDate: string
): { prevStart: string; prevEnd: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  return {
    prevStart: format(prevStart, 'yyyy-MM-dd'),
    prevEnd: format(prevEnd, 'yyyy-MM-dd'),
  };
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function getDateRangeOptions() {
  const today = new Date();
  return [
    {
      label: 'Last 7 days',
      startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    },
    {
      label: 'Last 30 days',
      startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    },
    {
      label: 'Last 90 days',
      startDate: format(subDays(today, 90), 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    },
    {
      label: 'Last 6 months',
      startDate: format(subMonths(today, 6), 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    },
    {
      label: 'Last 12 months',
      startDate: format(subMonths(today, 12), 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    },
  ];
}

// ─── Number formatting ────────────────────────────────────────────────────────

export function formatNumber(
  value: number | null | undefined,
  decimals = 0
): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(1)}%`;
}

export function formatMinutes(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const h = Math.floor(value / 60);
  const m = Math.round(value % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function calcChangePercent(
  current: number | null,
  previous: number | null
): number | null {
  if (current === null || previous === null) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// ─── CSV column header normalization ─────────────────────────────────────────

export function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// ─── Outbound CSV header → DB column mapping ──────────────────────────────────

export const OUTBOUND_COLUMN_MAP: Record<string, string> = {
  warehouse: 'warehouse',
  customer: 'customer',
  order: 'order_number',
  shipment: 'shipment',
  container: 'container',
  returned: 'returned',
  shipped_date: 'shipped_date',
  loading_ref: 'loading_ref',
  route: 'route',
  truck: 'truck',
  gate: 'gate',
  org_ship_to_code: 'org_ship_to_code',
  org_ship_to_name: 'org_ship_to_name',
  org_ship_to_country: 'org_ship_to_country',
  org_ship_plt: 'org_ship_plt',
  size_sorting: 'size_sorting',
  mixed: 'mixed',
  sorter_used: 'sorter_used',
  wlr_remarks: 'wlr_remarks',
  act_ship_to_code: 'act_ship_to_code',
  act_ship_to_name: 'act_ship_to_name',
  act_ship_to_country: 'act_ship_to_country',
  pallets: 'pallets',
  po_line: 'po_line',
  cartons: 'cartons',
  loading_type: 'loading_type',
  luik_shipment: 'luik_shipment',
  actual_loading_type: 'actual_loading_type',
  decon_in_date: 'decon_in_date',
  decon_in_time: 'decon_in_time',
  decon_out_date: 'decon_out_date',
  decon_out_time: 'decon_out_time',
  est_pickup_date: 'est_pickup_date',
  est_pickup_time: 'est_pickup_time',
  est__pickup_date: 'est_pickup_date',
  est__pickup_time: 'est_pickup_time',
  gate_in_date: 'gate_in_date',
  gate_in_time: 'gate_in_time',
  loading_start_date: 'loading_start_date',
  loading_start_time: 'loading_start_time',
  loading_end_date: 'loading_end_date',
  loading_end_time: 'loading_end_time',
  gate_out_date: 'gate_out_date',
  gate_out_time: 'gate_out_time',
  dock: 'dock',
};

// ─── Inbound CSV header → DB column mapping ───────────────────────────────────

export const INBOUND_COLUMN_MAP: Record<string, string> = {
  warehouse: 'warehouse',
  customer: 'customer',
  shipment: 'shipment',
  container: 'container',
  arrival: 'arrival',
  unloading_ref: 'unloading_ref',
  gate: 'gate',
  unloading_date: 'unloading_date',
  planned_arrival_date: 'planned_arrival_date',
  planned_arrival_time: 'planned_arrival_time',
  premisses_in_date: 'premises_in_date',
  premisses_in_time: 'premises_in_time',
  premises_in_date: 'premises_in_date',
  premises_in_time: 'premises_in_time',
  gate_in_date: 'gate_in_date',
  gate_in_time: 'gate_in_time',
  unloading_start_date: 'unloading_start_date',
  unloading_start_time: 'unloading_start_time',
  unloading_end_date: 'unloading_end_date',
  unloading_end_time: 'unloading_end_time',
  gate_out_date: 'gate_out_date',
  gate_out_time: 'gate_out_time',
  premisses_out_date: 'premises_out_date',
  premisses_out_time: 'premises_out_time',
  premises_out_date: 'premises_out_date',
  premises_out_time: 'premises_out_time',
  sortkeys: 'sortkeys',
  pallet_count: 'pallet_count',
  us_pallet_count: 'us_pallet_count',
  st_pallet_count: 'st_pallet_count',
  carton_count: 'carton_count',
  arrival_status: 'arrival_status',
  pallet_status: 'pallet_status',
  locate_status: 'locate_status',
  locate_date: 'locate_date',
  locate_time: 'locate_time',
  decon_in: 'decon_in',
  decon_in_date: 'decon_in_date',
  decon_in_time: 'decon_in_time',
  'decon_in_plt#': 'decon_in_plt_num',
  decon_in_plt_: 'decon_in_plt_num',
  decon_in_plt_num: 'decon_in_plt_num',
};

// ─── Numeric DB columns ───────────────────────────────────────────────────────

export const OUTBOUND_NUMERIC_COLS = new Set([
  'org_ship_plt',
  'pallets',
  'cartons',
]);

export const INBOUND_NUMERIC_COLS = new Set([
  'pallet_count',
  'us_pallet_count',
  'st_pallet_count',
  'carton_count',
]);

// ─── Date DB columns ──────────────────────────────────────────────────────────

export const OUTBOUND_DATE_COLS = new Set([
  'shipped_date',
  'decon_in_date',
  'decon_out_date',
  'est_pickup_date',
  'gate_in_date',
  'loading_start_date',
  'loading_end_date',
  'gate_out_date',
]);

export const INBOUND_DATE_COLS = new Set([
  'unloading_date',
  'planned_arrival_date',
  'premises_in_date',
  'gate_in_date',
  'unloading_start_date',
  'unloading_end_date',
  'gate_out_date',
  'premises_out_date',
  'locate_date',
  'decon_in_date',
]);

// ─── Parse raw cell value ─────────────────────────────────────────────────────

export function parseCell(
  value: string,
  dbCol: string,
  numericCols: Set<string>,
  dateCols: Set<string>
): string | number | null {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '-' || trimmed === 'N/A') return null;

  if (numericCols.has(dbCol)) {
    const n = parseFloat(trimmed.replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  if (dateCols.has(dbCol)) {
    // Accept formats like DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY
    const normalized = normalizeDateStr(trimmed);
    return normalized;
  }

  return trimmed;
}

function normalizeDateStr(raw: string): string | null {
  if (!raw) return null;
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // Try DD-MM-YYYY or DD/MM/YYYY
  const match = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (match) {
    let year = match[3];
    if (year.length === 2) year = '20' + year;
    return `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  }
  // Try MM/DD/YYYY
  const match2 = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match2) {
    return `${match2[3]}-${match2[1].padStart(2, '0')}-${match2[2].padStart(2, '0')}`;
  }
  return raw;
}
