'use client';

import { useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import { InboundRow } from '@/types';
import { cn } from '@/lib/utils';

const COLUMNS: ColumnDef<InboundRow>[] = [
  { key: 'warehouse', header: 'Warehouse' },
  { key: 'customer', header: 'Customer' },
  { key: 'shipment', header: 'Shipment' },
  { key: 'container', header: 'Container' },
  { key: 'arrival', header: 'Arrival' },
  { key: 'unloading_ref', header: 'Unloading Ref' },
  { key: 'gate', header: 'Gate' },
  { key: 'unloading_date', header: 'Unloading Date' },
  { key: 'planned_arrival_date', header: 'Planned Arrival Date' },
  { key: 'planned_arrival_time', header: 'Planned Arrival Time' },
  { key: 'premises_in_date', header: 'Premisses In Date' },
  { key: 'premises_in_time', header: 'Premisses In Time' },
  { key: 'gate_in_date', header: 'Gate In Date' },
  { key: 'gate_in_time', header: 'Gate In Time' },
  { key: 'unloading_start_date', header: 'Unloading Start Date' },
  { key: 'unloading_start_time', header: 'Unloading Start Time' },
  { key: 'unloading_end_date', header: 'Unloading End Date' },
  { key: 'unloading_end_time', header: 'Unloading End Time' },
  { key: 'gate_out_date', header: 'Gate Out Date' },
  { key: 'gate_out_time', header: 'Gate Out Time' },
  { key: 'premises_out_date', header: 'Premisses Out Date' },
  { key: 'premises_out_time', header: 'Premisses Out Time' },
  { key: 'sortkeys', header: 'Sortkeys' },
  { key: 'pallet_count', header: 'Pallet Count' },
  { key: 'us_pallet_count', header: 'US Pallet Count' },
  { key: 'st_pallet_count', header: 'ST Pallet Count' },
  { key: 'carton_count', header: 'Carton Count' },
  {
    key: 'arrival_status',
    header: 'Arrival Status',
    render: (row) =>
      row.arrival_status ? (
        <span className={cn('badge', row.arrival_status === 'Y' ? 'badge-green' : 'badge-gray')}>
          {row.arrival_status}
        </span>
      ) : <span className="text-slate-400">—</span>,
  },
  {
    key: 'pallet_status',
    header: 'Pallet Status',
    render: (row) =>
      row.pallet_status ? (
        <span className={cn('badge', row.pallet_status === 'Y' ? 'badge-green' : 'badge-gray')}>
          {row.pallet_status}
        </span>
      ) : <span className="text-slate-400">—</span>,
  },
  {
    key: 'locate_status',
    header: 'Locate Status',
    render: (row) =>
      row.locate_status ? (
        <span className={cn('badge', row.locate_status === 'Y' ? 'badge-green' : 'badge-gray')}>
          {row.locate_status}
        </span>
      ) : <span className="text-slate-400">—</span>,
  },
  { key: 'locate_date', header: 'Locate Date' },
  { key: 'locate_time', header: 'Locate Time' },
  {
    key: 'decon_in',
    header: 'Decon In',
    render: (row) =>
      row.decon_in ? (
        <span className={cn('badge', row.decon_in === 'Y' ? 'badge-green' : 'badge-gray')}>
          {row.decon_in}
        </span>
      ) : <span className="text-slate-400">—</span>,
  },
  { key: 'decon_in_date', header: 'Decon In Date' },
  { key: 'decon_in_time', header: 'Decon In Time' },
  { key: 'decon_in_plt_num', header: 'Decon In Plt#' },
];

export default function InboundDataPage() {
  const { globalStartDate, globalEndDate } = useApp();

  return (
    <div className="flex flex-col h-full">
      <Header title="Inbound Data" />
      <div className="flex-1 p-6 overflow-auto">
        <DataTable
          columns={COLUMNS}
          fetchUrl="/api/inbound/data"
          extraParams={{
            startDate: globalStartDate,
            endDate: globalEndDate,
          }}
        />
      </div>
    </div>
  );
}
