import { NextRequest, NextResponse } from 'next/server';
import { db, initDb, DbClient } from '@/lib/db';
import { getPreviousPeriod, calcChangePercent } from '@/lib/utils';
import { KPIValue } from '@/types';

export const runtime = 'nodejs';

// Regex check for valid HH:MM or HH:MM:SS format to prevent ::time cast failures
const TIME_RE = `~ '^[0-9]{1,2}:[0-9]{2}(:[0-9]{2})?$'`;

function safeTimeDiff(
  endDateCol: string,
  endTimeCol: string,
  startDateCol: string,
  startTimeCol: string
) {
  return `
    CASE WHEN ${endDateCol} IS NOT NULL AND ${startDateCol} IS NOT NULL
      AND ${endTimeCol} IS NOT NULL AND ${startTimeCol} IS NOT NULL
      AND ${endTimeCol} <> '' AND ${startTimeCol} <> ''
      AND ${endTimeCol} ${TIME_RE} AND ${startTimeCol} ${TIME_RE}
      AND (${endDateCol} + ${endTimeCol}::time) > (${startDateCol} + ${startTimeCol}::time)
      THEN EXTRACT(EPOCH FROM (
        (${endDateCol} + ${endTimeCol}::time) - (${startDateCol} + ${startTimeCol}::time)
      )) / 60.0
      ELSE NULL END
  `;
}

function buildFilters(
  startDate: string,
  endDate: string,
  customer: string,
  country: string,
  route: string,
  dock: string,
  warehouse: string,
  startIdx: number
): { conditions: string[]; params: (string | number)[]; nextIdx: number } {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let idx = startIdx;

  if (startDate) { conditions.push(`shipped_date >= $${idx++}`); params.push(startDate); }
  if (endDate) { conditions.push(`shipped_date <= $${idx++}`); params.push(endDate); }
  if (customer) { conditions.push(`act_ship_to_name = $${idx++}`); params.push(customer); }
  if (country) { conditions.push(`act_ship_to_country = $${idx++}`); params.push(country); }
  if (route) { conditions.push(`route = $${idx++}`); params.push(route); }
  if (dock) { conditions.push(`dock = $${idx++}`); params.push(dock); }
  if (warehouse) { conditions.push(`warehouse = $${idx++}`); params.push(warehouse); }

  return { conditions, params, nextIdx: idx };
}

async function computeKPIs(
  client: DbClient,
  startDate: string,
  endDate: string,
  customer: string,
  country: string,
  route: string,
  dock: string,
  warehouse: string
) {
  const { conditions, params } = buildFilters(
    startDate, endDate, customer, country, route, dock, warehouse, 1
  );
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const kpiSql = `
    SELECT
      COUNT(*) AS row_count,
      COALESCE(SUM(cartons), 0) AS total_cartons,
      COALESCE(SUM(pallets), 0) AS total_pallets,
      CASE WHEN COUNT(DISTINCT shipment) > 0
        THEN ROUND(COALESCE(SUM(cartons), 0) / COUNT(DISTINCT shipment)::numeric, 2)
        ELSE 0 END AS avg_cartons_per_shipment,
      CASE WHEN COALESCE(SUM(pallets), 0) > 0
        THEN ROUND(COALESCE(SUM(cartons), 0) / SUM(pallets)::numeric, 2)
        ELSE NULL END AS avg_cartons_per_pallet,
      CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE returned ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
        ELSE 0 END AS return_rate,
      CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE mixed ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
        ELSE 0 END AS mixed_rate,
      CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE sorter_used ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
        ELSE 0 END AS sorter_used_rate,
      ROUND(AVG(${safeTimeDiff('loading_end_date', 'loading_end_time', 'loading_start_date', 'loading_start_time')})::numeric, 1) AS avg_loading_time,
      ROUND(AVG(${safeTimeDiff('gate_out_date', 'gate_out_time', 'gate_in_date', 'gate_in_time')})::numeric, 1) AS avg_dwell_time,
      ROUND(AVG(${safeTimeDiff('loading_start_date', 'loading_start_time', 'gate_in_date', 'gate_in_time')})::numeric, 1) AS avg_wait_before_loading,
      ROUND(AVG(${safeTimeDiff('decon_out_date', 'decon_out_time', 'decon_in_date', 'decon_in_time')})::numeric, 1) AS avg_decon_time,
      CASE WHEN COUNT(*) FILTER (WHERE est_pickup_date IS NOT NULL AND gate_in_date IS NOT NULL) > 0
        THEN ROUND(
          COUNT(*) FILTER (WHERE gate_in_date <= est_pickup_date)::numeric * 100.0
          / COUNT(*) FILTER (WHERE est_pickup_date IS NOT NULL AND gate_in_date IS NOT NULL), 2
        )
        ELSE NULL END AS on_time_pickup_rate
    FROM outbound_shipments
    ${where}
  `;

  const result = await client.query(kpiSql, params);
  return result.rows[0] ?? {};
}

