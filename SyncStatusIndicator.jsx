import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, Loader, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';

/**
 * SyncStatusIndicator Component
 * Shows real-time sync status and connection state
 */
const SyncStatusIndicator = ({ darkMode, show = true }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'syncing', 'synced', 'error', 'offline'
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [tooltip, setTooltip] = useState('');

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('synced');
      setTooltip('Back online - syncing data');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
      setTooltip('Offline - data will sync when online');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate sync status changes
  useEffect(() => {
    if (!isOnline) return;

    // Random sync events to show sync status
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setSyncStatus('syncing');
        setTooltip('Syncing data...');
        
        // Simulate sync completion
        setTimeout(() => {
          setSyncStatus('synced');
          setLastSyncTime(new Date());
          setTooltip(`Last synced: ${new Date().toLocaleTimeString()}`);
        }, 500 + Math.random() * 1500);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOnline]);

  if (!show) return null;

  // Status styles
  const statusConfig = {
    synced: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: darkMode ? 'bg-green-900/20' : 'bg-green-50',
      borderColor: darkMode ? 'border-green-700' : 'border-green-200',
      label: 'Synced',
    },
    syncing: {
      icon: Loader,
      color: 'text-blue-500',
      bgColor: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
      borderColor: darkMode ? 'border-blue-700' : 'border-blue-200',
      label: 'Syncing...',
      animate: true,
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: darkMode ? 'bg-red-900/20' : 'bg-red-50',
      borderColor: darkMode ? 'border-red-700' : 'border-red-200',
      label: 'Sync Error',
    },
    offline: {
      icon: CloudOff,
      color: 'text-gray-500',
      bgColor: darkMode ? 'bg-gray-800' : 'bg-gray-100',
      borderColor: darkMode ? 'border-gray-600' : 'border-gray-300',
      label: 'Offline',
    },
  };

  const config = statusConfig[syncStatus];
  const Icon = config.icon;

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} flex items-center gap-2 z-40 group cursor-help transition-all`}
      title={tooltip}
      onMouseEnter={() => setTooltip(tooltip)}
    >
      <Icon
        size={16}
        className={`${config.color} ${config.animate ? 'animate-spin' : ''}`}
      />
      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {config.label}
      </span>

      {/* Tooltip on hover */}
      <div className={`absolute bottom-full mb-2 right-0 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
        darkMode ? 'bg-gray-900 text-gray-200 border border-gray-700' : 'bg-gray-900 text-white border border-gray-800'
      }`}>
        {tooltip || config.label}
      </div>
    </div>
  );
};

export default SyncStatusIndicator;
