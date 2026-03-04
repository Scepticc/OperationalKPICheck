// ─── Outbound ────────────────────────────────────────────────────────────────

export interface OutboundRow {
  id: number;
  warehouse: string | null;
  customer: string | null;
  order_number: string | null;
  shipment: string | null;
  container: string | null;
  returned: string | null;
  shipped_date: string | null;
  loading_ref: string | null;
  route: string | null;
  truck: string | null;
  gate: string | null;
  org_ship_to_code: string | null;
  org_ship_to_name: string | null;
  org_ship_to_country: string | null;
  org_ship_plt: number | null;
  size_sorting: string | null;
  mixed: string | null;
  sorter_used: string | null;
  wlr_remarks: string | null;
  act_ship_to_code: string | null;
  act_ship_to_name: string | null;
  act_ship_to_country: string | null;
  pallets: number | null;
  po_line: string | null;
  cartons: number | null;
  loading_type: string | null;
  luik_shipment: string | null;
  actual_loading_type: string | null;
  decon_in_date: string | null;
  decon_in_time: string | null;
  decon_out_date: string | null;
  decon_out_time: string | null;
  est_pickup_date: string | null;
  est_pickup_time: string | null;
  gate_in_date: string | null;
  gate_in_time: string | null;
  loading_start_date: string | null;
  loading_start_time: string | null;
  loading_end_date: string | null;
  loading_end_time: string | null;
  gate_out_date: string | null;
  gate_out_time: string | null;
  dock: string | null;
  created_at: string;
}

// ─── Inbound ─────────────────────────────────────────────────────────────────

export interface InboundRow {
  id: number;
  warehouse: string | null;
  customer: string | null;
  shipment: string | null;
  container: string | null;
  arrival: string | null;
  unloading_ref: string | null;
  gate: string | null;
  unloading_date: string | null;
  planned_arrival_date: string | null;
  planned_arrival_time: string | null;
  premises_in_date: string | null;
  premises_in_time: string | null;
  gate_in_date: string | null;
  gate_in_time: string | null;
  unloading_start_date: string | null;
  unloading_start_time: string | null;
  unloading_end_date: string | null;
  unloading_end_time: string | null;
  gate_out_date: string | null;
  gate_out_time: string | null;
  premises_out_date: string | null;
  premises_out_time: string | null;
  sortkeys: string | null;
  pallet_count: number | null;
  us_pallet_count: number | null;
  st_pallet_count: number | null;
  carton_count: number | null;
  arrival_status: string | null;
  pallet_status: string | null;
  locate_status: string | null;
  locate_date: string | null;
  locate_time: string | null;
  decon_in: string | null;
  decon_in_date: string | null;
  decon_in_time: string | null;
  decon_in_plt_num: string | null;
  created_at: string;
}

// ─── KPI types ───────────────────────────────────────────────────────────────

export interface KPIValue {
  current: number | null;
  previous: number | null;
  change: number | null; // percentage change
}

export interface OutboundKPIs {
  total_cartons: KPIValue;
  total_pallets: KPIValue;
  avg_cartons_per_shipment: KPIValue;
  avg_cartons_per_pallet: KPIValue;
  return_rate: KPIValue;
  mixed_rate: KPIValue;
  sorter_used_rate: KPIValue;
  avg_loading_time: KPIValue;
  avg_dwell_time: KPIValue;
  avg_wait_before_loading: KPIValue;
  avg_decon_time: KPIValue;
  on_time_pickup_rate: KPIValue;
  row_count: KPIValue;
}

export interface InboundKPIs {
  total_cartons: KPIValue;
  total_pallets: KPIValue;
  avg_cartons_per_shipment: KPIValue;
  avg_unloading_time: KPIValue;
  avg_dwell_time: KPIValue;
  avg_wait_before_unloading: KPIValue;
  avg_decon_time: KPIValue;
  on_time_arrival_rate: KPIValue;
  arrival_status_rate: KPIValue;
  pallet_status_rate: KPIValue;
  locate_status_rate: KPIValue;
  decon_completed_rate: KPIValue;
  row_count: KPIValue;
}

// ─── Chart types ─────────────────────────────────────────────────────────────

export interface TrendDataPoint {
  period: string;
  total_cartons: number;
  shipment_count: number;
}

export interface CategoryDataPoint {
  name: string;
  total_cartons: number;
  shipment_count: number;
}

export interface OutboundCharts {
  trend: TrendDataPoint[];
  by_customer: CategoryDataPoint[];
  by_country: CategoryDataPoint[];
  by_dock: CategoryDataPoint[];
  by_route: CategoryDataPoint[];
  by_warehouse: CategoryDataPoint[];
}

export interface InboundCharts {
  trend: TrendDataPoint[];
  by_customer: CategoryDataPoint[];
  by_gate: CategoryDataPoint[];
  by_warehouse: CategoryDataPoint[];
}

// ─── Filter types ─────────────────────────────────────────────────────────────

export interface OutboundFilters {
  startDate: string;
  endDate: string;
  customer?: string;
  country?: string;
  route?: string;
  dock?: string;
  warehouse?: string;
  granularity?: 'day' | 'week' | 'month';
}

export interface InboundFilters {
  startDate: string;
  endDate: string;
  customer?: string;
  warehouse?: string;
  gate?: string;
  granularity?: 'day' | 'week' | 'month';
}

export interface FilterOptions {
  customers: string[];
  warehouses: string[];
  countries?: string[];
  routes?: string[];
  docks?: string[];
  gates?: string[];
}

// ─── Data table types ─────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TableSort {
  column: string;
  direction: 'asc' | 'desc';
}

// ─── Import types ─────────────────────────────────────────────────────────────

export interface ImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  total: number;
  errors: string[];
  duplicates: DuplicateRecord[];
}

export interface DuplicateRecord {
  row: number;
  key: string;
  action: 'updated' | 'skipped';
}
