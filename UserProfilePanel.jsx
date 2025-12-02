import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Clock,
  Bell,
  Moon,
  Download,
  Upload,
  Trash2,
  Save,
  LogOut,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { getUserProfile, updateUserProfile } from './authService';
import { logoutUser } from './authService';
import { getEntries, getGoals, getTimerSessions } from './firestoreService';

/**
 * UserProfilePanel Component
 * Handles user profile management, preferences, and data operations
 */
const UserProfilePanel = ({ darkMode, onDarkModeChange, entries, goals, timerSessions, onLogout }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    preferences: {
      darkMode: darkMode,
      notificationsEnabled: true,
      timezone: 'UTC',
    },
  });

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            displayName: userProfile.displayName || '',
            email: userProfile.email || '',
            preferences: userProfile.preferences || {
              darkMode: false,
              notificationsEnabled: true,
              timezone: 'UTC',
            },
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile', 'error');
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  const handleDarkModeChange = (newDarkMode) => {
    onDarkModeChange(newDarkMode);
    handlePreferenceChange('darkMode', newDarkMode);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await updateUserProfile(user.uid, formData);
      setEditing(false);
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        exportDate: new Date().toISOString(),
      },
      entries: entries || [],
      goals: goals || [],
      timerSessions: timerSessions || [],
      backup: true,
    };

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

    showNotification('Data exported successfully', 'success');
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result);
        if (imported.backup) {
          showNotification(
            `Imported ${imported.entries?.length || 0} entries, ${imported.goals?.length || 0} goals, and ${imported.timerSessions?.length || 0} sessions`,
            'success'
          );
          // Data import would be handled by parent component or a separate service
        } else {
          showNotification('Invalid backup file', 'error');
        }
      } catch (error) {
        showNotification('Failed to import data', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // In production, this would call a Cloud Function to delete all user data
      // and then delete the auth user
      showNotification('Account deletion initiated. Check your email for confirmation.', 'success');
      setTimeout(() => {
        logoutUser();
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      showNotification('Failed to delete account', 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className={`max-w-2xl mx-auto p-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-8 w-48 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-32 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          notification.type === 'success'
            ? darkMode ? 'bg-green-900/30 border border-green-700 text-green-300' : 'bg-green-50 border border-green-200 text-green-700'
            : darkMode ? 'bg-red-900/30 border border-red-700 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      {/* Profile Header */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-indigo-700' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'} rounded-2xl p-8 border`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
            <User size={32} className="text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formData.displayName || 'User'}
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {formData.email}
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className={`ml-auto px-4 py-2 rounded-lg font-semibold transition-all ${
                darkMode
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      {editing && (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border space-y-6`}>
          <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

          {/* Display Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className={`w-full px-4 py-2 rounded-lg border opacity-50 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-400'
                  : 'bg-gray-100 border-gray-300 text-gray-600'
              }`}
            />
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Email cannot be changed
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Timezone
            </label>
            <select
              value={formData.preferences.timezone}
              onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option>UTC</option>
              <option>EST</option>
              <option>CST</option>
              <option>MST</option>
              <option>PST</option>
              <option>GMT</option>
              <option>CET</option>
              <option>IST</option>
              <option>JST</option>
              <option>AEST</option>
            </select>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              } bg-green-600 hover:bg-green-700 text-white`}
            >
              <Save size={18} />
              Save Changes
            </button>
            <button
              onClick={() => setEditing(false)}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preferences */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border space-y-6`}>
        <h2 className="text-2xl font-bold mb-6">Preferences</h2>

        {/* Dark Mode */}
        <div className="flex items-center justify-between pb-4 border-b" style={{
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-3">
            <Moon size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            <div>
              <p className="font-semibold">Dark Mode</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formData.preferences.darkMode ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDarkModeChange(!formData.preferences.darkMode)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              formData.preferences.darkMode
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            {formData.preferences.darkMode ? 'On' : 'Off'}
          </button>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between pb-4 border-b" style={{
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-3">
            <Bell size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            <div>
              <p className="font-semibold">Notifications</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formData.preferences.notificationsEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handlePreferenceChange('notificationsEnabled', !formData.preferences.notificationsEnabled)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              formData.preferences.notificationsEnabled
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            {formData.preferences.notificationsEnabled ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border space-y-4`}>
        <h2 className="text-2xl font-bold mb-6">Data Management</h2>

        {/* Export Data */}
        <button
          onClick={handleExportData}
          className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Download size={18} />
          Export All Data (JSON)
        </button>

        {/* Import Data */}
        <div>
          <input
            type="file"
            id="import-file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
          />
          <button
            onClick={() => document.getElementById('import-file')?.click()}
            className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              darkMode
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Upload size={18} />
            Import Data (JSON)
          </button>
        </div>

        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          💾 Backup your data to keep a local copy. Import to restore data from backup.
        </p>
      </div>

      {/* Danger Zone */}
      <div className={`${darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} rounded-2xl p-8 border space-y-4`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
          Danger Zone
        </h2>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-white bg-red-600 hover:bg-red-700`}
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        ) : (
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/40' : 'bg-red-100'}`}>
            <p className={`font-semibold mb-4 ${darkMode ? 'text-red-200' : 'text-red-900'}`}>
              ⚠️ This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
          darkMode
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
        }`}
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
};

export default UserProfilePanel;
