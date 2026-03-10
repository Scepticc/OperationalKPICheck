'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import TrendChart from '@/components/charts/TrendChart';
import AreaTrendChart from '@/components/charts/AreaTrendChart';
import DistributionPieChart from '@/components/charts/DistributionPieChart';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import OperationsTimeTrend from '@/components/charts/OperationsTimeTrend';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { formatNumber, formatPercent, formatMinutes } from '@/lib/utils';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  TrendingDown,
  Package,
  Upload,
  Table2,
} from 'lucide-react';
import {
  OutboundKPIs,
  InboundKPIs,
  OutboundCharts,
  InboundCharts,
  KPIValue,
  TrendDataPoint,
  CategoryDataPoint,
  TimeTrendPoint,
} from '@/types';

/* ──────────────────── Types ──────────────────── */

interface OutboundData { kpis: OutboundKPIs; charts: OutboundCharts }
interface InboundData  { kpis: InboundKPIs;  charts: InboundCharts  }

type Fmt = (v: number | null | undefined) => string;

interface MetricRow {
  label: string;
  outbound: KPIValue | undefined;
  inbound:  KPIValue | undefined;
  format: Fmt;
  higherIsBetter?: boolean;
  unit?: string;
}

/* ──────────────────── Helpers ──────────────────── */

