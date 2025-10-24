import React from 'react';
import type { ProgressStats, StudySession, Lesson } from '../types';

interface ProgressDashboardProps {
  stats: ProgressStats;
  sessions: StudySession[];
  lessons: Lesson[];
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ stats, sessions, lessons }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getCompletionRate = () => {
    if (stats.totalLessons === 0) return 0;
    return Math.round((stats.completedLessons / stats.totalLessons) * 100);
  };

  const getRecentActivity = () => {
    return sessions.slice(0, 5);
  };

  const getStudyTimeByCategory = () => {
    const categoryTime: { [key: string]: number } = {};
    
    sessions.forEach(session => {
      const lesson = lessons.find(l => l.id === session.lessonId);
      if (lesson) {
        categoryTime[lesson.category] = (categoryTime[lesson.category] || 0) + session.duration;
      }
    });

    return Object.entries(categoryTime)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const categoryData = getStudyTimeByCategory();

  return (
    <div className="progress-dashboard">
      <h2>Progress Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Lessons</h3>
            <p className="stat-value">{stats.completedLessons} / {stats.totalLessons}</p>
            <p className="stat-label">{getCompletionRate()}% Complete</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Study Time</h3>
            <p className="stat-value">{formatTime(stats.totalStudyTime)}</p>
            <p className="stat-label">Total Time</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Current Streak</h3>
            <p className="stat-value">{stats.currentStreak}</p>
            <p className="stat-label">Days</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Goals</h3>
            <p className="stat-value">{stats.goalsCompleted} / {stats.goalsCompleted + stats.goalsInProgress}</p>
            <p className="stat-label">Completed</p>
          </div>
        </div>
      </div>

      <div className="progress-sections">
        <div className="progress-section">
          <h3>Study Time by Category</h3>
          {categoryData.length === 0 ? (
            <p className="empty-state">No study sessions yet</p>
          ) : (
            <div className="category-chart">
              {categoryData.map(([category, time]) => (
                <div key={category} className="category-item">
                  <span className="category-name">{category}</span>
                  <div className="category-bar">
                    <div 
                      className="category-bar-fill" 
                      style={{ 
                        width: `${(time / stats.totalStudyTime) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="category-time">{formatTime(time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="progress-section">
          <h3>Recent Activity</h3>
          {getRecentActivity().length === 0 ? (
            <p className="empty-state">No recent activity</p>
          ) : (
            <div className="activity-list">
              {getRecentActivity().map(session => (
                <div key={session.id} className="activity-item">
                  <div className="activity-icon">✓</div>
                  <div className="activity-content">
                    <p className="activity-title">{session.lessonTitle}</p>
                    <p className="activity-meta">
                      {formatTime(session.duration)} • {new Date(session.startTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="progress-tips">
        <h3>💡 Keep Going!</h3>
        <ul>
          {stats.currentStreak === 0 && (
            <li>Start your study streak today by logging a session!</li>
          )}
          {stats.currentStreak > 0 && stats.currentStreak < 7 && (
            <li>You're building momentum! Keep your {stats.currentStreak}-day streak going.</li>
          )}
          {stats.currentStreak >= 7 && (
            <li>Amazing! You've maintained a {stats.currentStreak}-day streak. Keep it up!</li>
          )}
          {stats.totalLessons === 0 && (
            <li>Add your first lesson to start planning your learning journey.</li>
          )}
          {stats.goalsInProgress === 0 && (
            <li>Set a goal to give your studies direction and purpose.</li>
          )}
          {getCompletionRate() >= 50 && (
            <li>Great progress! You've completed over half of your lessons.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProgressDashboard;
