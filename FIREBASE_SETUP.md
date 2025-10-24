# CyberStudy App - Firebase Setup Guide

## Overview
CyberStudy is a comprehensive study management application designed for cybersecurity learners. It helps you plan lessons, track study sessions, analyze progress, and stay on top of your goals with cross-device sync via Firebase.

## Prerequisites
- Node.js v16 or higher
- npm or yarn
- A Google account for Firebase

## Firebase Configuration Steps

### 1. Create a Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "CyberStudy")
4. Follow the setup wizard (you can disable Google Analytics if not needed)

### 2. Enable Authentication
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### 3. Create Firestore Database
1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Start in **test mode** (you can update rules later for production)
4. Choose a location closest to your users
5. Click "Enable"

### 4. Set Up Firestore Security Rules
Replace the default rules with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Lessons collection
    match /lessons/{lessonId} {
      allow read, write: if isOwner(resource.data.userId);
      allow create: if isOwner(request.resource.data.userId);
    }
    
    // Study sessions collection
    match /studySessions/{sessionId} {
      allow read, write: if isOwner(resource.data.userId);
      allow create: if isOwner(request.resource.data.userId);
    }
    
    // Goals collection
    match /goals/{goalId} {
      allow read, write: if isOwner(resource.data.userId);
      allow create: if isOwner(request.resource.data.userId);
    }
  }
}
```

### 5. Get Your Firebase Configuration
1. Go to Project Settings (gear icon next to "Project Overview")
2. Scroll down to "Your apps" section
3. Click the Web icon (</>)
4. Register your app with a nickname (e.g., "CyberStudy Web")
5. Copy the Firebase configuration object

### 6. Configure Environment Variables
1. In the project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Firebase configuration values:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### 7. Install and Run
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Features Demonstration

### Authentication
- Sign up with email and password
- Sign in to access your dashboard
- Secure authentication via Firebase Auth

### Lesson Management
- Create lessons with title, description, category
- Set difficulty level (beginner, intermediate, advanced)
- Specify duration in minutes
- Mark lessons as completed
- Delete lessons when no longer needed

### Study Session Tracking
- Log study sessions for any lesson
- Record duration and notes
- View recent study history
- Track total study time

### Goal Management
- Set learning goals with target dates
- Track progress (0-100%)
- See days remaining until deadline
- Mark goals as complete
- Update progress incrementally

### Progress Dashboard
- View completion statistics
- Monitor current study streak
- See total study time
- Analyze study time by category
- Review recent activity
- Get personalized tips

## Data Structure

### Lessons Collection
```typescript
{
  id: string
  userId: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // minutes
  completed: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Study Sessions Collection
```typescript
{
  id: string
  userId: string
  lessonId: string
  lessonTitle: string
  startTime: Timestamp
  endTime: Timestamp
  duration: number // minutes
  notes: string
  createdAt: Timestamp
}
```

### Goals Collection
```typescript
{
  id: string
  userId: string
  title: string
  description: string
  targetDate: Timestamp
  completed: boolean
  progress: number // 0-100
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## Security Considerations

1. **Never commit your `.env` file** - It's already in `.gitignore`
2. **Use Firestore security rules** - The provided rules ensure users can only access their own data
3. **For production**:
   - Set up proper Firebase project quota limits
   - Enable App Check to prevent unauthorized access
   - Monitor usage in Firebase Console
   - Consider implementing rate limiting

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure your `.env` file exists and has correct values
- Restart the dev server after creating/modifying `.env`

### "Missing or insufficient permissions"
- Check Firestore security rules are properly set
- Ensure you're signed in
- Verify the userId matches in the data

### Cannot sign up/sign in
- Verify Email/Password auth is enabled in Firebase Console
- Check browser console for specific error messages
- Ensure your Firebase project is active

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [React + Firebase Guide](https://firebase.google.com/docs/web/setup)

## Support

For issues or questions:
1. Check the Firebase Console for error logs
2. Review browser console for client-side errors
3. Ensure all environment variables are correctly set
4. Verify Firebase project configuration
