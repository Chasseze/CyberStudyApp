import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { selectEntries, useAppStore } from '../../store';
import { formatDateTime } from '../../utils/date';

const HistoryListScreen: React.FC = () => {
  const { entries, deleteEntry } = useAppStore(selectEntries);

  const handleDelete = (id: string) => {
    Alert.alert('Delete entry', 'Are you sure you want to delete this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteEntry(id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.container}
        data={entries}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>Study history</Text>
            <Text style={styles.subheading}>
              Review your recent focus sessions, edit notes, and keep tabs on your momentum.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.entryTopic}>{item.topic}</Text>
                <Text style={styles.entryGoal}>{item.goal}</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteLabel}>Delete</Text>
              </TouchableOpacity>
            </View>
            {item.notes ? <Text style={styles.entryNotes}>{item.notes}</Text> : null}
            <View style={styles.entryFooter}>
              <Text style={styles.entryMeta}>{formatDateTime(item.createdAt)}</Text>
              <Text style={styles.entryMeta}>{item.week}</Text>
              <Text style={[styles.entryMeta, styles.entryStatus]}>{item.status}</Text>
              <Text style={styles.entryMeta}>{item.durationMinutes} min</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No sessions recorded</Text>
            <Text style={styles.emptySubtitle}>Start a focus timer to begin building your study history.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    padding: 20,
    gap: 16,
  },
  list: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    gap: 8,
    marginBottom: 12,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  subheading: {
    color: '#cbd5f5',
    fontSize: 15,
    lineHeight: 22,
  },
  entryCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    gap: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryTopic: {
    color: '#e0e7ff',
    fontSize: 16,
    fontWeight: '600',
  },
  entryGoal: {
    color: '#cbd5f5',
    fontSize: 14,
    marginTop: 2,
  },
  entryNotes: {
    color: '#f8fafc',
    fontSize: 14,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    padding: 10,
    borderRadius: 12,
  },
  entryFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  entryMeta: {
    color: '#cbd5f5',
    fontSize: 13,
  },
  entryStatus: {
    fontWeight: '600',
    color: '#34d399',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.5)',
  },
  deleteLabel: {
    color: '#fca5a5',
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
    paddingHorizontal: 20,
  },
});

export default HistoryListScreen;
