import React from 'react';
import { Radio, RefreshCw } from 'lucide-react';

interface LiveIndicatorProps {
  isLive: boolean;
  isFetching?: boolean;
  lastUpdated?: Date;
  onToggle?: () => void;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  isLive,
  isFetching,
  lastUpdated,
  onToggle,
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Live Status */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          isLive
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        title={isLive ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
      >
        <Radio
          className={`w-3.5 h-3.5 ${isLive ? 'animate-pulse' : ''}`}
        />
        <span>{isLive ? 'LIVE' : 'Static'}</span>
      </button>

      {/* Fetching Indicator */}
      {isFetching && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Updating...</span>
        </div>
      )}

      {/* Last Updated */}
      {!isFetching && lastUpdated && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Updated {formatTimeAgo(lastUpdated)}
        </div>
      )}
    </div>
  );
};

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
