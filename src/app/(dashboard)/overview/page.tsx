'use client';

import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import KPICard from '@/components/ui/KPICard';
import TrendChart from '@/components/charts/TrendChart';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { formatNumber, formatPercent, formatMinutes } from '@/lib/utils';
import { ArrowRight, Wallet, ShieldCheck, Activity, Truck, Factory, Target, Landmark } from 'lucide-react';

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

  const executiveSignals = useMemo(() => {
    const outboundVolume = outKpis?.total_cartons?.current ?? 0;
    const inboundVolume = inKpis?.total_cartons?.current ?? 0;
    const blendedService = ((outKpis?.on_time_pickup_rate?.current ?? 0) + (inKpis?.on_time_arrival_rate?.current ?? 0)) / 2;
    const cycleTime = ((outKpis?.avg_loading_time?.current ?? 0) + (inKpis?.avg_unloading_time?.current ?? 0)) / 2;

    return {
      outboundVolume,
      inboundVolume,
      blendedService,
      cycleTime,
      networkBalance: outboundVolume - inboundVolume,
    };
  }, [outKpis, inKpis]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Senior Executive Financial Control" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <PageLoading />
        ) : (
          <>
            <section className="card p-4 border-l-4 border-l-indigo-500">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-indigo-500 font-semibold">Board Summary</p>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Financially controlled operations cockpit</h2>
                  <p className="text-xs text-gray-500 mt-1">Track service reliability, throughput productivity, and cycle-time risk from one command view.</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Link href="/outbound-kpis" className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300 font-medium">Outbound KPI Tab</Link>
                  <Link href="/inbound-kpis" className="px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300 font-medium">Inbound KPI Tab</Link>
                </div>
              </div>
            </section>

            <section>
              <h3 className="section-title mb-3">Executive Control Signals</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                <KPICard title="Outbound Throughput" kpi={outKpis?.total_cartons} format={formatNumber} icon={<Factory className="w-4 h-4" />} accentColor="blue" />
                <KPICard title="Inbound Throughput" kpi={inKpis?.total_cartons} format={formatNumber} icon={<Truck className="w-4 h-4" />} accentColor="emerald" />
                <KPICard title="Blended Service Level" kpi={{ current: executiveSignals.blendedService, previous: null, change: null }} format={formatPercent} icon={<ShieldCheck className="w-4 h-4" />} accentColor="emerald" />
                <KPICard title="Blended Cycle Time" kpi={{ current: executiveSignals.cycleTime, previous: null, change: null }} higherIsBetter={false} format={formatMinutes} icon={<Activity className="w-4 h-4" />} accentColor="violet" />
                <KPICard title="Network Balance" kpi={{ current: executiveSignals.networkBalance, previous: null, change: null }} format={formatNumber} icon={<Wallet className="w-4 h-4" />} accentColor="amber" description="Outbound cartons - Inbound cartons" />
              </div>
            </section>

            <section>
              <h3 className="section-title mb-3">Operational Cost Drivers</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <KPICard title="Outbound Return Exposure" kpi={outKpis?.return_rate} format={formatPercent} higherIsBetter={false} icon={<Target className="w-4 h-4" />} accentColor="amber" />
                <KPICard title="Outbound Dwell Time" kpi={outKpis?.avg_dwell_time} format={formatMinutes} higherIsBetter={false} accentColor="violet" />
                <KPICard title="Inbound Dwell Time" kpi={inKpis?.avg_dwell_time} format={formatMinutes} higherIsBetter={false} accentColor="violet" />
                <KPICard title="Decon Completion" kpi={inKpis?.decon_completed_rate} format={formatPercent} icon={<Landmark className="w-4 h-4" />} accentColor="emerald" />
                <KPICard title="On-time Pickup" kpi={outKpis?.on_time_pickup_rate} format={formatPercent} accentColor="blue" />
                <KPICard title="On-time Arrival" kpi={inKpis?.on_time_arrival_rate} format={formatPercent} accentColor="emerald" />
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {outCharts?.trend && outCharts.trend.length > 0 && (
                <TrendChart data={outCharts.trend as Parameters<typeof TrendChart>[0]['data']} title="Outbound Throughput Trend" />
              )}
              {inCharts?.trend && inCharts.trend.length > 0 && (
                <TrendChart data={inCharts.trend as Parameters<typeof TrendChart>[0]['data']} title="Inbound Throughput Trend" />
              )}
            </section>

            <section>
              <h3 className="section-title mb-3">Detailed Views</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { href: '/outbound-kpis', label: 'Outbound KPI Tab', desc: 'Shipment economics and control', color: 'text-blue-600' },
                  { href: '/inbound-kpis', label: 'Inbound KPI Tab', desc: 'Receiving governance and SLA', color: 'text-emerald-600' },
                  { href: '/outbound-data', label: 'Outbound Data', desc: 'Drill into shipment rows', color: 'text-violet-600' },
                  { href: '/import', label: 'Data Import', desc: 'Refresh finance control dataset', color: 'text-amber-600' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="card p-3.5 flex items-start gap-3 transition-colors duration-100 hover:border-gray-300 dark:hover:border-gray-700">
                    <div className={`mt-0.5 shrink-0 ${item.color}`}><ArrowRight className="w-4 h-4" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{item.label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{item.desc}</p>
                    </div>
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
