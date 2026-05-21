import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createWebStorage } from './webStorage';

let storage: any;
try {
  // Try to use AsyncStorage first (for native platforms)
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = createJSONStorage(() => AsyncStorage);
  console.log('[Store] Using AsyncStorage');
} catch (error) {
  // Fall back to web storage (localStorage)
  console.log('[Store] AsyncStorage not available, using web storage');
  storage = createJSONStorage(() => createWebStorage());
}

export type StudyStatus =
  | '❌ Not Started'
  | '🟡 In Progress'
  | '✅ Completed'
  | '🔄 Review Needed';

export interface StudyEntry {
  id: string;
  week: string;
  topic: string;
  goal: string;
  status: StudyStatus;
  notes?: string;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimerSettings {
  workMinutes: number;
  breakMinutes: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
}

type AuthStatus = 'idle' | 'loading' | 'authenticated';

type EntryDraft = Omit<StudyEntry, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

type AppState = {
  user: UserProfile | null;
  authStatus: AuthStatus;
  isInitialized: boolean;
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;
  entries: StudyEntry[];
  timerSettings: TimerSettings;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addEntry: (entry: EntryDraft) => void;
  updateEntry: (id: string, updates: Partial<StudyEntry>) => void;
  deleteEntry: (id: string) => void;
  setTimerSettings: (settings: Partial<TimerSettings>) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  resetTimerSettings: () => void;
  initializeApp: () => void;
};

const initialTimerSettings: TimerSettings = {
  workMinutes: 25,
  breakMinutes: 5,
};

const defaultState: Omit<AppState, 'login' | 'logout' | 'addEntry' | 'updateEntry' | 'deleteEntry' | 'setTimerSettings' | 'setNotificationsEnabled' | 'setBiometricsEnabled' | 'resetTimerSettings' | 'initializeApp'> = {
  user: null,
  authStatus: 'idle',
  isInitialized: false,
  biometricsEnabled: false,
  notificationsEnabled: false,
  entries: [],
  timerSettings: initialTimerSettings,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      console.log('[Store] Creating store with default state');
      return {
        ...defaultState,
        async login(email, _password) {
          console.log('[Store] Login called for:', email);
          set({ authStatus: 'loading' });
          await new Promise((resolve) => setTimeout(resolve, 600));
          set({
            user: {
              id: `user-${email}`,
              email,
              displayName: email.split('@')[0],
            },
            authStatus: 'authenticated',
          });
        },
        logout() {
          set({ user: null, authStatus: 'idle' });
        },
        addEntry(entry) {
          const now = new Date().toISOString();
          const newEntry: StudyEntry = {
            id: entry.id ?? `entry-${Date.now()}`,
            createdAt: now,
            updatedAt: now,
            week: entry.week,
            topic: entry.topic,
            goal: entry.goal,
            status: entry.status,
            notes: entry.notes,
            durationMinutes: entry.durationMinutes,
          };
          set({ entries: [newEntry, ...get().entries] });
        },
        updateEntry(id, updates) {
          set({
            entries: get().entries.map((entry) =>
              entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry
            ),
          });
        },
        deleteEntry(id) {
          set({ entries: get().entries.filter((entry) => entry.id !== id) });
        },
        setTimerSettings(settings) {
          set({
            timerSettings: {
              ...get().timerSettings,
              ...settings,
            },
          });
        },
        setNotificationsEnabled(enabled) {
          set({ notificationsEnabled: enabled });
        },
        setBiometricsEnabled(enabled) {
          set({ biometricsEnabled: enabled });
        },
        resetTimerSettings() {
          set({ timerSettings: initialTimerSettings });
        },
        initializeApp() {
          console.log('[Store] initializeApp called');
          set({ isInitialized: true, authStatus: 'idle' });
        },
      };
    },
    {
      name: 'cybertracker-mobile-store',
      storage: storage,
      partialize: (state) => ({
        user: state.user,
        entries: state.entries,
        timerSettings: state.timerSettings,
        notificationsEnabled: state.notificationsEnabled,
        biometricsEnabled: state.biometricsEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        try {
          console.log('[Store] Rehydrating storage, state:', state);
          if (!state) {
            console.log('[Store] No state to rehydrate');
            return;
          }
          state.authStatus = state.user ? 'authenticated' : 'idle';
          console.log('[Store] Rehydration complete, authStatus:', state.authStatus);
        } catch (error) {
          console.error('[Store] Rehydration error:', error);
        }
      },
    }
  )
);

export const selectAuth = (state: AppState) => ({
  user: state.user,
  authStatus: state.authStatus,
  login: state.login,
  logout: state.logout,
  biometricsEnabled: state.biometricsEnabled,
  setBiometricsEnabled: state.setBiometricsEnabled,
});

export const selectEntries = (state: AppState) => ({
  entries: state.entries,
  addEntry: state.addEntry,
  updateEntry: state.updateEntry,
  deleteEntry: state.deleteEntry,
});

export const selectTimer = (state: AppState) => ({
  timerSettings: state.timerSettings,
  setTimerSettings: state.setTimerSettings,
  resetTimerSettings: state.resetTimerSettings,
});

export const selectPreferences = (state: AppState) => ({
  notificationsEnabled: state.notificationsEnabled,
  setNotificationsEnabled: state.setNotificationsEnabled,
  biometricsEnabled: state.biometricsEnabled,
  setBiometricsEnabled: state.setBiometricsEnabled,
});
