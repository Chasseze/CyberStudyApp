import React, { createContext, useContext, useEffect, useState } from 'react';
import { offlineSyncManager } from './offlineSyncManager';

/**
 * SyncContext - Multi-device and multi-tab sync state management
 */
const SyncContext = createContext();

/**
 * SyncProvider Component
 * Wraps the app and manages sync state across tabs
 */
export const SyncProvider = ({ children }) => {
  const [syncState, setSyncState] = useState({
    isOnline: navigator.onLine,
    syncStatus: 'synced', // 'syncing', 'synced', 'error', 'offline'
    lastSyncTime: null,
    hasPendingOperations: false,
    pendingCount: 0,
  });

  useEffect(() => {
    // Initialize offline sync manager
    offlineSyncManager.init().catch(console.error);

    // Listen for sync state changes
    const unsubscribe = offlineSyncManager.onSyncStateChange((state, data) => {
      if (state === 'online') {
        setSyncState(prev => ({
          ...prev,
          isOnline: true,
          syncStatus: 'synced',
          lastSyncTime: new Date(),
        }));
      } else if (state === 'offline') {
        setSyncState(prev => ({
          ...prev,
          isOnline: false,
          syncStatus: 'offline',
        }));
      } else if (state === 'remote_change') {
        setSyncState(prev => ({
          ...prev,
          lastSyncTime: new Date(),
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    ...syncState,
    isOnline: syncState.isOnline,
    isSynced: syncState.syncStatus === 'synced',
    isSyncing: syncState.syncStatus === 'syncing',
    isOffline: syncState.syncStatus === 'offline',
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

/**
 * Custom hook to use sync context
 */
export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
};

export default SyncContext;
