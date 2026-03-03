'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Table2,
  Upload,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/overview',      label: 'Overview',       icon: LayoutDashboard, section: null },
  { href: '/outbound-kpis', label: 'Outbound KPIs',  icon: TrendingUp,      section: 'Outbound' },
  { href: '/outbound-data', label: 'Outbound Data',  icon: Table2,          section: 'Outbound' },
  { href: '/inbound-kpis',  label: 'Inbound KPIs',   icon: TrendingDown,    section: 'Inbound' },
  { href: '/inbound-data',  label: 'Inbound Data',   icon: Table2,          section: 'Inbound' },
  { href: '/import',        label: 'Import Data',    icon: Upload,          section: null },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col shrink-0 transition-all duration-300',
        'bg-[#0f172a] dark:bg-[#040b17]',
        'border-r border-slate-800/60 dark:border-[#0f1e36]',
        collapsed ? 'w-[60px]' : 'w-56'
      )}
    >
      {/* Wordmark */}
      <div className={cn(
        'flex items-center gap-2.5 border-b border-slate-800/60 dark:border-[#0f1e36] shrink-0',
        collapsed ? 'px-0 py-[18px] justify-center' : 'px-5 py-[18px]'
      )}>
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white text-[11px] font-bold tracking-tight">KD</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-white leading-tight">KPI Dashboard</p>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-0.5">Warehouse Ops</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const prevSection = idx > 0 ? NAV_ITEMS[idx - 1].section : null;
          const showSection = item.section && item.section !== prevSection;

          return (
            <div key={item.href}>
              {showSection && (
                <div className={cn('pt-4 pb-1', collapsed ? 'px-3' : 'px-5')}>
                  {collapsed
                    ? <div className="h-px bg-slate-800/80 dark:bg-[#0f1e36]" />
                    : <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-700">{item.section}</p>
                  }
                </div>
              )}

              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-blue-600/[0.15] dark:bg-blue-500/[0.12] text-blue-300'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 dark:hover:bg-white/[0.04]'
                )}
              >
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full bg-blue-500" />
                )}
                <Icon className={cn(
                  'shrink-0 w-[17px] h-[17px]',
                  isActive ? 'text-blue-400' : 'text-slate-600'
                )} />
                {!collapsed && (
                  <span className={cn('truncate', isActive ? 'text-blue-200' : '')}>
                    {item.label}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'flex items-center gap-2 mb-4 mx-2 px-3 py-2 rounded-lg text-slate-700 hover:text-slate-300 hover:bg-white/5 dark:hover:bg-white/[0.04] transition-colors text-xs',
          collapsed && 'justify-center px-0'
        )}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed
          ? <PanelLeftOpen className="w-4 h-4" />
          : <><PanelLeftClose className="w-4 h-4" /><span>Collapse</span></>
        }
      </button>
    </aside>
  );
}
