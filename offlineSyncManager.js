import { db } from './firebaseConfig';
import { enableNetwork, disableNetwork } from 'firebase/firestore';

/**
 * Offline Sync Manager
 * Manages offline persistence and synchronization across multiple tabs/windows
 */
class OfflineSyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingOperations = [];
    this.syncListeners = [];
  }

  /**
   * Initialize offline sync manager
   */
  async init() {
    try {
      // Listen for online/offline events
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));

      // Listen for storage events from other tabs
      window.addEventListener('storage', this.handleStorageChange.bind(this));

      // Initial state
      if (navigator.onLine) {
        await enableNetwork(db);
        this.isOnline = true;
      } else {
        await disableNetwork(db);
        this.isOnline = false;
      }

      console.log('Offline sync manager initialized');
    } catch (error) {
      console.error('Error initializing offline sync manager:', error);
    }
  }

  /**
   * Handle going online
   */
  async handleOnline() {
    console.log('Going online - enabling sync');
    this.isOnline = true;

    try {
      await enableNetwork(db);
      this.notifyListeners('online');
      console.log('Network enabled - syncing pending changes');
    } catch (error) {
      console.error('Error enabling network:', error);
    }
  }

  /**
   * Handle going offline
   */
  async handleOffline() {
    console.log('Going offline - disabling sync');
    this.isOnline = false;

    try {
      await disableNetwork(db);
      this.notifyListeners('offline');
      console.log('Network disabled - offline mode enabled');
    } catch (error) {
      console.error('Error disabling network:', error);
    }
  }

  /**
   * Handle storage changes from other tabs
   */
  handleStorageChange(event) {
    if (event.key === 'firestore_sync_broadcast') {
      const data = JSON.parse(event.newValue);
      this.notifyListeners('remote_change', data);
      console.log('Remote change detected from another tab:', data);
    }
  }

  /**
   * Broadcast sync event to other tabs
   */
  broadcastSync(operation) {
    try {
      localStorage.setItem(
        'firestore_sync_broadcast',
        JSON.stringify({
          operation,
          timestamp: Date.now(),
          uid: JSON.parse(localStorage.getItem('currentUser') || '{}').uid,
        })
      );
    } catch (error) {
      console.warn('Could not broadcast sync:', error);
    }
  }

  /**
   * Register a sync listener
   */
  onSyncStateChange(callback) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners(state, data) {
    this.syncListeners.forEach(listener => {
      try {
        listener(state, data);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  /**
   * Check if online
   */
  getIsOnline() {
    return this.isOnline;
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      hasPendingOperations: this.pendingOperations.length > 0,
      pendingCount: this.pendingOperations.length,
    };
  }
}

// Export singleton instance
export const offlineSyncManager = new OfflineSyncManager();

export default OfflineSyncManager;
