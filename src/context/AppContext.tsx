'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getDefaultDateRange } from '@/lib/utils';
import { OutboundFilters, InboundFilters } from '@/types';

interface AppState {
  outboundFilters: OutboundFilters;
  setOutboundFilters: (f: Partial<OutboundFilters>) => void;
  inboundFilters: InboundFilters;
  setInboundFilters: (f: Partial<InboundFilters>) => void;
  globalStartDate: string;
  globalEndDate: string;
  setGlobalDates: (start: string, end: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const defaults = getDefaultDateRange();

  const [globalStartDate, setGlobalStartDate] = useState(defaults.startDate);
  const [globalEndDate, setGlobalEndDate] = useState(defaults.endDate);

  const [outboundFilters, setOutboundFiltersState] = useState<OutboundFilters>({
    startDate: defaults.startDate,
    endDate: defaults.endDate,
    granularity: 'day',
  });

  const [inboundFilters, setInboundFiltersState] = useState<InboundFilters>({
    startDate: defaults.startDate,
    endDate: defaults.endDate,
    granularity: 'day',
  });

  const setGlobalDates = useCallback((start: string, end: string) => {
    setGlobalStartDate(start);
    setGlobalEndDate(end);
    setOutboundFiltersState((prev) => ({ ...prev, startDate: start, endDate: end }));
    setInboundFiltersState((prev) => ({ ...prev, startDate: start, endDate: end }));
  }, []);

  const setOutboundFilters = useCallback((updates: Partial<OutboundFilters>) => {
    setOutboundFiltersState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setInboundFilters = useCallback((updates: Partial<InboundFilters>) => {
    setInboundFiltersState((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        outboundFilters, setOutboundFilters,
        inboundFilters, setInboundFilters,
        globalStartDate, globalEndDate, setGlobalDates,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
