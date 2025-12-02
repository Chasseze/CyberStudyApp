import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSync } from './SyncContext';
import AuthUI from './AuthUI';
import SyncStatusIndicator from './SyncStatusIndicator';
import PomodoroTimer from './PomodoroTimer';
import ErrorBoundary from './components/ErrorBoundary';
import { TabContentSkeleton, CalendarSkeleton, ChartSkeleton } from './components/LoadingSkeleton';

// Lazy load heavy components for better performance
const AnalyticsPanel = lazy(() => import('./AnalyticsPanel'));
const CalendarView = lazy(() => import('./CalendarView'));
const GoalsPanel = lazy(() => import('./GoalsPanel'));
const UserProfilePanel = lazy(() => import('./UserProfilePanel'));
const UserSettingsPanel = lazy(() => import('./UserSettingsPanel'));
const DataManagementPanel = lazy(() => import('./DataManagementPanel'));
const AccountManagementPanel = lazy(() => import('./AccountManagementPanel'));

import { 
  BookOpen, 
  Timer, 
  BarChart3, 
  Calendar, 
  Target, 
  User, 
  Search, 
  Plus, 
  Trash2, 
  Sun, 
  Moon,
  Filter,
  Download,
  CheckCircle,
  AlertCircle,
  Cloud,
  CloudOff
} from 'lucide-react';
import { logoutUser } from './authService';
import { formatDateDisplay, parseFirestoreDate } from './utils/dateUtils';
import { 
  addEntry, 
  deleteEntry, 
  subscribeToEntries,
  subscribeToGoals,
  addTimerSession,
  subscribeToTimerSessions,
  migrateLocalStorageToFirestore
} from './firestoreService';

/**
 * CyberTrackerApp With Authentication
 * Main application component with full feature set and Firebase integration
 */
