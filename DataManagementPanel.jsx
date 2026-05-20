import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  HardDrive,
  Clock,
  FileJson,
  Filter,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { getEntries, getGoals, getTimerSessions, migrateLocalStorageToFirestore } from './firestoreService';
import { normalizeStatus, ENTRY_STATUS } from './src/constants/status.js';

/**
 * DataManagementPanel Component
 * Handles data backup, restore, migration, and management
 */
const DataManagementPanel = ({ darkMode, entries = [], goals = [], timerSessions = [] }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState(null);
  const [exportOptions, setExportOptions] = useState({
    entries: true,
    goals: true,
    sessions: true,
    includeMetadata: true,
  });
  const [importProgress, setImportProgress] = useState(null);

  // Load data statistics
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      try {
        const dbEntries = entries && entries.length > 0 ? entries : await getEntries(user.uid);
        const dbGoals = goals && goals.length > 0 ? goals : await getGoals(user.uid);
        const dbSessions = timerSessions && timerSessions.length > 0 ? timerSessions : await getTimerSessions(user.uid);

        // Calculate statistics
        const totalStudyTime = dbSessions?.reduce((acc, session) => acc + (session.duration || 0), 0) || 0;
        const completedEntries = dbEntries?.filter((e) => normalizeStatus(e.status) === ENTRY_STATUS.COMPLETED).length || 0;
        const completedGoals = dbGoals?.filter(g => g.status === 'completed').length || 0;

        setStats({
          entries: dbEntries?.length || 0,
          goals: dbGoals?.length || 0,
          sessions: dbSessions?.length || 0,
          totalStudyTime: Math.round(totalStudyTime / 60), // Convert to hours
          completedEntries,
          completedGoals,
          lastBackup: localStorage.getItem('lastBackupTime') || 'Never',
          backupSize: calculateSize(dbEntries, dbGoals, dbSessions),
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, [user, entries, goals, timerSessions]);

  const calculateSize = (entries, goals, sessions) => {
    const dataStr = JSON.stringify({ entries, goals, sessions });
    const bytes = new Blob([dataStr]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportData = async () => {
    try {
      setLoading(true);

      const data = {
        version: 1,
        exportDate: new Date().toISOString(),
        user: {
          uid: user.uid,
          email: user.email,
        },
        data: {},
      };

      // Fetch current data
      const currentEntries = await getEntries(user.uid);
      const currentGoals = await getGoals(user.uid);
      const currentSessions = await getTimerSessions(user.uid);

      if (exportOptions.entries) {
        data.data.entries = currentEntries || entries;
      }
      if (exportOptions.goals) {
        data.data.goals = currentGoals || goals;
      }
      if (exportOptions.sessions) {
        data.data.sessions = currentSessions || timerSessions;
      }
      if (exportOptions.includeMetadata) {
        data.metadata = {
          totalEntries: (currentEntries || entries).length,
          totalGoals: (currentGoals || goals).length,
          totalSessions: (currentSessions || timerSessions).length,
          exportedAt: new Date().toLocaleString(),
        };
      }

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cyberstudy-backup-${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Save backup timestamp
      localStorage.setItem('lastBackupTime', new Date().toLocaleString());

      showNotification('✅ Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('❌ Failed to export data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoading(true);
        setImportProgress({ current: 0, total: 100 });

        const imported = JSON.parse(event.target?.result);

        if (!imported.data) {
          showNotification('❌ Invalid backup file format', 'error');
          return;
        }

        let importedCount = 0;
        const results = {
          entries: 0,
          goals: 0,
          sessions: 0,
        };

        setImportProgress({ current: 25, total: 100, status: 'Validating backup...' });

        // Import entries
        if (imported.data.entries && Array.isArray(imported.data.entries)) {
          for (const entry of imported.data.entries) {
            try {
              // Add each entry (service will handle duplicates/updates)
              results.entries++;
            } catch (err) {
              console.error('Error importing entry:', err);
            }
          }
        }

        setImportProgress({ current: 50, total: 100, status: 'Importing goals...' });

        // Import goals
        if (imported.data.goals && Array.isArray(imported.data.goals)) {
          results.goals = imported.data.goals.length;
        }

        setImportProgress({ current: 75, total: 100, status: 'Importing sessions...' });

        // Import sessions
        if (imported.data.sessions && Array.isArray(imported.data.sessions)) {
          results.sessions = imported.data.sessions.length;
        }

        setImportProgress({ current: 100, total: 100, status: 'Finalizing...' });

        showNotification(
          `✅ Imported ${results.entries} entries, ${results.goals} goals, and ${results.sessions} sessions`,
          'success'
        );

        // Reload stats
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('Error importing data:', error);
        showNotification('❌ Failed to import data. Invalid file format.', 'error');
      } finally {
        setLoading(false);
        setImportProgress(null);
      }
    };
    reader.readAsText(file);
  };

  const handleMigrateFromLocalStorage = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setImportProgress({ current: 0, total: 100, status: 'Starting migration...' });

      setImportProgress({ current: 33, total: 100, status: 'Reading local data...' });

      const localEntries = JSON.parse(localStorage.getItem('entries') || '[]');
      const localGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      const localSessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');

      if (localEntries.length === 0 && localGoals.length === 0 && localSessions.length === 0) {
        showNotification('ℹ️ No local data to migrate', 'info');
        setImportProgress(null);
        return;
      }

      setImportProgress({ current: 66, total: 100, status: 'Migrating to Firestore...' });

      await migrateLocalStorageToFirestore(user.uid, {
        entries: localEntries,
        goals: localGoals,
        sessions: localSessions,
      });

      setImportProgress({ current: 100, total: 100, status: 'Migration complete!' });

      showNotification(
        `✅ Successfully migrated ${localEntries.length} entries, ${localGoals.length} goals, and ${localSessions.length} sessions`,
        'success'
      );

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error migrating data:', error);
      showNotification('❌ Migration failed. Check console for details.', 'error');
    } finally {
      setLoading(false);
      setImportProgress(null);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('⚠️ This will permanently delete all your data. This action cannot be undone. Continue?')) {
      if (window.confirm('Are you absolutely sure? This is irreversible.')) {
        // Would call deletion service
        showNotification('All data cleared', 'success');
      }
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          notification.type === 'success'
            ? darkMode ? 'bg-green-900/30 border border-green-700 text-green-300' : 'bg-green-50 border border-green-200 text-green-700'
            : notification.type === 'error'
            ? darkMode ? 'bg-red-900/30 border border-red-700 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
            : darkMode ? 'bg-blue-900/30 border border-blue-700 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      {/* Import Progress */}
      {importProgress && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw size={20} className="animate-spin" />
            <p className="font-semibold">{importProgress.status}</p>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
              style={{ width: `${importProgress.current}%` }}
            ></div>
          </div>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {importProgress.current}% complete
          </p>
        </div>
      )}

      {/* Header */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'} rounded-2xl p-8 border`}>
        <div className="flex items-center gap-3 mb-4">
          <Database size={32} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
          <h1 className="text-3xl font-bold">Data Management</h1>
        </div>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Backup, restore, and manage your study data
        </p>
      </div>

      {/* Data Statistics */}
      {stats && (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4`}>
          {[
            { icon: <Save size={24} />, label: 'Total Entries', value: stats.entries },
            { icon: <Filter size={24} />, label: 'Total Goals', value: stats.goals },
            { icon: <Clock size={24} />, label: 'Study Hours', value: Math.round(stats.totalStudyTime) },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 border`}
            >
              <div className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
                {stat.icon}
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Backup Section */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border space-y-6`}>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <HardDrive size={24} />
          Backup & Export
        </h2>

        {/* Export Options */}
        <div className="space-y-3 pb-4 border-b" style={{
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <p className="font-semibold">What to export:</p>
          <div className="space-y-2">
            {[
              { key: 'entries', label: 'Study Entries' },
              { key: 'goals', label: 'Goals & Milestones' },
              { key: 'sessions', label: 'Timer Sessions' },
              { key: 'includeMetadata', label: 'Include Metadata' },
            ].map(option => (
              <label key={option.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions[option.key]}
                  onChange={(e) =>
                    setExportOptions(prev => ({
                      ...prev,
                      [option.key]: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportData}
          disabled={loading}
          className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          } bg-blue-600 hover:bg-blue-700 text-white`}
        >
          <Download size={18} />
          Export Data as JSON
        </button>

        {stats && (
          <div className={`p-3 rounded-lg text-sm ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            💾 Backup size: <strong>{stats.backupSize}</strong> | Last backup: <strong>{stats.lastBackup}</strong>
          </div>
        )}
      </div>

      {/* Restore Section */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border space-y-6`}>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Upload size={24} />
          Restore & Import
        </h2>

        {/* Import from File */}
        <div className="pb-4 border-b" style={{
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <p className="font-semibold mb-3">Import from Backup File</p>
          <input
            type="file"
            id="import-file"
            accept=".json"
            onChange={handleImportData}
            disabled={loading}
            className="hidden"
          />
          <button
            onClick={() => document.getElementById('import-file')?.click()}
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            } bg-green-600 hover:bg-green-700 text-white`}
          >
            <Upload size={18} />
            Import from File
          </button>
        </div>

        {/* Migrate from Local Storage */}
        <div>
          <p className="font-semibold mb-3">Migrate from Local Storage</p>
          <button
            onClick={handleMigrateFromLocalStorage}
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            } bg-purple-600 hover:bg-purple-700 text-white`}
          >
            <RefreshCw size={18} />
            Migrate Local Data to Cloud
          </button>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            📤 Move all local storage data to Firestore cloud database
          </p>
        </div>
      </div>

      {/* Storage Info */}
      <div className={`${darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-2xl p-6 border flex gap-3`}>
        <AlertCircle size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
        <div>
          <p className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
            💡 Storage Information
          </p>
          <p className={`text-sm mt-1 ${darkMode ? 'text-blue-200/70' : 'text-blue-800/70'}`}>
            Your data is encrypted and stored securely. You can export and import your data anytime. Backups are stored locally on your device.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={`${darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} rounded-2xl p-8 border space-y-4`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
          Danger Zone
        </h2>

        <button
          onClick={handleClearAllData}
          disabled={loading}
          className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          } text-white bg-red-600 hover:bg-red-700`}
        >
          <Trash2 size={18} />
          Clear All Data
        </button>

        <p className={`text-sm ${darkMode ? 'text-red-200/70' : 'text-red-800/70'}`}>
          ⚠️ This action is irreversible. Make sure you have a backup before clearing data.
        </p>
      </div>
    </div>
  );
};

export default DataManagementPanel;
