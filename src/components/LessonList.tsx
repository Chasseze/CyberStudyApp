import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Lesson } from '../types';

interface LessonListProps {
  lessons: Lesson[];
  onUpdate: () => void;
}

const LessonList: React.FC<LessonListProps> = ({ lessons, onUpdate }) => {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'lessons'), {
        userId: currentUser.uid,
        ...formData,
        completed: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setFormData({
        title: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        duration: 30,
      });
      setShowForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding lesson:', error);
    }
  };

  const toggleComplete = async (lesson: Lesson) => {
    try {
      await updateDoc(doc(db, 'lessons', lesson.id), {
        completed: !lesson.completed,
        updatedAt: Timestamp.now(),
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
      onUpdate();
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  return (
    <div className="lesson-list">
      <div className="section-header">
        <h2>My Lessons</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Lesson'}
        </button>
      </div>

      {showForm && (
        <form className="lesson-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Network Security"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
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
          </div>
          
          <button type="submit" className="btn-primary">Add Lesson</button>
        </form>
      )}

      <div className="lessons-grid">
        {lessons.length === 0 ? (
          <p className="empty-state">No lessons yet. Add your first lesson to get started!</p>
        ) : (
          lessons.map(lesson => (
            <div key={lesson.id} className={`lesson-card ${lesson.completed ? 'completed' : ''}`}>
              <div className="lesson-header">
                <h3>{lesson.title}</h3>
                <span className={`difficulty-badge ${lesson.difficulty}`}>
                  {lesson.difficulty}
                </span>
              </div>
              <p className="lesson-description">{lesson.description}</p>
              <div className="lesson-meta">
                <span className="category">{lesson.category}</span>
                <span className="duration">{lesson.duration} min</span>
              </div>
              <div className="lesson-actions">
                <button
                  className={`btn-toggle ${lesson.completed ? 'completed' : ''}`}
                  onClick={() => toggleComplete(lesson)}
                >
                  {lesson.completed ? '✓ Completed' : 'Mark Complete'}
                </button>
                <button
                  className="btn-delete"
                  onClick={() => deleteLesson(lesson.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LessonList;
