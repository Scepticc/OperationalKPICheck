'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import KPICard from '@/components/ui/KPICard';
import TrendChart from '@/components/charts/TrendChart';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { formatNumber, formatPercent, formatMinutes } from '@/lib/utils';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

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
      .then(([out, inn]) => {
        setOutData(out);
        setInData(inn);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [globalStartDate, globalEndDate]);

  const outKpis = outData?.kpis as Record<string, { current: number | null; previous: number | null; change: number | null }> | undefined;
  const inKpis = inData?.kpis as Record<string, { current: number | null; previous: number | null; change: number | null }> | undefined;
  const outCharts = outData?.charts as { trend: unknown[] } | undefined;
  const inCharts = inData?.charts as { trend: unknown[] } | undefined;

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard Overview" />
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {loading ? (
          <PageLoading />
        ) : (
          <>
            {/* Outbound summary */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Outbound Summary
                  </h2>
                </div>
                <Link
                  href="/outbound-kpis"
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all KPIs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard
                  title="Shipments"
                  kpi={outKpis?.row_count}
                  format={(v) => formatNumber(v)}
                  icon={<TrendingUp className="w-4 h-4" />}
                />
                <KPICard
                  title="Cartons"
                  kpi={outKpis?.total_cartons}
                  format={(v) => formatNumber(v)}
                />
                <KPICard
                  title="Pallets"
                  kpi={outKpis?.total_pallets}
                  format={(v) => formatNumber(v)}
                />
                <KPICard
                  title="Return Rate"
                  kpi={outKpis?.return_rate}
                  format={(v) => formatPercent(v)}
                  higherIsBetter={false}
                />
                <KPICard
                  title="On-time Pickup"
                  kpi={outKpis?.on_time_pickup_rate}
                  format={(v) => formatPercent(v)}
                />
                <KPICard
                  title="Avg Loading Time"
                  kpi={outKpis?.avg_loading_time}
                  format={(v) => formatMinutes(v)}
                  higherIsBetter={false}
                />
              </div>

              {outCharts?.trend && outCharts.trend.length > 0 && (
                <div className="mt-4">
                  <TrendChart
                    data={outCharts.trend as Parameters<typeof TrendChart>[0]['data']}
                    title="Outbound Carton Trend"
                  />
                </div>
              )}
            </section>

            {/* Inbound summary */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-600 rounded-full" />
                  <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Inbound Summary
                  </h2>
                </div>
                <Link
                  href="/inbound-kpis"
                  className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View all KPIs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard
                  title="Shipments"
                  kpi={inKpis?.row_count}
                  format={(v) => formatNumber(v)}
                  icon={<TrendingDown className="w-4 h-4" />}
                />
                <KPICard
                  title="Cartons Received"
                  kpi={inKpis?.total_cartons}
                  format={(v) => formatNumber(v)}
                />
                <KPICard
                  title="Pallets Received"
                  kpi={inKpis?.total_pallets}
                  format={(v) => formatNumber(v)}
                />
                <KPICard
                  title="On-time Arrival"
                  kpi={inKpis?.on_time_arrival_rate}
                  format={(v) => formatPercent(v)}
                />
                <KPICard
                  title="Decon Completed"
                  kpi={inKpis?.decon_completed_rate}
                  format={(v) => formatPercent(v)}
                />
                <KPICard
                  title="Avg Unloading Time"
                  kpi={inKpis?.avg_unloading_time}
                  format={(v) => formatMinutes(v)}
                  higherIsBetter={false}
                />
              </div>

              {inCharts?.trend && inCharts.trend.length > 0 && (
                <div className="mt-4">
                  <TrendChart
                    data={inCharts.trend as Parameters<typeof TrendChart>[0]['data']}
                    title="Inbound Carton Trend"
                  />
                </div>
              )}
            </section>

            {/* Quick links */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { href: '/outbound-kpis', label: 'Outbound KPIs', color: 'bg-blue-600', desc: 'Full outbound metrics' },
                { href: '/inbound-kpis', label: 'Inbound KPIs', color: 'bg-emerald-600', desc: 'Full inbound metrics' },
                { href: '/outbound-data', label: 'Outbound Data', color: 'bg-indigo-600', desc: 'Browse raw outbound data' },
                { href: '/import', label: 'Import Data', color: 'bg-violet-600', desc: 'Upload CSV files' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="card p-4 hover:shadow-md transition-shadow flex items-start gap-3"
                >
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${item.color}`} />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{item.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 ml-auto shrink-0 mt-0.5" />
                </Link>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