const CyberTrackerAppWithAuth = () => {
  // Check if demo mode is enabled
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { isOnline } = useSync();
  
  // UI State
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('tracker');
  const [profileSection, setProfileSection] = useState('profile');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Data State
  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [timerSessions, setTimerSessions] = useState([]);
  
  // UI State for Tracker
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    week: '',
    topic: '',
    goal: '',
    status: '❌ Not Started',
    notes: ''
  });

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Subscribe to Firestore data when user is authenticated
  useEffect(() => {
    if (!user?.uid) {
      // User not logged in - load from localStorage as fallback
      const savedEntries = localStorage.getItem('entries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
      
      const savedGoals = localStorage.getItem('studyGoals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
      
      const savedSessions = localStorage.getItem('timerSessions');
      if (savedSessions) {
        setTimerSessions(JSON.parse(savedSessions));
      }
      return;
    }

    // User is logged in - subscribe to Firestore real-time updates
    setIsSyncing(true);
    
    // Check if we need to migrate localStorage data to Firestore
    const checkAndMigrateData = async () => {
      const localEntries = localStorage.getItem('entries');
      const hasMigrated = localStorage.getItem(`migrated_${user.uid}`);
      
      if (localEntries && !hasMigrated) {
        try {
          const localData = {
            entries: JSON.parse(localStorage.getItem('entries') || '[]'),
            goals: JSON.parse(localStorage.getItem('studyGoals') || '[]'),
            timerSessions: JSON.parse(localStorage.getItem('timerSessions') || '[]'),
          };
          
          if (localData.entries.length > 0 || localData.goals.length > 0 || localData.timerSessions.length > 0) {
            await migrateLocalStorageToFirestore(user.uid, localData);
            localStorage.setItem(`migrated_${user.uid}`, 'true');
            showNotification('📦 Your local data has been synced to the cloud!', 'success');
          }
        } catch (error) {
          console.error('Migration error:', error);
        }
      }
    };
    
    checkAndMigrateData();

    // Subscribe to entries
    const unsubscribeEntries = subscribeToEntries(user.uid, (firestoreEntries) => {
      setEntries(firestoreEntries);
      // Also update localStorage as backup
      localStorage.setItem('entries', JSON.stringify(firestoreEntries));
      setIsSyncing(false);
      setLastSyncTime(new Date());
    });

    // Subscribe to goals
    const unsubscribeGoals = subscribeToGoals(user.uid, (firestoreGoals) => {
      setGoals(firestoreGoals);
      localStorage.setItem('studyGoals', JSON.stringify(firestoreGoals));
    });

    // Subscribe to timer sessions
    const unsubscribeTimerSessions = subscribeToTimerSessions(user.uid, (firestoreSessions) => {
      setTimerSessions(firestoreSessions);
      localStorage.setItem('timerSessions', JSON.stringify(firestoreSessions));
    });

    // Cleanup subscriptions on unmount or user change
    return () => {
      unsubscribeEntries();
      unsubscribeGoals();
      unsubscribeTimerSessions();
    };
  }, [user?.uid]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Entry management functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.week || !formData.topic || !formData.goal) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (user?.uid) {
        // Save to Firestore (will be synced to local via subscription)
        await addEntry(user.uid, {
          week: formData.week,
          topic: formData.topic,
          goal: formData.goal,
          status: formData.status,
          notes: formData.notes,
        });
        showNotification('✅ Entry saved to cloud!', 'success');
      } else {
        // Fallback to localStorage only if not logged in
        const newEntry = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString()
        };
        const updatedEntries = [...entries, newEntry];
        setEntries(updatedEntries);
        localStorage.setItem('entries', JSON.stringify(updatedEntries));
        showNotification('Entry added (local only - log in to sync)', 'success');
      }
      
      setFormData({
        week: '',
        topic: '',
        goal: '',
        status: '❌ Not Started',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      showNotification('Failed to save entry. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        if (user?.uid) {
          // Delete from Firestore
          await deleteEntry(user.uid, id.toString());
          showNotification('🗑️ Entry deleted from cloud', 'success');
        } else {
          // Fallback to localStorage
          const updatedEntries = entries.filter(entry => entry.id !== id);
          setEntries(updatedEntries);
          localStorage.setItem('entries', JSON.stringify(updatedEntries));
          showNotification('Entry deleted', 'success');
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
        showNotification('Failed to delete entry. Please try again.', 'error');
      }
    }
  };

  const handleSessionComplete = async (sessionData) => {
    try {
      if (user?.uid) {
        // Save to Firestore
        await addTimerSession(user.uid, {
          type: sessionData.type,
          duration: sessionData.duration,
          completedAt: new Date().toISOString()
        });
      } else {
        // Fallback to localStorage
        const newSession = {
          id: Date.now(),
          type: sessionData.type,
          duration: sessionData.duration,
          completedAt: new Date().toISOString()
        };
        const updatedSessions = [...timerSessions, newSession];
        setTimerSessions(updatedSessions);
        localStorage.setItem('timerSessions', JSON.stringify(updatedSessions));
      }
      
      showNotification(`${sessionData.type === 'work' ? '✅ Work session' : '☕ Break'} completed!`, 'success');
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await logoutUser();
  };

  // Tab configuration
  const tabs = [
    { id: 'tracker', label: 'Tracker', icon: BookOpen },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Profile subsections
  const profileSections = [
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
    { id: 'data', label: 'Data' },
    { id: 'account', label: 'Account' },
  ];

  // Show loading state
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your study tracker...</p>
        </div>
      </div>
    );
  }

  // Show Auth UI if not authenticated (unless in demo mode)
  if (!isAuthenticated && !isDemoMode) {
    return <AuthUI darkMode={darkMode} onAuthSuccess={() => {}} />;
  }

  // Filtered and sorted entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.goal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || entry.status === filterStatus;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest': {
        const dateA = parseFirestoreDate(a.createdAt)?.getTime() || 0;
        const dateB = parseFirestoreDate(b.createdAt)?.getTime() || 0;
        return dateB - dateA;
      }
      case 'oldest': {
        const dateA = parseFirestoreDate(a.createdAt)?.getTime() || 0;
        const dateB = parseFirestoreDate(b.createdAt)?.getTime() || 0;
        return dateA - dateB;
      }
      case 'week': return parseInt(a.week) - parseInt(b.week);
      case 'topic': return a.topic.localeCompare(b.topic);
      default: return 0;
    }
  });

  const statusCounts = entries.reduce((acc, entry) => {
    switch (entry.status) {
      case '✅ Completed':
        acc.completed += 1;
        break;
      case '🟡 In Progress':
        acc.inProgress += 1;
        break;
      case '🔄 Review Needed':
        acc.review += 1;
        break;
      default:
        acc.notStarted += 1;
    }
    return acc;
  }, { completed: 0, inProgress: 0, review: 0, notStarted: 0 });

  const totalEntries = entries.length;
  const completionRate = totalEntries ? Math.round((statusCounts.completed / totalEntries) * 100) : 0;
  const totalTimerSessions = timerSessions.length;
  const totalFocusMinutes = timerSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const latestEntry = entries.reduce((latest, entry) => {
    const entryDate = parseFirestoreDate(entry.createdAt);
    if (!entryDate) return latest;
    if (!latest) return entry;
    const latestDate = parseFirestoreDate(latest.createdAt);
    return entryDate > latestDate ? entry : latest;
  }, null);
  const latestEntryDisplay = latestEntry ? formatDateDisplay(latestEntry.createdAt) : null;

  // Show main app if authenticated
  return (
    <div className={darkMode ? "min-h-screen bg-gray-900 text-white" : "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`${darkMode ? 'bg-gradient-to-br from-purple-900/60 via-indigo-900/50 to-blue-900/40 border-purple-600/50' : 'bg-gradient-to-br from-white/80 via-indigo-50 to-blue-50 border-indigo-100'} rounded-2xl p-6 border max-w-4xl mx-auto relative shadow-xl backdrop-blur`}>
            <h1 className={`text-4xl font-bold ${darkMode ? 'bg-gradient-to-r from-purple-300 via-indigo-300 to-blue-300 bg-clip-text text-transparent' : 'bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 bg-clip-text text-transparent'} mb-3`}>
              📚 CyberStudy Tracker
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Track your cybersecurity learning journey
            </p>
            
            {/* Top right controls */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {/* Cloud Sync Status */}
              {user && (
                <div 
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isSyncing 
                      ? (darkMode ? 'bg-blue-900/50 text-blue-300 border border-blue-600/30' : 'bg-blue-100 text-blue-700 border border-blue-300')
                      : isOnline 
                        ? (darkMode ? 'bg-green-900/50 text-green-300 border border-green-600/30' : 'bg-green-100 text-green-700 border border-green-300')
                        : (darkMode ? 'bg-orange-900/50 text-orange-300 border border-orange-600/30' : 'bg-orange-100 text-orange-700 border border-orange-300')
                  }`}
                  title={isSyncing ? 'Syncing...' : isOnline ? `Synced to cloud${lastSyncTime ? ` at ${lastSyncTime.toLocaleTimeString()}` : ''}` : 'Offline - changes will sync when online'}
                >
                  {isSyncing ? (
                    <>
                      <Cloud size={14} className="animate-pulse" />
                      <span>Syncing</span>
                    </>
                  ) : isOnline ? (
                    <>
                      <Cloud size={14} />
                      <span>Synced</span>
                    </>
                  ) : (
                    <>
                      <CloudOff size={14} />
                      <span>Offline</span>
                    </>
                  )}
                </div>
              )}
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode ? 'bg-gray-800/50 hover:bg-gray-700/60 border border-purple-600/30' : 'bg-white/60 hover:bg-white/80 border border-purple-300/40'
                } shadow-md hover:shadow-lg`}
                title="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className={`${darkMode ? 'bg-amber-900/40 border-amber-600 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-800'} rounded-xl p-4 border-2 border-dashed`}>
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">🚀 Demo Mode</h3>
                  <p className="text-sm opacity-90">
                    You're using demo mode with localStorage only. Data won't sync across devices. 
                    <a 
                      href="#firebase-setup" 
                      className="underline ml-1 hover:opacity-80"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('To enable Firebase sync:\n1. Create Firebase project\n2. Update .env file\n3. Set VITE_DEMO_MODE=false\n\nSee console for detailed instructions.');
                        console.log('Firebase Setup Instructions:\n1. Go to https://console.firebase.google.com/\n2. Create a new project\n3. Enable Authentication (Email/Password)\n4. Create Firestore database\n5. Update .env file with your config\n6. Set VITE_DEMO_MODE=false');
                      }}
                    >
                      Enable Firebase sync
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/70 border-gray-200'} p-1.5 rounded-2xl border flex flex-wrap gap-1 shadow-lg backdrop-blur`}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'profile') setProfileSection('profile');
                  }}
                  className={`flex-1 min-w-0 py-2 px-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1 ${
                    activeTab === tab.id
                      ? darkMode
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-indigo-600 text-white shadow-lg'
                      : darkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`max-w-4xl mx-auto mb-6 p-4 rounded-lg flex items-center gap-3 shadow-lg ${
            notification.type === 'success'
              ? darkMode ? 'bg-green-900/30 border border-green-700 text-green-300' : 'bg-green-50 border border-green-200 text-green-700'
              : darkMode ? 'bg-red-900/30 border border-red-700 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {notification.message}
          </div>
        )}

        {/* Content Area */}
        <div className="max-w-4xl mx-auto">
          
          {/* Study Tracker Tab */}
          {activeTab === 'tracker' && (
            <div className="space-y-6">
              {/* Add New Entry Form */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                <h2 className="text-2xl font-bold mb-6">📝 Add New Study Entry</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Week *
                    </label>
                    <input
                      type="text"
                      name="week"
                      value={formData.week}
                      onChange={handleInputChange}
                      placeholder="e.g., Week 1"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Topic *
                    </label>
                    <input
                      type="text"
                      name="topic"
                      value={formData.topic}
                      onChange={handleInputChange}
                      placeholder="e.g., Network Security"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Study Goal *
                    </label>
                    <input
                      type="text"
                      name="goal"
                      value={formData.goal}
                      onChange={handleInputChange}
                      placeholder="e.g., Learn about firewalls"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="❌ Not Started">❌ Not Started</option>
                      <option value="🟡 In Progress">🟡 In Progress</option>
                      <option value="✅ Completed">✅ Completed</option>
                      <option value="🔄 Review Needed">🔄 Review Needed</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Additional notes..."
                      rows="3"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Add Entry
                    </button>
                  </div>
                </form>
              </div>

              {/* Search and Filter Controls */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 border shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search size={20} className={`absolute left-3 top-2.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search entries..."
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="all">All Status</option>
                      <option value="❌ Not Started">❌ Not Started</option>
                      <option value="🟡 In Progress">🟡 In Progress</option>
                      <option value="✅ Completed">✅ Completed</option>
                      <option value="🔄 Review Needed">🔄 Review Needed</option>
                    </select>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="week">By Week</option>
                      <option value="topic">By Topic</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Insights */}
              <div className={`${darkMode ? 'bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-blue-900/30 border-indigo-800/40' : 'bg-gradient-to-br from-white via-indigo-50/80 to-purple-50/80 border-indigo-100/60'} rounded-2xl p-6 border shadow-xl backdrop-blur`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Insights</h3>
                  {latestEntryDisplay && (
                    <span className={`text-xs uppercase tracking-wide ${darkMode ? 'text-indigo-200' : 'text-indigo-600/80'}`}>
                      Updated {latestEntryDisplay}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`${darkMode ? 'bg-gray-900/50 border border-white/10' : 'bg-white/70 border border-white/60'} rounded-xl p-4 shadow-inner`}>
                    <p className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-indigo-200/80' : 'text-indigo-700/80'}`}>Total Entries</p>
                    <p className="text-2xl font-bold mt-2">{totalEntries}</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Across all topics</p>
                  </div>
                  <div className={`${darkMode ? 'bg-gradient-to-br from-green-900/40 to-emerald-800/40 border border-green-700/40' : 'bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200/80'} rounded-xl p-4 shadow-inner`}>
                    <p className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-emerald-200/80' : 'text-emerald-700/80'}`}>Completed</p>
                    <p className="text-2xl font-bold mt-2">{statusCounts.completed}</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-emerald-200/80' : 'text-emerald-600/90'}`}>{completionRate}% completion</p>
                  </div>
                  <div className={`${darkMode ? 'bg-gradient-to-br from-amber-900/40 to-orange-800/40 border border-amber-700/40' : 'bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200/80'} rounded-xl p-4 shadow-inner`}>
                    <p className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-amber-200/80' : 'text-amber-700/80'}`}>In Progress</p>
                    <p className="text-2xl font-bold mt-2">{statusCounts.inProgress + statusCounts.review}</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-amber-200/80' : 'text-amber-600/90'}`}>Including reviews</p>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-900/40 border border-white/10' : 'bg-white/70 border border-white/60'} rounded-xl p-4 shadow-inner`}>
                    <p className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-indigo-200/80' : 'text-indigo-700/80'}`}>Focus Minutes</p>
                    <p className="text-2xl font-bold mt-2">{totalFocusMinutes}</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{totalTimerSessions} sessions logged</p>
                  </div>
                </div>
                {totalEntries > 0 && (
                  <div className="mt-5">
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className={darkMode ? 'text-indigo-200/90' : 'text-indigo-700/90'}>Completion progress</span>
                      <span className={darkMode ? 'text-indigo-200/90' : 'text-indigo-700/90'}>{completionRate}%</span>
                    </div>
                    <div className={`${darkMode ? 'bg-indigo-950/60' : 'bg-indigo-200/50'} h-2 rounded-full overflow-hidden`}>
                      <div
                        className={`h-full ${completionRate === 100 ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500'} transition-all duration-500`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Entries List */}
              <div className="space-y-4">
                {filteredEntries.length === 0 ? (
                  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border shadow-lg text-center`}>
                    <BookOpen size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No entries found
                    </p>
                    <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter.' : 'Add your first study entry above!'}
                    </p>
                  </div>
                ) : (
                  filteredEntries.map(entry => (
                    <div key={entry.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 border shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              darkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {entry.week}
                            </span>
                            <h3 className="text-lg font-semibold">{entry.topic}</h3>
                          </div>
                          
                          <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <strong>Goal:</strong> {entry.goal}
                          </p>
                          
                          {entry.notes && (
                            <p className={`mb-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <strong>Notes:</strong> {entry.notes}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`font-semibold ${
                              entry.status === '✅ Completed' ? 'text-green-500' :
                              entry.status === '🟡 In Progress' ? 'text-yellow-500' :
                              entry.status === '🔄 Review Needed' ? 'text-blue-500' :
                              'text-gray-500'
                            }`}>
                              {entry.status}
                            </span>
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                              {formatDateDisplay(entry.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className={`ml-4 p-2 rounded-lg transition-colors ${
                            darkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'
                          }`}
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Pomodoro Tab */}
          {activeTab === 'pomodoro' && (
            <PomodoroTimer darkMode={darkMode} onSessionComplete={handleSessionComplete} />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <ErrorBoundary darkMode={darkMode} componentName="Analytics">
              <Suspense fallback={<ChartSkeleton darkMode={darkMode} />}>
                <AnalyticsPanel entries={entries} darkMode={darkMode} timerSessions={timerSessions} />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <ErrorBoundary darkMode={darkMode} componentName="Calendar">
              <Suspense fallback={<CalendarSkeleton darkMode={darkMode} />}>
                <CalendarView entries={entries} darkMode={darkMode} />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <ErrorBoundary darkMode={darkMode} componentName="Goals">
              <Suspense fallback={<TabContentSkeleton darkMode={darkMode} />}>
                <GoalsPanel entries={entries} darkMode={darkMode} goals={goals} onGoalsUpdate={setGoals} />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Navigation */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-2 border shadow-lg`}>
                <div className="flex gap-2">
                  {profileSections.map(section => (
                    <button
                      key={section.id}
                      onClick={() => setProfileSection(section.id)}
                      className={`flex-1 py-2 px-4 font-semibold text-sm transition-all rounded-lg ${
                        profileSection === section.id
                          ? 'bg-indigo-600 text-white'
                          : darkMode
                            ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Content */}
              {profileSection === 'profile' && (
                <ErrorBoundary darkMode={darkMode} componentName="Profile">
                  <Suspense fallback={<TabContentSkeleton darkMode={darkMode} />}>
                    <UserProfilePanel
                      darkMode={darkMode}
                      onDarkModeChange={setDarkMode}
                      entries={entries}
                      goals={goals}
                      timerSessions={timerSessions}
                      onLogout={handleLogout}
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
                      onThemeChange={(theme) => console.log('Theme changed:', theme)}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}

              {profileSection === 'data' && (
                <ErrorBoundary darkMode={darkMode} componentName="Data Management">
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
                    <AccountManagementPanel
                      darkMode={darkMode}
                      onLogout={handleLogout}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Sync Status Indicator */}
      <SyncStatusIndicator darkMode={darkMode} show={isAuthenticated} />
    </div>
  );
};

export default CyberTrackerAppWithAuth;
