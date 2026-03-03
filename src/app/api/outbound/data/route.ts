import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const { searchParams } = req.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const pageSize = Math.min(200, Math.max(10, parseInt(searchParams.get('pageSize') ?? '50')));
    const search = searchParams.get('search') ?? '';
    const sortCol = searchParams.get('sortCol') ?? 'shipped_date';
    const sortDir = searchParams.get('sortDir') === 'asc' ? 'ASC' : 'DESC';
    const startDate = searchParams.get('startDate') ?? '';
    const endDate = searchParams.get('endDate') ?? '';

    const ALLOWED_SORT_COLS = new Set([
      'id', 'warehouse', 'customer', 'order_number', 'shipment', 'container',
      'returned', 'shipped_date', 'route', 'truck', 'gate', 'act_ship_to_name',
      'act_ship_to_country', 'pallets', 'cartons', 'loading_type', 'dock',
      'mixed', 'sorter_used',
    ]);
    const safeSortCol = ALLOWED_SORT_COLS.has(sortCol) ? sortCol : 'shipped_date';

    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let idx = 1;

    if (startDate) {
      conditions.push(`shipped_date >= $${idx++}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`shipped_date <= $${idx++}`);
      params.push(endDate);
    }
    if (search) {
      conditions.push(
        `(customer ILIKE $${idx} OR shipment ILIKE $${idx} OR order_number ILIKE $${idx} OR act_ship_to_name ILIKE $${idx} OR route ILIKE $${idx})`
      );
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const client = await db.connect();
    try {
      const countResult = await client.query(
        `SELECT COUNT(*) AS total FROM outbound_shipments ${where}`,
        params
      );
      const total = parseInt(countResult.rows[0]?.total ?? '0');

      const dataResult = await client.query(
        `SELECT * FROM outbound_shipments ${where}
         ORDER BY ${safeSortCol} ${sortDir} NULLS LAST
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, pageSize, offset]
      );

      return NextResponse.json({
        data: dataResult.rows,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Outbound data error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
