# CyberStudy App

Master your cybersecurity journey with CyberStudy - a comprehensive study management application.

## Features

- **Lesson Planning**: Organize and plan your cybersecurity lessons with categories, difficulty levels, and durations
- **Study Session Tracking**: Log and track your study sessions with detailed notes
- **Progress Analysis**: Visualize your learning progress with comprehensive statistics and charts
- **Goal Management**: Set and track goals with progress indicators and deadlines
- **Firebase Integration**: All your data syncs across devices using Firebase Firestore
- **Authentication**: Secure sign-in and sign-up with Firebase Authentication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Firebase project (see setup instructions below)

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication (Email/Password provider)
4. Create a Firestore database
5. Copy your Firebase configuration from Project Settings
6. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

7. Update the `.env` file with your Firebase configuration values

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Usage

1. **Sign Up**: Create a new account with your email and password
2. **Add Lessons**: Click "Add Lesson" to create study topics with categories and difficulty levels
3. **Log Sessions**: Track your study time by logging sessions for specific lessons
4. **Set Goals**: Create goals with target dates and track progress
5. **View Progress**: Check your statistics, streaks, and study time distribution

## Project Structure

```
src/
├── components/         # React components
│   ├── LessonList.tsx
│   ├── StudySessions.tsx
│   ├── GoalManager.tsx
│   └── ProgressDashboard.tsx
├── contexts/          # React contexts
│   └── AuthContext.tsx
├── pages/             # Page components
│   ├── Login.tsx
│   ├── Signup.tsx
│   └── Dashboard.tsx
├── styles/            # CSS files
│   ├── Auth.css
│   └── Dashboard.css
├── firebase.ts        # Firebase configuration
├── types.ts           # TypeScript type definitions
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## Technologies Used

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Firebase**: Authentication and database
- **React Router**: Client-side routing

## Security

- All authentication is handled by Firebase Auth
- Firestore security rules should be configured to protect user data
- Environment variables are used to store sensitive Firebase configuration

## License

This project is open source and available under the MIT License.
