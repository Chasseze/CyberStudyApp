# Stage 5.5: User Profile & Account Management

## Overview
Stage 5.5 implements comprehensive user profile, settings, and account management features. This stage provides users with full control over their account, data, preferences, and security settings.

## Components Created

### 1. UserProfilePanel.jsx
**Purpose**: User profile display, editing, and account overview

**Features**:
- Profile header with user avatar and info
- Edit profile functionality (display name)
- Theme preference management
- Notification settings toggle
- Dark mode toggle
- Data export to JSON
- Data import from JSON
- Account deletion with confirmation
- Sign out functionality

**Key Functions**:
```jsx
// Profile editing
handleInputChange(e)
handlePreferenceChange(key, value)
handleSaveProfile()

// Data management
handleExportData()
handleImportData(e)
handleDeleteAccount()

// UI helpers
showNotification(message, type)
```

**State Management**:
```jsx
const [profile, setProfile] = useState(null)
const [editing, setEditing] = useState(false)
const [formData, setFormData] = useState({
  displayName: '',
  email: '',
  preferences: {
    darkMode: false,
    notificationsEnabled: true,
    timezone: 'UTC'
  }
})
const [notification, setNotification] = useState(null)
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
```

**Styling**:
- Gradient header with indigo/purple theme
- Card-based layout with 2xl rounded borders
- Dark/light mode fully supported
- Responsive design with max-w-2xl container
- Danger zone with red accent colors

---

### 2. UserSettingsPanel.jsx
**Purpose**: Comprehensive preferences and settings management

**Features**:
- **Notifications**: Enable/disable notifications, sound, Pomodoro reminders
- **Display Settings**:
  - Dark mode toggle
  - Font size selector (small, normal, large)
  - Color theme selector (indigo, purple, blue, green)
- **Study Settings**:
  - Pomodoro work duration (5-60 minutes, 5-min intervals)
  - Pomodoro break duration (1-30 minutes)
  - Auto-start break option
  - Auto-start work option
- **Privacy & Data**:
  - Analytics toggle
  - Statistics sharing toggle
- **Accessibility**:
  - High contrast mode placeholder
  - Reduced motion placeholder
  - Screen reader optimization placeholder

**Key Functions**:
```jsx
// Settings management
handleSettingChange(category, key, value)
handleSaveSettings()
handleResetToDefaults()
handleDarkModeChange(newDarkMode)
handleThemeChange(theme)

// UI helpers
showNotification(message, type)
```

**State Management**:
```jsx
const [formData, setFormData] = useState({
  notifications: {
    enabled: true,
    sound: true,
    desktop: true,
    pomodoroReminder: true
  },
  display: {
    darkMode: false,
    compactView: false,
    animationsEnabled: true,
    fontSize: 'normal',
    theme: 'indigo'
  },
  study: {
    pomodoroWorkDuration: 25,
    pomodoroBreakDuration: 5,
    autoStartBreak: false,
    autoStartWork: false
  },
  privacy: {
    shareStats: false,
    dataCollection: false,
    analyticsEnabled: true
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false
  }
})
const [hasChanges, setHasChanges] = useState(false)
```

**Styling**:
- Gradient header with purple/indigo theme
- Range sliders for duration inputs
- Color palette buttons for theme selection
- Toggle buttons with green/gray states
- Max-w-4xl responsive container

---

### 3. DataManagementPanel.jsx
**Purpose**: Data backup, restore, migration, and analytics

**Features**:
- **Data Statistics**:
  - Total entries, goals, and sessions count
  - Total study hours
  - Completed entries and goals
  - Last backup timestamp
  - Backup file size

- **Backup & Export**:
  - Selective export (entries, goals, sessions)
  - Include metadata option
  - One-click export to JSON
  - Timestamp-based filenames
  - Local backup timestamp tracking

- **Restore & Import**:
  - Import from JSON backup file
  - Migrate from localStorage to Firestore
  - Progress indicator with status updates
  - Validation of backup file format

- **Data Analytics**:
  - Completion rates
  - Study time tracking
  - Entry statistics

**Key Functions**:
```jsx
// Statistics
loadStats()
calculateSize(entries, goals, sessions)

// Export/Import
handleExportData()
handleImportData(e)
handleMigrateFromLocalStorage()
handleClearAllData()

// UI helpers
showNotification(message, type)
```

