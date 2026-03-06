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
import { CategoryDataPoint } from '@/types';

interface CategoryBarChartProps {
  data: CategoryDataPoint[];
  title: string;
  color?: string;
  valueKey?: keyof CategoryDataPoint;
  valueLabel?: string;
  maxItems?: number;
  onBarClick?: (name: string) => void;
}

const BAR_COLORS = ['#84cc16', '#1a2553', '#a78bfa', '#f59e0b', '#ec4899', '#10b981', '#3b82f6', '#f97316', '#ef4444', '#14b8a6'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm">
      <p className="text-xs font-semibold text-navy-900 mb-1.5 max-w-[200px] truncate">{d.payload.name}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-6">
          <span className="text-xs text-gray-500">Cartons</span>
          <span className="text-xs font-semibold text-lime-600 tabular-nums">{Number(d.payload.total_cartons).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-xs text-gray-500">Shipments</span>
          <span className="text-xs font-semibold text-navy-700 tabular-nums">{Number(d.payload.shipment_count).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function CategoryBarChart({
  data,
  title,
  color = '#84cc16',
  valueKey = 'total_cartons',
  maxItems = 12,
  onBarClick,
}: CategoryBarChartProps) {
  const sliced = data.slice(0, maxItems);

  if (!sliced.length) {
    return (
      <div className="card p-5">
        <p className="section-title mb-3">{title}</p>
        <div className="h-44 flex items-center justify-center text-gray-400 text-sm">No data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...sliced.map((d) => Number(d[valueKey] ?? 0)));

  return (
    <div className="card p-5">
      <p className="section-title mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={Math.max(200, sliced.length * 28)}>
        <BarChart data={sliced} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barSize={10}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={100} tickFormatter={(val: string) => val.length > 14 ? val.slice(0, 14) + '\u2026' : val} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(132,204,22,0.06)' }} />
          <Bar dataKey={valueKey as string} name="Cartons" radius={[0, 4, 4, 0]} cursor={onBarClick ? 'pointer' : undefined} onClick={onBarClick ? (d) => onBarClick(d.name as string) : undefined}>
            {sliced.map((entry, index) => (
              <Cell key={entry.name} fill={BAR_COLORS[index % BAR_COLORS.length] ?? color} opacity={Number(entry[valueKey] ?? 0) === maxValue ? 1 : 0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
