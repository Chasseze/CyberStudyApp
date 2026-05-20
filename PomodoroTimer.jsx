import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'cyberstudy_pomodoro_state';
const WORK = 25 * 60;
const BREAK = 5 * 60;

function loadState() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

export default function PomodoroTimer({ darkMode, onSessionComplete, soundEnabled = true }) {
  const saved = loadState();
  const [isRunning, setIsRunning] = useState(saved?.isRunning ?? false);
  const [sessionType, setSessionType] = useState(saved?.sessionType ?? 'work');
  const [timeLeft, setTimeLeft] = useState(saved?.timeLeft ?? WORK);
  const [sessionsCompleted, setSessionsCompleted] = useState(saved?.sessionsCompleted ?? 0);
  const endAtRef = useRef(saved?.endAt ?? null);

  const total = sessionType === 'work' ? WORK : BREAK;
  const progress = ((total - timeLeft) / total) * 100;
  const circ = 2 * Math.PI * 88;

  const beep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 800;
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      o.start();
      o.stop(ctx.currentTime + 0.5);
    } catch { /* noop */ }
  }, [soundEnabled]);

  const finish = useCallback(() => {
    beep();
    if (sessionType === 'work') {
      setSessionType('break');
      setTimeLeft(BREAK);
      onSessionComplete?.({ type: 'work', duration: 25 });
    } else {
      setSessionType('work');
      setTimeLeft(WORK);
      setSessionsCompleted((s) => s + 1);
      onSessionComplete?.({ type: 'break', duration: 5 });
    }
    setIsRunning(false);
    endAtRef.current = null;
  }, [sessionType, beep, onSessionComplete]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ isRunning, sessionType, timeLeft, sessionsCompleted, endAt: endAtRef.current }));
  }, [isRunning, sessionType, timeLeft, sessionsCompleted]);

  useEffect(() => {
    if (!isRunning) return;
    if (!endAtRef.current) endAtRef.current = Date.now() + timeLeft * 1000;
    const id = setInterval(() => {
      const rem = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setTimeLeft(rem);
      if (rem <= 0) {
        clearInterval(id);
        finish();
      }
    }, 250);
    return () => clearInterval(id);
  }, [isRunning, finish]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8 max-w-md mx-auto border`}>
      <h2 className={`text-3xl font-bold text-center mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Pomodoro Timer</h2>
      <p className={`text-center text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{sessionType === 'work' ? 'Work session' : 'Break'}</p>
      <div className="relative w-56 h-56 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r="88" fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="12" />
          <circle cx="100" cy="100" r="88" fill="none" stroke={sessionType === 'work' ? '#6366f1' : '#10b981'} strokeWidth="12" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - (progress / 100) * circ} />
        </svg>
        <p className="absolute inset-0 flex items-center justify-center text-5xl font-mono font-bold" aria-live="polite">{fmt(timeLeft)}</p>
      </div>
      <p className="text-center text-sm mb-6">Sessions: {sessionsCompleted}</p>
      <div className="flex gap-4 justify-center">
        {!isRunning ? (
          <button type="button" onClick={() => { if (!endAtRef.current) endAtRef.current = Date.now() + timeLeft * 1000; setIsRunning(true); }} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl" aria-label="Start"><Play size={20} />Start</button>
        ) : (
          <button type="button" onClick={() => { setIsRunning(false); endAtRef.current = null; }} className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl" aria-label="Pause"><Pause size={20} />Pause</button>
        )}
        <button type="button" onClick={() => { setIsRunning(false); setSessionType('work'); setTimeLeft(WORK); setSessionsCompleted(0); endAtRef.current = null; sessionStorage.removeItem(STORAGE_KEY); }} className={`flex items-center gap-2 px-6 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'}`} aria-label="Reset"><RotateCcw size={20} />Reset</button>
      </div>
    </div>
  );
}
