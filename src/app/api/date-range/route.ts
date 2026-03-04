import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await initDb();
    const client = await db.connect();

    try {
      const [outbound, inbound] = await Promise.all([
        client.query(`
          SELECT
            MIN(shipped_date)::text AS min_date,
            MAX(shipped_date)::text AS max_date
          FROM outbound_shipments
          WHERE shipped_date IS NOT NULL
        `),
        client.query(`
          SELECT
            MIN(unloading_date)::text AS min_date,
            MAX(unloading_date)::text AS max_date
          FROM inbound_shipments
          WHERE unloading_date IS NOT NULL
        `),
      ]);

      const mins = [outbound.rows[0]?.min_date, inbound.rows[0]?.min_date].filter(Boolean) as string[];
      const maxs = [outbound.rows[0]?.max_date, inbound.rows[0]?.max_date].filter(Boolean) as string[];

      if (mins.length === 0 || maxs.length === 0) {
        return NextResponse.json({ startDate: null, endDate: null });
      }

      const startDate = mins.sort()[0];
      const endDate = maxs.sort().reverse()[0];

      return NextResponse.json({ startDate, endDate });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
