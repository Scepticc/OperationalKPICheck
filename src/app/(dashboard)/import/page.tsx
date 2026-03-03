import Header from '@/components/layout/Header';
import CSVImporter from '@/components/import/CSVImporter';
import { Info } from 'lucide-react';

export default function ImportPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Import Data" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Info banner */}
        <div className="card p-4 flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-800 dark:text-blue-300">How importing works</p>
            <ul className="mt-1 text-blue-700 dark:text-blue-400 space-y-0.5 list-disc list-inside">
              <li>New rows are appended — existing data is never deleted</li>
              <li>
                Outbound duplicates are detected by: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">Order + Shipment + Shipped Date</code>
              </li>
              <li>
                Inbound duplicates are detected by: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">Shipment + Container + Unloading Date</code>
              </li>
              <li>Column headers are matched automatically (case-insensitive)</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CSVImporter
            type="outbound"
            label="Outbound CSV (WHNIK765)"
            description="Import outbound shipment data. Columns: Warehouse, Customer, Order, Shipment, Container, and more."
            color="#3b82f6"
          />
          <CSVImporter
            type="inbound"
            label="Inbound CSV (WHNIK752)"
            description="Import inbound shipment data. Columns: Warehouse, Customer, Shipment, Container, Unloading Date, and more."
            color="#10b981"
          />
        </div>
      </div>
    </div>
  );
}
