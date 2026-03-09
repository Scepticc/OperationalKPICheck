'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TimeDataPoint } from '@/types';

interface TimeBarChartProps {
  data: TimeDataPoint[];
  title: string;
  color?: string;
  unit?: string;
  maxItems?: number;
}

const BAR_COLORS = ['#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, unit }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm">
      <p className="text-xs font-medium text-navy-900 mb-1.5 max-w-[200px] truncate">{d.payload.name}</p>
      <div className="flex justify-between gap-6">
        <span className="text-xs text-gray-500">Avg Time</span>
        <span className="text-xs font-medium text-violet-600 tabular-nums">
          {d.value != null ? `${Number(d.value).toFixed(1)} ${unit}` : '—'}
        </span>
      </div>
    </div>
  );
}

export default function TimeBarChart({
  data,
  title,
  color = '#8b5cf6',
  unit = 'min',
  maxItems = 12,
}: TimeBarChartProps) {
  const filtered = data.filter((d) => d.avg_time != null).slice(0, maxItems);

  if (!filtered.length) {
    return (
      <div className="card p-5">
        <p className="section-title mb-3">{title}</p>
        <div className="h-44 flex items-center justify-center text-gray-400 text-sm">No data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...filtered.map((d) => Number(d.avg_time ?? 0)));

  return (
    <div className="card p-5">
      <p className="section-title mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={Math.max(200, filtered.length * 28)}>
        <BarChart data={filtered} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }} barSize={10}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}m`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={120} tickFormatter={(val: string) => val.length > 18 ? val.slice(0, 18) + '\u2026' : val} />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
          <Bar dataKey="avg_time" name="Avg Time" radius={[0, 4, 4, 0]}>
            {filtered.map((entry, index) => (
              <Cell key={entry.name} fill={BAR_COLORS[index % BAR_COLORS.length] ?? color} opacity={Number(entry.avg_time ?? 0) === maxValue ? 1 : 0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
