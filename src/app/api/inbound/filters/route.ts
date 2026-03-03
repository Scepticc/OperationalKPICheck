import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await initDb();
    const client = await db.connect();
    try {
      const [customers, warehouses, gates] = await Promise.all([
        client.query(
          `SELECT DISTINCT customer AS value FROM inbound_shipments
           WHERE customer IS NOT NULL ORDER BY customer`
        ),
        client.query(
          `SELECT DISTINCT warehouse AS value FROM inbound_shipments
           WHERE warehouse IS NOT NULL ORDER BY warehouse`
        ),
        client.query(
          `SELECT DISTINCT gate AS value FROM inbound_shipments
           WHERE gate IS NOT NULL ORDER BY gate`
        ),
      ]);

      return NextResponse.json({
        customers: customers.rows.map((r) => r.value),
        warehouses: warehouses.rows.map((r) => r.value),
        gates: gates.rows.map((r) => r.value),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
