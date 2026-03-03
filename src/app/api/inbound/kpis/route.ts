import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { getPreviousPeriod, calcChangePercent } from '@/lib/utils';
import { KPIValue } from '@/types';

export const runtime = 'nodejs';

function buildFilters(
  startDate: string,
  endDate: string,
  customer: string,
  warehouse: string,
  gate: string,
  startIdx: number
) {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let idx = startIdx;

  if (startDate) { conditions.push(`unloading_date >= $${idx++}`); params.push(startDate); }
  if (endDate) { conditions.push(`unloading_date <= $${idx++}`); params.push(endDate); }
  if (customer) { conditions.push(`customer = $${idx++}`); params.push(customer); }
  if (warehouse) { conditions.push(`warehouse = $${idx++}`); params.push(warehouse); }
  if (gate) { conditions.push(`gate = $${idx++}`); params.push(gate); }

  return { conditions, params, nextIdx: idx };
}

async function computeKPIs(
  client: { query: (sql: string, params?: (string | number)[]) => Promise<{ rows: Record<string, string>[] }> },
  startDate: string,
  endDate: string,
  customer: string,
  warehouse: string,
  gate: string
) {
  const { conditions, params } = buildFilters(startDate, endDate, customer, warehouse, gate, 1);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const kpiSql = `
    SELECT
      COUNT(*) AS row_count,
      COALESCE(SUM(carton_count), 0) AS total_cartons,
      COALESCE(SUM(pallet_count), 0) AS total_pallets,
      CASE WHEN COUNT(DISTINCT shipment) > 0
        THEN ROUND(COALESCE(SUM(carton_count), 0) / COUNT(DISTINCT shipment)::numeric, 2)
        ELSE 0 END AS avg_cartons_per_shipment,
      ROUND(AVG(
        CASE WHEN unloading_end_date IS NOT NULL AND unloading_start_date IS NOT NULL
          AND unloading_end_time IS NOT NULL AND unloading_start_time IS NOT NULL
          AND unloading_end_time <> '' AND unloading_start_time <> ''
          AND (unloading_end_date + unloading_end_time::time) > (unloading_start_date + unloading_start_time::time)
          THEN EXTRACT(EPOCH FROM (
            (unloading_end_date + unloading_end_time::time) - (unloading_start_date + unloading_start_time::time)
          )) / 60.0
          ELSE NULL END
      )::numeric, 1) AS avg_unloading_time,
      ROUND(AVG(
        CASE WHEN gate_out_date IS NOT NULL AND gate_in_date IS NOT NULL
          AND gate_out_time IS NOT NULL AND gate_in_time IS NOT NULL
          AND gate_out_time <> '' AND gate_in_time <> ''
          AND (gate_out_date + gate_out_time::time) > (gate_in_date + gate_in_time::time)
          THEN EXTRACT(EPOCH FROM (
            (gate_out_date + gate_out_time::time) - (gate_in_date + gate_in_time::time)
          )) / 60.0
          ELSE NULL END
      )::numeric, 1) AS avg_dwell_time,
      ROUND(AVG(
        CASE WHEN unloading_start_date IS NOT NULL AND gate_in_date IS NOT NULL
          AND unloading_start_time IS NOT NULL AND gate_in_time IS NOT NULL
          AND unloading_start_time <> '' AND gate_in_time <> ''
          AND (unloading_start_date + unloading_start_time::time) > (gate_in_date + gate_in_time::time)
          THEN EXTRACT(EPOCH FROM (
            (unloading_start_date + unloading_start_time::time) - (gate_in_date + gate_in_time::time)
          )) / 60.0
          ELSE NULL END
      )::numeric, 1) AS avg_wait_before_unloading,
      ROUND(AVG(
        CASE WHEN decon_in_date IS NOT NULL AND unloading_end_date IS NOT NULL
          AND decon_in_time IS NOT NULL AND unloading_end_time IS NOT NULL
          AND decon_in_time <> '' AND unloading_end_time <> ''
          AND (decon_in_date + decon_in_time::time) > (unloading_end_date + unloading_end_time::time)
          THEN EXTRACT(EPOCH FROM (
            (decon_in_date + decon_in_time::time) - (unloading_end_date + unloading_end_time::time)
          )) / 60.0
          ELSE NULL END
      )::numeric, 1) AS avg_decon_time,
      CASE WHEN COUNT(*) FILTER (WHERE planned_arrival_date IS NOT NULL AND premises_in_date IS NOT NULL) > 0
        THEN ROUND(
          COUNT(*) FILTER (WHERE premises_in_date <= planned_arrival_date)::numeric * 100.0
          / COUNT(*) FILTER (WHERE planned_arrival_date IS NOT NULL AND premises_in_date IS NOT NULL), 2
        )
        ELSE NULL END AS on_time_arrival_rate,
      CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE arrival_status ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
        ELSE 0 END AS arrival_status_rate,
      CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE pallet_status ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
        ELSE 0 END AS pallet_status_rate,
      CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE locate_status ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
        ELSE 0 END AS locate_status_rate,
      CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE decon_in ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
        ELSE 0 END AS decon_completed_rate
    FROM inbound_shipments
    ${where}
  `;

  const result = await client.query(kpiSql, params);
  return result.rows[0] ?? {};
}

