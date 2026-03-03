'use client';

import {
  LineChart,
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

interface TrendChartProps {
  data: TrendDataPoint[];
  granularity?: string;
  title?: string;
  valueKey?: keyof TrendDataPoint;
  valueLabel?: string;
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
    <div className="bg-white dark:bg-[#0c1829] border border-slate-200 dark:border-[#1d2f4d] rounded-xl shadow-2xl p-3 text-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-2">{formattedDate}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-slate-500 dark:text-slate-400">{p.name}</span>
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
            {p.value.toLocaleString('en-US', { maximumFractionDigits: 1 })}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TrendChart({
  data,
  granularity = 'day',
  title = 'Carton Trend',
  valueKey = 'total_cartons',
  valueLabel = 'Cartons',
}: TrendChartProps) {
  const fmt = dateFormats[granularity] ?? 'dd MMM';
  const formatted = data.map((d) => ({
    ...d,
    period: d.period,
    label: (() => { try { return format(parseISO(d.period), fmt); } catch { return d.period; } })(),
  }));

  if (!data.length) {
    return (
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-4">{title}</p>
        <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-700 text-sm">No data available</div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-5">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={formatted} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-slate-100 dark:text-[#0f1e36]"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            width={40}
          />
          <Tooltip
            content={<CustomTooltip granularity={granularity} />}
            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.5 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 12, color: '#64748b' }}
            iconType="circle"
            iconSize={6}
          />
          <Line
            type="monotone"
            dataKey={valueKey as string}
            name={valueLabel}
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="shipment_count"
            name="Shipments"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
            strokeDasharray="5 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
