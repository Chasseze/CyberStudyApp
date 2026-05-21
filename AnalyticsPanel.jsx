import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { countByStatus, normalizeStatus, ENTRY_STATUS } from './src/constants/status.js';

/**
 * Analytics Panel Component
 * Displays study statistics and progress visualization
 */
const AnalyticsPanel = ({ entries, darkMode, timerSessions }) => {
  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!entries || entries.length === 0) {
      return {
        totalEntries: 0,
        completedCount: 0,
        inProgressCount: 0,
        notStartedCount: 0,
        reviewNeededCount: 0,
        completionRate: 0,
        topicStats: {},
        weeklyStats: [],
        statusDistribution: [],
        totalStudyHours: 0,
      };
    }

    // Basic counts
    const totalEntries = entries.length;
    const counts = countByStatus(entries);
    const completedCount = counts.completed;
    const inProgressCount = counts.inProgress;
    const notStartedCount = counts.notStarted;
    const reviewNeededCount = counts.review;

    // Completion rate
    const completionRate = totalEntries > 0 ? Math.round((completedCount / totalEntries) * 100) : 0;

    // Topic statistics
    const topicStats = {};
    entries.forEach(entry => {
      if (!topicStats[entry.topic]) {
        topicStats[entry.topic] = { completed: 0, total: 0 };
      }
      topicStats[entry.topic].total += 1;
      if (normalizeStatus(entry.status) === ENTRY_STATUS.COMPLETED) {
        topicStats[entry.topic].completed += 1;
      }
    });

    // Status distribution for pie chart
    const statusDistribution = [
      { name: 'Completed', value: completedCount, color: '#10b981' },
      { name: 'In Progress', value: inProgressCount, color: '#f59e0b' },
      { name: 'Not Started', value: notStartedCount, color: '#ef4444' },
      { name: 'Review Needed', value: reviewNeededCount, color: '#8b5cf6' },
    ].filter(item => item.value > 0);

    // Weekly statistics - organize by week
    const weeklyData = {};
    entries.forEach(entry => {
      const week = parseInt(entry.week) || 0;
      if (!weeklyData[week]) {
        weeklyData[week] = { week: `Week ${week}`, completed: 0, total: 0 };
      }
      weeklyData[week].total += 1;
      if (normalizeStatus(entry.status) === ENTRY_STATUS.COMPLETED) {
        weeklyData[week].completed += 1;
      }
    });

    const weeklyStats = Object.values(weeklyData)
      .sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]))
      .slice(-8); // Last 8 weeks

    // Calculate total study hours from timer sessions
    let totalStudyHours = 0;
    if (timerSessions && timerSessions.length > 0) {
      totalStudyHours = timerSessions.reduce((sum, session) => {
        const duration = session.duration || 0;
        return sum + (duration / 3600); // Convert seconds to hours
      }, 0);
    }

    return {
      totalEntries,
      completedCount,
      inProgressCount,
      notStartedCount,
      reviewNeededCount,
      completionRate,
      topicStats,
      weeklyStats,
      statusDistribution,
      totalStudyHours: totalStudyHours.toFixed(1),
    };
  }, [entries, timerSessions]);

  // Top topics by completion rate
  const topTopics = useMemo(() => {
    const topics = Object.entries(analytics.topicStats)
      .map(([name, stats]) => ({
        name,
        completed: stats.completed,
        total: stats.total,
        rate: Math.round((stats.completed / stats.total) * 100),
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
    return topics;
  }, [analytics.topicStats]);

  if (analytics.totalEntries === 0) {
    return (
      <div className={`max-w-4xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 text-center`}>
        <AlertCircle className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={48} />
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          No study entries yet. Start tracking your progress to see analytics!
        </p>
      </div>
    );
  }

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className={`space-y-6 max-w-4xl mx-auto w-full`}>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <div className={`${darkMode ? 'bg-gradient-to-br from-green-900/40 to-green-800/40 border-green-700' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} rounded-xl p-6 border`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
              Completion Rate
            </h3>
            <CheckCircle size={20} className={darkMode ? 'text-green-400' : 'text-green-600'} />
          </div>
          <p className={`text-3xl font-bold ${darkMode ? 'text-green-200' : 'text-green-900'}`}>
            {analytics.completionRate}%
          </p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-green-400/70' : 'text-green-700/70'}`}>
            {analytics.completedCount} of {analytics.totalEntries} entries
          </p>
        </div>

        {/* Total Entries */}
        <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'} rounded-xl p-6 border`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              Total Entries
            </h3>
            <Calendar size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
          </div>
          <p className={`text-3xl font-bold ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
            {analytics.totalEntries}
          </p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-blue-400/70' : 'text-blue-700/70'}`}>
            Study sessions tracked
          </p>
        </div>

        {/* Study Time */}
        <div className={`${darkMode ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} rounded-xl p-6 border`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              Study Time
            </h3>
            <Clock size={20} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
          </div>
          <p className={`text-3xl font-bold ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
            {analytics.totalStudyHours}h
          </p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-purple-400/70' : 'text-purple-700/70'}`}>
            From Pomodoro sessions
          </p>
        </div>

        {/* In Progress */}
        <div className={`${darkMode ? 'bg-gradient-to-br from-amber-900/40 to-amber-800/40 border-amber-700' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'} rounded-xl p-6 border`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
              In Progress
            </h3>
            <TrendingUp size={20} className={darkMode ? 'text-amber-400' : 'text-amber-600'} />
          </div>
          <p className={`text-3xl font-bold ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>
            {analytics.inProgressCount}
          </p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-amber-400/70' : 'text-amber-700/70'}`}>
            Active topics
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        {analytics.weeklyStats.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg p-6 border`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <TrendingUp size={20} />
              Weekly Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#fff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: darkMode ? '#fff' : '#000',
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="total" fill="#3b82f6" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status Distribution */}
        {analytics.statusDistribution.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg p-6 border`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <CheckCircle size={20} />
              Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#fff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: darkMode ? '#fff' : '#000',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Topics */}
      {topTopics.length > 0 && (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg p-6 border`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📚 Top Topics by Completion
          </h3>
          <div className="space-y-3">
            {topTopics.map((topic, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {topic.name}
                  </p>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${
                    topic.rate === 100 ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                    topic.rate >= 75 ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                    topic.rate >= 50 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                    'bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}>
                    {topic.rate}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all ${
                      topic.rate === 100 ? 'bg-green-500' :
                      topic.rate >= 75 ? 'bg-blue-500' :
                      topic.rate >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${topic.rate}%` }}
                  />
                </div>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {topic.completed} of {topic.total} completed
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
