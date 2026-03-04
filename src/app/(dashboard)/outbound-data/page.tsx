'use client';

import Header from '@/components/layout/Header';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import { OutboundRow } from '@/types';
import { cn } from '@/lib/utils';

const COLUMNS: ColumnDef<OutboundRow>[] = [
  { key: 'warehouse', header: 'Warehouse' },
  { key: 'customer', header: 'Customer' },
  { key: 'order_number', header: 'Order' },
  { key: 'shipment', header: 'Shipment' },
  { key: 'container', header: 'Container' },
  {
    key: 'returned',
    header: 'Returned',
    render: (row) =>
      row.returned ? (
        <span className={cn('badge', row.returned === 'Y' ? 'badge-red' : 'badge-gray')}>
          {row.returned}
        </span>
      ) : <span className="text-gray-400">{'\u2014'}</span>,
  },
  { key: 'shipped_date', header: 'Shipped Date' },
  { key: 'loading_ref', header: 'Loading Ref' },
  { key: 'route', header: 'Route' },
  { key: 'truck', header: 'Truck' },
  { key: 'gate', header: 'Gate' },
  { key: 'org_ship_to_code', header: 'Org Ship To Code' },
  { key: 'org_ship_to_name', header: 'Org Ship To Name' },
  { key: 'org_ship_to_country', header: 'Org Ship To Country' },
  { key: 'org_ship_plt', header: 'Org Ship PLT' },
  { key: 'size_sorting', header: 'Size Sorting' },
  {
    key: 'mixed',
    header: 'Mixed',
    render: (row) =>
      row.mixed ? (
        <span className={cn('badge', row.mixed === 'Y' ? 'badge-green' : 'badge-gray')}>
          {row.mixed}
        </span>
      ) : <span className="text-gray-400">{'\u2014'}</span>,
  },
  {
    key: 'sorter_used',
    header: 'Sorter Used',
    render: (row) =>
      row.sorter_used ? (
        <span className={cn('badge', row.sorter_used === 'Y' ? 'badge-green' : 'badge-gray')}>
          {row.sorter_used}
        </span>
      ) : <span className="text-gray-400">{'\u2014'}</span>,
  },
  { key: 'wlr_remarks', header: 'WLR Remarks', sortable: false },
  { key: 'act_ship_to_code', header: 'Act Ship To Code' },
  { key: 'act_ship_to_name', header: 'Act Ship To Name' },
  { key: 'act_ship_to_country', header: 'Act Ship To Country' },
  { key: 'pallets', header: 'Pallets' },
  { key: 'po_line', header: 'PO Line' },
  { key: 'cartons', header: 'Cartons' },
  { key: 'loading_type', header: 'Loading Type' },
  { key: 'luik_shipment', header: 'Luik Shipment' },
  { key: 'actual_loading_type', header: 'Actual Loading Type' },
  { key: 'decon_in_date', header: 'Decon In Date' },
  { key: 'decon_in_time', header: 'Decon In Time' },
  { key: 'decon_out_date', header: 'Decon Out Date' },
  { key: 'decon_out_time', header: 'Decon Out Time' },
  { key: 'est_pickup_date', header: 'Est. Pickup Date' },
  { key: 'est_pickup_time', header: 'Est. Pickup Time' },
  { key: 'gate_in_date', header: 'Gate In Date' },
  { key: 'gate_in_time', header: 'Gate In Time' },
  { key: 'loading_start_date', header: 'Loading Start Date' },
  { key: 'loading_start_time', header: 'Loading Start Time' },
  { key: 'loading_end_date', header: 'Loading End Date' },
  { key: 'loading_end_time', header: 'Loading End Time' },
  { key: 'gate_out_date', header: 'Gate Out Date' },
  { key: 'gate_out_time', header: 'Gate Out Time' },
  { key: 'dock', header: 'Dock' },
];

export default function OutboundDataPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Outbound Data" showDatePicker={false} />
      <div className="flex-1 p-6 overflow-auto">
        <DataTable
          columns={COLUMNS}
          fetchUrl="/api/outbound/data"
          dateColumn="shipped_date"
        />
      </div>
    </div>
  );
}
