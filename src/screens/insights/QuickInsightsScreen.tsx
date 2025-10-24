import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { selectEntries, selectTimer, useAppStore } from '../../store';

const QuickInsightsScreen: React.FC = () => {
  const { entries } = useAppStore(selectEntries);
  const { timerSettings } = useAppStore(selectTimer);

  // Calculate stats
  const stats = useMemo(() => {
    const completed = entries.filter((e) => e.status === '✅ Completed').length;
    const inProgress = entries.filter((e) => e.status === '🟡 In Progress').length;
    const totalMinutes = entries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const completionRate = entries.length > 0 ? Math.round((completed / entries.length) * 100) : 0;

    return {
      totalEntries: entries.length,
      completed,
      inProgress,
      totalMinutes,
      completionRate,
    };
  }, [entries]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.container}
        data={[{ id: 'insights' }]}
        keyExtractor={(item) => item.id}
        renderItem={() => (
          <View style={styles.content}>
            <Text style={styles.title}>Quick Insights</Text>

            {/* Main Stats Grid */}
            <View style={styles.statsGrid}>
              {/* Total Entries */}
              <View style={[styles.statCard, styles.card1]}>
                <Text style={styles.statLabel}>TOTAL ENTRIES</Text>
                <Text style={styles.statValue}>{stats.totalEntries}</Text>
                <Text style={styles.statDescription}>Across all topics</Text>
              </View>

              {/* Completed */}
              <View style={[styles.statCard, styles.card2]}>
                <Text style={styles.statLabel}>COMPLETED</Text>
                <Text style={styles.statValue}>{stats.completed}</Text>
                <Text style={styles.statDescription}>{stats.completionRate}% completion</Text>
              </View>

              {/* In Progress */}
              <View style={[styles.statCard, styles.card3]}>
                <Text style={styles.statLabel}>IN PROGRESS</Text>
                <Text style={styles.statValue}>{stats.inProgress}</Text>
                <Text style={styles.statDescription}>Including reviews</Text>
              </View>

              {/* Focus Minutes */}
              <View style={[styles.statCard, styles.card4]}>
                <Text style={styles.statLabel}>FOCUS MINUTES</Text>
                <Text style={styles.statValue}>{stats.totalMinutes}</Text>
                <Text style={styles.statDescription}>{entries.length} sessions logged</Text>
              </View>
            </View>

            {/* Additional Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Session Summary</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoPair}>
                  <Text style={styles.infoLabel}>Avg Session Duration</Text>
                  <Text style={styles.infoValue}>
                    {entries.length > 0 ? Math.round(stats.totalMinutes / entries.length) : 0} min
                  </Text>
                </View>
                <View style={styles.infoPair}>
                  <Text style={styles.infoLabel}>Work Duration</Text>
                  <Text style={styles.infoValue}>{timerSettings.workMinutes} min</Text>
                </View>
                <View style={styles.infoPair}>
                  <Text style={styles.infoLabel}>Break Duration</Text>
                  <Text style={styles.infoValue}>{timerSettings.breakMinutes} min</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  list: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    padding: 20,
  },
  content: {
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    borderRadius: 20,
    padding: 20,
    gap: 8,
    borderWidth: 1,
  },
  card1: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  card2: {
    backgroundColor: 'rgba(236, 253, 245, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  card3: {
    backgroundColor: 'rgba(254, 252, 232, 0.08)',
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  card4: {
    backgroundColor: 'rgba(243, 232, 255, 0.08)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5f5',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f8fafc',
  },
  statDescription: {
    fontSize: 13,
    color: '#94a3b8',
  },
  infoSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
  infoCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  infoPair: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#cbd5f5',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e7ff',
  },
});

export default QuickInsightsScreen;
