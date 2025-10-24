/**
 * Web-compatible storage adapter for Zustand persistence
 * Falls back to localStorage when AsyncStorage isn't available
 */

const isWeb = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export const createWebStorage = () => ({
  getItem: async (name: string) => {
    if (isWeb) {
      try {
        const item = localStorage.getItem(name);
        console.log('[WebStorage] getItem', name, ':', item ? 'found' : 'not found');
        return item;
      } catch (error) {
        console.error('[WebStorage] getItem error:', error);
        return null;
      }
    }
    return null;
  },
  setItem: async (name: string, value: string) => {
    if (isWeb) {
      try {
        localStorage.setItem(name, value);
        console.log('[WebStorage] setItem', name, ':', value.length, 'bytes');
      } catch (error) {
        console.error('[WebStorage] setItem error:', error);
      }
    }
  },
  removeItem: async (name: string) => {
    if (isWeb) {
      try {
        localStorage.removeItem(name);
        console.log('[WebStorage] removeItem', name);
      } catch (error) {
        console.error('[WebStorage] removeItem error:', error);
      }
    }
  },
});
