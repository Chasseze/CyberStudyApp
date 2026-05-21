import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Globe,
  Palette,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { getUserProfile, updateUserProfile } from './authService';

/**
 * UserSettingsPanel Component
 * Handles user preferences and settings management
 */
const UserSettingsPanel = ({
  darkMode,
  onDarkModeChange,
  onThemeChange,
  soundEnabled = true,
  onSoundEnabledChange,
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    notifications: {
      enabled: true,
      sound: true,
      desktop: true,
      pomodoroReminder: true,
    },
    display: {
      darkMode: darkMode,
      compactView: false,
      animationsEnabled: true,
      fontSize: 'normal', // small, normal, large
      theme: 'indigo', // indigo, purple, blue, green
    },
    study: {
      pomodoroWorkDuration: 25,
      pomodoroBreakDuration: 5,
      autoStartBreak: false,
      autoStartWork: false,
    },
    privacy: {
      shareStats: false,
      dataCollection: false,
      analyticsEnabled: true,
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      screenReaderOptimized: false,
    },
  });

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile?.settings) {
          setFormData(prev => ({
            ...prev,
            ...userProfile.settings,
          }));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('Failed to load settings', 'error');
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSettingChange = (category, key, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleDarkModeChange = (newDarkMode) => {
    onDarkModeChange(newDarkMode);
    handleSettingChange('display', 'darkMode', newDarkMode);
  };

  const handleThemeChange = (theme) => {
    onThemeChange?.(theme);
    handleSettingChange('display', 'theme', theme);
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await updateUserProfile(user.uid, { settings: formData });
      setHasChanges(false);
      showNotification('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    const defaults = {
      notifications: {
        enabled: true,
        sound: true,
        desktop: true,
        pomodoroReminder: true,
      },
      display: {
        darkMode: false,
        compactView: false,
        animationsEnabled: true,
        fontSize: 'normal',
        theme: 'indigo',
      },
      study: {
        pomodoroWorkDuration: 25,
        pomodoroBreakDuration: 5,
        autoStartBreak: false,
        autoStartWork: false,
      },
      privacy: {
        shareStats: false,
        dataCollection: false,
        analyticsEnabled: true,
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        screenReaderOptimized: false,
      },
    };

    setFormData(defaults);
    setHasChanges(true);
    showNotification('Settings reset to defaults', 'success');
  };

  if (loading) {
    return (
      <div className={`max-w-4xl mx-auto p-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-8 w-48 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-96 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    );
  }

  const themeColors = {
    indigo: { name: 'Indigo', bg: 'bg-indigo-500' },
    purple: { name: 'Purple', bg: 'bg-purple-500' },
    blue: { name: 'Blue', bg: 'bg-blue-500' },
    green: { name: 'Green', bg: 'bg-green-500' },
  };

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

      {/* Header */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-700' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'} rounded-2xl p-8 border`}>
        <div className="flex items-center gap-3">
          <Settings size={32} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
          <h1 className="text-3xl font-bold">Settings & Preferences</h1>
        </div>
      </div>

      {/* Notification Settings */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border space-y-4`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Bell size={24} />
          Notifications
        </h2>

        <div className="space-y-4">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between pb-4 border-b" style={{
            borderColor: darkMode ? '#374151' : '#e5e7eb'
          }}>
            <div>
              <p className="font-semibold">Enable Notifications</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Receive app notifications
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('notifications', 'enabled', !formData.notifications.enabled)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                formData.notifications.enabled
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {formData.notifications.enabled ? 'On' : 'Off'}
            </button>
          </div>

          {/* Pomodoro timer sound */}
          <div
            className="flex items-center justify-between pb-4 border-b"
            style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}
          >
            <div>
              <p className="font-semibold flex items-center gap-2">
                {soundEnabled ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
                Pomodoro sounds
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Play a chime when a work or break session ends
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSoundEnabledChange?.(!soundEnabled)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                soundEnabled
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {soundEnabled ? 'On' : 'Off'}
            </button>
          </div>

          {/* Sound Notifications */}
          <div className="flex items-center justify-between pb-4 border-b" style={{
            borderColor: darkMode ? '#374151' : '#e5e7eb'
          }}>
            <div>
              <p className="font-semibold">Sound Notifications</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Play sound for alerts
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSettingChange('notifications', 'sound', !formData.notifications.sound)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                formData.notifications.sound
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {formData.notifications.sound ? 'On' : 'Off'}
            </button>
          </div>

          {/* Pomodoro Reminder */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Pomodoro Reminders</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Get notified for timer completion
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('notifications', 'pomodoroReminder', !formData.notifications.pomodoroReminder)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                formData.notifications.pomodoroReminder
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {formData.notifications.pomodoroReminder ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border space-y-6`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Palette size={24} />
          Display
        </h2>

        {/* Dark Mode */}
        <div className="flex items-center justify-between pb-4 border-b" style={{
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            <div>
              <p className="font-semibold">Dark Mode</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formData.display.darkMode ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDarkModeChange(!formData.display.darkMode)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              formData.display.darkMode
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            {formData.display.darkMode ? 'On' : 'Off'}
          </button>
        </div>

        {/* Font Size */}
        <div className="pb-4 border-b" style={{
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <p className="font-semibold mb-3">Font Size</p>
          <div className="flex gap-2">
            {['small', 'normal', 'large'].map(size => (
              <button
                key={size}
                onClick={() => handleSettingChange('display', 'fontSize', size)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                  formData.display.fontSize === size
                    ? 'bg-indigo-600 text-white'
                    : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {size === 'small' ? 'A' : size === 'normal' ? 'A A' : 'A A A'}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Color */}
        <div>
          <p className="font-semibold mb-3">Color Theme</p>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(themeColors).map(([key, { name, bg }]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                className={`p-4 rounded-lg flex items-center justify-center transition-all ${
                  formData.display.theme === key
                    ? `${bg} ring-2 ring-offset-2 ring-white text-white`
                    : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${bg}`}></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Study Settings */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border space-y-6`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Clock size={24} />
          Study Settings
        </h2>

        {/* Pomodoro Work Duration */}
        <div className="pb-4 border-b" style={{
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Pomodoro Work Duration (minutes)
          </label>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={formData.study.pomodoroWorkDuration}
            onChange={(e) => handleSettingChange('study', 'pomodoroWorkDuration', parseInt(e.target.value))}
            className="w-full"
          />
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Current: <strong>{formData.study.pomodoroWorkDuration} minutes</strong>
          </p>
        </div>

        {/* Pomodoro Break Duration */}
        <div className="pb-4 border-b" style={{
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Pomodoro Break Duration (minutes)
          </label>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={formData.study.pomodoroBreakDuration}
            onChange={(e) => handleSettingChange('study', 'pomodoroBreakDuration', parseInt(e.target.value))}
            className="w-full"
          />
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Current: <strong>{formData.study.pomodoroBreakDuration} minutes</strong>
          </p>
        </div>

        {/* Auto Start Break */}
        <div className="flex items-center justify-between pb-4 border-b" style={{
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <div>
            <p className="font-semibold">Auto-Start Break</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Automatically start break after work
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('study', 'autoStartBreak', !formData.study.autoStartBreak)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              formData.study.autoStartBreak
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            {formData.study.autoStartBreak ? 'On' : 'Off'}
          </button>
        </div>

        {/* Auto Start Work */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Auto-Start Work</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Automatically start work after break
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('study', 'autoStartWork', !formData.study.autoStartWork)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              formData.study.autoStartWork
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            {formData.study.autoStartWork ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 border space-y-4`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Globe size={24} />
          Privacy & Data
        </h2>

        {/* Analytics */}
        <div className="flex items-center justify-between pb-4 border-b" style={{
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <div>
            <p className="font-semibold">Analytics</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Help us improve with usage analytics
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('privacy', 'analyticsEnabled', !formData.privacy.analyticsEnabled)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              formData.privacy.analyticsEnabled
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            {formData.privacy.analyticsEnabled ? 'On' : 'Off'}
          </button>
        </div>

        {/* Share Stats */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Share Stats</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Allow sharing of anonymous stats
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('privacy', 'shareStats', !formData.privacy.shareStats)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              formData.privacy.shareStats
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            {formData.privacy.shareStats ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSaveSettings}
          disabled={!hasChanges || loading}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            !hasChanges || loading ? 'opacity-50 cursor-not-allowed' : ''
          } bg-green-600 hover:bg-green-700 text-white`}
        >
          <Save size={18} />
          Save Settings
        </button>
        <button
          onClick={handleResetToDefaults}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            darkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}
        >
          <RotateCcw size={18} />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default UserSettingsPanel;
