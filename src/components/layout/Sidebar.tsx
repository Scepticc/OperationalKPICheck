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
  Zap,
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
        'bg-navy-950 border-r border-navy-800/40',
        collapsed ? 'w-[56px]' : 'w-56'
      )}
    >
      {/* Brand */}
      <div className={cn(
        'flex items-center gap-3 border-b border-navy-800/40 shrink-0',
        collapsed ? 'px-0 py-4 justify-center' : 'px-4 py-4'
      )}>
        <div className="w-8 h-8 rounded-lg bg-lime-500 flex items-center justify-center shrink-0 shadow-lg shadow-lime-500/25">
          <Zap className="w-4 h-4 text-navy-950" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white leading-tight truncate">OpsKPI</p>
            <p className="text-[9px] text-lime-500/60 tracking-[0.2em] uppercase mt-0.5">Control Center</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const prevSection = idx > 0 ? NAV_ITEMS[idx - 1].section : null;
          const showSection = item.section && item.section !== prevSection;

          return (
            <div key={item.href}>
              {showSection && (
                <div className={cn('pt-5 pb-2', collapsed ? 'px-2' : 'px-4')}>
                  {collapsed
                    ? <div className="h-px bg-navy-800/60" />
                    : <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-navy-400/40">{item.section}</p>
                  }
                </div>
              )}

              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'relative flex items-center gap-2.5 mx-2 px-3 py-2.5 rounded-lg transition-all duration-200 text-[13px] font-medium group',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-lime-500/10 text-lime-400'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-navy-800/40'
                )}
              >
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-lime-500 shadow-lg shadow-lime-500/50" />
                )}
                <Icon className={cn(
                  'shrink-0 w-4 h-4 transition-colors',
                  isActive ? 'text-lime-400' : 'text-gray-600 group-hover:text-gray-400'
                )} />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
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
          'flex items-center gap-2 mb-3 mx-2 px-3 py-2.5 rounded-lg text-gray-600 hover:text-lime-400 hover:bg-navy-800/40 transition-all text-xs',
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
