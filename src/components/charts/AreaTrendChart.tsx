'use client';

import {
  AreaChart,
  Area,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, granularity }: any) {
  if (!active || !payload?.length) return null;
  let formattedDate = label;
  try {
    formattedDate = format(parseISO(label), dateFormats[granularity ?? 'day'] ?? 'dd MMM yyyy');
  } catch {}

  return (
    <div className="bg-navy-900 border border-navy-700/60 rounded-xl shadow-xl shadow-black/20 p-3 text-sm backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-lime-500/50 mb-2">{formattedDate}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-gray-400">{p.name}</span>
          </div>
          <span className="text-xs font-semibold text-white tabular-nums">
            {p.value.toLocaleString('en-US', { maximumFractionDigits: 1 })}
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
  const formatted = data.map((d) => ({
    ...d,
    period: d.period,
    label: (() => { try { return format(parseISO(d.period), fmt); } catch { return d.period; } })(),
  }));

  if (!data.length) {
    return (
      <div className="card p-5">
        <p className="section-title mb-3">{title}</p>
        <div className="h-44 flex items-center justify-center text-gray-600 text-sm">No data available</div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <p className="section-title mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={formatted} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gradLime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#84cc16" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#84cc16" stopOpacity={0.01}/>
            </linearGradient>
            <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.20}/>
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.01}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2553" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} tickMargin={8} />
          <YAxis tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} width={36} />
          <Tooltip content={<CustomTooltip granularity={granularity} />} cursor={{ stroke: '#84cc16', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.3 }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, color: '#6b7280' }} iconType="circle" iconSize={6} />
          <Area type="monotone" dataKey="shipment_count" name="Shipments" stroke="#84cc16" strokeWidth={2} fill="url(#gradLime)" dot={false} activeDot={{ r: 4, fill: '#84cc16', strokeWidth: 0 }} />
          <Area type="monotone" dataKey="total_cartons" name="Cartons" stroke="#22d3ee" strokeWidth={1.5} fill="url(#gradCyan)" dot={false} activeDot={{ r: 3.5, fill: '#22d3ee', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
