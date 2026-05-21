import React, { useState, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { Home, BookOpen, Timer, BarChart3, Target, User } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useSync } from './SyncContext';
import { useToast } from './src/context/ToastContext';
import { useDarkMode } from './src/hooks/useDarkMode';
import { useKeyboardShortcuts } from './src/hooks/useKeyboardShortcuts';
import AuthUI from './AuthUI';
import PomodoroTimer from './PomodoroTimer';
import ErrorBoundary from './components/ErrorBoundary';
import { TabContentSkeleton } from './components/LoadingSkeleton';
import { AppHeader } from './src/components/layout/AppHeader';
import { AppNav } from './src/components/layout/AppNav';
import { DashboardTab } from './src/components/dashboard/DashboardTab';
import { EntryForm } from './src/components/tracker/EntryForm';
import { EntryList, EntryFilters } from './src/components/tracker/EntryList';
import { InsightsTab } from './src/components/insights/InsightsTab';
import { Card } from './src/components/ui/Card';
import {
  ENTRY_STATUS,
  normalizeEntries,
  normalizeEntry,
  countByStatus,
  matchesStatusFilter,
} from './src/constants/status';
import { sanitizeEntryPayload } from './src/utils/validation';
import { logoutUser, resendVerificationEmail } from './authService';
import { formatDateDisplay, parseFirestoreDate } from './utils/dateUtils';
import {
  addEntry,
  updateEntry,
  deleteEntry,
  subscribeToEntries,
  subscribeToGoals,
  subscribeToTimerSessions,
  subscribeToStreak,
  addTimerSession,
  migrateLocalStorageToFirestore,
} from './firestoreService';

const AnalyticsPanel = lazy(() => import('./AnalyticsPanel'));
const GoalsPanel = lazy(() => import('./GoalsPanel'));
const UserProfilePanel = lazy(() => import('./UserProfilePanel'));
const UserSettingsPanel = lazy(() => import('./UserSettingsPanel'));
const DataManagementPanel = lazy(() => import('./DataManagementPanel'));
const AccountManagementPanel = lazy(() => import('./AccountManagementPanel'));
const CalendarView = lazy(() => import('./CalendarView'));

const EMPTY_FORM = {
  week: '',
  topic: '',
  goal: '',
  status: ENTRY_STATUS.NOT_STARTED,
  notes: '',
};

