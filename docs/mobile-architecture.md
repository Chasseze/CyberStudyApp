# CyberStudy Tracker Mobile Architecture (Stage 6)

## 1. Product Scope & Phasing

### Phase 1 (MVP – launch target)
- **Authentication**: Email/password via Firebase Auth + optional biometric quick-unlock.
- **Focus Timer**: Pomodoro-style start/pause/reset with session editing.
- **Study Log**: List of past focus sessions with basic metadata (week/topic/status/notes) and quick add/edit/delete.
- **Offline-first**: Entries and timer events cached locally; sync with Firestore when online.
- **Notifications**: Local push for timer completion + scheduled reminders.

### Phase 2 (Fast Follow)
- Advanced analytics dashboards (charts/stats mirroring web).
- Full settings suite (theme, notification cadence, account management).
- Data exports/imports, streak visualizations, community hooks, etc.

## 2. Technical Stack Choices

| Concern | Recommendation | Notes |
| --- | --- | --- |
| Framework | **Expo (React Native)** with Custom Dev Client | Speeds up delivery, keeps iOS/Android parity, still allows native modules (notifications, biometrics) via config plugins. |
| Language | TypeScript | Ensures parity with web typings; improves Zustand store contracts. |
| Navigation | `@react-navigation/native` + `@react-navigation/bottom-tabs` + `@react-navigation/native-stack` | Tab bar for top-level areas, stack per tab. |
| State (global) | **Zustand** with slices + `zustand/persist` + MMKV storage | Handles entries/auth/timer slices with low boilerplate. |
| UI Kit | Tailwind-in-RN via `nativewind` or `tamagui` | Keeps design language similar to web Tailwind. |
| Auth & Data | `firebase` JS SDK + `@react-native-firebase/app` (if needed) | Use modular SDK; Firestore with offline persistence disabled (handled via Zustand). |
| Notifications | `expo-notifications` + `expo-task-manager` | Local schedule for timers/reminders; remote pushes later if needed. |
| Biometrics | `expo-local-authentication` | Wrap login screen with optional Face ID/Touch ID. |
| Background Timer | JS timer + fallback scheduled notification | Keep timer accurate in foreground; if app backgrounded, schedule notification & resume elapsed time on re-open. |
| Analytics (Phase 2) | `react-native-chart-kit` or `victory-native` | Similar to web charts. |

## 3. Navigation Map

```
Root Tabs (BottomTabNavigator)
├── TrackerStack (Native Stack)
│   ├── TrackerHomeScreen      // Timer + quick add entry controls
│   ├── EditEntryScreen        // Modal
│   └── TimerSettingsScreen    // Focus / break durations
├── HistoryStack (Native Stack)
│   ├── HistoryListScreen      // Paginated list of entries
│   └── HistoryDetailScreen    // Extended notes + edit/delete
└── SettingsStack (Native Stack)
    ├── SettingsHomeScreen     // Theme, notifications, biometrics toggle
    ├── AccountScreen          // Profile info, logout
    └── AboutScreen            // Version, feedback
```

- **Modal presentation**: Use `presentation: 'modal'` for edit dialogs.
- **Phase 2 additions**: Add `AnalyticsStack` tab with charts and badges once ready.

## 4. State Architecture

### Zustand Store Slices

```ts
// authSlice
state: {
  user: FirebaseUser | null,
  status: 'idle' | 'loading' | 'authenticated' | 'error',
  error?: string
}
actions: login(email, password), logout(), refreshUser(), enableBiometrics(),
         authenticateWithBiometrics()

// timerSlice
state: {
  mode: 'work' | 'break',
  durationMinutes: number,
  timeRemaining: number,
  isRunning: boolean,
  sessionStart?: number,
  pendingNotificationId?: string
}
actions: startTimer(), pauseTimer(), resetTimer(), tick(), setDurations(),
         scheduleCompletionNotification(), clearNotification()

// entriesSlice
state: {
  entries: Entry[],
  lastSyncedAt?: string,
  isSyncing: boolean
}
actions: loadLocal(), addEntry(entryDraft), updateEntry(id, patch), deleteEntry(id),
         syncFromRemote(), syncToRemote()
```

### Persistence Strategy
- Use `zustand/persist` + `MMKV` storage for near-native performance.
- Persist `entriesSlice` and timer state; keep auth transient (restore via Firebase silently).
- Conflict resolution: last-write-wins with server timestamps; highlight conflicts for manual review (Phase 2).

## 5. Data Layer & Sync

1. **Local cache**: All CRUD actions mutate Zustand state + MMKV immediately for instant UX.
2. **Sync queue**: Maintain array of pending mutations (add/update/delete) with Firestore doc IDs.
3. **Firestore**:
   - Collections: `users/{uid}/entries` (same schema as web) + `users/{uid}/sessions` for timer logs.
   - 
   ```json
   Entry {
     id: string,
     week: string,
     topic: string,
     goal: string,
     status: string,
     notes?: string,
     createdAt: Timestamp,
     updatedAt: Timestamp
   }
   ```
