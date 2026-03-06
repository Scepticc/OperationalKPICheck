import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import {
  normalizeHeader,
  INBOUND_COLUMN_MAP,
  INBOUND_NUMERIC_COLS,
  INBOUND_DATE_COLS,
  parseCell,
} from '@/lib/utils';
import { DuplicateRecord } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const UNIQUE_KEY_COLS = ['shipment', 'container', 'unloading_date'];

interface BatchRequest {
  headers: string[];
  rows: Record<string, string>[];
  batchIndex: number;
}

export async function POST(req: NextRequest) {
  try {
    await initDb();

    const body: BatchRequest = await req.json();
    const { headers: rawHeaders, rows, batchIndex } = body;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ inserted: 0, updated: 0, errors: [], duplicates: [] });
    }

    const headerMap: Record<string, string> = {};
    for (const h of rawHeaders) {
      const normalized = normalizeHeader(h);
      const dbCol = INBOUND_COLUMN_MAP[normalized];
      if (dbCol) headerMap[h] = dbCol;
    }

    const dbCols = [...new Set(Object.values(headerMap))];
    if (dbCols.length === 0) {
      return NextResponse.json(
        { error: `No matching columns found.` },
        { status: 400 }
      );
    }

    const updateCols = dbCols.filter((c) => !UNIQUE_KEY_COLS.includes(c));
    const updateSet = updateCols.length > 0
      ? updateCols.map((c) => `${c} = EXCLUDED.${c}`).join(', ')
      : null;

    const client = await db.connect();
    let inserted = 0;
    let updated = 0;
    const errors: string[] = [];
    const duplicates: DuplicateRecord[] = [];

    try {
      const colList = dbCols.join(', ');
      const placeholders = dbCols.map((_, i) => `$${i + 1}`).join(', ');

      const conflictAction = updateSet
        ? `ON CONFLICT (shipment, container, unloading_date) DO UPDATE SET ${updateSet} RETURNING (xmax = 0) AS was_inserted`
        : `ON CONFLICT (shipment, container, unloading_date) DO NOTHING`;

      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const values: (string | number | null)[] = [];

        for (const dbCol of dbCols) {
          const rawKey = Object.keys(headerMap).find((k) => headerMap[k] === dbCol);
          const rawVal = rawKey ? (row[rawKey] ?? '') : '';
          values.push(parseCell(rawVal, dbCol, INBOUND_NUMERIC_COLS, INBOUND_DATE_COLS));
        }

        const keyParts: string[] = [];
        for (const kc of UNIQUE_KEY_COLS) {
          const idx = dbCols.indexOf(kc);
          if (idx >= 0) keyParts.push(`${kc}=${values[idx] ?? 'NULL'}`);
        }
        const keyStr = keyParts.join(', ');
        const globalRowNum = batchIndex + rowIdx + 2;

        try {
          const result = await client.query(
            `INSERT INTO inbound_shipments (${colList}) VALUES (${placeholders}) ${conflictAction}`,
            values
          );

          if (updateSet) {
            if (result.rows.length > 0) {
              if (result.rows[0].was_inserted) {
                inserted++;
              } else {
                updated++;
                duplicates.push({ row: globalRowNum, key: keyStr, action: 'updated' });
              }
            }
          } else {
            if ((result.rowCount ?? 0) > 0) {
              inserted++;
            } else {
              duplicates.push({ row: globalRowNum, key: keyStr, action: 'skipped' });
            }
          }
        } catch (rowErr) {
          errors.push(`Row ${globalRowNum}: ${String(rowErr)}`);
        }
      }
    } finally {
      client.release();
    }

    return NextResponse.json({ inserted, updated, errors, duplicates });
  } catch (error) {
    console.error('Batch import error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
