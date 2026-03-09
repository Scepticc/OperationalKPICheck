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

function ceilNice(v: number): number {
  if (v <= 0) return 10;
  const order = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / order) * order;
}

const fmtAxis = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm">
      <p className="text-xs font-medium text-navy-900 mb-1.5 max-w-[200px] truncate">{d.payload.name}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-6">
          <span className="text-xs text-gray-500">Cartons</span>
          <span className="text-xs font-medium text-lime-600 tabular-nums">{Number(d.payload.total_cartons).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-xs text-gray-500">Shipments</span>
          <span className="text-xs font-medium text-navy-700 tabular-nums">{Number(d.payload.shipment_count).toLocaleString()}</span>
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

  const hasShipments = useMemo(() => sliced.some((d) => Number(d.shipment_count ?? 0) > 0), [sliced]);

  const { barMax, lineMax } = useMemo(() => {
    const bMax = Math.max(0, ...sliced.map((d) => Number(d[valueKey] ?? 0)));
    const lMax = Math.max(0, ...sliced.map((d) => Number(d.shipment_count ?? 0)));
    return {
      barMax: ceilNice(bMax * 1.2),
      lineMax: ceilNice(lMax * 1.2),
    };
  }, [sliced, valueKey]);

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
      <ResponsiveContainer width="100%" height={Math.max(220, sliced.length * 32)}>
        <ComposedChart data={sliced} layout="vertical" margin={{ top: 4, right: hasShipments ? 12 : 8, left: 4, bottom: 0 }} barSize={12}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis xAxisId="bar" type="number" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} domain={[0, barMax]} orientation="bottom" />
          {hasShipments && (
            <XAxis xAxisId="line" type="number" tick={{ fontSize: 10, fill: '#0f1a3e' }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} domain={[0, lineMax]} orientation="top" hide />
          )}
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={120} tickFormatter={(val: string) => val.length > 18 ? val.slice(0, 18) + '\u2026' : val} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(132,204,22,0.06)' }} />
          {hasShipments && (
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6, color: '#6b7280' }} iconType="circle" iconSize={6} />
          )}
          <Bar xAxisId="bar" dataKey={valueKey as string} name="Cartons" radius={[0, 4, 4, 0]} cursor={onBarClick ? 'pointer' : undefined} onClick={onBarClick ? (d) => onBarClick(d.name as string) : undefined}>
            {sliced.map((entry, index) => (
              <Cell key={entry.name} fill={BAR_COLORS[index % BAR_COLORS.length] ?? color} opacity={Number(entry[valueKey] ?? 0) === maxValue ? 1 : 0.7} />
            ))}
          </Bar>
          {hasShipments && (
            <Line xAxisId="line" type="monotone" dataKey="shipment_count" name="Shipments" stroke="#0f1a3e" strokeWidth={1.5} dot={{ r: 3, fill: '#0f1a3e', strokeWidth: 0 }} layout="vertical" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
