import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Goal } from '../types';

interface GoalManagerProps {
  goals: Goal[];
  onUpdate: () => void;
}

const GoalManager: React.FC<GoalManagerProps> = ({ goals, onUpdate }) => {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'goals'), {
        userId: currentUser.uid,
        ...formData,
        targetDate: Timestamp.fromDate(new Date(formData.targetDate)),
        completed: false,
        progress: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setFormData({
        title: '',
        description: '',
        targetDate: '',
      });
      setShowForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const updateProgress = async (goal: Goal, newProgress: number) => {
    try {
      await updateDoc(doc(db, 'goals', goal.id), {
        progress: newProgress,
        completed: newProgress === 100,
        updatedAt: Timestamp.now(),
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await deleteDoc(doc(db, 'goals', goalId));
      onUpdate();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getDaysRemaining = (targetDate: Date) => {
    const today = new Date();
    const diff = targetDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="goal-manager">
      <div className="section-header">
        <h2>My Goals</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Goal'}
        </button>
      </div>

      {showForm && (
        <form className="goal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete Security+ Certification"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal..."
              required
            />
          </div>

          <div className="form-group">
            <label>Target Date</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary">Add Goal</button>
        </form>
      )}

      <div className="goals-grid">
        {goals.length === 0 ? (
          <p className="empty-state">No goals yet. Set your first goal to stay motivated!</p>
        ) : (
          goals.map(goal => {
            const daysRemaining = getDaysRemaining(goal.targetDate);
            return (
              <div key={goal.id} className={`goal-card ${goal.completed ? 'completed' : ''}`}>
                <div className="goal-header">
                  <h3>{goal.title}</h3>
                  {goal.completed && <span className="completed-badge">✓ Completed</span>}
                </div>
                <p className="goal-description">{goal.description}</p>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">{goal.progress}%</span>
                </div>
                <div className="goal-meta">
                  <span className="target-date">
                    Target: {formatDate(goal.targetDate)}
                  </span>
                  {!goal.completed && (
                    <span className={`days-remaining ${daysRemaining < 7 ? 'urgent' : ''}`}>
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                    </span>
                  )}
                </div>
                <div className="goal-actions">
                  {!goal.completed && (
                    <div className="progress-controls">
                      <button
                        className="btn-small"
                        onClick={() => updateProgress(goal, Math.max(0, goal.progress - 10))}
                      >
                        -10%
                      </button>
                      <button
                        className="btn-small"
                        onClick={() => updateProgress(goal, Math.min(100, goal.progress + 10))}
                      >
                        +10%
                      </button>
                    </div>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GoalManager;
