import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Firebase Authentication Service
 * Handles user registration, login, logout, and profile management
 */

/**
 * Register a new user with email and password
 */
export const registerUser = async (email, password, displayName) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: displayName || email.split('@')[0],
    });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName || email.split('@')[0],
      photoURL: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      preferences: {
        darkMode: false,
        notificationsEnabled: true,
        timezone: 'UTC',
      },
      stats: {
        totalEntries: 0,
        totalGoals: 0,
        completedGoals: 0,
        currentStreak: 0,
        maxStreak: 0,
        totalStudyHours: 0,
      },
    });

    // Initialize streak document
    await setDoc(doc(db, 'streaks', user.uid, 'data', 'current'), {
      userId: user.uid,
      currentStreak: 0,
      maxStreak: 0,
      lastActivityDate: null,
      startDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Sign in user with email and password
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (uid, profileData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        ...profileData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (uid, preferences) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        preferences: {
          ...preferences,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};

/**
 * Delete user account
 */
export const deleteUserAccount = async (uid) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== uid) {
      throw new Error('Cannot delete another user account');
    }

    // Note: Firestore documents should be deleted in a Cloud Function for security
    // For now, we'll just delete the auth user
    await user.delete();
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};
