import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, ChevronDown, Check } from 'lucide-react';
import { useRefresh } from '../../contexts/RefreshContext';

const REFRESH_OPTIONS = [
  { value: 'off' as const, label: 'Off (Manual only)' },
  { value: 30 as const, label: '30 seconds' },
  { value: 60 as const, label: '1 minute' },
  { value: 300 as const, label: '5 minutes' },
  { value: 600 as const, label: '10 minutes' },
  { value: 900 as const, label: '15 minutes' },
  { value: 1800 as const, label: '30 minutes' },
  { value: 3600 as const, label: '1 hour' },
];

export const RefreshControl: React.FC = () => {
  const { refreshInterval, setRefreshInterval, refresh, isRefreshing, nextRefreshIn } = useRefresh();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatCountdown = (seconds: number | null): string => {
    if (seconds === null) return '';
    
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getCurrentLabel = () => {
    const option = REFRESH_OPTIONS.find(opt => opt.value === refreshInterval);
    return option ? option.label : 'Off';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button - Split into refresh action and dropdown trigger */}
      <div className="flex items-center bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden">
        {/* Refresh Button */}
        <button
          onClick={() => {
            refresh();
          }}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh now"
        >
          <RefreshCw 
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} ${refreshInterval !== 'off' ? 'text-green-600 dark:text-green-400' : 'text-neutral-600 dark:text-neutral-400'}`}
          />
          <span className="hidden sm:inline text-neutral-700 dark:text-neutral-300">
            {refreshInterval === 'off' ? 'Refresh' : 'Auto'}
          </span>
          {nextRefreshIn !== null && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatCountdown(nextRefreshIn)}
            </span>
          )}
        </button>

        {/* Dropdown Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-2 border-l border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          title="Auto-refresh settings"
        >
          <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Manual Refresh */}
          <button
            onClick={() => {
              refresh();
              setIsOpen(false);
            }}
            disabled={isRefreshing}
            className="w-full px-4 py-3 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors border-b border-neutral-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 text-primary-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 ml-6">
              Fetch latest data
            </p>
          </button>

          {/* Auto-refresh Options */}
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Auto-refresh
            </div>
            {REFRESH_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setRefreshInterval(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center justify-between"
              >
                <span className="text-neutral-700 dark:text-neutral-300">
                  {option.label}
                </span>
                {refreshInterval === option.value && (
                  <Check className="w-4 h-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>

          {/* Current Status */}
          {refreshInterval !== 'off' && (
            <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                <span className="font-medium">
                  Auto-refresh: {getCurrentLabel()}
                </span>
              </div>
              {nextRefreshIn !== null && (
                <p className="text-xs text-green-600 dark:text-green-500 mt-1 ml-4">
                  Next refresh in {formatCountdown(nextRefreshIn)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