**State Management**:
```jsx
const [stats, setStats] = useState(null)
const [exportOptions, setExportOptions] = useState({
  entries: true,
  goals: true,
  sessions: true,
  includeMetadata: true
})
const [importProgress, setImportProgress] = useState(null)
const [notification, setNotification] = useState(null)
```

**Import Progress States**:
- 0%: Starting migration
- 25%: Validating backup
- 50%: Importing goals
- 75%: Importing sessions
- 100%: Finalizing

**Styling**:
- Gradient header with blue/cyan theme
- Statistics cards in grid layout
- Progress bar with blue gradient
- File input hidden with button trigger
- Storage info box with alert styling

---

### 4. AccountManagementPanel.jsx
**Purpose**: Account security, password management, and account deletion

**Features**:
- **Account Information**:
  - Email display (read-only)
  - Account creation date
  - Last sign-in timestamp

- **Password Management**:
  - Current password verification
  - New password input with validation
  - Password confirmation
  - Password visibility toggles
  - Password security tips

  **Validation Rules**:
  - Minimum 8 characters
  - Must differ from current password
  - Passwords must match
  - Current password must be correct

- **Account Deletion**:
  - Two-step confirmation process
  - Email verification
  - Password verification
  - Irreversible action warning
  - Data loss confirmation checkbox

**Security Features**:
- Firebase reauthentication required
- Password validation before changes
- Clear error messages for failed auth
- Secure credential handling

**Key Functions**:
```jsx
// Password management
validatePasswordForm()
handleChangePassword()
handlePasswordInputChange(field, value)

// Account deletion
validateDeleteForm()
handleDeleteAccount()
handleDeleteInputChange(field, value)

// UI helpers
showNotification(message, type)
```

**State Management**:
```jsx
const [passwordForm, setPasswordForm] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  showCurrent: false,
  showNew: false,
  showConfirm: false
})
const [deleteForm, setDeleteForm] = useState({
  email: '',
  password: '',
  confirmDelete: false,
  showPassword: false
})
const [notification, setNotification] = useState(null)
```

**Styling**:
- Gradient header with green/emerald theme
- Delete section with red warning colors
- Password input fields with eye toggle
- Security tips box with blue background
- Max-w-4xl responsive container

---

## Integration Points

### CyberTrackerAppWithAuth.jsx Updates Needed
Add profile management to the main app:

```jsx
// Add new tab for profile
const [activeTab, setActiveTab] = useState('tracker') // Add 'profile' option

// Conditionally render profile component
{activeTab === 'profile' && (
  <UserProfilePanel
    darkMode={darkMode}
    onDarkModeChange={onDarkModeChange}
    entries={entries}
    goals={goals}
    timerSessions={timerSessions}
    onLogout={handleLogout}
  />
)}
```

### AuthService.jsx Enhancements
```jsx
// Already implemented:
- getUserProfile(uid)
- updateUserProfile(uid, data)
- deleteUserAccount(uid)

// Can be enhanced with:
- updateUserSettings(uid, settings)
- exportUserData(uid)
- importUserData(uid, data)
```

### FirestoreService.js Integration
```jsx
// Existing functions to leverage:
- migrateLocalStorageToFirestore(uid, data)
- All CRUD operations for entries, goals, sessions

// Data structures support:
- users/{uid}/profile document
- users/{uid}/settings document
- Batch export/import operations
```

---

## Usage Examples

### 1. Using UserProfilePanel
```jsx
import UserProfilePanel from './UserProfilePanel';

<UserProfilePanel
  darkMode={darkMode}
  onDarkModeChange={setDarkMode}
  entries={entries}
  goals={goals}
  timerSessions={timerSessions}
  onLogout={handleLogout}
/>
```

### 2. Using UserSettingsPanel
```jsx
import UserSettingsPanel from './UserSettingsPanel';

<UserSettingsPanel
  darkMode={darkMode}
  onDarkModeChange={setDarkMode}
  onThemeChange={handleThemeChange}
/>
```

### 3. Using DataManagementPanel
```jsx
import DataManagementPanel from './DataManagementPanel';

<DataManagementPanel
  darkMode={darkMode}
  entries={entries}
  goals={goals}
  timerSessions={timerSessions}
/>
```

### 4. Using AccountManagementPanel
```jsx
import AccountManagementPanel from './AccountManagementPanel';

<AccountManagementPanel
  darkMode={darkMode}
  onLogout={handleLogout}
/>
```

---

## Data Backup Format

