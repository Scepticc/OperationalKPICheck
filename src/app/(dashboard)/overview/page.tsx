'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import KPICard from '@/components/ui/KPICard';
import TrendChart from '@/components/charts/TrendChart';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { formatNumber, formatPercent, formatMinutes } from '@/lib/utils';
import { ArrowRight, TrendingUp, TrendingDown, Package, BarChart3 } from 'lucide-react';

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
  const outCharts = outData?.charts as { trend: unknown[] } | undefined;
  const inCharts  = inData?.charts  as { trend: unknown[] } | undefined;

  return (
    <div className="flex flex-col h-full">
      <Header title="Overview" />

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {loading ? <PageLoading /> : (
          <>
            {/* ── Outbound ─────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-5 rounded-full bg-blue-500" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Outbound</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 ml-1">Shipments</span>
                </div>
                <Link
                  href="/outbound-kpis"
                  className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Full report <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <KPICard title="Shipments"       kpi={outKpis?.row_count}           format={formatNumber}  icon={<TrendingUp className="w-3.5 h-3.5" />} accentColor="blue" />
                <KPICard title="Cartons"         kpi={outKpis?.total_cartons}        format={formatNumber}  accentColor="blue" />
                <KPICard title="Pallets"         kpi={outKpis?.total_pallets}        format={formatNumber}  accentColor="blue" />
                <KPICard title="Return Rate"     kpi={outKpis?.return_rate}          format={formatPercent} higherIsBetter={false} accentColor="amber" />
                <KPICard title="On-time Pickup"  kpi={outKpis?.on_time_pickup_rate}  format={formatPercent} accentColor="emerald" />
                <KPICard title="Avg Loading"     kpi={outKpis?.avg_loading_time}     format={formatMinutes} higherIsBetter={false} accentColor="violet" />
              </div>

              {outCharts?.trend && outCharts.trend.length > 0 && (
                <div className="mt-3">
                  <TrendChart
                    data={outCharts.trend as Parameters<typeof TrendChart>[0]['data']}
                    title="Outbound Carton Trend"
                  />
                </div>
              )}
            </section>

            {/* ── Inbound ──────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Inbound</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 ml-1">Shipments</span>
                </div>
                <Link
                  href="/inbound-kpis"
                  className="flex items-center gap-1 text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  Full report <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <KPICard title="Shipments"       kpi={inKpis?.row_count}           format={formatNumber}  icon={<TrendingDown className="w-3.5 h-3.5" />} accentColor="emerald" />
                <KPICard title="Cartons Recv."   kpi={inKpis?.total_cartons}       format={formatNumber}  accentColor="emerald" />
                <KPICard title="Pallets Recv."   kpi={inKpis?.total_pallets}       format={formatNumber}  accentColor="emerald" />
                <KPICard title="On-time Arrival" kpi={inKpis?.on_time_arrival_rate} format={formatPercent} accentColor="emerald" />
                <KPICard title="Decon Completed" kpi={inKpis?.decon_completed_rate} format={formatPercent} accentColor="violet" />
                <KPICard title="Avg Unloading"   kpi={inKpis?.avg_unloading_time}  format={formatMinutes} higherIsBetter={false} accentColor="amber" />
              </div>

              {inCharts?.trend && inCharts.trend.length > 0 && (
                <div className="mt-3">
                  <TrendChart
                    data={inCharts.trend as Parameters<typeof TrendChart>[0]['data']}
                    title="Inbound Carton Trend"
                  />
                </div>
              )}
            </section>

            {/* ── Quick links ───────────────────────────────── */}
            <section>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-700 mb-3">Quick access</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { href: '/outbound-kpis', label: 'Outbound KPIs',  desc: 'Full outbound metrics',     icon: <TrendingUp className="w-4 h-4" />,  color: 'text-blue-400',    border: 'hover:border-blue-500/30' },
                  { href: '/inbound-kpis',  label: 'Inbound KPIs',   desc: 'Full inbound metrics',      icon: <TrendingDown className="w-4 h-4" />, color: 'text-emerald-400', border: 'hover:border-emerald-500/30' },
                  { href: '/outbound-data', label: 'Outbound Data',  desc: 'Browse outbound records',   icon: <BarChart3 className="w-4 h-4" />,   color: 'text-violet-400',  border: 'hover:border-violet-500/30' },
                  { href: '/import',        label: 'Import Data',    desc: 'Upload CSV files',          icon: <Package className="w-4 h-4" />,     color: 'text-amber-400',   border: 'hover:border-amber-500/30' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`card p-4 flex items-start gap-3 transition-all duration-150 hover:shadow-md dark:hover:shadow-none ${item.border}`}
                  >
                    <div className={`mt-0.5 shrink-0 ${item.color}`}>{item.icon}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{item.label}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5 truncate">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 ml-auto shrink-0 mt-0.5" />
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
