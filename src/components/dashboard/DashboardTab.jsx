import React from 'react';
import { Flame, BookOpen, Timer, Target, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Card } from '../ui/Card';
import { countByStatus } from '../../constants/status';

export function DashboardTab({
  darkMode,
  entries,
  timerSessions,
  streak,
  onNavigate,
  latestEntryDisplay,
  totalFocusMinutes,
}) {
  const statusCounts = countByStatus(entries);
  const total = entries.length;
  const completionRate = total ? Math.round((statusCounts.completed / total) * 100) : 0;
  const currentStreak = streak?.currentStreak ?? 0;

  const quickLinks = [
    { id: 'tracker', label: 'Add entry', icon: BookOpen },
    { id: 'pomodoro', label: 'Start timer', icon: Timer },
    { id: 'insights', label: 'Analytics', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
  ];

  return (
    <div className="space-y-6">
      <Card darkMode={darkMode} className="bg-gradient-to-br from-indigo-600/90 to-purple-700/90 !border-0 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wide">Welcome back</p>
            <h2 className="text-2xl font-bold mt-1">Your study command center</h2>
            {latestEntryDisplay && (
              <p className="text-indigo-100/90 text-sm mt-2">Last activity: {latestEntryDisplay}</p>
            )}
          </div>
          <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-3">
            <Flame className="text-amber-300" size={28} aria-hidden />
            <div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-indigo-100">day streak</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard darkMode={darkMode} label="Entries" value={total} icon={BookOpen} />
        <StatCard darkMode={darkMode} label="Completed" value={`${completionRate}%`} icon={TrendingUp} accent="emerald" />
        <StatCard darkMode={darkMode} label="Focus min" value={totalFocusMinutes} icon={Timer} />
        <StatCard darkMode={darkMode} label="Sessions" value={timerSessions.length} icon={Calendar} />
      </div>

      <Card darkMode={darkMode} hover={false}>
        <h3 className="font-semibold mb-4">Quick actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                darkMode
                  ? 'border-gray-700 hover:bg-gray-700/50'
                  : 'border-gray-200 hover:bg-indigo-50'
              }`}
            >
              <Icon size={22} className="text-indigo-500" aria-hidden />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </Card>

      {total > 0 && (
        <Card darkMode={darkMode} hover={false}>
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span>Overall completion</span>
            <span>{completionRate}%</span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-indigo-100'}`}>
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
              role="progressbar"
              aria-valuenow={completionRate}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {statusCounts.inProgress + statusCounts.review} in progress or need review
          </p>
        </Card>
      )}
    </div>
  );
}

function StatCard({ darkMode, label, value, icon: Icon, accent }) {
  return (
    <Card darkMode={darkMode} hover={false} className="!p-4">
      <Icon
        size={20}
        className={accent === 'emerald' ? 'text-emerald-500' : 'text-indigo-500'}
        aria-hidden
      />
      <p className={`text-xs mt-2 uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </Card>
  );
}
