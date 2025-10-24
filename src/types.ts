export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface Lesson {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  lessonId: string;
  lessonTitle: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  notes?: string;
  createdAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  totalStudyTime: number; // in minutes
  currentStreak: number; // days
  goalsCompleted: number;
  goalsInProgress: number;
}