const CyberTrackerAppWithAuth = () => {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { reportSyncStart, reportSyncEnd, reportSyncError } = useSync();
  const toast = useToast();
  const { darkMode, setDarkMode, toggleDarkMode } = useDarkMode();

  const [activeTab, setActiveTab] = useState('home');
  const [profileSection, setProfileSection] = useState('profile');
  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [timerSessions, setTimerSessions] = useState([]);
  const [streak, setStreak] = useState(null);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const s = localStorage.getItem('pomodoroSound');
    return s !== 'false';
  });
  const searchInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('pomodoroSound', soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

  useKeyboardShortcuts({
    enabled: isAuthenticated || isDemoMode,
    onTab: setActiveTab,
    onFocusSearch: () => {
      setActiveTab('tracker');
      setTimeout(() => searchInputRef.current?.focus(), 50);
    },
  });

  useEffect(() => {
    if (!user?.uid) {
      setEntriesLoading(false);
      const savedEntries = localStorage.getItem('entries');
      if (savedEntries) setEntries(normalizeEntries(JSON.parse(savedEntries)));
      const savedGoals = localStorage.getItem('studyGoals');
      if (savedGoals) setGoals(JSON.parse(savedGoals));
      const savedSessions = localStorage.getItem('timerSessions');
      if (savedSessions) setTimerSessions(JSON.parse(savedSessions));
      return;
    }

    setEntriesLoading(true);
    const unsubEntries = subscribeToEntries(user.uid, (firestoreEntries) => {
      const normalized = normalizeEntries(firestoreEntries);
      setEntries(normalized);
      localStorage.setItem('entries', JSON.stringify(normalized));
      setEntriesLoading(false);
      reportSyncEnd();
    });

    const unsubGoals = subscribeToGoals(user.uid, (firestoreGoals) => {
      setGoals(firestoreGoals);
      localStorage.setItem('studyGoals', JSON.stringify(firestoreGoals));
    });

    const unsubSessions = subscribeToTimerSessions(user.uid, (firestoreSessions) => {
      setTimerSessions(firestoreSessions);
      localStorage.setItem('timerSessions', JSON.stringify(firestoreSessions));
    });

    const unsubStreak = subscribeToStreak(user.uid, setStreak);

    const hasMigrated = localStorage.getItem(`migrated_${user.uid}`);
    if (!hasMigrated) {
      const localEntries = JSON.parse(localStorage.getItem('entries') || '[]');
      const localGoals = JSON.parse(localStorage.getItem('studyGoals') || '[]');
      const localSessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');
      if (localEntries.length || localGoals.length || localSessions.length) {
        reportSyncStart();
        migrateLocalStorageToFirestore(user.uid, {
          entries: localEntries,
          goals: localGoals,
          timerSessions: localSessions,
        })
          .then(() => {
            localStorage.setItem(`migrated_${user.uid}`, 'true');
            toast.success('Local data synced to cloud');
            reportSyncEnd();
          })
          .catch((err) => {
            reportSyncError(err.message);
            toast.error('Migration failed — data kept locally');
          });
      }
    }

    return () => {
      unsubEntries();
      unsubGoals();
      unsubSessions();
      unsubStreak();
    };
  }, [user?.uid, reportSyncEnd, reportSyncStart, reportSyncError, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  const persistEntryLocal = (list) => {
    setEntries(list);
    localStorage.setItem('entries', JSON.stringify(list));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitized = sanitizeEntryPayload(formData);
    if (!sanitized.valid) {
      toast.error(sanitized.error);
      return;
    }

    setIsSaving(true);
    reportSyncStart();
    const payload = sanitized.data;
    const previousEntries = entries;

    try {
      if (editingId) {
        const optimistic = entries.map((entry) =>
          String(entry.id) === String(editingId)
            ? { ...entry, ...payload, status: payload.status, updatedAt: new Date().toISOString() }
            : entry
        );
        persistEntryLocal(optimistic);

        if (user?.uid) {
          await updateEntry(user.uid, String(editingId), payload);
        }
        toast.success('Entry updated');
        resetForm();
      } else {
        if (user?.uid) {
          await addEntry(user.uid, payload);
        } else {
          const optimisticEntry = {
            id: Date.now(),
            ...payload,
            createdAt: new Date().toISOString(),
          };
          persistEntryLocal([optimisticEntry, ...entries]);
        }
        toast.success('Entry saved');
        resetForm();
      }
      reportSyncEnd();
    } catch (error) {
      console.error('Save entry error:', error);
      persistEntryLocal(previousEntries);
      reportSyncError(error.message);
      toast.error('Failed to save. Changes reverted.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({
      week: entry.week || '',
      topic: entry.topic || '',
      goal: entry.goal || '',
      status: normalizeEntry(entry).status,
      notes: entry.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    const previous = entries;
    const next = entries.filter((e) => String(e.id) !== String(id));
    persistEntryLocal(next);
    reportSyncStart();

    try {
      if (user?.uid) await deleteEntry(user.uid, String(id));
      toast.success('Entry deleted');
      if (String(editingId) === String(id)) resetForm();
      reportSyncEnd();
    } catch (error) {
      persistEntryLocal(previous);
      reportSyncError(error.message);
      toast.error('Delete failed');
    }
  };

  const handleSessionComplete = async (sessionData) => {
    const newSession = {
      id: Date.now(),
      type: sessionData.type,
      duration: sessionData.duration,
      completedAt: new Date().toISOString(),
    };
    reportSyncStart();
    try {
      if (user?.uid) {
        await addTimerSession(user.uid, newSession);
      } else {
        const updated = [...timerSessions, newSession];
        setTimerSessions(updated);
        localStorage.setItem('timerSessions', JSON.stringify(updated));
      }
      toast.success(sessionData.type === 'work' ? 'Work session complete!' : 'Break complete!');
      reportSyncEnd();
    } catch (error) {
      const updated = [...timerSessions, newSession];
      setTimerSessions(updated);
      localStorage.setItem('timerSessions', JSON.stringify(updated));
      toast.info('Session saved locally');
    }
  };

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          entry.topic?.toLowerCase().includes(q) ||
          entry.goal?.toLowerCase().includes(q) ||
          entry.notes?.toLowerCase().includes(q);
        return matchesSearch && matchesStatusFilter(entry, filterStatus);
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'oldest': {
            const da = parseFirestoreDate(a.createdAt)?.getTime() || 0;
            const db = parseFirestoreDate(b.createdAt)?.getTime() || 0;
            return da - db;
          }
          case 'week':
            return String(a.week).localeCompare(String(b.week));
          case 'topic':
            return a.topic.localeCompare(b.topic);
          default: {
            const da = parseFirestoreDate(a.createdAt)?.getTime() || 0;
            const db = parseFirestoreDate(b.createdAt)?.getTime() || 0;
            return db - da;
          }
        }
      });
  }, [entries, searchTerm, filterStatus, sortBy]);

  const statusCounts = countByStatus(entries);
  const totalEntries = entries.length;
  const completionRate = totalEntries
    ? Math.round((statusCounts.completed / totalEntries) * 100)
    : 0;
  const totalFocusMinutes = timerSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const latestEntry = entries.reduce((latest, entry) => {
    const entryDate = parseFirestoreDate(entry.createdAt);
    if (!entryDate) return latest;
    if (!latest) return entry;
    return entryDate > parseFirestoreDate(latest.createdAt) ? entry : latest;
  }, null);
  const latestEntryDisplay = latestEntry ? formatDateDisplay(latestEntry.createdAt) : null;

  const tabs = [
    { id: 'home', label: 'Home', shortLabel: 'Home', icon: Home },
    { id: 'tracker', label: 'Tracker', shortLabel: 'Track', icon: BookOpen },
    { id: 'pomodoro', label: 'Pomodoro', shortLabel: 'Timer', icon: Timer },
    { id: 'insights', label: 'Insights', shortLabel: 'Stats', icon: BarChart3, mobile: true },
    { id: 'goals', label: 'Goals', shortLabel: 'Goals', icon: Target },
    { id: 'profile', label: 'Profile', shortLabel: 'You', icon: User },
  ];

  const profileSections = [
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
    { id: 'data', label: 'Data' },
    { id: 'account', label: 'Account' },
  ];

  const shellBg = darkMode
    ? 'min-h-screen bg-gray-900 text-white'
    : 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100';

  if (authLoading) {
    return (
      <div className={`${shellBg} flex items-center justify-center`}>
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4" />
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your study tracker…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isDemoMode) {
    return <AuthUI darkMode={darkMode} />;
  }

  return (
    <div className={`${shellBg} pb-nav-mobile`}>
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <AppHeader
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={logoutUser}
          showDemoBanner={isDemoMode}
        />

        {user && !user.emailVerified && (
          <Card darkMode={darkMode} hover={false} className="mb-6 !p-4 border-amber-500/50">
            <p className="text-sm">
              Please verify your email.{' '}
              <button
                type="button"
                className="underline font-semibold text-indigo-500"
                onClick={() =>
                  resendVerificationEmail()
                    .then(() => toast.success('Verification email sent'))
                    .catch(() => toast.error('Could not send email'))
                }
              >
                Resend verification
              </button>
            </p>
          </Card>
        )}

        <AppNav darkMode={darkMode} tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="max-w-4xl mx-auto w-full">
          {activeTab === 'home' && (
            <DashboardTab
              darkMode={darkMode}
              entries={entries}
              timerSessions={timerSessions}
              streak={streak}
              onNavigate={setActiveTab}
              latestEntryDisplay={latestEntryDisplay}
              totalFocusMinutes={totalFocusMinutes}
            />
          )}

          {activeTab === 'tracker' && (
            <div className="space-y-6">
              <EntryForm
                darkMode={darkMode}
                formData={formData}
                editingId={editingId}
                isSaving={isSaving}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancelEdit={resetForm}
              />
              <EntryFilters
                darkMode={darkMode}
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                sortBy={sortBy}
                onSearch={setSearchTerm}
                onFilter={setFilterStatus}
                onSort={setSortBy}
                searchInputRef={searchInputRef}
              />
              <Card darkMode={darkMode} hover={false} className="!p-5">
                <h3 className="font-semibold mb-4">Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold">{totalEntries}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Entries</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-500">{completionRate}%</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Done</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statusCounts.inProgress + statusCounts.review}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalFocusMinutes}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Focus min</p>
                  </div>
                </div>
              </Card>
              <EntryList
                darkMode={darkMode}
                entries={filteredEntries}
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                isLoading={entriesLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddFirst={resetForm}
              />
            </div>
          )}

          {activeTab === 'pomodoro' && (
            <PomodoroTimer
              darkMode={darkMode}
              onSessionComplete={handleSessionComplete}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsTab
              darkMode={darkMode}
              entries={entries}
              timerSessions={timerSessions}
              AnalyticsPanel={AnalyticsPanel}
              CalendarView={CalendarView}
            />
          )}

          {activeTab === 'goals' && (
            <ErrorBoundary darkMode={darkMode} componentName="Goals">
              <Suspense fallback={<TabContentSkeleton darkMode={darkMode} />}>
                <GoalsPanel
                  entries={entries}
                  darkMode={darkMode}
                  goals={goals}
                  onGoalsUpdate={setGoals}
                />
              </Suspense>
            </ErrorBoundary>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card darkMode={darkMode} hover={false} className="!p-2">
                <div className="flex flex-wrap gap-2" role="tablist">
                  {profileSections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      role="tab"
                      aria-selected={profileSection === section.id}
                      onClick={() => setProfileSection(section.id)}
                      className={`flex-1 min-w-[5rem] py-2 px-3 text-sm font-semibold rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        profileSection === section.id
                          ? 'bg-indigo-600 text-white'
                          : darkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </Card>

              {profileSection === 'profile' && (
                <ErrorBoundary darkMode={darkMode} componentName="Profile">
                  <Suspense fallback={<TabContentSkeleton darkMode={darkMode} />}>
                    <UserProfilePanel
                      darkMode={darkMode}
                      onDarkModeChange={setDarkMode}
                      entries={entries}
                      goals={goals}
                      timerSessions={timerSessions}
                      onLogout={logoutUser}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}
              {profileSection === 'settings' && (
                <ErrorBoundary darkMode={darkMode} componentName="Settings">
                  <Suspense fallback={<TabContentSkeleton darkMode={darkMode} />}>
                    <UserSettingsPanel
                      darkMode={darkMode}
                      onDarkModeChange={setDarkMode}
                      soundEnabled={soundEnabled}
                      onSoundEnabledChange={setSoundEnabled}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}
              {profileSection === 'data' && (
                <ErrorBoundary darkMode={darkMode} componentName="Data">
                  <Suspense fallback={<TabContentSkeleton darkMode={darkMode} />}>
                    <DataManagementPanel
                      darkMode={darkMode}
                      entries={entries}
                      goals={goals}
                      timerSessions={timerSessions}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}
              {profileSection === 'account' && (
                <ErrorBoundary darkMode={darkMode} componentName="Account">
                  <Suspense fallback={<TabContentSkeleton darkMode={darkMode} />}>
                    <AccountManagementPanel darkMode={darkMode} onLogout={logoutUser} />
                  </Suspense>
                </ErrorBoundary>
              )}
            </div>
          )}
        </main>

        <p className={`hidden sm:block text-center text-xs mt-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          Shortcuts: 1–6 switch tabs · / focus search
        </p>
      </div>
    </div>
  );
};

export default CyberTrackerAppWithAuth;