async function computeTrends(
  client: { query: (sql: string, params?: (string | number)[]) => Promise<{ rows: Record<string, string>[] }> },
  startDate: string,
  endDate: string,
  customer: string,
  warehouse: string,
  gate: string,
  granularity: string
) {
  const { conditions, params } = buildFilters(startDate, endDate, customer, warehouse, gate, 1);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const safe_gran = ['day', 'week', 'month'].includes(granularity) ? granularity : 'day';
  const andOrWhere = where ? 'AND' : 'WHERE';

  const [byCustomer, byGate, trend] = await Promise.all([
    client.query(
      `SELECT customer AS name, COALESCE(SUM(carton_count),0) AS total_cartons, COUNT(DISTINCT shipment) AS shipment_count
       FROM inbound_shipments ${where} ${andOrWhere} customer IS NOT NULL
       GROUP BY customer ORDER BY total_cartons DESC LIMIT 20`,
      params
    ),
    client.query(
      `SELECT gate AS name, COALESCE(SUM(carton_count),0) AS total_cartons, COUNT(DISTINCT shipment) AS shipment_count
       FROM inbound_shipments ${where} ${andOrWhere} gate IS NOT NULL
       GROUP BY gate ORDER BY total_cartons DESC LIMIT 20`,
      params
    ),
    client.query(
      `SELECT DATE_TRUNC('${safe_gran}', unloading_date)::date AS period,
              COALESCE(SUM(carton_count), 0) AS total_cartons,
              COUNT(DISTINCT shipment) AS shipment_count
       FROM inbound_shipments ${where} ${andOrWhere} unloading_date IS NOT NULL
       GROUP BY DATE_TRUNC('${safe_gran}', unloading_date)
       ORDER BY period`,
      params
    ),
  ]);

  return { trend: trend.rows, by_customer: byCustomer.rows, by_gate: byGate.rows };
}

function makeKPIValue(current: string | null, previous: string | null): KPIValue {
  const c = current !== null && current !== '' ? parseFloat(current) : null;
  const p = previous !== null && previous !== '' ? parseFloat(previous) : null;
  return { current: c, previous: p, change: calcChangePercent(c, p) };
}

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const { searchParams } = req.nextUrl;

    const startDate = searchParams.get('startDate') ?? '';
    const endDate = searchParams.get('endDate') ?? '';
    const customer = searchParams.get('customer') ?? '';
    const warehouse = searchParams.get('warehouse') ?? '';
    const gate = searchParams.get('gate') ?? '';
    const granularity = searchParams.get('granularity') ?? 'day';

    const { prevStart, prevEnd } = getPreviousPeriod(startDate, endDate);

    const client = await db.connect();
    try {
      const [current, previous, charts] = await Promise.all([
        computeKPIs(client, startDate, endDate, customer, warehouse, gate),
        computeKPIs(client, prevStart, prevEnd, customer, warehouse, gate),
        computeTrends(client, startDate, endDate, customer, warehouse, gate, granularity),
      ]);

      const kpis = {
        row_count: makeKPIValue(current.row_count, previous.row_count),
        total_cartons: makeKPIValue(current.total_cartons, previous.total_cartons),
        total_pallets: makeKPIValue(current.total_pallets, previous.total_pallets),
        avg_cartons_per_shipment: makeKPIValue(current.avg_cartons_per_shipment, previous.avg_cartons_per_shipment),
        avg_unloading_time: makeKPIValue(current.avg_unloading_time, previous.avg_unloading_time),
        avg_dwell_time: makeKPIValue(current.avg_dwell_time, previous.avg_dwell_time),
        avg_wait_before_unloading: makeKPIValue(current.avg_wait_before_unloading, previous.avg_wait_before_unloading),
        avg_decon_time: makeKPIValue(current.avg_decon_time, previous.avg_decon_time),
        on_time_arrival_rate: makeKPIValue(current.on_time_arrival_rate, previous.on_time_arrival_rate),
        arrival_status_rate: makeKPIValue(current.arrival_status_rate, previous.arrival_status_rate),
        pallet_status_rate: makeKPIValue(current.pallet_status_rate, previous.pallet_status_rate),
        locate_status_rate: makeKPIValue(current.locate_status_rate, previous.locate_status_rate),
        decon_completed_rate: makeKPIValue(current.decon_completed_rate, previous.decon_completed_rate),
      };

      return NextResponse.json({ kpis, charts });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Inbound KPI error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
