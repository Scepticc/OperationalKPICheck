import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db, initDb } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const { searchParams } = req.nextUrl;
    const startDate = searchParams.get('startDate') ?? '';
    const endDate = searchParams.get('endDate') ?? '';

    const client = await db.connect();
    try {
      // Build date filter
      const outConditions: string[] = [];
      const inConditions: string[] = [];
      const outParams: string[] = [];
      const inParams: string[] = [];
      let outIdx = 1;
      let inIdx = 1;

      if (startDate) {
        outConditions.push(`shipped_date >= $${outIdx++}`);
        outParams.push(startDate);
        inConditions.push(`unloading_date >= $${inIdx++}`);
        inParams.push(startDate);
      }
      if (endDate) {
        outConditions.push(`shipped_date <= $${outIdx++}`);
        outParams.push(endDate);
        inConditions.push(`unloading_date <= $${inIdx++}`);
        inParams.push(endDate);
      }

      const outWhere = outConditions.length ? `WHERE ${outConditions.join(' AND ')}` : '';
      const inWhere = inConditions.length ? `WHERE ${inConditions.join(' AND ')}` : '';

      // Fetch all data
      const [outboundResult, inboundResult, outKpiResult, inKpiResult] = await Promise.all([
        client.query(
          `SELECT warehouse, customer, order_number, shipment, container, returned,
                  shipped_date, loading_ref, route, truck, gate, dock,
                  org_ship_to_code, org_ship_to_name, org_ship_to_country,
                  act_ship_to_code, act_ship_to_name, act_ship_to_country,
                  pallets, cartons, po_line, loading_type, actual_loading_type,
                  size_sorting, mixed, sorter_used,
                  est_pickup_date, est_pickup_time,
                  gate_in_date, gate_in_time,
                  loading_start_date, loading_start_time,
                  loading_end_date, loading_end_time,
                  gate_out_date, gate_out_time,
                  decon_in_date, decon_in_time,
                  decon_out_date, decon_out_time
           FROM outbound_shipments ${outWhere}
           ORDER BY shipped_date DESC, shipment`,
          outParams
        ),
        client.query(
          `SELECT warehouse, customer, shipment, container, arrival, unloading_ref, gate,
                  unloading_date,
                  planned_arrival_date, planned_arrival_time,
                  premises_in_date, premises_in_time,
                  gate_in_date, gate_in_time,
                  unloading_start_date, unloading_start_time,
                  unloading_end_date, unloading_end_time,
                  gate_out_date, gate_out_time,
                  premises_out_date, premises_out_time,
                  sortkeys, pallet_count, carton_count,
                  arrival_status, pallet_status, locate_status,
                  decon_in, decon_in_date, decon_in_time
           FROM inbound_shipments ${inWhere}
           ORDER BY unloading_date DESC, shipment`,
          inParams
        ),
        // Outbound KPIs summary
        client.query(
          `SELECT
            COUNT(*) AS total_shipments,
            COALESCE(SUM(cartons), 0) AS total_cartons,
            COALESCE(SUM(pallets), 0) AS total_pallets,
            CASE WHEN COUNT(DISTINCT shipment) > 0
              THEN ROUND(COALESCE(SUM(cartons), 0) / COUNT(DISTINCT shipment)::numeric, 2)
              ELSE 0 END AS avg_cartons_per_shipment,
            CASE WHEN COUNT(*) > 0
              THEN ROUND(COUNT(*) FILTER (WHERE returned ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
              ELSE 0 END AS return_rate_pct,
            CASE WHEN COUNT(*) > 0
              THEN ROUND(COUNT(*) FILTER (WHERE mixed ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
              ELSE 0 END AS mixed_rate_pct,
            CASE WHEN COUNT(*) > 0
              THEN ROUND(COUNT(*) FILTER (WHERE sorter_used ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
              ELSE 0 END AS sorter_used_pct
           FROM outbound_shipments ${outWhere}`,
          outParams
        ),
        // Inbound KPIs summary
        client.query(
          `SELECT
            COUNT(*) AS total_shipments,
            COALESCE(SUM(carton_count), 0) AS total_cartons,
            COALESCE(SUM(pallet_count), 0) AS total_pallets,
            CASE WHEN COUNT(DISTINCT shipment) > 0
              THEN ROUND(COALESCE(SUM(carton_count), 0) / COUNT(DISTINCT shipment)::numeric, 2)
              ELSE 0 END AS avg_cartons_per_shipment,
            CASE WHEN COUNT(*) > 0
              THEN ROUND(COUNT(*) FILTER (WHERE arrival_status ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
              ELSE 0 END AS arrival_status_pct,
            CASE WHEN COUNT(*) > 0
              THEN ROUND(COUNT(*) FILTER (WHERE pallet_status ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
              ELSE 0 END AS pallet_status_pct,
            CASE WHEN COUNT(*) > 0
              THEN ROUND(COUNT(*) FILTER (WHERE locate_status ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
              ELSE 0 END AS locate_status_pct,
            CASE WHEN COUNT(*) > 0
              THEN ROUND(COUNT(*) FILTER (WHERE decon_in ILIKE 'Y')::numeric * 100.0 / COUNT(*), 2)
              ELSE 0 END AS decon_completed_pct
           FROM inbound_shipments ${inWhere}`,
          inParams
        ),
      ]);

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Tab 1: Outbound Data
      const outRows = outboundResult.rows.map(r => {
        const row: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(r)) {
          // Convert dates
          row[formatColHeader(key)] = val instanceof Date ? val.toISOString().slice(0, 10) : val;
        }
        return row;
      });
      const outWs = XLSX.utils.json_to_sheet(outRows.length > 0 ? outRows : [{ 'No Data': 'No outbound records found' }]);
      XLSX.utils.book_append_sheet(wb, outWs, 'Outbound Data');

      // Tab 2: Inbound Data
      const inRows = inboundResult.rows.map(r => {
        const row: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(r)) {
          row[formatColHeader(key)] = val instanceof Date ? val.toISOString().slice(0, 10) : val;
        }
        return row;
      });
      const inWs = XLSX.utils.json_to_sheet(inRows.length > 0 ? inRows : [{ 'No Data': 'No inbound records found' }]);
      XLSX.utils.book_append_sheet(wb, inWs, 'Inbound Data');

      // Tab 3: KPI Summary
      const outKpi = outKpiResult.rows[0] ?? {};
      const inKpi = inKpiResult.rows[0] ?? {};
      const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : 'All dates';

      const kpiData = [
        { Section: 'Report', Metric: 'Date Range', Value: dateRange },
        { Section: '', Metric: '', Value: '' },
        { Section: 'OUTBOUND KPIs', Metric: '', Value: '' },
        { Section: 'Outbound', Metric: 'Total Shipments', Value: Number(outKpi.total_shipments ?? 0) },
        { Section: 'Outbound', Metric: 'Total Cartons', Value: Number(outKpi.total_cartons ?? 0) },
        { Section: 'Outbound', Metric: 'Total Pallets', Value: Number(outKpi.total_pallets ?? 0) },
        { Section: 'Outbound', Metric: 'Avg Cartons / Shipment', Value: Number(outKpi.avg_cartons_per_shipment ?? 0) },
        { Section: 'Outbound', Metric: 'Return Rate (%)', Value: Number(outKpi.return_rate_pct ?? 0) },
        { Section: 'Outbound', Metric: 'Mixed Rate (%)', Value: Number(outKpi.mixed_rate_pct ?? 0) },
        { Section: 'Outbound', Metric: 'Sorter Used (%)', Value: Number(outKpi.sorter_used_pct ?? 0) },
        { Section: '', Metric: '', Value: '' },
        { Section: 'INBOUND KPIs', Metric: '', Value: '' },
        { Section: 'Inbound', Metric: 'Total Shipments', Value: Number(inKpi.total_shipments ?? 0) },
        { Section: 'Inbound', Metric: 'Total Cartons', Value: Number(inKpi.total_cartons ?? 0) },
        { Section: 'Inbound', Metric: 'Total Pallets', Value: Number(inKpi.total_pallets ?? 0) },
        { Section: 'Inbound', Metric: 'Avg Cartons / Shipment', Value: Number(inKpi.avg_cartons_per_shipment ?? 0) },
        { Section: 'Inbound', Metric: 'Arrival Status (%)', Value: Number(inKpi.arrival_status_pct ?? 0) },
        { Section: 'Inbound', Metric: 'Pallet Status (%)', Value: Number(inKpi.pallet_status_pct ?? 0) },
        { Section: 'Inbound', Metric: 'Locate Status (%)', Value: Number(inKpi.locate_status_pct ?? 0) },
        { Section: 'Inbound', Metric: 'Decon Completed (%)', Value: Number(inKpi.decon_completed_pct ?? 0) },
      ];
      const kpiWs = XLSX.utils.json_to_sheet(kpiData);
      // Set column widths
      kpiWs['!cols'] = [{ wch: 18 }, { wch: 28 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, kpiWs, 'KPI Summary');

      // Generate buffer
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="operational-kpi-export-${new Date().toISOString().slice(0, 10)}.xlsx"`,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function formatColHeader(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
