import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { scheduleTimerCompletionNotification, cancelNotification, requestNotificationPermissions } from '../services/notifications';
import { getCurrentWeekLabel } from '../utils/date';
import { useAppStore } from '../store';

export type TimerMode = 'work' | 'break';

interface UseTimerResult {
  mode: TimerMode;
  secondsRemaining: number;
  isRunning: boolean;
  startTimer: () => Promise<void>;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipBreak: () => void;
  workDuration: number;
  breakDuration: number;
}

const SECOND = 1000;

export const useTimer = (): UseTimerResult => {
  const { timerSettings, addEntry } = useAppStore((state) => ({
    timerSettings: state.timerSettings,
    addEntry: state.addEntry,
  }));

  const [mode, setMode] = useState<TimerMode>('work');
  const [secondsRemaining, setSecondsRemaining] = useState(timerSettings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const sessionStartRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<string | undefined>(undefined);

  const workDurationSeconds = timerSettings.workMinutes * 60;
  const breakDurationSeconds = timerSettings.breakMinutes * 60;

  useEffect(() => {
    if (isRunning) {
      return;
    }
    setSecondsRemaining(mode === 'work' ? workDurationSeconds : breakDurationSeconds);
  }, [timerSettings.workMinutes, timerSettings.breakMinutes, mode, isRunning, workDurationSeconds, breakDurationSeconds]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && isRunning && sessionStartRef.current) {
        const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        if (elapsed > 0) {
          setSecondsRemaining((prev) => Math.max(prev - elapsed, 0));
        }
        sessionStartRef.current = Date.now();
      }

      if (nextState === 'background' && isRunning) {
        sessionStartRef.current = Date.now();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleTimerCompletion();
          return 0;
        }
        return prev - 1;
      });
    }, SECOND);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const scheduleNotification = async (seconds: number) => {
    const permissionGranted = await requestNotificationPermissions();
    if (!permissionGranted) {
      return;
    }
    notificationIdRef.current = await scheduleTimerCompletionNotification(seconds, 'Take a moment to log your session.');
  };

  const handleTimerCompletion = () => {
    cancelNotification(notificationIdRef.current).catch(() => undefined);
    notificationIdRef.current = undefined;
    setIsRunning(false);
    sessionStartRef.current = null;

    if (mode === 'work') {
      addEntry({
        week: getCurrentWeekLabel(),
        topic: 'Focus Session',
        goal: 'Deep work completed',
        status: '✅ Completed',
        durationMinutes: timerSettings.workMinutes,
      });
      setMode('break');
      setSecondsRemaining(breakDurationSeconds);
    } else {
      setMode('work');
      setSecondsRemaining(workDurationSeconds);
    }
  };

  const startTimer = async () => {
    if (isRunning) return;
    const seconds = secondsRemaining || (mode === 'work' ? workDurationSeconds : breakDurationSeconds);
    sessionStartRef.current = Date.now();
    setIsRunning(true);
    await scheduleNotification(seconds);
  };

  const pauseTimer = () => {
    if (!isRunning) return;
    setIsRunning(false);
    sessionStartRef.current = null;
    cancelNotification(notificationIdRef.current).catch(() => undefined);
    notificationIdRef.current = undefined;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    sessionStartRef.current = null;
    setSecondsRemaining(workDurationSeconds);
    cancelNotification(notificationIdRef.current).catch(() => undefined);
    notificationIdRef.current = undefined;
  };

  const skipBreak = () => {
    if (mode === 'break') {
      setMode('work');
      setSecondsRemaining(workDurationSeconds);
      setIsRunning(false);
      cancelNotification(notificationIdRef.current).catch(() => undefined);
      notificationIdRef.current = undefined;
    }
  };

  return {
    mode,
    secondsRemaining,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipBreak,
    workDuration: timerSettings.workMinutes,
    breakDuration: timerSettings.breakMinutes,
  };
};
