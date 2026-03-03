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

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1 max-w-[200px] truncate">
        {d.payload.name}
      </p>
      <div className="flex gap-4">
        <div>
          <span className="text-slate-400">Cartons: </span>
          <span className="font-semibold">{Number(d.payload.total_cartons).toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-400">Shipments: </span>
          <span className="font-semibold">{Number(d.payload.shipment_count).toLocaleString()}</span>
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
  maxItems = 15,
  onBarClick,
}: CategoryBarChartProps) {
  const sliced = data.slice(0, maxItems);

  if (!sliced.length) {
    return (
      <div className="card p-5">
        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-4">{title}</p>
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...sliced.map((d) => Number(d[valueKey] ?? 0)));

  return (
    <div className="card p-5">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={Math.max(240, sliced.length * 32)}>
        <BarChart
          data={sliced}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            className="stroke-slate-200 dark:stroke-slate-700"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={120}
            tickFormatter={(val: string) => val.length > 18 ? val.slice(0, 18) + '…' : val}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
          <Bar
            dataKey={valueKey as string}
            name={valueLabel}
            radius={[0, 4, 4, 0]}
            cursor={onBarClick ? 'pointer' : undefined}
            onClick={
              onBarClick ? (d) => onBarClick(d.name as string) : undefined
            }
          >
            {sliced.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length] ?? color}
                opacity={Number(entry[valueKey] ?? 0) === maxValue ? 1 : 0.75}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
