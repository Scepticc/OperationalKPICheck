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
  day: 'dd MMM',
  week: "'W'w MMM",
  month: 'MMM yyyy',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, granularity }: any) {
  if (!active || !payload?.length) return null;
  let formattedDate = label;
  try {
    formattedDate = format(parseISO(label), dateFormats[granularity ?? 'day'] ?? 'dd MMM yyyy');
  } catch {}

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{formattedDate}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100">
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
    label: (() => {
      try { return format(parseISO(d.period), fmt); } catch { return d.period; }
    })(),
  }));

  if (!data.length) {
    return (
      <div className="card p-5">
        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-4">{title}</p>
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={formatted} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
          />
          <Tooltip
            content={<CustomTooltip granularity={granularity} />}
            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey={valueKey as string}
            name={valueLabel}
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#3b82f6' }}
          />
          <Line
            type="monotone"
            dataKey="shipment_count"
            name="Shipments"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#10b981' }}
            strokeDasharray="4 4"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