### Export JSON Structure
```json
{
  "version": 1,
  "exportDate": "2024-01-15T10:30:00Z",
  "user": {
    "uid": "user_id_123",
    "email": "user@example.com"
  },
  "data": {
    "entries": [
      {
        "id": 1705315800000,
        "week": "1",
        "topic": "Network Security",
        "goal": "Learn firewalls",
        "status": "✅ Completed",
        "notes": "Optional notes",
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ],
    "goals": [
      {
        "id": 1705315800001,
        "title": "Weekly Goal",
        "description": "Complete 5 study sessions",
        "category": "General",
        "status": "in-progress",
        "progress": 60,
        "dueDate": "2024-01-20"
      }
    ],
    "sessions": [
      {
        "id": 1705315800002,
        "type": "pomodoro",
        "duration": 1500,
        "completedAt": "2024-01-15T10:00:00Z"
      }
    ]
  },
  "metadata": {
    "totalEntries": 25,
    "totalGoals": 8,
    "totalSessions": 142,
    "exportedAt": "1/15/2024, 10:30:00 AM"
  }
}
```

---

## Error Handling

### Common Error Scenarios

1. **Password Change Errors**:
   - `auth/wrong-password`: Current password incorrect
   - `auth/weak-password`: New password doesn't meet requirements
   - `auth/requires-recent-login`: Reauthentication needed

2. **Account Deletion Errors**:
   - `auth/wrong-password`: Password verification failed
   - `auth/user-not-found`: User no longer exists

3. **Data Import Errors**:
   - Invalid JSON format
   - Corrupted backup file
   - Missing required fields

---

## Security Considerations

1. **Password Requirements**:
   - Minimum 8 characters
   - Case-sensitive validation
   - Firebase built-in validation

2. **Reauthentication**:
   - Required for password changes
   - Required for account deletion
   - Prevents unauthorized access

3. **Data Export**:
   - Contains personal study data
   - Should be stored securely
   - Consider encryption for sensitive backups

4. **Account Deletion**:
   - Two-step confirmation
   - Requires password verification
   - Should trigger Cloud Function for complete cleanup

---

## Testing Checklist

- [ ] Profile editing saves to Firestore
- [ ] Settings persist across sessions
- [ ] Dark mode toggle applies instantly
- [ ] Data export creates valid JSON
- [ ] Data import restores all records
- [ ] Password change requires reauthentication
- [ ] Password validation enforces all rules
- [ ] Account deletion shows confirmation
- [ ] Notifications display correctly
- [ ] All forms validate input
- [ ] Error messages are clear and helpful
- [ ] Responsive design works on mobile
- [ ] Dark/light mode fully supported

---

## Future Enhancements

1. **Two-Factor Authentication (2FA)**:
   - Email-based verification
   - Authenticator app support

2. **Profile Customization**:
   - Profile photo upload
   - Bio/description field
   - Preferred study topics

3. **Advanced Privacy**:
   - Session history
   - Login activity log
   - Device management

4. **Integration**:
   - Calendar sync (Google Calendar)
   - Email notifications
   - Slack notifications

5. **Data Analytics**:
   - Study statistics dashboard
   - Progress charts
   - Performance metrics

---

## File Sizes

- UserProfilePanel.jsx: ~450 lines
- UserSettingsPanel.jsx: ~550 lines
- DataManagementPanel.jsx: ~600 lines
- AccountManagementPanel.jsx: ~550 lines
- **Total: ~2,150 lines of new code**

---

## Related Files

- `authService.js` - Authentication operations
- `firestoreService.js` - Database operations
- `AuthContext.jsx` - Authentication state
- `CyberTrackerAppWithAuth.jsx` - Main app wrapper
- `firebaseConfig.js` - Firebase configuration

---

## Next Steps

1. Integrate components into CyberTrackerAppWithAuth.jsx
2. Add profile tab to main navigation
3. Create profile routes/navigation
4. Add theme switcher functionality
5. Implement Cloud Functions for account deletion
6. Add email verification for security-sensitive actions
7. Create user activity logs
8. Implement 2FA support

---

## Changelog

### Version 1.0 (Initial Release)
- ✅ User profile display and editing
- ✅ Settings and preferences panel
- ✅ Data backup and restore
- ✅ Account security management
- ✅ Password change functionality
- ✅ Account deletion workflow
- ✅ Data export/import support
- ✅ Dark/light mode integration

