import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { normalizeStatus } from './src/constants/status.js';

/**
 * Firestore Service Layer
 * Handles all CRUD operations for entries, goals, and timer sessions
 */

// ==================== ENTRIES OPERATIONS ====================

/**
 * Add a new study entry
 */
export const addEntry = async (userId, entryData) => {
  try {
    const entryId = Date.now().toString();
    const entry = {
      id: entryId,
      userId,
      ...entryData,
      status: normalizeStatus(entryData.status),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'entries', userId, 'data', entryId), entry);
    return entry;
  } catch (error) {
    console.error('Error adding entry:', error);
    throw error;
  }
};

/**
 * Get all entries for a user
 */
export const getEntries = async (userId) => {
  try {
    const entriesRef = collection(db, 'entries', userId, 'data');
    const q = query(entriesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
  } catch (error) {
    console.error('Error fetching entries:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time entry updates
 */
export const subscribeToEntries = (userId, callback) => {
  try {
    const entriesRef = collection(db, 'entries', userId, 'data');
    const q = query(entriesRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id,
        status: normalizeStatus(d.data().status),
      }));
      callback(entries);
    });
  } catch (error) {
    console.error('Error subscribing to entries:', error);
    throw error;
  }
};

/**
 * Update an entry
 */
export const updateEntry = async (userId, entryId, updates) => {
  try {
    const entryRef = doc(db, 'entries', userId, 'data', entryId);
    const payload = { ...updates, updatedAt: serverTimestamp() };
    if (updates.status !== undefined) payload.status = normalizeStatus(updates.status);
    await updateDoc(entryRef, payload);
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
};

/**
 * Delete an entry
 */
export const deleteEntry = async (userId, entryId) => {
  try {
    await deleteDoc(doc(db, 'entries', userId, 'data', entryId));
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
};

// ==================== GOALS OPERATIONS ====================

/**
 * Add a new goal
 */
export const addGoal = async (userId, goalData) => {
  try {
    const goalId = Date.now().toString();
    const goal = {
      id: goalId,
      userId,
      ...goalData,
      currentValue: 0,
      isCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'goals', userId, 'data', goalId), goal);
    return goal;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

/**
 * Get all goals for a user
 */
export const getGoals = async (userId) => {
  try {
    const goalsRef = collection(db, 'goals', userId, 'data');
    const q = query(goalsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time goal updates
 */
export const subscribeToGoals = (userId, callback) => {
  try {
    const goalsRef = collection(db, 'goals', userId, 'data');
    const q = query(goalsRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const goals = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      callback(goals);
    });
  } catch (error) {
    console.error('Error subscribing to goals:', error);
    throw error;
  }
};

/**
 * Update a goal
 */
export const updateGoal = async (userId, goalId, updates) => {
  try {
    const goalRef = doc(db, 'goals', userId, 'data', goalId);
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

/**
 * Delete a goal
 */
export const deleteGoal = async (userId, goalId) => {
  try {
    await deleteDoc(doc(db, 'goals', userId, 'data', goalId));
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// ==================== TIMER SESSIONS OPERATIONS ====================

/**
 * Add a timer session
 */
export const addTimerSession = async (userId, sessionData) => {
  try {
    const sessionId = Date.now().toString();
    const session = {
      id: sessionId,
      userId,
      ...sessionData,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'timerSessions', userId, 'data', sessionId), session);
    return session;
  } catch (error) {
    console.error('Error adding timer session:', error);
    throw error;
  }
};

/**
 * Get all timer sessions for a user
 */
export const getTimerSessions = async (userId) => {
  try {
    const sessionsRef = collection(db, 'timerSessions', userId, 'data');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
  } catch (error) {
    console.error('Error fetching timer sessions:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time timer session updates
 */
export const subscribeToTimerSessions = (userId, callback) => {
  try {
    const sessionsRef = collection(db, 'timerSessions', userId, 'data');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      callback(sessions);
    });
  } catch (error) {
    console.error('Error subscribing to timer sessions:', error);
    throw error;
  }
};

// ==================== STREAK OPERATIONS ====================

/**
 * Get or create streak document
 */
export const getStreak = async (userId) => {
  try {
    const streakRef = doc(db, 'streaks', userId, 'data', 'current');
    const streakSnap = await getDoc(streakRef);
    
    if (streakSnap.exists()) {
      return streakSnap.data();
    }
    
    // Create default streak if doesn't exist
    const defaultStreak = {
      userId,
      currentStreak: 0,
      maxStreak: 0,
      lastActivityDate: null,
      startDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(streakRef, defaultStreak);
    return defaultStreak;
  } catch (error) {
    console.error('Error fetching streak:', error);
    throw error;
  }
};

/**
 * Update streak
 */
export const updateStreak = async (userId, streakData) => {
  try {
    const streakRef = doc(db, 'streaks', userId, 'data', 'current');
    await updateDoc(streakRef, {
      ...streakData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
};

/**
 * Subscribe to streak updates
 */
export const subscribeToStreak = (userId, callback) => {
  try {
    const streakRef = doc(db, 'streaks', userId, 'data', 'current');
    
    return onSnapshot(streakRef, (snap) => {
      callback(snap.exists() ? snap.data() : { currentStreak: 0, maxStreak: 0 });
    });
  } catch (error) {
    console.error('Error subscribing to streak:', error);
    throw error;
  }
};

// ==================== BATCH OPERATIONS ====================

/**
 * Batch update entries status
 */
export const batchUpdateEntriesStatus = async (userId, entryIds, status) => {
  try {
    const batch = writeBatch(db);
    
    entryIds.forEach(entryId => {
      const entryRef = doc(db, 'entries', userId, 'data', entryId);
      batch.update(entryRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error batch updating entries:', error);
    throw error;
  }
};

/**
 * Migrate localStorage data to Firestore
 */
export const migrateLocalStorageToFirestore = async (userId, localData) => {
  try {
    const batch = writeBatch(db);

    // Migrate entries
    if (localData.entries && Array.isArray(localData.entries)) {
      localData.entries.forEach(entry => {
        const entryRef = doc(db, 'entries', userId, 'data', entry.id.toString());
        batch.set(entryRef, {
          ...entry,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    }

    // Migrate goals
    if (localData.goals && Array.isArray(localData.goals)) {
      localData.goals.forEach(goal => {
        const goalRef = doc(db, 'goals', userId, 'data', goal.id.toString());
        batch.set(goalRef, {
          ...goal,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    }

    // Migrate timer sessions
    if (localData.timerSessions && Array.isArray(localData.timerSessions)) {
      localData.timerSessions.forEach(session => {
        const sessionRef = doc(db, 'timerSessions', userId, 'data', session.id.toString());
        batch.set(sessionRef, {
          ...session,
          userId,
          createdAt: serverTimestamp(),
        });
      });
    }

    await batch.commit();
    console.log('Data migrated to Firestore successfully');
  } catch (error) {
    console.error('Error migrating data:', error);
    throw error;
  }
};
