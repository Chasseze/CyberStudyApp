import React, { useState, Suspense } from 'react';
import ErrorBoundary from '../../../components/ErrorBoundary';
import { ChartSkeleton, CalendarSkeleton } from '../../../components/LoadingSkeleton';

export function InsightsTab({
  darkMode,
  entries,
  timerSessions,
  AnalyticsPanel,
  CalendarView,
}) {
  const [subTab, setSubTab] = useState('analytics');

  return (
    <div className="space-y-4">
      <div
        className={`flex gap-2 p-1 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
        role="tablist"
        aria-label="Insights sections"
      >
        {[
          { id: 'analytics', label: 'Analytics' },
          { id: 'calendar', label: 'Calendar' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={subTab === t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              subTab === t.id
                ? 'bg-indigo-600 text-white'
                : darkMode
                  ? 'text-gray-300'
                  : 'text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {subTab === 'analytics' && (
        <ErrorBoundary darkMode={darkMode} componentName="Analytics">
          <Suspense fallback={<ChartSkeleton darkMode={darkMode} />}>
            <AnalyticsPanel entries={entries} darkMode={darkMode} timerSessions={timerSessions} />
          </Suspense>
        </ErrorBoundary>
      )}
      {subTab === 'calendar' && (
        <ErrorBoundary darkMode={darkMode} componentName="Calendar">
          <Suspense fallback={<CalendarSkeleton darkMode={darkMode} />}>
            <CalendarView entries={entries} darkMode={darkMode} />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
