import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Award, Target, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { getDateKey } from './utils/dateUtils';

/**
 * Calendar View Component
 * Displays study sessions on a calendar with activity heatmap and streak tracking
 */
const CalendarView = ({ entries = [], darkMode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Parse entries by date
  const entriesByDate = useMemo(() => {
    const dateMap = {};
    if (!entries || !Array.isArray(entries)) return dateMap;
    
    entries.forEach(entry => {
      if (!entry || !entry.createdAt) return;
      const dateKey = getDateKey(entry.createdAt);
      if (!dateKey) {
        return;
      }
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = [];
      }
      dateMap[dateKey].push(entry);
    });
    return dateMap;
  }, [entries]);

  // Calculate streak
  const currentStreak = useMemo(() => {
    if (Object.keys(entriesByDate).length === 0) return 0;

    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    while (true) {
      const dateKey = format(checkDate, 'yyyy-MM-dd');
      if (entriesByDate[dateKey]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [entriesByDate]);

  // Calculate max streak
  const maxStreak = useMemo(() => {
    if (Object.keys(entriesByDate).length === 0) return 0;

    const sortedDates = Object.keys(entriesByDate).sort();
    let maxStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffTime = currDate - prevDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }

    maxStreak = Math.max(maxStreak, currentStreak);
    return maxStreak;
  }, [entriesByDate]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Get intensity for heatmap color (based on number of entries that day)
  const getIntensity = (date) => {
  const dateKey = format(date, 'yyyy-MM-dd');
    const count = entriesByDate[dateKey]?.length || 0;
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    return 3;
  };

  // Get color based on intensity
  const getHeatmapColor = (intensity) => {
    if (intensity === 0) {
      return darkMode ? 'bg-gray-700' : 'bg-gray-100';
    } else if (intensity === 1) {
      return darkMode ? 'bg-green-900/60' : 'bg-green-200/50';
    } else if (intensity === 2) {
      return darkMode ? 'bg-green-700/80' : 'bg-green-300/70';
    } else {
      return darkMode ? 'bg-green-600' : 'bg-green-500';
    }
  };

  // Get text color based on background
  const getTextColor = (intensity) => {
    return intensity > 0 ? 'text-white font-bold' : (darkMode ? 'text-gray-300' : 'text-gray-700');
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Group calendar days by weeks
  const weeks = useMemo(() => {
    const firstDay = calendarDays[0].getDay();
    const weeks = [];
    let currentWeek = new Array(firstDay).fill(null);

    calendarDays.forEach(day => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [calendarDays]);

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Streak Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Streak */}
        <div className={`${darkMode ? 'bg-gradient-to-br from-orange-900/40 to-orange-800/40 border-orange-700' : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'} rounded-xl p-6 border flex items-center gap-4`}>
          <div className="flex-shrink-0">
            <Flame className={`${currentStreak > 0 ? 'text-orange-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
              Current Streak
            </p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-orange-200' : 'text-orange-900'}`}>
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-orange-400/70' : 'text-orange-700/70'}`}>
              Keep it up! 🔥
            </p>
          </div>
        </div>

        {/* Max Streak */}
        <div className={`${darkMode ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} rounded-xl p-6 border flex items-center gap-4`}>
          <div className="flex-shrink-0">
            <Flame className={`text-purple-500`} size={32} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              Max Streak
            </p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
              {maxStreak} {maxStreak === 1 ? 'day' : 'days'}
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-purple-400/70' : 'text-purple-700/70'}`}>
              Personal best
            </p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg p-6 border`}>
        <div className="mb-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {format(currentDate, 'MMMM yyyy')}
            </h2>

            <button
              onClick={handleNextMonth}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center justify-center gap-4 mb-6 text-sm">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Less</span>
            <div className="flex gap-1">
              <div className={`w-3 h-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
              <div className={`w-3 h-3 rounded ${darkMode ? 'bg-green-900/60' : 'bg-green-200/50'}`} />
              <div className={`w-3 h-3 rounded ${darkMode ? 'bg-green-700/80' : 'bg-green-300/70'}`} />
              <div className={`w-3 h-3 rounded ${darkMode ? 'bg-green-600' : 'bg-green-500'}`} />
            </div>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>More</span>
          </div>

          {/* Days of Week Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className={`text-center text-sm font-semibold py-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="space-y-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIdx) => {
                  const intensity = day ? getIntensity(day) : 0;
                  const dateKey = day ? format(day, 'yyyy-MM-dd') : null;
                  const dayEntries = (dateKey && entriesByDate[dateKey]) || [];
                  const isToday = day && isSameDay(day, new Date());
                  const textColor = day ? getTextColor(intensity) : '';

                  return (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all hover:shadow-md relative group
                        ${day ? getHeatmapColor(intensity) : 'bg-transparent'}
                        ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                      title={day ? `${format(day, 'MMM d, yyyy')} (${dayEntries.length} entries)` : ''}
                    >
                      {day && (
                        <>
                          <span className={`text-sm font-semibold ${textColor}`}>
                            {format(day, 'd')}
                          </span>

                          {/* Tooltip */}
                          {dayEntries.length > 0 && (
                            <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block
                              ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-900 border border-gray-700'}
                              text-white text-xs rounded p-2 whitespace-nowrap z-10`}>
                              {dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day Details - Show entries for selected date or today */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg p-6 border`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <CalendarIcon size={20} />
          Today's Sessions
        </h3>

        <div className="space-y-3">
          {entriesByDate[format(new Date(), 'yyyy-MM-dd')]?.length > 0 ? (
            entriesByDate[format(new Date(), 'yyyy-MM-dd')].map((entry, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border-l-4 ${
                  entry.status === '✅ Completed'
                    ? 'border-green-500'
                    : entry.status === '🟡 In Progress'
                    ? 'border-yellow-500'
                    : entry.status === '🔄 Review Needed'
                    ? 'border-purple-500'
                    : 'border-red-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {entry.topic}
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {entry.goal}
                    </p>
                  </div>
                  <span className="text-sm font-medium ml-2">{entry.status}</span>
                </div>

                {entry.notes && (
                  <p className={`text-sm mt-2 italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    "{entry.notes}"
                  </p>
                )}

                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Week {entry.week}
                </p>
              </div>
            ))
          ) : (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="text-sm">No entries recorded for today</p>
              <p className="text-xs mt-1">Start studying to build your streak! 📚</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Summary */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg p-6 border`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📊 Activity Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Active Days
            </p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {Object.keys(entriesByDate).length}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Sessions
            </p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {entries?.length || 0}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Average Per Day
            </p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {(Object.keys(entriesByDate).length > 0 && entries?.length
                ? (entries.length / Object.keys(entriesByDate).length).toFixed(1)
                : 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
