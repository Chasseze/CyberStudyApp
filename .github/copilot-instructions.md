# Cybersecurity Study Tracker - AI Agent Instructions

## Project Overview
This is a single-page React application for tracking cybersecurity study progress. The entire application is contained in `CyberTrackerR.jsx` and uses no external dependencies beyond React and the Lucide icon library.

## Architecture
- **Single Component App**: All functionality is contained in the main `App` component
- **Local Storage Persistence**: Study entries are automatically saved to browser localStorage
- **No Backend/Database**: This is a client-side only application
- **No Build System**: The project appears to be a standalone React component (no package.json found)

## Key Patterns & Conventions

### State Management
- Uses `useState` for form data, entries list, sorting, filtering, and loading states
- Dual `useEffect` hooks handle localStorage read/write operations
- Entry objects include: `id`, `week`, `topic`, `goal`, `status`, `notes`, `createdAt`

### Data Flow
```jsx
// Entry structure
{
  id: Date.now(),
  week: "1",
  topic: "Network Security", 
  goal: "Learn firewalls",
  status: "✅ Completed", // or "🟡 In Progress", "❌ Not Started", "🔄 Review Needed"
  notes: "Optional notes...",
  createdAt: new Date().toISOString()
}
```

### Status System
The app uses emoji-prefixed status values:
- `✅ Completed`
- `🟡 In Progress` 
- `❌ Not Started`
- `🔄 Review Needed`

Status icons are mapped via `getStatusIcon()` function using Lucide React icons.

### Styling Approach
- **Tailwind CSS**: Extensive use of utility classes
- **Gradient-heavy design**: Multiple gradient backgrounds (indigo/purple/pink theme)
- **Card-based layout**: All sections use rounded white cards with shadows
- **Responsive design**: Grid layouts adapt from mobile to desktop
- **Hover effects**: Transform animations and shadow changes

### Form Handling
- Controlled components with single `handleChange` function
- Form validation requires `week`, `topic`, and `goal` fields
- Loading state simulation (300ms timeout) for better UX
- Form resets after successful submission

### Data Operations
- **Add**: Validates required fields, generates timestamp-based ID
- **Delete**: Uses `window.confirm()` for confirmation
- **Sort**: By week (newest first, default), topic (alphabetical), or status
- **Filter**: By status value or show all

### Component Features
- Real-time statistics calculation (completion rate, status counts)
- Progress bar visualization
- Responsive grid layouts (1-4 columns based on screen size)
- Accessible form labels with icons
- Optimistic loading states

## Development Guidelines

### When Adding Features
- Keep everything in the single component unless complexity demands splitting
- Maintain the emoji + text status pattern for consistency
- Use Tailwind gradient classes following the indigo/purple/pink theme
- Add proper form validation for new fields
- Update localStorage save/load logic for new data structures

### UI/UX Patterns
- Use Lucide icons consistently (already imported: BookOpen, Plus, Trash2, etc.)
- Follow the card-based layout with `rounded-2xl` and `shadow-xl`
- Implement hover states with `transform` and `shadow` changes
- Use gradient backgrounds for headers and primary actions
- Maintain responsive grid patterns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

### Data Handling
- Always update localStorage when entries state changes
- Use `Date.now()` for unique IDs (timestamp-based)
- Include `createdAt` ISO string for new entries
- Implement confirmation dialogs for destructive actions

### Performance Considerations
- The app stores everything in browser localStorage (size limitations apply)
- No pagination implemented - consider for large datasets
- All filtering/sorting happens client-side in memory