# Firestore Collection Structure

This document outlines the Firestore database schema for CyberStudyApp.

## Collections Overview

### 1. `users` Collection
Stores user profile information and preferences.

```
/users/{uid}
├── email: string
├── displayName: string
├── photoURL: string (optional)
├── createdAt: timestamp
├── updatedAt: timestamp
├── preferences: object
│   ├── darkMode: boolean
│   ├── notificationsEnabled: boolean
│   └── timezone: string (default: "UTC")
└── stats: object
    ├── totalEntries: number
    ├── totalGoals: number
    ├── completedGoals: number
    ├── currentStreak: number
    ├── maxStreak: number
    └── totalStudyHours: number
```

### 2. `entries` Collection
Stores study entries (tracker data).

```
/entries/{uid}/data/{entryId}
├── id: string (timestamp)
├── userId: string
├── week: string
├── topic: string
├── goal: string
├── status: string (✅ Completed | 🟡 In Progress | ❌ Not Started | 🔄 Review Needed)
├── notes: string (optional)
├── createdAt: timestamp
├── updatedAt: timestamp
├── tags: array (optional)
└── completedAt: timestamp (optional)
```

### 3. `goals` Collection
Stores study goals and milestones.

```
/goals/{uid}/data/{goalId}
├── id: string (timestamp)
├── userId: string
├── title: string
├── description: string (optional)
├── category: string (General | Network | Cryptography | Web Security | Ethics)
├── targetValue: number (e.g., 10 entries)
├── currentValue: number
├── frequency: string (Weekly | Monthly)
├── status: string (Active | Completed | Archived)
├── createdAt: timestamp
├── updatedAt: timestamp
├── completedAt: timestamp (optional)
├── reward: string (optional badge name)
└── isCompleted: boolean
```

### 4. `timerSessions` Collection
Stores Pomodoro timer session history.

```
/timerSessions/{uid}/data/{sessionId}
├── id: string (timestamp)
├── userId: string
├── duration: number (in minutes)
├── type: string (work | break)
├── topic: string (optional - what was studied)
├── completed: boolean
├── createdAt: timestamp
└── completedAt: timestamp (optional)
```

### 5. `streaks` Collection
Stores streak tracking data.

```
/streaks/{uid}/data/current
├── userId: string
├── currentStreak: number
├── maxStreak: number
├── lastActivityDate: timestamp
├── startDate: timestamp
└── updatedAt: timestamp
```

### 6. `badges` Collection
Stores user achievement badges.

```
/badges/{uid}/data/{badgeId}
├── id: string
├── userId: string
├── type: string (Goal Master | Weekly Champion | Consistent Learner | Subject Matter Expert)
├── title: string
├── description: string
├── unlockedAt: timestamp
├── progress: number (0-100)
└── requirements: object
    ├── requirementType: string
    └── targetValue: number
```

## Security Rules

```javascript
// Firestore Rules (in Firebase Console)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own documents
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      
      match /data/{document=**} {
        allow read, write: if request.auth.uid == uid;
      }
    }
    
    // Entries
    match /entries/{uid}/data/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Goals
    match /goals/{uid}/data/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Timer Sessions
    match /timerSessions/{uid}/data/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Streaks
    match /streaks/{uid}/data/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Badges
    match /badges/{uid}/data/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

## Implementation in Firebase Console

1. **Create Collections**: Go to Firestore Database → Start Collection
   - Create: `users`, `entries`, `goals`, `timerSessions`, `streaks`, `badges`

2. **Set Security Rules**:
   - Go to Firestore → Rules
   - Replace default rules with the rules above
   - Click "Publish"

3. **Create Indexes** (if needed):
   - Firestore will suggest composite indexes when you run complex queries
   - Follow prompts to create them

## Notes

- All timestamps use `serverTimestamp()` for consistency
- User documents are organized with `/users/{uid}/data/{documentId}` pattern
- Security rules ensure users can only access their own data
- Offline persistence is enabled in `firebaseConfig.js`
