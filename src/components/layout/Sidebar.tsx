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
  BarChart3,
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
        'flex flex-col shrink-0 transition-all duration-200',
        'bg-gray-900',
        'border-r border-gray-800',
        collapsed ? 'w-[56px]' : 'w-52'
      )}
    >
      {/* Brand */}
      <div className={cn(
        'flex items-center gap-2.5 border-b border-gray-800 shrink-0',
        collapsed ? 'px-0 py-4 justify-center' : 'px-4 py-4'
      )}>
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
          <BarChart3 className="w-3.5 h-3.5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white leading-tight truncate">KPI Dashboard</p>
            <p className="text-[9px] text-gray-500 tracking-widest uppercase mt-0.5">Financial Controlling</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const prevSection = idx > 0 ? NAV_ITEMS[idx - 1].section : null;
          const showSection = item.section && item.section !== prevSection;

          return (
            <div key={item.href}>
              {showSection && (
                <div className={cn('pt-4 pb-1.5', collapsed ? 'px-2' : 'px-4')}>
                  {collapsed
                    ? <div className="h-px bg-gray-800" />
                    : <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-600">{item.section}</p>
                  }
                </div>
              )}

              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'relative flex items-center gap-2.5 mx-1.5 px-2.5 py-2 rounded-md transition-colors duration-100 text-[13px] font-medium',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-blue-600/15 text-blue-400'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                )}
              >
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r bg-blue-500" />
                )}
                <Icon className={cn(
                  'shrink-0 w-4 h-4',
                  isActive ? 'text-blue-400' : 'text-gray-600'
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
          'flex items-center gap-2 mb-3 mx-1.5 px-2.5 py-2 rounded-md text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors text-xs',
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
