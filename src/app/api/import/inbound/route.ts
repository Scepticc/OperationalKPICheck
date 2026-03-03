import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { db, initDb } from '@/lib/db';
import {
  normalizeHeader,
  INBOUND_COLUMN_MAP,
  INBOUND_NUMERIC_COLS,
  INBOUND_DATE_COLS,
  parseCell,
} from '@/lib/utils';
import { ImportResult } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    await initDb();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();

    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse CSV', details: parsed.errors },
        { status: 400 }
      );
    }

    const rows = parsed.data;
    if (rows.length === 0) {
      return NextResponse.json({ inserted: 0, skipped: 0, total: 0, errors: [] });
    }

    const rawHeaders = Object.keys(rows[0]);
    const headerMap: Record<string, string> = {};
    for (const h of rawHeaders) {
      const normalized = normalizeHeader(h);
      const dbCol = INBOUND_COLUMN_MAP[normalized];
      if (dbCol) headerMap[h] = dbCol;
    }

    const client = await db.connect();
    let inserted = 0;
    const errors: string[] = [];

    try {
      const dbCols = [...new Set(Object.values(headerMap))];
      const colList = dbCols.join(', ');
      const placeholders = dbCols.map((_, i) => `$${i + 1}`).join(', ');

      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const values: (string | number | null)[] = [];

        for (const dbCol of dbCols) {
          const rawKey = Object.keys(headerMap).find(
            (k) => headerMap[k] === dbCol
          );
          const rawVal = rawKey ? (row[rawKey] ?? '') : '';
          values.push(parseCell(rawVal, dbCol, INBOUND_NUMERIC_COLS, INBOUND_DATE_COLS));
        }

        try {
          const result = await client.query(
            `INSERT INTO inbound_shipments (${colList})
             VALUES (${placeholders})
             ON CONFLICT (shipment, container, unloading_date) DO NOTHING`,
            values
          );
          inserted += result.rowCount ?? 0;
        } catch (rowErr) {
          errors.push(`Row ${rowIdx + 2}: ${String(rowErr)}`);
        }
      }
    } finally {
      client.release();
    }

    const result: ImportResult = {
      inserted,
      skipped: rows.length - inserted - errors.length,
      total: rows.length,
      errors: errors.slice(0, 10),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
