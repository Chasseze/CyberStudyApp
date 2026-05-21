import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'cyberstudy_pomodoro_state';
const WORK_DEFAULT = 25 * 60;
const BREAK_DEFAULT = 5 * 60;

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export default function PomodoroTimer({ darkMode, onSessionComplete, soundEnabled = true }) {
  const saved = loadState();
  const [isRunning, setIsRunning] = useState(saved?.isRunning ?? false);
  const [sessionType, setSessionType] = useState(saved?.sessionType ?? 'work');
  const [timeLeft, setTimeLeft] = useState(saved?.timeLeft ?? WORK_DEFAULT);
  const [sessionsCompleted, setSessionsCompleted] = useState(saved?.sessionsCompleted ?? 0);
  const endAtRef = useRef(saved?.endAt ?? null);
  const tickRef = useRef(null);

  const totalDuration = sessionType === 'work' ? WORK_DEFAULT : BREAK_DEFAULT;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 88;

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      /* audio unavailable */
    }
  }, [soundEnabled]);

  const persist = useCallback(
    (patch) => {
      const next = {
        isRunning,
        sessionType,
        timeLeft,
        sessionsCompleted,
        endAt: endAtRef.current,
        ...patch,
      };
      saveState(next);
    },
    [isRunning, sessionType, timeLeft, sessionsCompleted]
  );

  const finishSession = useCallback(() => {
    playNotificationSound();
    if (sessionType === 'work') {
      setSessionType('break');
      setTimeLeft(BREAK_DEFAULT);
      endAtRef.current = null;
      setIsRunning(false);
      onSessionComplete?.({ type: 'work', duration: 25 });
    } else {
      setSessionType('work');
      setTimeLeft(WORK_DEFAULT);
      setSessionsCompleted((s) => s + 1);
      endAtRef.current = null;
      setIsRunning(false);
      onSessionComplete?.({ type: 'break', duration: 5 });
    }
  }, [sessionType, playNotificationSound, onSessionComplete]);

  useEffect(() => {
    if (!isRunning) {
      if (tickRef.current) clearInterval(tickRef.current);
      persist({ isRunning: false, endAt: endAtRef.current });
      return;
    }

    if (!endAtRef.current) {
      endAtRef.current = Date.now() + timeLeft * 1000;
    }

    tickRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(tickRef.current);
        finishSession();
      }
    }, 250);

    persist({ isRunning: true, endAt: endAtRef.current });

    return () => clearInterval(tickRef.current);
  }, [isRunning, finishSession]);

  useEffect(() => {
    persist({});
  }, [sessionType, timeLeft, sessionsCompleted, persist]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!endAtRef.current) endAtRef.current = Date.now() + timeLeft * 1000;
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    endAtRef.current = null;
  };

  const handleReset = () => {
    setIsRunning(false);
    setSessionType('work');
    setTimeLeft(WORK_DEFAULT);
    setSessionsCompleted(0);
    endAtRef.current = null;
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const urgent = timeLeft <= 60 && isRunning;

  return (
    <div
      className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8 max-w-md mx-auto border`}
    >
      <h2 className={`text-3xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Pomodoro Timer
      </h2>

      <div
        className={`text-center mb-6 px-4 py-2 rounded-lg ${
          sessionType === 'work'
            ? darkMode
              ? 'bg-blue-900/30 text-blue-300'
              : 'bg-blue-100 text-blue-700'
            : darkMode
              ? 'bg-green-900/30 text-green-300'
              : 'bg-green-100 text-green-700'
        }`}
      >
        <p className="text-sm font-semibold">
          {sessionType === 'work' ? 'Work session' : 'Break time'}
        </p>
      </div>

      <div className="relative w-56 h-56 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200" aria-hidden>
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke={darkMode ? '#374151' : '#e5e7eb'}
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke={sessionType === 'work' ? '#6366f1' : '#10b981'}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (progressPercent / 100) * circumference}
            className="transition-all duration-300"
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-live="polite"
          aria-atomic="true"
        >
          <p
            className={`text-5xl font-bold font-mono tabular-nums ${
              urgent ? 'text-amber-500 animate-pulse' : darkMode ? 'text-white' : 'text-indigo-900'
            }`}
          >
            {formatTime(timeLeft)}
          </p>
        </div>
      </div>

      <p className={`text-center text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Sessions completed: <span className="font-bold text-lg">{sessionsCompleted}</span>
      </p>

      <div className="flex gap-4 justify-center">
        {!isRunning ? (
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-3 px-6 rounded-xl focus-visible:ring-2 focus-visible:ring-green-400"
            aria-label="Start timer"
          >
            <Play size={20} aria-hidden />
            Start
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="Pause timer"
          >
            <Pause size={20} aria-hidden />
            Pause
          </button>
        )}
        <button
          type="button"
          onClick={handleReset}
          className={`flex items-center gap-2 font-semibold py-3 px-6 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
          }`}
          aria-label="Reset timer"
        >
          <RotateCcw size={20} aria-hidden />
          Reset
        </button>
      </div>

      <p className={`text-center text-xs mt-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        Work 25 min · Break 5 min · Timer persists if you refresh
      </p>
    </div>
  );
}
