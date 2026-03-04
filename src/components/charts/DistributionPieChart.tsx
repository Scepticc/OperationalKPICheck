'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface DistributionPieChartProps {
  data: DataPoint[];
  title: string;
  maxItems?: number;
}

const COLORS = ['#84cc16', '#22d3ee', '#a78bfa', '#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#fb923c', '#f87171', '#2dd4bf'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-navy-900 border border-navy-700/60 rounded-xl shadow-xl shadow-black/20 p-3 text-sm backdrop-blur-sm">
      <p className="text-xs font-semibold text-white mb-1 max-w-[180px] truncate">{d.name}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-gray-500">Value</span>
        <span className="text-xs font-semibold text-lime-400 tabular-nums">{Number(d.value).toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between gap-4 mt-0.5">
        <span className="text-xs text-gray-500">Share</span>
        <span className="text-xs font-semibold text-cyan-400 tabular-nums">{(d.payload.percent * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

export default function DistributionPieChart({
  data,
  title,
  maxItems = 8,
}: DistributionPieChartProps) {
  if (!data.length) {
    return (
      <div className="card p-5">
        <p className="section-title mb-3">{title}</p>
        <div className="h-44 flex items-center justify-center text-gray-600 text-sm">No data available</div>
      </div>
    );
  }

  const sliced = data.slice(0, maxItems);
  const otherTotal = data.slice(maxItems).reduce((sum, d) => sum + d.value, 0);
  const chartData = otherTotal > 0 ? [...sliced, { name: 'Other', value: otherTotal }] : sliced;
  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  const withPercent = chartData.map(d => ({ ...d, percent: total > 0 ? d.value / total : 0 }));

  return (
    <div className="card p-5">
      <p className="section-title mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={withPercent}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {withPercent.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
            iconType="circle"
            iconSize={6}
            formatter={(value: string) => (
              <span className="text-gray-400 text-[10px]">{value.length > 18 ? value.slice(0, 18) + '\u2026' : value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
