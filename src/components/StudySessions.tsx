import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import type { StudySession, Lesson } from '../types';

interface StudySessionsProps {
  sessions: StudySession[];
  lessons: Lesson[];
  onUpdate: () => void;
}

const StudySessions: React.FC<StudySessionsProps> = ({ sessions, lessons, onUpdate }) => {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    lessonId: '',
    duration: 30,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !formData.lessonId) return;

    try {
      const lesson = lessons.find(l => l.id === formData.lessonId);
      if (!lesson) return;

      const now = new Date();
      const startTime = new Date(now.getTime() - formData.duration * 60000);

      await addDoc(collection(db, 'studySessions'), {
        userId: currentUser.uid,
        lessonId: formData.lessonId,
        lessonTitle: lesson.title,
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(now),
        duration: formData.duration,
        notes: formData.notes,
        createdAt: Timestamp.now(),
      });

      setFormData({
        lessonId: '',
        duration: 30,
        notes: '',
      });
      setShowForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding study session:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="study-sessions">
      <div className="section-header">
        <h2>Study Sessions</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Log Session'}
        </button>
      </div>

      {showForm && (
        <form className="session-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Lesson</label>
            <select
              value={formData.lessonId}
              onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
              required
            >
              <option value="">Select a lesson</option>
              {lessons.map(lesson => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              min="5"
              required
            />
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="What did you learn?"
            />
          </div>

          <button type="submit" className="btn-primary">Log Session</button>
        </form>
      )}

      <div className="sessions-list">
        {sessions.length === 0 ? (
          <p className="empty-state">No study sessions yet. Log your first session to start tracking!</p>
        ) : (
          sessions.map(session => (
            <div key={session.id} className="session-card">
              <div className="session-header">
                <h3>{session.lessonTitle}</h3>
                <span className="session-duration">{formatDuration(session.duration)}</span>
              </div>
              <p className="session-date">{formatDate(session.startTime)}</p>
              {session.notes && (
                <p className="session-notes">{session.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudySessions;