async function computeTrends(
  client: DbClient,
  startDate: string,
  endDate: string,
  customer: string,
  country: string,
  route: string,
  dock: string,
  warehouse: string,
  granularity: string
) {
  const { conditions, params } = buildFilters(
    startDate, endDate, customer, country, route, dock, warehouse, 1
  );
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const safe_gran = ['day', 'week', 'month'].includes(granularity) ? granularity : 'day';
  const andOrWhere = where ? 'AND' : 'WHERE';

  const [byCustomer, byCountry, byDock, byRoute, byWarehouse, trend] = await Promise.all([
    client.query(
      `SELECT act_ship_to_name AS name, COALESCE(SUM(cartons),0) AS total_cartons, COUNT(DISTINCT shipment) AS shipment_count
       FROM outbound_shipments ${where} ${andOrWhere} act_ship_to_name IS NOT NULL
       GROUP BY act_ship_to_name ORDER BY total_cartons DESC LIMIT 20`,
      params
    ),
    client.query(
      `SELECT act_ship_to_country AS name, COALESCE(SUM(cartons),0) AS total_cartons, COUNT(DISTINCT shipment) AS shipment_count
       FROM outbound_shipments ${where} ${andOrWhere} act_ship_to_country IS NOT NULL
       GROUP BY act_ship_to_country ORDER BY total_cartons DESC LIMIT 20`,
      params
    ),
    client.query(
      `SELECT dock AS name, COALESCE(SUM(cartons),0) AS total_cartons, COUNT(DISTINCT shipment) AS shipment_count
       FROM outbound_shipments ${where} ${andOrWhere} dock IS NOT NULL
       GROUP BY dock ORDER BY total_cartons DESC LIMIT 20`,
      params
    ),
    client.query(
      `SELECT route AS name, COALESCE(SUM(cartons),0) AS total_cartons, COUNT(DISTINCT shipment) AS shipment_count
       FROM outbound_shipments ${where} ${andOrWhere} route IS NOT NULL AND route <> ''
       GROUP BY route ORDER BY total_cartons DESC LIMIT 15`,
      params
    ),
    client.query(
      `SELECT warehouse AS name, COALESCE(SUM(cartons),0) AS total_cartons, COUNT(DISTINCT shipment) AS shipment_count
       FROM outbound_shipments ${where} ${andOrWhere} warehouse IS NOT NULL AND warehouse <> ''
       GROUP BY warehouse ORDER BY total_cartons DESC LIMIT 15`,
      params
    ),
    client.query(
      `SELECT DATE_TRUNC('${safe_gran}', shipped_date)::date AS period,
              COALESCE(SUM(cartons), 0) AS total_cartons,
              COUNT(DISTINCT shipment) AS shipment_count
       FROM outbound_shipments ${where} ${andOrWhere} shipped_date IS NOT NULL
       GROUP BY DATE_TRUNC('${safe_gran}', shipped_date)
       ORDER BY period`,
      params
    ),
  ]);

  return {
    trend: trend.rows,
    by_customer: byCustomer.rows,
    by_country: byCountry.rows,
    by_dock: byDock.rows,
    by_route: byRoute.rows,
    by_warehouse: byWarehouse.rows,
  };
}

function makeKPIValue(current: unknown, previous: unknown): KPIValue {
  const toNum = (v: unknown) =>
    v !== null && v !== undefined && v !== '' ? parseFloat(String(v)) : null;
  const c = toNum(current);
  const p = toNum(previous);
  return { current: c, previous: p, change: calcChangePercent(c, p) };
}

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const { searchParams } = req.nextUrl;

    const startDate = searchParams.get('startDate') ?? '';
    const endDate = searchParams.get('endDate') ?? '';
    const customer = searchParams.get('customer') ?? '';
    const country = searchParams.get('country') ?? '';
    const route = searchParams.get('route') ?? '';
    const dock = searchParams.get('dock') ?? '';
    const warehouse = searchParams.get('warehouse') ?? '';
    const granularity = searchParams.get('granularity') ?? 'day';

    const { prevStart, prevEnd } = getPreviousPeriod(startDate, endDate);

    const client = await db.connect();
    try {
      const [current, previous, charts] = await Promise.all([
        computeKPIs(client, startDate, endDate, customer, country, route, dock, warehouse),
        computeKPIs(client, prevStart, prevEnd, customer, country, route, dock, warehouse),
        computeTrends(client, startDate, endDate, customer, country, route, dock, warehouse, granularity),
      ]);

      const kpis = {
        row_count: makeKPIValue(current.row_count, previous.row_count),
        total_cartons: makeKPIValue(current.total_cartons, previous.total_cartons),
        total_pallets: makeKPIValue(current.total_pallets, previous.total_pallets),
        avg_cartons_per_shipment: makeKPIValue(current.avg_cartons_per_shipment, previous.avg_cartons_per_shipment),
        avg_cartons_per_pallet: makeKPIValue(current.avg_cartons_per_pallet, previous.avg_cartons_per_pallet),
        return_rate: makeKPIValue(current.return_rate, previous.return_rate),
        mixed_rate: makeKPIValue(current.mixed_rate, previous.mixed_rate),
        sorter_used_rate: makeKPIValue(current.sorter_used_rate, previous.sorter_used_rate),
        avg_loading_time: makeKPIValue(current.avg_loading_time, previous.avg_loading_time),
        avg_dwell_time: makeKPIValue(current.avg_dwell_time, previous.avg_dwell_time),
        avg_wait_before_loading: makeKPIValue(current.avg_wait_before_loading, previous.avg_wait_before_loading),
        avg_decon_time: makeKPIValue(current.avg_decon_time, previous.avg_decon_time),
        on_time_pickup_rate: makeKPIValue(current.on_time_pickup_rate, previous.on_time_pickup_rate),
      };

      return NextResponse.json({ kpis, charts });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Outbound KPI error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
