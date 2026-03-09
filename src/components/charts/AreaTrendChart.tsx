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
import { TrendDataPoint } from '@/types';

interface AreaTrendChartProps {
  data: TrendDataPoint[];
  granularity?: string;
  title?: string;
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

const fmtAxis = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v));

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
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-gray-500">{p.name}</span>
          </div>
          <span className="text-xs font-medium text-navy-900 tabular-nums">
            {p.value?.toLocaleString('en-US', { maximumFractionDigits: 1 }) ?? '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AreaTrendChart({
  data,
  granularity = 'day',
  title = 'Shipment Volume',
}: AreaTrendChartProps) {
  const fmt = dateFormats[granularity] ?? 'dd MMM';
  const formatted = useMemo(() => data.map((d) => ({
    ...d,
    period: d.period,
    label: (() => { try { return format(parseISO(d.period), fmt); } catch { return d.period; } })(),
  })), [data, fmt]);

  const { leftMax, rightMax } = useMemo(() => {
    const lMax = Math.max(0, ...data.map((d) => Number(d.shipment_count ?? 0)));
    const rMax = Math.max(0, ...data.map((d) => Number(d.total_cartons ?? 0)));
    return {
      leftMax: ceilNice(lMax * 1.2),
      rightMax: ceilNice(rMax * 1.2),
    };
  }, [data]);

  if (!data.length) {
    return (
      <div className="card p-5">
        <p className="section-title mb-3">{title}</p>
        <div className="h-44 flex items-center justify-center text-gray-400 text-sm">No data available</div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <p className="section-title mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={formatted} margin={{ top: 16, right: 12, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickMargin={8} angle={-35} textAnchor="end" interval="preserveStartEnd" height={40} />
          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#84cc16' }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} width={48} domain={[0, leftMax]} allowDataOverflow={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#1a2553' }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} width={48} domain={[0, rightMax]} allowDataOverflow={false} />
          <Tooltip content={<CustomTooltip granularity={granularity} />} cursor={{ fill: 'rgba(132,204,22,0.06)' }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, color: '#6b7280' }} iconType="circle" iconSize={6} />
          <Bar yAxisId="left" dataKey="shipment_count" name="Shipments" fill="#84cc16" opacity={0.75} radius={[3, 3, 0, 0]} barSize={14} />
          <Line yAxisId="right" type="monotone" dataKey="total_cartons" name="Cartons" stroke="#1a2553" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#1a2553', strokeWidth: 0 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
