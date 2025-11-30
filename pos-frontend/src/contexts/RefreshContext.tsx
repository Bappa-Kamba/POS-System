import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

type RefreshInterval = 'off' | 30 | 60 | 300 | 600 | 900 | 1800 | 3600;

interface RefreshContextType {
  refreshInterval: RefreshInterval;
  setRefreshInterval: (interval: RefreshInterval) => void;
  refresh: () => void;
  isRefreshing: boolean;
  nextRefreshIn: number | null;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [refreshInterval, setRefreshIntervalState] = useState<RefreshInterval>('off');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextRefreshIn, setNextRefreshIn] = useState<number | null>(null);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Invalidate all queries - React Query will refetch mounted queries
      await queryClient.invalidateQueries();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  // Auto-refresh timer
  useEffect(() => {
    if (refreshInterval === 'off') {
      setNextRefreshIn(null);
      return;
    }

    const intervalMs = refreshInterval * 1000;
    let countdown = refreshInterval;
    setNextRefreshIn(countdown);

    // Countdown timer (updates every second)
    const countdownTimer = window.setInterval(() => {
      countdown -= 1;
      setNextRefreshIn(countdown);
    }, 1000);

    // Refresh timer (triggers at interval)
    const refreshTimer = window.setInterval(() => {
      refresh();
      countdown = refreshInterval; // Reset countdown
      setNextRefreshIn(countdown);
    }, intervalMs);

    return () => {
      window.clearInterval(countdownTimer);
      window.clearInterval(refreshTimer);
    };
  }, [refreshInterval, refresh]);

  const setRefreshInterval = useCallback((newInterval: RefreshInterval) => {
    setRefreshIntervalState(newInterval);
    // Save to localStorage for persistence
    if (newInterval === 'off') {
      localStorage.removeItem('refreshInterval');
    } else {
      localStorage.setItem('refreshInterval', String(newInterval));
    }
  }, []);

  // Load saved interval on mount
  useEffect(() => {
    const saved = localStorage.getItem('refreshInterval');
    if (saved && saved !== 'off') {
      const parsedInterval = parseInt(saved, 10);
      const validIntervals: number[] = [30, 60, 300, 600, 900, 1800, 3600];
      if (validIntervals.includes(parsedInterval)) {
        setRefreshIntervalState(parsedInterval as RefreshInterval);
      }
    }
  }, []);

  return (
    <RefreshContext.Provider
      value={{
        refreshInterval,
        setRefreshInterval,
        refresh,
        isRefreshing,
        nextRefreshIn,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within RefreshProvider');
  }
  return context;
};
