'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { TimeTrendPoint } from '@/types';

interface SeriesConfig {
  key: string;
  label: string;
  color: string;
  type: 'bar' | 'line';
}

interface OperationsTimeTrendProps {
  data: TimeTrendPoint[];
  granularity?: string;
  title?: string;
  series: SeriesConfig[];
}

const dateFormats: Record<string, string> = {
  day:   'dd MMM',
  week:  "'W'w MMM",
  month: 'MMM yy',
};

function ceilNice(v: number): number {
  if (v <= 0) return 10;
  const order = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / order) * order;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, granularity }: any) {
  if (!active || !payload?.length) return null;
  let formattedDate = label;
  try {
    formattedDate = format(parseISO(label), dateFormats[granularity ?? 'day'] ?? 'dd MMM yyyy');
  } catch {}

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm">
      <p className="text-[10px] font-medium uppercase tracking-wider text-navy-500 mb-2">{formattedDate}</p>
      {payload.map((p: { name: string; value: number | null; color: string }) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-gray-500">{p.name}</span>
          </div>
          <span className="text-xs font-medium text-navy-900 tabular-nums">
            {p.value != null ? `${Number(p.value).toFixed(1)} min` : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function OperationsTimeTrend({
  data,
  granularity = 'day',
  title = 'Operations Time Trend',
  series,
}: OperationsTimeTrendProps) {
  const fmt = dateFormats[granularity] ?? 'dd MMM';
  const formatted = useMemo(() => data.map((d) => ({
    ...d,
    label: (() => { try { return format(parseISO(d.period), fmt); } catch { return d.period; } })(),
  })), [data, fmt]);

  const yMax = useMemo(() => {
    let max = 0;
    for (const d of data) {
      for (const s of series) {
        const v = Number((d as unknown as Record<string, unknown>)[s.key] ?? 0);
        if (v > max) max = v;
      }
    }
    return ceilNice(max * 1.2);
  }, [data, series]);

  if (!data.length) {
    return (
      <div className="card p-5">
        <p className="section-title mb-3">{title}</p>
        <div className="h-44 flex items-center justify-center text-gray-400 text-sm">No data available</div>
      </div>
    );
  }

  const barSeries = series.filter((s) => s.type === 'bar');
  const lineSeries = series.filter((s) => s.type === 'line');

  return (
    <div className="card p-5">
      <p className="section-title mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={formatted} margin={{ top: 16, right: 24, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickMargin={8} angle={-35} textAnchor="end" interval="preserveStartEnd" height={40} />
          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}m`} width={48} domain={[0, yMax]} allowDataOverflow={false} />
          <Tooltip content={<CustomTooltip granularity={granularity} />} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, color: '#6b7280' }} iconType="circle" iconSize={6} />
          {barSeries.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} opacity={0.75} radius={[3, 3, 0, 0]} barSize={10} />
          ))}
          {lineSeries.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: s.color, strokeWidth: 0 }} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
