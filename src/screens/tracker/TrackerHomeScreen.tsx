import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TimerDisplay } from '../../components/TimerDisplay';
import { useTimer } from '../../hooks/useTimer';
import { selectEntries, selectTimer, useAppStore } from '../../store';
import { formatDateTime } from '../../utils/date';

const TrackerHomeScreen: React.FC = () => {
  const { mode, secondsRemaining, isRunning, startTimer, pauseTimer, resetTimer, skipBreak } = useTimer();
  const { entries } = useAppStore(selectEntries);
  const { timerSettings } = useAppStore(selectTimer);

  const lastSessions = entries.slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.container}
        data={lastSessions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>Focus Timer</Text>
            <Text style={styles.subheading}>Stay on track with quick sessions and a lightweight log.</Text>

            <TimerDisplay mode={mode} secondsRemaining={secondsRemaining} />

            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.controlButton, styles.primaryButton]}
                onPress={isRunning ? pauseTimer : startTimer}
              >
                <Text style={styles.controlLabel}>{isRunning ? 'Pause' : 'Start'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
                <Text style={styles.controlLabel}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, mode !== 'break' && styles.controlDisabled]}
                onPress={skipBreak}
                disabled={mode !== 'break'}
              >
                <Text style={styles.controlLabel}>Skip break</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Work duration</Text>
                <Text style={styles.metaValue}>{timerSettings.workMinutes} min</Text>
              </View>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Break duration</Text>
                <Text style={styles.metaValue}>{timerSettings.breakMinutes} min</Text>
              </View>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Logged sessions</Text>
                <Text style={styles.metaValue}>{entries.length}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Recent sessions</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryTopic}>{item.topic}</Text>
              <Text style={styles.entryStatus}>{item.status}</Text>
            </View>
            <Text style={styles.entryGoal}>{item.goal}</Text>
            <View style={styles.entryFooter}>
              <Text style={styles.entryTime}>{formatDateTime(item.createdAt)}</Text>
              <Text style={styles.entryDuration}>{item.durationMinutes} min</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptySubtitle}>Start a focus session to see your history build up here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    padding: 20,
    gap: 16,
  },
  list: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    gap: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e0e7ff',
  },
  subheading: {
    color: '#c7d2fe',
    fontSize: 15,
    lineHeight: 22,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  controlButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1',
  },
  controlLabel: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 15,
  },
  controlDisabled: {
    opacity: 0.4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    gap: 6,
  },
  metaLabel: {
    color: '#cbd5f5',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metaValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    gap: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryTopic: {
    color: '#e0e7ff',
    fontSize: 16,
    fontWeight: '600',
  },
  entryStatus: {
    color: '#34d399',
    fontWeight: '600',
  },
  entryGoal: {
    color: '#cbd5f5',
    fontSize: 14,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  entryTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  entryDuration: {
    color: '#facc15',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#e0e7ff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#cbd5f5',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default TrackerHomeScreen;
