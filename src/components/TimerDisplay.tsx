import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TimerDisplayProps {
  secondsRemaining: number;
  mode: 'work' | 'break';
}

const pad = (value: number) => value.toString().padStart(2, '0');

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ secondsRemaining, mode }) => {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <View style={[styles.container, mode === 'work' ? styles.focus : styles.break]}>
      <Text style={styles.modeLabel}>{mode === 'work' ? 'Focus' : 'Break'}</Text>
      <Text style={styles.timeText}>{`${pad(minutes)}:${pad(seconds)}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#4c1d95',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 6,
  },
  focus: {
    backgroundColor: '#312e81',
  },
  break: {
    backgroundColor: '#047857',
  },
  modeLabel: {
    color: '#e0e7ff',
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 8,
  },
  timeText: {
    color: '#f8fafc',
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: 4,
  },
});
