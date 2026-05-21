import React from 'react';
import { Cloud, CloudOff, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useSync } from './SyncContext';

/**
 * SyncStatusIndicator — reflects real SyncContext state (no simulated sync).
 */
const SyncStatusIndicator = ({ darkMode, show = true }) => {
  const {
    isOnline,
    syncStatus,
    lastSyncTime,
    syncError,
    hasPendingOperations,
    pendingCount,
  } = useSync();

  if (!show) return null;

  const getStatusConfig = () => {
    if (!isOnline || syncStatus === 'offline') {
      return {
        icon: CloudOff,
        color: darkMode ? 'text-gray-400' : 'text-gray-500',
        bg: darkMode ? 'bg-gray-800' : 'bg-gray-100',
        label: 'Offline',
        tooltip: 'Offline — changes sync when you reconnect',
      };
    }
    if (syncStatus === 'syncing' || hasPendingOperations) {
      return {
        icon: Loader,
        color: darkMode ? 'text-blue-400' : 'text-blue-600',
        bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-50',
        label: 'Syncing',
        tooltip: pendingCount
          ? `Syncing ${pendingCount} pending change(s)…`
          : 'Syncing with cloud…',
        spin: true,
      };
    }
    if (syncStatus === 'error') {
      return {
        icon: AlertCircle,
        color: darkMode ? 'text-red-400' : 'text-red-600',
        bg: darkMode ? 'bg-red-900/30' : 'bg-red-50',
        label: 'Sync error',
        tooltip: syncError || 'Sync failed — will retry',
      };
    }
    return {
      icon: CheckCircle,
      color: darkMode ? 'text-green-400' : 'text-green-600',
      bg: darkMode ? 'bg-green-900/30' : 'bg-green-50',
      label: 'Synced',
      tooltip: lastSyncTime
        ? `Last synced ${lastSyncTime.toLocaleTimeString()}`
        : 'All changes saved to cloud',
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
      title={config.tooltip}
      role="status"
      aria-live="polite"
    >
      <Icon size={14} className={config.spin ? 'animate-spin' : ''} aria-hidden />
      <span className="hidden sm:inline">{config.label}</span>
    </div>
  );
};

export default SyncStatusIndicator;
