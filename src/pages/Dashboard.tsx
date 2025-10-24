import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import type { Lesson, StudySession, Goal, ProgressStats } from '../types';
import LessonList from '../components/LessonList';
import StudySessions from '../components/StudySessions';
import GoalManager from '../components/GoalManager';
import ProgressDashboard from '../components/ProgressDashboard';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'lessons' | 'sessions' | 'goals' | 'progress'>('lessons');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalLessons: 0,
    completedLessons: 0,
    totalStudyTime: 0,
    currentStreak: 0,
    goalsCompleted: 0,
    goalsInProgress: 0,
  });

  const loadData = useCallback(async () => {
    if (!currentUser) return;

    try {
      // Load lessons
      const lessonsQuery = query(
        collection(db, 'lessons'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const lessonsSnapshot = await getDocs(lessonsQuery);
      const lessonsData = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Lesson[];
      setLessons(lessonsData);

      // Load study sessions
      const sessionsQuery = query(
        collection(db, 'studySessions'),
        where('userId', '==', currentUser.uid),
        orderBy('startTime', 'desc'),
        limit(10)
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessionsData = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as StudySession[];
      setSessions(sessionsData);

      // Load goals
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      const goalsData = goalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        targetDate: doc.data().targetDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Goal[];
      setGoals(goalsData);

      // Calculate stats
      const completedLessons = lessonsData.filter(l => l.completed).length;
      const totalStudyTime = sessionsData.reduce((acc, s) => acc + s.duration, 0);
      const goalsCompleted = goalsData.filter(g => g.completed).length;
      const goalsInProgress = goalsData.filter(g => !g.completed).length;

      setStats({
        totalLessons: lessonsData.length,
        completedLessons,
        totalStudyTime,
        currentStreak: calculateStreak(sessionsData),
        goalsCompleted,
        goalsInProgress,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadData();
  }, [currentUser, navigate, loadData]);

  const calculateStreak = (sessions: StudySession[]): number => {
    if (sessions.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    const currentDate = new Date(today);
    
    for (let i = 0; i < 30; i++) {
      const hasSession = sessions.some(s => {
        const sessionDate = new Date(s.startTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === currentDate.getTime();
      });
      
      if (hasSession) {
        streak++;
      } else if (streak > 0) {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>CyberStudy</h1>
        <div className="user-info">
          <span>{currentUser?.email}</span>
          <button onClick={handleSignOut} className="btn-secondary">Sign Out</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={activeTab === 'lessons' ? 'active' : ''}
          onClick={() => setActiveTab('lessons')}
        >
          Lessons
        </button>
        <button
          className={activeTab === 'sessions' ? 'active' : ''}
          onClick={() => setActiveTab('sessions')}
        >
          Study Sessions
        </button>
        <button
          className={activeTab === 'goals' ? 'active' : ''}
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </button>
        <button
          className={activeTab === 'progress' ? 'active' : ''}
          onClick={() => setActiveTab('progress')}
        >
          Progress
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'lessons' && (
          <LessonList lessons={lessons} onUpdate={loadData} />
        )}
        {activeTab === 'sessions' && (
          <StudySessions sessions={sessions} lessons={lessons} onUpdate={loadData} />
        )}
        {activeTab === 'goals' && (
          <GoalManager goals={goals} onUpdate={loadData} />
        )}
        {activeTab === 'progress' && (
          <ProgressDashboard stats={stats} sessions={sessions} lessons={lessons} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
