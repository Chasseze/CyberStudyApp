import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { offlineSyncManager } from './offlineSyncManager';

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
  const [syncState, setSyncState] = useState({
    isOnline: navigator.onLine,
    syncStatus: 'synced',
    lastSyncTime: null,
    hasPendingOperations: false,
    pendingCount: 0,
    syncError: null,
  });

  const reportSyncStart = useCallback(() => {
    setSyncState((prev) => ({ ...prev, syncStatus: 'syncing', syncError: null }));
  }, []);

  const reportSyncEnd = useCallback(() => {
    setSyncState((prev) => ({
      ...prev,
      syncStatus: prev.isOnline ? 'synced' : 'offline',
      lastSyncTime: new Date(),
      hasPendingOperations: false,
      pendingCount: 0,
    }));
  }, []);

  const reportSyncError = useCallback((message) => {
    setSyncState((prev) => ({ ...prev, syncStatus: 'error', syncError: message || 'Sync failed' }));
  }, []);

  const setPendingOperations = useCallback((count) => {
    setSyncState((prev) => ({
      ...prev,
      hasPendingOperations: count > 0,
      pendingCount: count,
    }));
  }, []);

  useEffect(() => {
    offlineSyncManager.init().catch(console.error);
    const unsubscribe = offlineSyncManager.onSyncStateChange((state) => {
      if (state === 'online') {
        setSyncState((prev) => ({ ...prev, isOnline: true, syncStatus: 'synced', lastSyncTime: new Date() }));
      } else if (state === 'offline') {
        setSyncState((prev) => ({ ...prev, isOnline: false, syncStatus: 'offline' }));
      } else if (state === 'remote_change') {
        setSyncState((prev) => ({ ...prev, lastSyncTime: new Date() }));
      }
    });
    return () => unsubscribe();
  }, []);

  const value = {
    ...syncState,
    isSynced: syncState.syncStatus === 'synced',
    isSyncing: syncState.syncStatus === 'syncing',
    isOffline: !syncState.isOnline || syncState.syncStatus === 'offline',
    reportSyncStart,
    reportSyncEnd,
    reportSyncError,
    setPendingOperations,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within SyncProvider');
  return context;
};

export default SyncContext;
