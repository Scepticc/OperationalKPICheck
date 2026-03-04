'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import KPICard from '@/components/ui/KPICard';
import FilterBar from '@/components/ui/FilterBar';
import TrendChart from '@/components/charts/TrendChart';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { OutboundKPIs, OutboundCharts, FilterOptions } from '@/types';
import {
  formatNumber,
  formatPercent,
  formatMinutes,
} from '@/lib/utils';
import {
  Package,
  Layers,
  RotateCcw,
  Shuffle,
  Clock,
  Truck,
  TimerReset,
  Wrench,
  Target,
  CheckCircle,
} from 'lucide-react';

interface KPIData {
  kpis: OutboundKPIs;
  charts: OutboundCharts;
}

export default function OutboundKPIsPage() {
  const { outboundFilters, setOutboundFilters, globalStartDate, globalEndDate } = useApp();
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    customers: [],
    warehouses: [],
    countries: [],
    routes: [],
    docks: [],
  });

  useEffect(() => {
    setOutboundFilters({ startDate: globalStartDate, endDate: globalEndDate });
  }, [globalStartDate, globalEndDate]); // eslint-disable-line

  useEffect(() => {
    fetch('/api/outbound/filters')
      .then((r) => r.json())
      .then((d) => { if (!d.error) setFilterOptions(d); })
      .catch(console.error);
  }, []);

  const fetchKPIs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate: outboundFilters.startDate,
        endDate: outboundFilters.endDate,
        customer: outboundFilters.customer ?? '',
        country: outboundFilters.country ?? '',
        route: outboundFilters.route ?? '',
        dock: outboundFilters.dock ?? '',
        warehouse: outboundFilters.warehouse ?? '',
        granularity: outboundFilters.granularity ?? 'day',
      });
      const res = await fetch(`/api/outbound/kpis?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [outboundFilters]);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  const filters = [
    {
      key: 'warehouse',
      label: 'Warehouse',
      options: filterOptions.warehouses ?? [],
      value: outboundFilters.warehouse ?? '',
      onChange: (v: string) => setOutboundFilters({ warehouse: v }),
    },
    {
      key: 'customer',
      label: 'Customer',
      options: filterOptions.customers ?? [],
      value: outboundFilters.customer ?? '',
      onChange: (v: string) => setOutboundFilters({ customer: v }),
    },
    {
      key: 'country',
      label: 'Country',
      options: filterOptions.countries ?? [],
      value: outboundFilters.country ?? '',
      onChange: (v: string) => setOutboundFilters({ country: v }),
    },
    {
      key: 'route',
      label: 'Route',
      options: filterOptions.routes ?? [],
      value: outboundFilters.route ?? '',
      onChange: (v: string) => setOutboundFilters({ route: v }),
    },
    {
      key: 'dock',
      label: 'Dock',
      options: filterOptions.docks ?? [],
      value: outboundFilters.dock ?? '',
      onChange: (v: string) => setOutboundFilters({ dock: v }),
    },
  ];

  function clearFilters() {
    setOutboundFilters({
      customer: '',
      country: '',
      route: '',
      dock: '',
      warehouse: '',
      granularity: 'day',
    });
  }

  const kpis = data?.kpis;
  const charts = data?.charts;

  return (
    <div className="flex flex-col h-full">
      <Header title="Outbound KPIs" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <FilterBar
          filters={filters}
          granularity={outboundFilters.granularity ?? 'day'}
          onGranularityChange={(g) => setOutboundFilters({ granularity: g as 'day' | 'week' | 'month' })}
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
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                <KPICard
                  title="Total Shipments"
                  kpi={kpis?.row_count}
                  format={(v) => formatNumber(v)}
                  icon={<Package className="w-4 h-4" />}
                  accentColor="blue"
                />
                <KPICard
                  title="Total Cartons"
                  kpi={kpis?.total_cartons}
                  format={(v) => formatNumber(v)}
                  icon={<Layers className="w-4 h-4" />}
                  accentColor="blue"
                />
                <KPICard
                  title="Total Pallets"
                  kpi={kpis?.total_pallets}
                  format={(v) => formatNumber(v)}
                  accentColor="blue"
                />
                <KPICard
                  title="Avg Cartons / Shipment"
                  kpi={kpis?.avg_cartons_per_shipment}
                  format={(v) => formatNumber(v, 1)}
                  accentColor="blue"
                />
                <KPICard
                  title="Avg Cartons / Pallet"
                  kpi={kpis?.avg_cartons_per_pallet}
                  format={(v) => formatNumber(v, 1)}
                  description="Density indicator"
                  accentColor="blue"
                />
              </div>
            </section>

            {/* Quality KPIs */}
            <section>
              <h2 className="section-title mb-3">Quality & Compliance</h2>
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <KPICard
                  title="Return Rate"
                  kpi={kpis?.return_rate}
                  format={(v) => formatPercent(v)}
                  higherIsBetter={false}
                  icon={<RotateCcw className="w-4 h-4" />}
                  description="% rows where Returned = Y"
                  accentColor="amber"
                />
                <KPICard
                  title="Mixed Loads"
                  kpi={kpis?.mixed_rate}
                  format={(v) => formatPercent(v)}
                  higherIsBetter={false}
                  icon={<Shuffle className="w-4 h-4" />}
                  description="% rows where Mixed = Y"
                  accentColor="amber"
                />
                <KPICard
                  title="Sorter Used"
                  kpi={kpis?.sorter_used_rate}
                  format={(v) => formatPercent(v)}
                  icon={<Wrench className="w-4 h-4" />}
                  description="% rows where Sorter Used = Y"
                  accentColor="emerald"
                />
                <KPICard
                  title="On-time Pickup Rate"
                  kpi={kpis?.on_time_pickup_rate}
                  format={(v) => formatPercent(v)}
                  icon={<CheckCircle className="w-4 h-4" />}
                  description="Gate In <= Est. Pickup Date"
                  accentColor="emerald"
                />
              </div>
            </section>

            {/* Time KPIs */}
            <section>
              <h2 className="section-title mb-3">Time Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <KPICard
                  title="Avg Loading Time"
                  kpi={kpis?.avg_loading_time}
                  format={(v) => formatMinutes(v)}
                  higherIsBetter={false}
                  icon={<Clock className="w-4 h-4" />}
                  description="Loading End - Loading Start"
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
                  title="Avg Wait Before Loading"
                  kpi={kpis?.avg_wait_before_loading}
                  format={(v) => formatMinutes(v)}
                  higherIsBetter={false}
                  icon={<TimerReset className="w-4 h-4" />}
                  description="Loading Start - Gate In"
                  accentColor="violet"
                />
                <KPICard
                  title="Avg Decon Processing"
                  kpi={kpis?.avg_decon_time}
                  format={(v) => formatMinutes(v)}
                  higherIsBetter={false}
                  icon={<Target className="w-4 h-4" />}
                  description="Decon Out - Decon In"
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
                    granularity={outboundFilters.granularity ?? 'day'}
                    title="Carton Volume Trend"
                  />
                </div>
                <CategoryBarChart
                  data={charts?.by_customer ?? []}
                  title="Cartons by Customer"
                  onBarClick={(name) => setOutboundFilters({ customer: name })}
                />
                <CategoryBarChart
                  data={charts?.by_country ?? []}
                  title="Cartons by Country"
                  color="#059669"
                  onBarClick={(name) => setOutboundFilters({ country: name })}
                />
                <div className="xl:col-span-2">
                  <CategoryBarChart
                    data={charts?.by_dock ?? []}
                    title="Cartons by Dock"
                    color="#d97706"
                    onBarClick={(name) => setOutboundFilters({ dock: name })}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
