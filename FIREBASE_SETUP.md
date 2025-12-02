# Stage 5.1: Firebase Setup Guide

## Installation Complete ✓

Firebase SDK has been installed and configured. Now you need to add your Firebase credentials.

## Steps to Set Up Firebase:

### 1. Create a Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Click "Add project"
- Enter project name (e.g., "CyberStudyApp")
- Click "Create project"

### 2. Enable Authentication
- In Firebase Console, go to **Authentication** (left menu)
- Click **Get Started**
- Click **Email/Password** provider
- Enable it
- Save

### 3. Create Firestore Database
- In Firebase Console, go to **Firestore Database** (left menu)
- Click **Create Database**
- Select region (closest to your location)
- Choose **Start in test mode** (for development)
- Click **Create**

### 4. Get Your Firebase Config
- In Firebase Console, click **Project Settings** (gear icon, top-left)
- Under "Your apps", click the **Web** icon (</> symbol)
- Copy the entire `firebaseConfig` object

### 5. Add Credentials to Your App
- Copy `.env.example` to `.env.local`:
  ```bash
  cp .env.example .env.local
  ```
- Open `.env.local` and replace the placeholder values with your Firebase config:
  ```
  VITE_FIREBASE_API_KEY=your_actual_api_key
  VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=your_project_id
  VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
  VITE_FIREBASE_APP_ID=your_app_id
  ```

### 6. Restart Dev Server
```bash
npm run dev
```

## Files Created:

- **`firebaseConfig.js`** - Firebase initialization and configuration
- **`.env.example`** - Template for environment variables
- **`.env.local`** - Your actual credentials (DO NOT commit this file)

## What's Next (Stage 5.2):

Once you've set up your Firebase credentials, we'll:
1. Design Firestore collection structure
2. Set up Firebase Authentication in the app
3. Create auth state management
4. Add login/signup UI

## Security Notes:

⚠️ **Never commit `.env.local` to Git** - it contains sensitive credentials
- `.env.local` is already in `.gitignore` (if it exists)
- Always use environment variables for sensitive data
- In production, use Firebase security rules to protect your data

## Testing Connection:

After setting up credentials, check browser console (F12) for any Firebase errors.
If no errors appear, your Firebase connection is working!
