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

const BAR_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#ef4444'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white dark:bg-[#0c1829] border border-slate-200 dark:border-[#1d2f4d] rounded-xl shadow-2xl p-3 text-sm">
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-2 max-w-[200px] truncate">{d.payload.name}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-6">
          <span className="text-xs text-slate-400">Cartons</span>
          <span className="text-xs font-semibold tabular-nums">{Number(d.payload.total_cartons).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-xs text-slate-400">Shipments</span>
          <span className="text-xs font-semibold tabular-nums">{Number(d.payload.shipment_count).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function CategoryBarChart({
  data,
  title,
  color = '#3b82f6',
  valueKey = 'total_cartons',
  valueLabel = 'Cartons',
  maxItems = 12,
  onBarClick,
}: CategoryBarChartProps) {
  const sliced = data.slice(0, maxItems);

  if (!sliced.length) {
    return (
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-4">{title}</p>
        <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-700 text-sm">No data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...sliced.map((d) => Number(d[valueKey] ?? 0)));

  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-5">{title}</p>
      <ResponsiveContainer width="100%" height={Math.max(220, sliced.length * 30)}>
        <BarChart
          data={sliced}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          barSize={10}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="currentColor"
            className="text-slate-100 dark:text-[#0f1e36]"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={110}
            tickFormatter={(val: string) => val.length > 16 ? val.slice(0, 16) + '…' : val}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
          <Bar
            dataKey={valueKey as string}
            name={valueLabel}
            radius={[0, 4, 4, 0]}
            cursor={onBarClick ? 'pointer' : undefined}
            onClick={onBarClick ? (d) => onBarClick(d.name as string) : undefined}
          >
            {sliced.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={BAR_COLORS[index % BAR_COLORS.length] ?? color}
                opacity={Number(entry[valueKey] ?? 0) === maxValue ? 1 : 0.65}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
