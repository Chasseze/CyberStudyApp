import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, Trophy, Target, Zap, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { parseFirestoreDate, getDateKey } from './utils/dateUtils';
import { normalizeStatus, ENTRY_STATUS } from './src/constants/status.js';

/**
 * Goals Panel Component
 * Displays and manages study goals with milestone tracking and badges
 */
const GoalsPanel = ({ entries, darkMode, onGoalsUpdate }) => {
  const [goals, setGoals] = useState(() => {
    const stored = localStorage.getItem('studyGoals');
    return stored ? JSON.parse(stored) : [];
  });

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'weekly', // 'weekly' or 'monthly'
    target: 10, // number of entries
    category: 'general', // 'general', 'network', 'cryptography', 'web-security', etc.
  });

  // Save goals to localStorage
  const saveGoals = (updatedGoals) => {
    setGoals(updatedGoals);
    localStorage.setItem('studyGoals', JSON.stringify(updatedGoals));
    if (onGoalsUpdate) onGoalsUpdate(updatedGoals);
  };

  // Add or update goal
  const handleSaveGoal = () => {
    if (!newGoal.title.trim()) {
      alert('Please enter a goal title');
      return;
    }

    let updatedGoals;
    if (editingGoal) {
      updatedGoals = goals.map(g => g.id === editingGoal.id ? { ...newGoal, id: editingGoal.id } : g);
    } else {
      updatedGoals = [...goals, { ...newGoal, id: Date.now() }];
    }

    saveGoals(updatedGoals);
    setNewGoal({
      title: '',
      description: '',
      type: 'weekly',
      target: 10,
      category: 'general',
    });
    setEditingGoal(null);
    setShowAddGoal(false);
  };

  // Delete goal
  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      saveGoals(goals.filter(g => g.id !== goalId));
    }
  };

  // Edit goal
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal(goal);
    setShowAddGoal(true);
  };

  const entriesWithDates = useMemo(() => {
    return entries
      .map(entry => {
        const parsedDate = parseFirestoreDate(entry.createdAt);
        if (!parsedDate) {
          return null;
        }
        return { ...entry, parsedDate };
      })
      .filter(Boolean);
  }, [entries]);

  // Calculate progress for each goal
  const goalProgress = useMemo(() => {
    return goals.map(goal => {
      const now = new Date();
      let relevantEntries = entriesWithDates;

      if (goal.type === 'weekly') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        relevantEntries = entriesWithDates.filter(entry => {
          return entry.parsedDate >= weekStart;
        });
      } else if (goal.type === 'monthly') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        relevantEntries = entriesWithDates.filter(entry => {
          return entry.parsedDate >= monthStart;
        });
      }

      // Filter by category if specified
      if (goal.category && goal.category !== 'general') {
        relevantEntries = relevantEntries.filter(entry => 
          entry.topic.toLowerCase().includes(goal.category.toLowerCase())
        );
      }

      const completed = relevantEntries.length;
      const percentage = Math.min(100, (completed / goal.target) * 100);
      const isCompleted = completed >= goal.target;

      return {
        ...goal,
        completed,
        percentage,
        isCompleted,
      };
    });
  }, [goals, entriesWithDates]);

  // Calculate achievements/badges
  const achievements = useMemo(() => {
    const badges = [];

    // Total goals completed
    const totalCompleted = goalProgress.filter(g => g.isCompleted).length;
    if (totalCompleted > 0) {
      badges.push({
        id: 'goals-completed',
        name: 'Goal Master',
        description: `Completed ${totalCompleted} goal${totalCompleted > 1 ? 's' : ''}`,
        icon: Trophy,
        color: 'text-yellow-500',
        condition: true,
      });
    }

    // Perfect week (all entries completed)
    const weekStart = new Date();
    weekStart.setDate(new Date().getDate() - new Date().getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekEntries = entriesWithDates.filter(entry => {
      return entry.parsedDate >= weekStart;
    });
    const completedThisWeek = thisWeekEntries.filter((e) => normalizeStatus(e.status) === ENTRY_STATUS.COMPLETED).length;
    
    if (completedThisWeek >= 5) {
      badges.push({
        id: 'perfect-week',
        name: 'Weekly Champion',
        description: `${completedThisWeek} entries completed this week`,
        icon: Zap,
        color: 'text-blue-500',
        condition: true,
      });
    }

    // High consistency
    if (entriesWithDates.length >= 20) {
      badges.push({
        id: 'consistent',
        name: 'Consistent Learner',
        description: 'Logged 20+ study sessions',
        icon: TrendingUp,
        color: 'text-green-500',
        condition: true,
      });
    }

    // Expert level
  const completedTopics = [...new Set(entriesWithDates.filter((e) => normalizeStatus(e.status) === ENTRY_STATUS.COMPLETED).map((e) => e.topic))].length;
    if (completedTopics >= 5) {
      badges.push({
        id: 'expert',
        name: 'Subject Matter Expert',
        description: `Mastered ${completedTopics} topics`,
        icon: Award,
        color: 'text-purple-500',
        condition: true,
      });
    }

    return badges.filter(b => b.condition);
  }, [goalProgress, entriesWithDates]);

  // Calculate streaks
  const streakInfo = useMemo(() => {
    const entriesByDate = {};
    entriesWithDates.forEach(entry => {
      const dateKey = getDateKey(entry.parsedDate);
      if (!dateKey) return;
      if (!entriesByDate[dateKey]) {
        entriesByDate[dateKey] = [];
      }
      entriesByDate[dateKey].push(entry);
    });

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 1;

  const sortedDates = Object.keys(entriesByDate).sort();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check current streak
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (entriesByDate[dateKey]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate max streak
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);

    return {
      currentStreak,
      maxStreak,
      isStreakActive: sortedDates.includes(today) || sortedDates.includes(yesterday),
    };
  }, [entriesWithDates]);

  return (
    <div className={`space-y-6 max-w-4xl mx-auto ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Streak Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${darkMode ? 'bg-gradient-to-br from-red-900/40 to-red-800/40 border-red-700' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'} rounded-xl p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                Current Streak
              </p>
              <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-red-200' : 'text-red-900'}`}>
                {streakInfo.currentStreak}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-red-400/70' : 'text-red-700/70'}`}>
                {streakInfo.isStreakActive ? '🔥 Active' : 'Not active today'}
              </p>
            </div>
            <div className={`text-5xl ${streakInfo.isStreakActive ? '' : 'opacity-30'}`}>🔥</div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} rounded-xl p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                Best Streak
              </p>
              <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                {streakInfo.maxStreak}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-purple-400/70' : 'text-purple-700/70'}`}>
                Personal best
              </p>
            </div>
            <Trophy size={40} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'} rounded-xl p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                Goals Completed
              </p>
              <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                {goalProgress.filter(g => g.isCompleted).length}/{goals.length}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-blue-400/70' : 'text-blue-700/70'}`}>
                {goals.length === 0 ? 'No goals yet' : 'Active goals'}
              </p>
            </div>
            <Target size={40} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
          </div>
        </div>
      </div>

      {/* Achievements/Badges */}
      {achievements.length > 0 && (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg p-6 border`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Award size={20} />
            Achievements Unlocked
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map(badge => {
              const IconComponent = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg flex items-center gap-3 ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <IconComponent size={32} className={badge.color} />
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {badge.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Goals Section */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg p-6 border`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Target size={20} />
            Study Goals
          </h3>
          {!showAddGoal && (
            <button
              onClick={() => {
                setShowAddGoal(true);
                setEditingGoal(null);
                setNewGoal({
                  title: '',
                  description: '',
                  type: 'weekly',
                  target: 10,
                  category: 'general',
                });
              }}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Goal
            </button>
          )}
        </div>

        {/* Add/Edit Goal Form */}
        {showAddGoal && (
          <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Master Cryptography"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Type
                </label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Target Entries
                </label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) })}
                  min="1"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="general">General</option>
                  <option value="network">Network Security</option>
                  <option value="cryptography">Cryptography</option>
                  <option value="web">Web Security</option>
                  <option value="ethics">Ethics</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Optional description..."
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                rows="2"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveGoal}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                {editingGoal ? 'Update' : 'Create'} Goal
              </button>
              <button
                onClick={() => {
                  setShowAddGoal(false);
                  setEditingGoal(null);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Goals List */}
        {goals.length === 0 && !showAddGoal ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Target size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No goals yet. Create one to get started! 🎯</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goalProgress.map((goal) => (
              <div
                key={goal.id}
                className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${
                  darkMode ? 'border-gray-600' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {goal.title}
                      </p>
                      {goal.isCompleted && (
                        <span className="text-green-500 font-bold">✓ Completed</span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {goal.type === 'weekly' ? '📅 Weekly' : '📅 Monthly'} • {goal.category !== 'general' ? goal.category : 'All topics'}
                    </p>
                    {goal.description && (
                      <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="text-blue-500 hover:text-blue-700 p-2"
                      title="Edit goal"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Delete goal"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Progress
                    </span>
                    <span className={`text-sm font-bold ${
                      goal.isCompleted ? 'text-green-500' : 'text-gray-600'
                    }`}>
                      {goal.completed}/{goal.target}
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        goal.percentage === 100
                          ? 'bg-green-500'
                          : goal.percentage >= 75
                          ? 'bg-blue-500'
                          : goal.percentage >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {goal.percentage.toFixed(0)}% complete
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivational Quote */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-indigo-700' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'} rounded-2xl shadow-lg p-6 border text-center`}>
        <p className={`text-lg font-semibold italic ${darkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>
          "Success is the sum of small efforts repeated day in and day out." 💪
        </p>
      </div>
    </div>
  );
};

export default GoalsPanel;
