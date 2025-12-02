/**
 * CyberTrackerR.jsx
 * 
 * Main entry point for the CyberStudy Tracker application.
 * This component serves as a proxy to CyberTrackerAppWithAuth.jsx which handles:
 * - Firebase authentication
 * - User session management
 * - App routing and navigation
 * - All feature components
 * 
 * Features:
 * ✅ Study Tracker - Track cybersecurity study progress
 * ✅ Pomodoro Timer - 25-min work / 5-min break sessions
 * ✅ Analytics Dashboard - Real-time study statistics
 * ✅ Calendar View - Activity heatmap and streak tracking
 * ✅ Goals & Streaks - Goal management with achievement badges
 * ✅ User Profile - Profile, settings, data management, security
 * ✅ Firebase Sync - Cloud storage with offline support
 * ✅ Dark/Light Mode - Full theme support
 */

export { default } from './CyberTrackerAppWithAuth';
