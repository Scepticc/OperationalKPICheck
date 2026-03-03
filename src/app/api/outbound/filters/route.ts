import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await initDb();
    const client = await db.connect();
    try {
      const [customers, countries, routes, docks, warehouses] = await Promise.all([
        client.query(
          `SELECT DISTINCT act_ship_to_name AS value FROM outbound_shipments
           WHERE act_ship_to_name IS NOT NULL ORDER BY act_ship_to_name`
        ),
        client.query(
          `SELECT DISTINCT act_ship_to_country AS value FROM outbound_shipments
           WHERE act_ship_to_country IS NOT NULL ORDER BY act_ship_to_country`
        ),
        client.query(
          `SELECT DISTINCT route AS value FROM outbound_shipments
           WHERE route IS NOT NULL ORDER BY route`
        ),
        client.query(
          `SELECT DISTINCT dock AS value FROM outbound_shipments
           WHERE dock IS NOT NULL ORDER BY dock`
        ),
        client.query(
          `SELECT DISTINCT warehouse AS value FROM outbound_shipments
           WHERE warehouse IS NOT NULL ORDER BY warehouse`
        ),
      ]);

      return NextResponse.json({
        customers: customers.rows.map((r) => r.value),
        countries: countries.rows.map((r) => r.value),
        routes: routes.rows.map((r) => r.value),
        docks: docks.rows.map((r) => r.value),
        warehouses: warehouses.rows.map((r) => r.value),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
