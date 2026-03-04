'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import KPICard from '@/components/ui/KPICard';
import FilterBar from '@/components/ui/FilterBar';
import TrendChart from '@/components/charts/TrendChart';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { InboundKPIs, InboundCharts, FilterOptions } from '@/types';
import { formatNumber, formatPercent, formatMinutes } from '@/lib/utils';
import {
  Package,
  Layers,
  Clock,
  Truck,
  TimerReset,
  Target,
  CheckCircle,
  ShieldCheck,
  MapPin,
  Scan,
} from 'lucide-react';

interface KPIData {
  kpis: InboundKPIs;
  charts: InboundCharts;
}

export default function InboundKPIsPage() {
  const { inboundFilters, setInboundFilters, globalStartDate, globalEndDate } = useApp();
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    customers: [],
    warehouses: [],
    gates: [],
  });

  useEffect(() => {
    setInboundFilters({ startDate: globalStartDate, endDate: globalEndDate });
  }, [globalStartDate, globalEndDate]); // eslint-disable-line

  useEffect(() => {
    fetch('/api/inbound/filters')
      .then((r) => r.json())
      .then((d) => { if (!d.error) setFilterOptions(d); })
      .catch(console.error);
  }, []);

  const fetchKPIs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate: inboundFilters.startDate,
        endDate: inboundFilters.endDate,
        customer: inboundFilters.customer ?? '',
        warehouse: inboundFilters.warehouse ?? '',
        gate: inboundFilters.gate ?? '',
        granularity: inboundFilters.granularity ?? 'day',
      });
      const res = await fetch(`/api/inbound/kpis?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [inboundFilters]);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  const filters = [
    {
      key: 'warehouse',
      label: 'Warehouse',
      options: filterOptions.warehouses ?? [],
      value: inboundFilters.warehouse ?? '',
      onChange: (v: string) => setInboundFilters({ warehouse: v }),
    },
    {
      key: 'customer',
      label: 'Customer',
      options: filterOptions.customers ?? [],
      value: inboundFilters.customer ?? '',
      onChange: (v: string) => setInboundFilters({ customer: v }),
    },
    {
      key: 'gate',
      label: 'Gate',
      options: filterOptions.gates ?? [],
      value: inboundFilters.gate ?? '',
      onChange: (v: string) => setInboundFilters({ gate: v }),
    },
  ];

  function clearFilters() {
    setInboundFilters({ customer: '', warehouse: '', gate: '', granularity: 'day' });
  }

  const kpis = data?.kpis;
  const charts = data?.charts;

  return (
    <div className="flex flex-col h-full">
      <Header title="Inbound KPIs" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <FilterBar
          filters={filters}
          granularity={inboundFilters.granularity ?? 'day'}
          onGranularityChange={(g) => setInboundFilters({ granularity: g as 'day' | 'week' | 'month' })}
          onClear={clearFilters}
        />

        {loading ? (
          <PageLoading />
        ) : error ? (
          <div className="card p-6 text-center text-red-500 text-sm">Error: {error}</div>
        ) : (
          <>
            {/* Volume KPIs */}
            <section>
              <h2 className="section-title mb-3">Volume</h2>
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <KPICard
                  title="Total Shipments"
                  kpi={kpis?.row_count}
                  format={(v) => formatNumber(v)}
                  icon={<Package className="w-4 h-4" />}
                  accentColor="emerald"
                />
                <KPICard
                  title="Total Cartons Received"
                  kpi={kpis?.total_cartons}
                  format={(v) => formatNumber(v)}
                  icon={<Layers className="w-4 h-4" />}
                  accentColor="emerald"
                />
                <KPICard
                  title="Total Pallets Received"
                  kpi={kpis?.total_pallets}
                  format={(v) => formatNumber(v)}
                  accentColor="emerald"
                />
                <KPICard
                  title="Avg Cartons / Shipment"
                  kpi={kpis?.avg_cartons_per_shipment}
                  format={(v) => formatNumber(v, 1)}
                  accentColor="emerald"
                />
              </div>
            </section>

            {/* Status KPIs */}
            <section>
              <h2 className="section-title mb-3">Status & Compliance</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                <KPICard
                  title="On-time Arrival Rate"
                  kpi={kpis?.on_time_arrival_rate}
                  format={(v) => formatPercent(v)}
                  icon={<CheckCircle className="w-4 h-4" />}
                  description="Premises In <= Planned Arrival"
                  accentColor="emerald"
                />
                <KPICard
                  title="Arrival Status"
                  kpi={kpis?.arrival_status_rate}
                  format={(v) => formatPercent(v)}
                  icon={<ShieldCheck className="w-4 h-4" />}
                  description="% Arrival Status = Y"
                  accentColor="emerald"
                />
                <KPICard
                  title="Pallet Status"
                  kpi={kpis?.pallet_status_rate}
                  format={(v) => formatPercent(v)}
                  icon={<Layers className="w-4 h-4" />}
                  description="% Pallet Status = Y"
                  accentColor="blue"
                />
                <KPICard
                  title="Locate Status"
                  kpi={kpis?.locate_status_rate}
                  format={(v) => formatPercent(v)}
                  icon={<MapPin className="w-4 h-4" />}
                  description="% Locate Status = Y"
                  accentColor="blue"
                />
                <KPICard
                  title="Decon Completed"
                  kpi={kpis?.decon_completed_rate}
                  format={(v) => formatPercent(v)}
                  icon={<Scan className="w-4 h-4" />}
                  description="% Decon In = Y"
                  accentColor="violet"
                />
              </div>
            </section>

            {/* Time KPIs */}
            <section>
              <h2 className="section-title mb-3">Time Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <KPICard
                  title="Avg Unloading Time"
                  kpi={kpis?.avg_unloading_time}
                  format={(v) => formatMinutes(v)}
                  higherIsBetter={false}
                  icon={<Clock className="w-4 h-4" />}
                  description="Unloading End - Unloading Start"
                  accentColor="violet"
                />
                <KPICard
                  title="Avg Truck Dwell Time"
                  kpi={kpis?.avg_dwell_time}
                  format={(v) => formatMinutes(v)}
                  higherIsBetter={false}
                  icon={<Truck className="w-4 h-4" />}
                  description="Gate Out - Gate In"
                  accentColor="violet"
                />
                <KPICard
                  title="Avg Wait Before Unloading"
                  kpi={kpis?.avg_wait_before_unloading}
                  format={(v) => formatMinutes(v)}
                  higherIsBetter={false}
                  icon={<TimerReset className="w-4 h-4" />}
                  description="Unloading Start - Gate In"
                  accentColor="violet"
                />
                <KPICard
                  title="Avg Decon Processing"
                  kpi={kpis?.avg_decon_time}
                  format={(v) => formatMinutes(v)}
                  higherIsBetter={false}
                  icon={<Target className="w-4 h-4" />}
                  description="Decon In - Unloading End"
                  accentColor="violet"
                />
              </div>
            </section>

            {/* Charts */}
            <section>
              <h2 className="section-title mb-3">Analytics</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="xl:col-span-2">
                  <TrendChart
                    data={charts?.trend ?? []}
                    granularity={inboundFilters.granularity ?? 'day'}
                    title="Carton Volume Trend"
                    valueKey="total_cartons"
                    valueLabel="Cartons"
                  />
                </div>
                <CategoryBarChart
                  data={charts?.by_customer ?? []}
                  title="Cartons by Customer"
                  onBarClick={(name) => setInboundFilters({ customer: name })}
                />
                <CategoryBarChart
                  data={charts?.by_gate ?? []}
                  title="Cartons by Gate"
                  color="#059669"
                  onBarClick={(name) => setInboundFilters({ gate: name })}
                />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
