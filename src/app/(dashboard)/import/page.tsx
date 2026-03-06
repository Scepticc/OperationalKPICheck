import Header from '@/components/layout/Header';
import CSVImporter from '@/components/import/CSVImporter';
import { Info, Shield, RefreshCw, Database } from 'lucide-react';

export default function ImportPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Data Import" showDatePicker={false} />
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* Info banner */}
        <div className="card p-4 bg-lime-50 border-lime-200">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-semibold text-lime-700 text-[13px]">Import Rules</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-start gap-2">
                  <Database className="w-3.5 h-3.5 text-lime-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-lime-700">Data Preservation</p>
                    <p className="text-[11px] text-lime-600 mt-0.5">Existing data is never deleted. New imports add or update records.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-lime-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-lime-700">Duplicate Handling</p>
                    <p className="text-[11px] text-lime-600 mt-0.5">Duplicates are detected and updated with newer data automatically.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 text-lime-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-lime-700">Unique Keys</p>
                    <p className="text-[11px] text-lime-600 mt-0.5">
                      Outbound: <code className="bg-lime-100 px-1 rounded text-[10px]">Order + Shipment + Date</code>
                    </p>
                    <p className="text-[11px] text-lime-600 mt-0.5">
                      Inbound: <code className="bg-lime-100 px-1 rounded text-[10px]">Shipment + Container + Date</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Importers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CSVImporter
            type="outbound"
            label="Outbound Shipments"
            description="Import outbound CSV data (Warehouse, Customer, Order, Shipment, etc.)"
            accent="lime"
          />
          <CSVImporter
            type="inbound"
            label="Inbound Shipments"
            description="Import inbound CSV data (Warehouse, Customer, Shipment, Container, etc.)"
            accent="cyan"
          />
        </div>
      </div>
    </div>
  );
}
