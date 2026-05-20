import React from 'react';
import { CloudOff, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useSync } from './SyncContext';

const SyncStatusIndicator = ({ darkMode, show = true }) => {
  const { isOnline, syncStatus, lastSyncTime, syncError, hasPendingOperations, pendingCount } = useSync();
  if (!show) return null;

  const config =
    !isOnline || syncStatus === 'offline'
      ? { Icon: CloudOff, bg: darkMode ? 'bg-gray-800' : 'bg-gray-100', color: darkMode ? 'text-gray-400' : 'text-gray-500', label: 'Offline', tip: 'Offline — changes sync when you reconnect' }
      : syncStatus === 'syncing' || hasPendingOperations
        ? { Icon: Loader, bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-50', color: darkMode ? 'text-blue-400' : 'text-blue-600', label: 'Syncing', tip: pendingCount ? `Syncing ${pendingCount} change(s)…` : 'Syncing…', spin: true }
        : syncStatus === 'error'
          ? { Icon: AlertCircle, bg: darkMode ? 'bg-red-900/30' : 'bg-red-50', color: darkMode ? 'text-red-400' : 'text-red-600', label: 'Error', tip: syncError || 'Sync failed' }
          : { Icon: CheckCircle, bg: darkMode ? 'bg-green-900/30' : 'bg-green-50', color: darkMode ? 'text-green-400' : 'text-green-600', label: 'Synced', tip: lastSyncTime ? `Last synced ${lastSyncTime.toLocaleTimeString()}` : 'All changes saved' };

  const { Icon, bg, color, label, tip, spin } = config;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${bg} ${color}`} title={tip} role="status" aria-live="polite">
      <Icon size={14} className={spin ? 'animate-spin' : ''} aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
};

export default SyncStatusIndicator;
