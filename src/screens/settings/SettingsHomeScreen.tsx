import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { requestNotificationPermissions } from '../../services/notifications';
import { selectAuth, selectEntries, selectPreferences, selectTimer, useAppStore } from '../../store';

const SettingsHomeScreen: React.FC = () => {
  const { timerSettings, setTimerSettings, resetTimerSettings } = useAppStore(selectTimer);
  const { notificationsEnabled, setNotificationsEnabled, biometricsEnabled, setBiometricsEnabled } = useAppStore(selectPreferences);
  const { logout } = useAppStore(selectAuth);
  const { entries } = useAppStore(selectEntries);

  const adjustDuration = (key: 'workMinutes' | 'breakMinutes', delta: number) => {
    const nextValue = Math.max(1, timerSettings[key] + delta);
    setTimerSettings({ [key]: nextValue });
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Permission needed', 'Enable notifications in Settings to get timer reminders.');
        return;
      }
    }
    setNotificationsEnabled(!notificationsEnabled);
  };

  const toggleBiometrics = () => {
    setBiometricsEnabled(!biometricsEnabled);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Settings & preferences</Text>
        <Text style={styles.subheading}>Tune your timer flow and manage account options.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timer durations</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Focus minutes</Text>
            <View style={styles.adjustRow}>
              <TouchableOpacity style={styles.adjustButton} onPress={() => adjustDuration('workMinutes', -5)}>
                <Text style={styles.adjustLabel}>-5</Text>
              </TouchableOpacity>
              <Text style={styles.settingValue}>{timerSettings.workMinutes}</Text>
              <TouchableOpacity style={styles.adjustButton} onPress={() => adjustDuration('workMinutes', 5)}>
                <Text style={styles.adjustLabel}>+5</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Break minutes</Text>
            <View style={styles.adjustRow}>
              <TouchableOpacity style={styles.adjustButton} onPress={() => adjustDuration('breakMinutes', -1)}>
                <Text style={styles.adjustLabel}>-1</Text>
              </TouchableOpacity>
              <Text style={styles.settingValue}>{timerSettings.breakMinutes}</Text>
              <TouchableOpacity style={styles.adjustButton} onPress={() => adjustDuration('breakMinutes', 1)}>
                <Text style={styles.adjustLabel}>+1</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={resetTimerSettings}>
            <Text style={styles.resetLabel}>Reset to defaults</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingLabel}>Timer reminders</Text>
              <Text style={styles.settingDescription}>Receive alerts when focus sessions end.</Text>
            </View>
            <TouchableOpacity style={styles.toggleButton} onPress={toggleNotifications}>
              <Text style={styles.toggleLabel}>{notificationsEnabled ? 'On' : 'Off'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingLabel}>Biometric unlock</Text>
              <Text style={styles.settingDescription}>Quickly access the app with Face ID / Touch ID.</Text>
            </View>
            <TouchableOpacity style={styles.toggleButton} onPress={toggleBiometrics}>
              <Text style={styles.toggleLabel}>{biometricsEnabled ? 'Enabled' : 'Disabled'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily snapshot</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{entries.length}</Text>
            <Text style={styles.summaryLabel}>Sessions logged</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutLabel}>Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  subheading: {
    color: '#cbd5f5',
    fontSize: 15,
  },
  section: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    padding: 18,
    gap: 16,
  },
  sectionTitle: {
    color: '#e0e7ff',
    fontSize: 18,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingCopy: {
    flex: 1,
    gap: 6,
  },
  settingLabel: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    color: '#cbd5f5',
    fontSize: 13,
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adjustButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  adjustLabel: {
    color: '#bfdbfe',
    fontWeight: '600',
    fontSize: 14,
  },
  settingValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'center',
  },
  resetButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  resetLabel: {
    color: '#93c5fd',
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  toggleLabel: {
    color: '#e0f2fe',
    fontWeight: '600',
  },
  summaryCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
  },
  summaryValue: {
    color: '#facc15',
    fontSize: 28,
    fontWeight: '700',
  },
  summaryLabel: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  logoutButton: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#ef4444',
  },
  logoutLabel: {
    color: '#fee2e2',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsHomeScreen;