function ChangeChip({ change, higherIsBetter = true }: { change: number | null | undefined; higherIsBetter?: boolean }) {
  if (change == null) return <span className="text-[10px] text-gray-300">—</span>;
  const positive = higherIsBetter ? change >= 0 : change <= 0;
  const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

function CellValue({ kpi, format, higherIsBetter }: { kpi: KPIValue | undefined; format: Fmt; higherIsBetter?: boolean }) {
  if (!kpi) return <td className="table-td text-center text-gray-300">—</td>;
  return (
    <td className="table-td text-right">
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-sm font-semibold tabular-nums text-navy-900">
          {kpi.current != null ? format(kpi.current) : '—'}
        </span>
        <ChangeChip change={kpi.change} higherIsBetter={higherIsBetter} />
      </div>
    </td>
  );
}

function PrevCell({ kpi, format }: { kpi: KPIValue | undefined; format: Fmt }) {
  if (!kpi || kpi.previous == null) return <td className="table-td text-right text-gray-300 text-xs">—</td>;
  return (
    <td className="table-td text-right text-xs text-gray-400 tabular-nums">
      {format(kpi.previous)}
    </td>
  );
}

/* ──────────────────── Component ──────────────────── */

export default function OverviewPage() {
  const { globalStartDate, globalEndDate } = useApp();
  const [outData, setOutData] = useState<OutboundData | null>(null);
  const [inData, setInData]   = useState<InboundData | null>(null);
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

  const ok = outData?.kpis;
  const ik = inData?.kpis;
  const oc = outData?.charts;
  const ic = inData?.charts;

  /* ── Build the metric rows for the executive table ── */
  const volumeRows: MetricRow[] = [
    { label: 'Shipments',              outbound: ok?.row_count,              inbound: ik?.row_count,              format: formatNumber },
    { label: 'Cartons',                outbound: ok?.total_cartons,          inbound: ik?.total_cartons,          format: formatNumber },
    { label: 'Pallets',                outbound: ok?.total_pallets,          inbound: ik?.total_pallets,          format: formatNumber },
    { label: 'Avg Cartons / Shipment', outbound: ok?.avg_cartons_per_shipment, inbound: ik?.avg_cartons_per_shipment, format: (v) => formatNumber(v, 1) },
  ];

  const qualityRows: MetricRow[] = [
    { label: 'On-time Rate',     outbound: ok?.on_time_pickup_rate, inbound: ik?.on_time_arrival_rate, format: formatPercent },
    { label: 'Return Rate',      outbound: ok?.return_rate,         inbound: undefined,                format: formatPercent, higherIsBetter: false },
    { label: 'Mixed Load Rate',  outbound: ok?.mixed_rate,          inbound: undefined,                format: formatPercent, higherIsBetter: false },
    { label: 'Sorter Used Rate', outbound: ok?.sorter_used_rate,    inbound: undefined,                format: formatPercent },
    { label: 'Decon Completed',  outbound: undefined,               inbound: ik?.decon_completed_rate, format: formatPercent },
    { label: 'Arrival Status',   outbound: undefined,               inbound: ik?.arrival_status_rate,  format: formatPercent },
    { label: 'Pallet Status',    outbound: undefined,               inbound: ik?.pallet_status_rate,   format: formatPercent },
    { label: 'Locate Status',    outbound: undefined,               inbound: ik?.locate_status_rate,   format: formatPercent },
  ];

  const timeRows: MetricRow[] = [
    { label: 'Avg Loading / Unloading', outbound: ok?.avg_loading_time,        inbound: ik?.avg_unloading_time,        format: formatMinutes, higherIsBetter: false },
    { label: 'Avg Dwell Time',          outbound: ok?.avg_dwell_time,          inbound: ik?.avg_dwell_time,            format: formatMinutes, higherIsBetter: false },
    { label: 'Avg Wait Before Op.',     outbound: ok?.avg_wait_before_loading, inbound: ik?.avg_wait_before_unloading, format: formatMinutes, higherIsBetter: false },
    { label: 'Avg Decon Processing',    outbound: ok?.avg_decon_time,          inbound: ik?.avg_decon_time,            format: formatMinutes, higherIsBetter: false },
  ];

  function renderTableSection(title: string, rows: MetricRow[], color: string) {
    return (
      <>
        <tr>
          <td colSpan={6} className="pt-3 pb-1.5 px-3">
            <div className="flex items-center gap-2">
              <div className={`w-1 h-3 rounded-full ${color}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{title}</span>
            </div>
          </td>
        </tr>
        {rows.map((r) => (
          <tr key={r.label} className="table-row">
            <td className="table-td text-xs font-medium text-navy-800 pl-6 whitespace-nowrap">{r.label}</td>
            <CellValue kpi={r.outbound} format={r.format} higherIsBetter={r.higherIsBetter} />
            <PrevCell   kpi={r.outbound} format={r.format} />
            <CellValue kpi={r.inbound}  format={r.format} higherIsBetter={r.higherIsBetter} />
            <PrevCell   kpi={r.inbound}  format={r.format} />
          </tr>
        ))}
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Executive Overview" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? <PageLoading /> : (
          <>
            {/* ═══════════════ EXECUTIVE SUMMARY TABLE ═══════════════ */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="section-title">KPI Summary</p>
                <div className="flex gap-1">
                  <Link href="/outbound-kpis" className="flex items-center gap-1 text-[10px] font-medium text-lime-600 hover:text-lime-700 transition-colors">
                    Outbound <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                  <span className="text-gray-300 text-[10px] mx-1">|</span>
                  <Link href="/inbound-kpis" className="flex items-center gap-1 text-[10px] font-medium text-navy-600 hover:text-navy-800 transition-colors">
                    Inbound <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50/80">
                        <th className="table-th text-left pl-6 w-[200px]">Metric</th>
                        <th className="table-th text-right w-[120px]">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-lime-500" />
                            <span>Outbound</span>
                          </div>
                        </th>
                        <th className="table-th text-right w-[90px] text-gray-400">Prev</th>
                        <th className="table-th text-right w-[120px]">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-navy-700" />
                            <span>Inbound</span>
                          </div>
                        </th>
                        <th className="table-th text-right w-[90px] text-gray-400">Prev</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderTableSection('Volume', volumeRows, 'bg-lime-500')}
                      {renderTableSection('Quality & Compliance', qualityRows, 'bg-amber-500')}
                      {renderTableSection('Time Metrics', timeRows, 'bg-violet-500')}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* ═══════════════ VOLUME TREND CHARTS ═══════════════ */}
            <section>
              <p className="section-title mb-3">Volume Trends</p>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <TrendChart
                  data={(oc?.trend ?? []) as TrendDataPoint[]}
                  title="Outbound Carton & Shipment Trend"
                />
                <TrendChart
                  data={(ic?.trend ?? []) as TrendDataPoint[]}
                  title="Inbound Carton & Shipment Trend"
                />
                <AreaTrendChart
                  data={(oc?.trend ?? []) as TrendDataPoint[]}
                  title="Outbound Shipment vs Carton"
                />
                <AreaTrendChart
                  data={(ic?.trend ?? []) as TrendDataPoint[]}
                  title="Inbound Shipment vs Carton"
                />
              </div>
            </section>

            {/* ═══════════════ OPERATIONS TIME COMPARISON ═══════════════ */}
            <section>
              <p className="section-title mb-3">Operations Time Trends</p>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <OperationsTimeTrend
                  data={(oc?.time_trend ?? []) as TimeTrendPoint[]}
                  title="Outbound: Loading / Wait / Dwell"
                  series={[
                    { key: 'avg_loading', label: 'Loading', color: '#8b5cf6', type: 'bar' },
                    { key: 'avg_wait', label: 'Wait', color: '#f59e0b', type: 'bar' },
                    { key: 'avg_dwell', label: 'Dwell', color: '#0f1a3e', type: 'line' },
                  ]}
                />
                <OperationsTimeTrend
                  data={(ic?.time_trend ?? []) as TimeTrendPoint[]}
                  title="Inbound: Unloading / Wait / Dwell"
                  series={[
                    { key: 'avg_unloading', label: 'Unloading', color: '#8b5cf6', type: 'bar' },
                    { key: 'avg_wait', label: 'Wait', color: '#f59e0b', type: 'bar' },
                    { key: 'avg_dwell', label: 'Dwell', color: '#0f1a3e', type: 'line' },
                  ]}
                />
              </div>
            </section>

            {/* ═══════════════ DISTRIBUTION ═══════════════ */}
            <section>
              <p className="section-title mb-3">Distribution</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <DistributionPieChart
                  data={((oc?.by_country ?? []) as CategoryDataPoint[]).map(d => ({ name: d.name, value: Number(d.total_cartons) }))}
                  title="Outbound by Country"
                />
                <DistributionPieChart
                  data={((oc?.by_dock ?? []) as CategoryDataPoint[]).map(d => ({ name: d.name, value: Number(d.total_cartons) }))}
                  title="Outbound by Dock"
                />
                <DistributionPieChart
                  data={((ic?.by_gate ?? []) as CategoryDataPoint[]).map(d => ({ name: d.name, value: Number(d.total_cartons) }))}
                  title="Inbound by Gate"
                />
                <DistributionPieChart
                  data={((ic?.by_customer ?? []) as CategoryDataPoint[]).slice(0, 10).map(d => ({ name: d.name, value: Number(d.total_cartons) }))}
                  title="Inbound by Customer"
                />
              </div>
            </section>

            {/* ═══════════════ BREAKDOWN BARS ═══════════════ */}
            <section>
              <p className="section-title mb-3">Breakdown</p>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <CategoryBarChart
                  data={(oc?.by_country ?? []) as CategoryDataPoint[]}
                  title="Outbound Cartons by Country"
                  color="#84cc16"
                />
                <CategoryBarChart
                  data={(ic?.by_gate ?? []) as CategoryDataPoint[]}
                  title="Inbound Cartons by Gate"
                  color="#0891b2"
                />
                <CategoryBarChart
                  data={(oc?.by_customer ?? []) as CategoryDataPoint[]}
                  title="Outbound Cartons by Customer"
                  color="#7c3aed"
                />
                <CategoryBarChart
                  data={(ic?.by_customer ?? []) as CategoryDataPoint[]}
                  title="Inbound Cartons by Customer"
                  color="#f59e0b"
                />
              </div>
            </section>

            {/* ═══════════════ QUICK NAVIGATION ═══════════════ */}
            <section>
              <p className="section-title mb-3">Quick Access</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { href: '/outbound-kpis', label: 'Outbound KPIs',  desc: 'Full outbound metrics',     icon: <TrendingUp className="w-4 h-4" />,  color: 'text-lime-600',    hoverBorder: 'hover:border-lime-500/40' },
                  { href: '/inbound-kpis',  label: 'Inbound KPIs',   desc: 'Full inbound metrics',      icon: <TrendingDown className="w-4 h-4" />, color: 'text-navy-600',    hoverBorder: 'hover:border-navy-500/30' },
                  { href: '/outbound-data', label: 'Outbound Data',  desc: 'Browse outbound records',   icon: <Table2 className="w-4 h-4" />,      color: 'text-violet-600',  hoverBorder: 'hover:border-violet-400/30' },
                  { href: '/import',        label: 'Import Data',    desc: 'Upload CSV files',          icon: <Upload className="w-4 h-4" />,      color: 'text-amber-600',   hoverBorder: 'hover:border-amber-400/30' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`card p-3.5 flex items-start gap-3 transition-colors duration-100 ${item.hoverBorder}`}
                  >
                    <div className={`mt-0.5 shrink-0 ${item.color}`}>{item.icon}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-900 truncate">{item.label}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 ml-auto shrink-0 mt-0.5" />
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
