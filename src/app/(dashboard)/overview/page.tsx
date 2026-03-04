'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import KPICard from '@/components/ui/KPICard';
import TrendChart from '@/components/charts/TrendChart';
import AreaTrendChart from '@/components/charts/AreaTrendChart';
import DistributionPieChart from '@/components/charts/DistributionPieChart';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { formatNumber, formatPercent, formatMinutes } from '@/lib/utils';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Package,
  BarChart3,
  Upload,
  Table2,
} from 'lucide-react';

export default function OverviewPage() {
  const { globalStartDate, globalEndDate } = useApp();
  const [outData, setOutData] = useState<Record<string, unknown> | null>(null);
  const [inData, setInData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ startDate: globalStartDate, endDate: globalEndDate });
    Promise.all([
      fetch(`/api/outbound/kpis?${params}`).then((r) => r.json()),
      fetch(`/api/inbound/kpis?${params}`).then((r) => r.json()),
    ])
      .then(([out, inn]) => { setOutData(out); setInData(inn); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [globalStartDate, globalEndDate]);

  const outKpis = outData?.kpis as Record<string, { current: number | null; previous: number | null; change: number | null }> | undefined;
  const inKpis  = inData?.kpis  as Record<string, { current: number | null; previous: number | null; change: number | null }> | undefined;
  const outCharts = outData?.charts as { trend: unknown[]; by_customer?: unknown[]; by_country?: unknown[] } | undefined;
  const inCharts  = inData?.charts  as { trend: unknown[]; by_customer?: unknown[]; by_gate?: unknown[] } | undefined;

  return (
    <div className="flex flex-col h-full">
      <Header title="Executive Overview" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? <PageLoading /> : (
          <>
            {/* Outbound Section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-lime-500" />
                  <h2 className="text-sm font-semibold text-white">Outbound Operations</h2>
                </div>
                <Link
                  href="/outbound-kpis"
                  className="flex items-center gap-1 text-xs font-medium text-lime-400 hover:text-lime-500 transition-colors"
                >
                  View details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <KPICard title="Shipments"       kpi={outKpis?.row_count}           format={formatNumber}  icon={<Package className="w-3.5 h-3.5" />} accentColor="lime" />
                <KPICard title="Cartons"         kpi={outKpis?.total_cartons}        format={formatNumber}  accentColor="lime" />
                <KPICard title="Pallets"         kpi={outKpis?.total_pallets}        format={formatNumber}  accentColor="lime" />
                <KPICard title="Return Rate"     kpi={outKpis?.return_rate}          format={formatPercent} higherIsBetter={false} accentColor="amber" />
                <KPICard title="On-time Pickup"  kpi={outKpis?.on_time_pickup_rate}  format={formatPercent} accentColor="cyan" />
                <KPICard title="Avg Loading"     kpi={outKpis?.avg_loading_time}     format={formatMinutes} higherIsBetter={false} accentColor="violet" />
              </div>

              {outCharts?.trend && outCharts.trend.length > 0 && (
                <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <TrendChart
                    data={outCharts.trend as Parameters<typeof TrendChart>[0]['data']}
                    title="Outbound Carton Trend"
                  />
                  <DistributionPieChart
                    data={(outCharts.by_customer as { name: string; total_cartons: number }[] ?? []).map(d => ({ name: d.name, value: Number(d.total_cartons) }))}
                    title="Outbound by Customer"
                  />
                </div>
              )}
            </section>

            {/* Inbound Section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-cyan-400" />
                  <h2 className="text-sm font-semibold text-white">Inbound Operations</h2>
                </div>
                <Link
                  href="/inbound-kpis"
                  className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-400 transition-colors"
                >
                  View details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <KPICard title="Shipments"       kpi={inKpis?.row_count}           format={formatNumber}  icon={<Package className="w-3.5 h-3.5" />} accentColor="cyan" />
                <KPICard title="Cartons Recv."   kpi={inKpis?.total_cartons}       format={formatNumber}  accentColor="cyan" />
                <KPICard title="Pallets Recv."   kpi={inKpis?.total_pallets}       format={formatNumber}  accentColor="cyan" />
                <KPICard title="On-time Arrival" kpi={inKpis?.on_time_arrival_rate} format={formatPercent} accentColor="cyan" />
                <KPICard title="Decon Completed" kpi={inKpis?.decon_completed_rate} format={formatPercent} accentColor="violet" />
                <KPICard title="Avg Unloading"   kpi={inKpis?.avg_unloading_time}  format={formatMinutes} higherIsBetter={false} accentColor="amber" />
              </div>

              {inCharts?.trend && inCharts.trend.length > 0 && (
                <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <TrendChart
                    data={inCharts.trend as Parameters<typeof TrendChart>[0]['data']}
                    title="Inbound Carton Trend"
                  />
                  <DistributionPieChart
                    data={(inCharts.by_customer as { name: string; total_cartons: number }[] ?? []).map(d => ({ name: d.name, value: Number(d.total_cartons) }))}
                    title="Inbound by Customer"
                  />
                </div>
              )}
            </section>

            {/* Quick Navigation */}
            <section>
              <p className="section-title mb-3">Quick Access</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { href: '/outbound-kpis', label: 'Outbound KPIs',  desc: 'Full outbound metrics',     icon: <TrendingUp className="w-4 h-4" />,  color: 'text-lime-400',    hoverBorder: 'hover:border-lime-500/30' },
                  { href: '/inbound-kpis',  label: 'Inbound KPIs',   desc: 'Full inbound metrics',      icon: <TrendingDown className="w-4 h-4" />, color: 'text-cyan-400', hoverBorder: 'hover:border-cyan-400/30' },
                  { href: '/outbound-data', label: 'Outbound Data',  desc: 'Browse outbound records',   icon: <Table2 className="w-4 h-4" />,      color: 'text-violet-400',  hoverBorder: 'hover:border-violet-400/30' },
                  { href: '/import',        label: 'Import Data',    desc: 'Upload CSV files',          icon: <Upload className="w-4 h-4" />,      color: 'text-amber-400',   hoverBorder: 'hover:border-amber-400/30' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`card p-3.5 flex items-start gap-3 transition-colors duration-100 ${item.hoverBorder}`}
                  >
                    <div className={`mt-0.5 shrink-0 ${item.color}`}>{item.icon}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.label}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 ml-auto shrink-0 mt-0.5" />
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
