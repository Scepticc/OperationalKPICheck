import { db } from '@vercel/postgres';

// ─── Database initialization ──────────────────────────────────────────────────

export async function initDb() {
  const client = await db.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS outbound_shipments (
        id SERIAL PRIMARY KEY,
        warehouse VARCHAR(100),
        customer VARCHAR(255),
        order_number VARCHAR(100),
        shipment VARCHAR(100),
        container VARCHAR(100),
        returned VARCHAR(10),
        shipped_date DATE,
        loading_ref VARCHAR(100),
        route VARCHAR(100),
        truck VARCHAR(100),
        gate VARCHAR(100),
        org_ship_to_code VARCHAR(100),
        org_ship_to_name VARCHAR(255),
        org_ship_to_country VARCHAR(100),
        org_ship_plt NUMERIC,
        size_sorting VARCHAR(100),
        mixed VARCHAR(10),
        sorter_used VARCHAR(10),
        wlr_remarks TEXT,
        act_ship_to_code VARCHAR(100),
        act_ship_to_name VARCHAR(255),
        act_ship_to_country VARCHAR(100),
        pallets NUMERIC,
        po_line VARCHAR(100),
        cartons NUMERIC,
        loading_type VARCHAR(100),
        luik_shipment VARCHAR(100),
        actual_loading_type VARCHAR(100),
        decon_in_date DATE,
        decon_in_time VARCHAR(10),
        decon_out_date DATE,
        decon_out_time VARCHAR(10),
        est_pickup_date DATE,
        est_pickup_time VARCHAR(10),
        gate_in_date DATE,
        gate_in_time VARCHAR(10),
        loading_start_date DATE,
        loading_start_time VARCHAR(10),
        loading_end_date DATE,
        loading_end_time VARCHAR(10),
        gate_out_date DATE,
        gate_out_time VARCHAR(10),
        dock VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(order_number, shipment, shipped_date)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS inbound_shipments (
        id SERIAL PRIMARY KEY,
        warehouse VARCHAR(100),
        customer VARCHAR(255),
        shipment VARCHAR(100),
        container VARCHAR(100),
        arrival VARCHAR(100),
        unloading_ref VARCHAR(100),
        gate VARCHAR(100),
        unloading_date DATE,
        planned_arrival_date DATE,
        planned_arrival_time VARCHAR(10),
        premises_in_date DATE,
        premises_in_time VARCHAR(10),
        gate_in_date DATE,
        gate_in_time VARCHAR(10),
        unloading_start_date DATE,
        unloading_start_time VARCHAR(10),
        unloading_end_date DATE,
        unloading_end_time VARCHAR(10),
        gate_out_date DATE,
        gate_out_time VARCHAR(10),
        premises_out_date DATE,
        premises_out_time VARCHAR(10),
        sortkeys VARCHAR(255),
        pallet_count NUMERIC,
        us_pallet_count NUMERIC,
        st_pallet_count NUMERIC,
        carton_count NUMERIC,
        arrival_status VARCHAR(10),
        pallet_status VARCHAR(10),
        locate_status VARCHAR(10),
        locate_date DATE,
        locate_time VARCHAR(10),
        decon_in VARCHAR(10),
        decon_in_date DATE,
        decon_in_time VARCHAR(10),
        decon_in_plt_num VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(shipment, container, unloading_date)
      )
    `);
  } finally {
    client.release();
  }
}

// ─── Helper: build WHERE clause ───────────────────────────────────────────────

export function buildWhereClause(
  filters: Record<string, string | undefined>,
  paramOffset = 1
): { clause: string; params: string[]; nextOffset: number } {
  const conditions: string[] = [];
  const params: string[] = [];
  let idx = paramOffset;

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '' && value !== null) {
      conditions.push(`${key} = $${idx}`);
      params.push(value);
      idx++;
    }
  }

  const clause = conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : '';
  return { clause, params, nextOffset: idx };
}

// ─── Helper: combine date + time safely ──────────────────────────────────────

export const SAFE_DATETIME_EXPR = (dateCol: string, timeCol: string) => `
  CASE
    WHEN ${dateCol} IS NOT NULL AND ${timeCol} IS NOT NULL AND ${timeCol} <> ''
      THEN (${dateCol}::timestamp + ${timeCol}::interval)
    WHEN ${dateCol} IS NOT NULL
      THEN ${dateCol}::timestamp
    ELSE NULL
  END
`;

// ─── Helper: minutes between two datetime expressions ─────────────────────────

export const MINUTES_BETWEEN = (startExpr: string, endExpr: string) => `
  CASE
    WHEN (${startExpr}) IS NOT NULL AND (${endExpr}) IS NOT NULL
      AND (${endExpr}) > (${startExpr})
      THEN EXTRACT(EPOCH FROM ((${endExpr}) - (${startExpr}))) / 60.0
    ELSE NULL
  END
`;

export { db };
