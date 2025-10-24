import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { selectAuth, useAppStore } from '../../store';
import { checkBiometricSupport, authenticateWithBiometrics } from '../../services/biometrics';

const LoginScreen: React.FC = () => {
  console.log('Rendering LoginScreen');
  const { login, authStatus, biometricsEnabled, setBiometricsEnabled } = useAppStore(selectAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingBiometric, setIsCheckingBiometric] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password.trim());
    } catch (err) {
      console.error(err);
      setError('Unable to log in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricToggle = async () => {
    if (biometricsEnabled) {
      setBiometricsEnabled(false);
      return;
    }

    setIsCheckingBiometric(true);
    const { supported, enrolled } = await checkBiometricSupport();
    if (!supported) {
      Alert.alert('Biometrics unavailable', 'Your device does not support biometric authentication.');
      setIsCheckingBiometric(false);
      return;
    }
    if (!enrolled) {
      Alert.alert('No biometrics found', 'Please enroll Face ID / Touch ID / Fingerprint in your device settings.');
      setIsCheckingBiometric(false);
      return;
    }

    const result = await authenticateWithBiometrics('Enable quick sign-in');
    setIsCheckingBiometric(false);
    if (result.success) {
      setBiometricsEnabled(true);
      Alert.alert('Enabled', 'Biometric login is now enabled.');
    } else {
      Alert.alert('Authentication failed', 'Could not verify biometrics.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>CyberStudy Tracker</Text>
            <Text style={styles.subtitle}>Stay consistent on mobile with quick sessions and reminders.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back 👋</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                style={styles.input}
              />
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity
              style={[styles.button, (isSubmitting || authStatus === 'loading') && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting || authStatus === 'loading'}
            >
              <Text style={styles.buttonLabel}>
                {isSubmitting || authStatus === 'loading' ? 'Signing in…' : 'Sign in'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.biometricRow}>
              <View style={styles.biometricText}>
                <Text style={styles.cardTitle}>Biometric unlock</Text>
                <Text style={styles.biometricDescription}>
                  {biometricsEnabled
                    ? 'Sign in instantly with Face ID, Touch ID, or fingerprint.'
                    : 'Use device biometrics to bypass typing your password.'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleButton, isCheckingBiometric && styles.buttonDisabled]}
                onPress={handleBiometricToggle}
                disabled={isCheckingBiometric}
              >
                <Text style={styles.toggleLabel}>{biometricsEnabled ? 'Disable' : 'Enable'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  flex: {
    flex: 1,
  },
  container: {
    padding: 24,
    gap: 24,
    flexGrow: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    marginTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#e0f2fe',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#bfdbfe',
    lineHeight: 22,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    shadowColor: '#1e1b4b',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    gap: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#cbd5f5',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    color: '#f8fafc',
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  error: {
    color: '#fca5a5',
    fontSize: 14,
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  biometricText: {
    flex: 1,
    gap: 8,
  },
  biometricDescription: {
    color: '#cbd5f5',
    fontSize: 14,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#1d4ed8',
  },
  toggleLabel: {
    color: '#e0f2fe',
    fontWeight: '600',
  },
});

export default LoginScreen;
