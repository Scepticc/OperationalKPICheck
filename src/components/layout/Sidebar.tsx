'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Table2,
  Upload,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  {
    href: '/overview',
    label: 'Dashboard Overview',
    icon: LayoutDashboard,
    section: null,
  },
  {
    href: '/outbound-kpis',
    label: 'Outbound KPIs',
    icon: TrendingUp,
    section: 'Outbound',
  },
  {
    href: '/outbound-data',
    label: 'Outbound Data',
    icon: Table2,
    section: 'Outbound',
  },
  {
    href: '/inbound-kpis',
    label: 'Inbound KPIs',
    icon: TrendingDown,
    section: 'Inbound',
  },
  {
    href: '/inbound-data',
    label: 'Inbound Data',
    icon: Table2,
    section: 'Inbound',
  },
  {
    href: '/import',
    label: 'Import Data',
    icon: Upload,
    section: null,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col bg-slate-900 dark:bg-slate-950 text-slate-100 transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">KPI Dashboard</p>
            <p className="text-xs text-slate-400 truncate">Warehouse Ops</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          // Section divider
          const prevSection = idx > 0 ? NAV_ITEMS[idx - 1].section : null;
          const showDivider = item.section && item.section !== prevSection;

          return (
            <div key={item.href}>
              {showDivider && !collapsed && (
                <p className="px-4 pt-4 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {item.section}
                </p>
              )}
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center gap-2 mx-2 mb-4 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors text-sm"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs">Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
}
