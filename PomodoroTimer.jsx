import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

export default function PomodoroTimer({ darkMode, onSessionComplete }) {
  // Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('work'); // 'work' or 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const audioRef = useRef(null);

  // Timer interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished
          playNotificationSound();
          
          if (sessionType === 'work') {
            // Switch to break
            setSessionType('break');
            return 5 * 60; // 5 minutes break
          } else {
            // Switch to work and increment counter
            setSessionType('work');
            setSessionsCompleted((s) => s + 1);
            onSessionComplete?.({ type: 'break', duration: 5 });
            return 25 * 60; // 25 minutes work
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, sessionType, onSessionComplete]);

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
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
    } catch (e) {
      console.log('Audio context not available');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSessionType('work');
    setTimeLeft(25 * 60);
    setSessionsCompleted(0);
  };

  const progressPercent = sessionType === 'work' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8 max-w-md mx-auto`}>
      {/* Header */}
      <h2 className={`text-3xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Pomodoro Timer
      </h2>
      
      {/* Session type indicator */}
      <div className={`text-center mb-4 px-4 py-2 rounded-lg ${
        sessionType === 'work' 
          ? darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
          : darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
      }`}>
        <p className="text-sm font-semibold">
          {sessionType === 'work' ? '📚 Work Session' : '☕ Break Time'}
        </p>
      </div>

      {/* Timer display */}
      <div className={`${
        darkMode ? 'bg-gradient-to-br from-indigo-900 to-purple-900' : 'bg-gradient-to-br from-indigo-100 to-purple-100'
      } rounded-xl p-8 mb-6`}>
        <p className={`text-6xl font-bold text-center font-mono ${
          darkMode ? 'text-white' : 'text-indigo-900'
        }`}>
          {formatTime(timeLeft)}
        </p>
      </div>

      {/* Progress bar */}
      <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 mb-6 overflow-hidden`}>
        <div
          className={`h-full transition-all duration-300 ${
            sessionType === 'work'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
              : 'bg-gradient-to-r from-green-500 to-teal-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stats */}
      <div className="text-center mb-6">
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
          Sessions Completed: <span className="font-bold text-lg">{sessionsCompleted}</span>
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 justify-center mb-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
          >
            <Play size={20} />
            Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
          >
            <Pause size={20} />
            Pause
          </button>
        )}

        <button
          onClick={handleReset}
          className={`flex items-center gap-2 ${
            darkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          } font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105`}
        >
          <RotateCcw size={20} />
          Reset
        </button>
      </div>

      {/* Info */}
      <div className={`text-center text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        <p>Work: 25 min | Break: 5 min</p>
      </div>
    </div>
  );
}
