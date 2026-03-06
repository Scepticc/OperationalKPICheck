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
import { ImportResult, DuplicateRecord } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const UNIQUE_KEY_COLS = ['shipment', 'container', 'unloading_date'];

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
      delimiter: ',',
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse CSV', details: parsed.errors },
        { status: 400 }
      );
    }

    const rows = parsed.data;
    if (rows.length === 0) {
      return NextResponse.json({
        inserted: 0, updated: 0, skipped: 0, total: 0, errors: [], duplicates: [],
      });
    }

    const rawHeaders = Object.keys(rows[0]);
    const headerMap: Record<string, string> = {};
    for (const h of rawHeaders) {
      const clean = h.replace(/^\uFEFF/, '').replace(/^["']+|["']+$/g, '').trim();
      const normalized = normalizeHeader(clean);
      const dbCol = INBOUND_COLUMN_MAP[normalized];
      if (dbCol) headerMap[h] = dbCol;
    }

    const dbCols = [...new Set(Object.values(headerMap))];
    if (dbCols.length === 0) {
      return NextResponse.json(
        {
          error: `No matching columns found. CSV headers detected: ${rawHeaders.slice(0, 8).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Build the UPDATE SET clause for non-key columns
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
          const rawKey = Object.keys(headerMap).find(
            (k) => headerMap[k] === dbCol
          );
          const rawVal = rawKey ? (row[rawKey] ?? '') : '';
          values.push(parseCell(rawVal, dbCol, INBOUND_NUMERIC_COLS, INBOUND_DATE_COLS));
        }

        const keyParts: string[] = [];
        for (const kc of UNIQUE_KEY_COLS) {
          const idx = dbCols.indexOf(kc);
          if (idx >= 0) keyParts.push(`${kc}=${values[idx] ?? 'NULL'}`);
        }
        const keyStr = keyParts.join(', ');

        try {
          const result = await client.query(
            `INSERT INTO inbound_shipments (${colList})
             VALUES (${placeholders})
             ${conflictAction}`,
            values
          );

          if (updateSet) {
            if (result.rows.length > 0) {
              const wasInserted = result.rows[0].was_inserted;
              if (wasInserted) {
                inserted++;
              } else {
                updated++;
                duplicates.push({ row: rowIdx + 2, key: keyStr, action: 'updated' });
              }
            }
          } else {
            if ((result.rowCount ?? 0) > 0) {
              inserted++;
            } else {
              duplicates.push({ row: rowIdx + 2, key: keyStr, action: 'skipped' });
            }
          }
        } catch (rowErr) {
          errors.push(`Row ${rowIdx + 2}: ${String(rowErr)}`);
        }
      }
    } finally {
      client.release();
    }

    const result: ImportResult = {
      inserted,
      updated,
      skipped: rows.length - inserted - updated - errors.length,
      total: rows.length,
      errors: errors.slice(0, 20),
      duplicates: duplicates.slice(0, 100),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