4. **Sync loop**:
   - On app focus / network regain: flush queue, then fetch delta via `where('updatedAt', '>', lastSync)`.
   - Subscribe to Firestore snapshots when app active for near-real-time updates.
5. **Background sync (Phase 2)**: Use `expo-task-manager` + `expo-background-fetch` to refresh analytics daily.

## 6. Timer & Background Behaviour

- Use JS timers (`setInterval`) while foregrounded; keep components awake via `expo-keep-awake` when timer running.
- On `AppState` change to background:
  1. Persist `sessionStart`, `duration`, current `timeRemaining`.
  2. Schedule local notification for expected completion using `expo-notifications.scheduleNotificationAsync`.
  3. Clear live interval.
- On resume:
  1. Recompute elapsed time (`Date.now() - sessionStart`).
  2. If timer should have finished, mark session complete, trigger completion workflow, cancel pending notification.
- For long background durations, rely on scheduled notification to alert user. (True background execution beyond this requires native headless tasks; revisit if needed.)

## 7. Authentication Flow

1. **Email/Password**: `signInWithEmailAndPassword` + `createUserWithEmailAndPassword` from Firebase Auth.
2. **Biometric Unlock**:
   - After first successful login, offer "Enable biometric login".
   - Store refresh token securely via `expo-secure-store`.
   - On app launch, if token exists, prompt for biometric via `LocalAuthentication.authenticateAsync`; upon success, use `signInWithCustomToken` or `signInWithRefreshToken` flow.
3. **State Handling**: Auth slice updates `status`, triggers navigation guard to switch between `AuthStack` and main tabs.

## 8. Notifications & Permissions

- Request notification permission on first timer start, explaining the need.
- For completion reminders: schedule local notifications tied to timer end-time, include action buttons (stop/resume) where platform supports.
- Future remote notifications: integrate Firebase Cloud Messaging (phase 2) to send daily study reminders.
- Store user preferences (enabled/disabled, quiet hours) in Settings slice.

## 9. Project Structure (Proposed)

```
mobile/
├── app.config.ts              // Expo config (bundle ID, notifications, deeplinks)
├── package.json
├── src/
│   ├── App.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── TrackerNavigator.tsx
│   │   └── types.ts
│   ├── screens/
│   │   ├── auth/
│   │   ├── tracker/
│   │   ├── history/
│   │   └── settings/
│   ├── components/
│   │   ├── TimerDial.tsx
│   │   ├── EntryCard.tsx
│   │   └── NotificationPermissionModal.tsx
│   ├── store/
│   │   ├── index.ts
│   │   ├── authSlice.ts
│   │   ├── timerSlice.ts
│   │   └── entriesSlice.ts
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── notifications.ts
│   │   └── biometrics.ts
│   ├── hooks/
│   │   ├── useTimer.ts
│   │   └── useSync.ts
│   ├── utils/
│   │   └── date.ts
│   └── theme/
│       └── tailwind.ts
└── tsconfig.json
```

- Use `expo-router` if desired, but explicit navigation files keep parity with existing web structure.
- Shared constants (status emojis, etc.) can be extracted to `/shared` and imported by both web & mobile.

## 10. Security & Compliance

- Store sensitive tokens in `expo-secure-store`.
- Ensure biometric opt-in with fallback to password.
- Use HTTPS functions for any future server-side features; keep Firestore security rules aligned with web.
- Follow iOS/Android background execution guidelines; document push/biometric usage in Info.plist & AndroidManifest.

## 11. Tooling & DevOps

- **Dev environment**: Expo Go for quick testing; custom dev client once native modules added.
- **Linting/Formatting**: ESLint + Prettier + TypeScript strict mode.
- **Testing**: Jest + React Native Testing Library for components; Detox/E2E in later phases.
- **CI/CD**: Expo Application Services (EAS) build profiles (`preview`, `production`).
- **Beta distribution**: EAS Update for OTA; TestFlight / Play Internal Testing for builds requiring new native code (notifications, biometrics).

## 12. Phase 1 Acceptance Criteria

- User can log in/out (email/password) and optionally enable biometric unlock.
- Timer counts down accurately in foreground, sends notification on completion even when app backgrounded.
- Sessions appear in list view with status, week/topic, and editable notes.
- Data persists offline and syncs when online (manual trigger or auto on reconnect).
- Basic settings screen allows toggling notifications & biometric login.
- Build available on both iOS and Android via Expo.

## 13. Open Questions / Follow-ups

- Confirm whether analytics data needs to be aggregated client-side or via Cloud Functions prior to Phase 2.
- Determine push reminder cadence & UI (daily reminder vs. per-goal notifications).
- Decide on shared code strategy (monorepo for web + mobile shared utilities?).
- Accessibility targets (voiceover, large fonts) for mobile to bake into design system.
