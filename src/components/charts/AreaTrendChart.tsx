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
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">{formattedDate}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-gray-500">{p.name}</span>
          </div>
          <span className="text-xs font-semibold text-gray-800 tabular-nums">
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
      <div className="card p-4">
        <p className="section-title mb-3">{title}</p>
        <div className="h-44 flex items-center justify-center text-gray-400 text-sm">No data available</div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <p className="section-title mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={formatted} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01}/>
            </linearGradient>
            <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0.01}/>
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-gray-100"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            width={36}
          />
          <Tooltip
            content={<CustomTooltip granularity={granularity} />}
            cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.4 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 10, color: '#9ca3af' }}
            iconType="circle"
            iconSize={6}
          />
          <Area
            type="monotone"
            dataKey="shipment_count"
            name="Shipments"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#gradBlue)"
            dot={false}
            activeDot={{ r: 3.5, fill: '#2563eb', strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="total_cartons"
            name="Cartons"
            stroke="#059669"
            strokeWidth={1.5}
            fill="url(#gradGreen)"
            dot={false}
            activeDot={{ r: 3.5, fill: '#059669', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
