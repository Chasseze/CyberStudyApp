# Quick Reference Guide - Cybersecurity Study Tracker

## 🚀 Quick Start

### Start the App
```bash
cd /Users/charleseze/CyberStudyApp
npm run dev
```
Then open: http://localhost:5174/

### Build for Production
```bash
npm run build
```

---

## 🔐 Authentication

### Create Account (Sign-Up)
1. Select "Password" tab
2. Click "Sign Up" 
3. Fill: Email, Username, Password (6+ chars), Confirm Password
4. Click "Sign Up"
5. ✅ Auto-logged in!

### Login with Email/Password
1. Select "Password" tab (default)
2. Click "Login" (default)
3. Enter Email & Password
4. Click "Login"
5. ✅ Welcome back!

### Passwordless Token Login
1. Select "Token" tab
2. Enter your registered email
3. Click "Send Token"
4. Copy token from browser console (📧 TOKEN SENT TO...)
5. Paste 6-digit token in input
6. Click "Verify Token"
7. ✅ Access granted!

### Logout
Click red logout button in header → Back to auth screen

---

## 📚 Study Entries

### Add Entry
1. Fill: **Week**, **Topic**, **Goal** (required)
2. Optional: Status, Notes, Time Spent
3. Click "Add Entry"

### Edit Entry
1. Click edit button on entry card
2. Form loads with entry data
3. Make changes
4. Click "Update Entry"

### Delete Entry
1. Click delete button (trash icon)
2. Confirm deletion
3. Entry removed

### Search
Type in search box → filters by topic, notes, goal

### Filter
Use Status dropdown → Shows only selected status

### Sort
Use Sort dropdown → Week, Topic, or Status

---

## 📊 Status Types

| Status | Meaning |
|--------|---------|
| ✅ Completed | Topic studied and completed |
| 🟡 In Progress | Currently studying |
| ❌ Not Started | Haven't started yet |
| 🔄 Review Needed | Need to review material |

---

## 💾 Data

### Export Data
1. Click "Export Data" button
2. JSON file downloads with today's date
3. Save for backup

### Import Data
1. Click "Import Data" button
2. Select JSON file
3. Data loads into app

### Clear All Data
1. Click "Clear All Data" button
2. Confirm deletion
3. All entries removed

---

## 🎨 UI Features

### Dark Mode
Click moon/sun icon in header to toggle dark mode

### Time Tracking
Enter hours studied in "Time Spent" field → Auto-calculates total

### Statistics
Live dashboard shows:
- Completion rate %
- Count by status
- Total hours studied

---

## 💡 Tips & Tricks

### Demo Token Flow
1. No actual emails sent
2. Token appears in browser console
3. Demo: Use "test@example.com" → Create account → Request token → See token in console

### Session Persistence
- Refresh page? You stay logged in!
- Logout? Session clears
- Data saved? Always in browser storage

### Multiple Accounts
- Create different accounts with different emails
- Each account has separate study entries
- Switch by logging out and logging in

### Backup Data
- Click "Export Data" regularly
- Stores as JSON file
- Import anytime to restore

### Search Tips
- Search is case-insensitive
- Searches topic, notes, and goals
- Combine with filters for specific views

---

## ⚙️ Status Codes

| Code | Meaning |
|------|---------|
| ✅ 200 | Sign-up/login successful |
| ❌ 401 | Invalid credentials |
| ⚠️ 400 | Validation error (check error message) |
| 📧 403 | Email already registered |
| 🔒 422 | Password requirements not met |

---

## 🔍 Troubleshooting

### "Password must be at least 6 characters"
→ Enter password with 6+ characters

### "Passwords do not match"
→ Make sure confirm password matches password

### "Email already registered"
→ Use different email or login with existing account

### "Invalid email or password"
→ Check spelling and caps lock

### "Invalid token"
→ Copy token from console (📧 TOKEN SENT TO...) not typed manually

### "Please fill in all fields"
→ Week, Topic, and Goal are required

### Data not saving?
→ Check browser localStorage is enabled (not in private mode)

### Token not showing in console?
→ Open Developer Tools (F12) → Console tab → Try again

---

## 🎯 Common Workflows

### Daily Study Log
1. Add entry with today's topic
2. Set status to 🟡 In Progress
3. Later: Update status to ✅ Completed
4. Log time spent

### Review Management
1. Filter by 🔄 Review Needed
2. Update status to 🟡 In Progress
3. Complete review
4. Change to ✅ Completed

### End of Week Report
1. Click Statistics section
2. Check completion rate
3. Export data
4. Share with mentor/teacher

### Backup & Restore
1. Export data (weekly)
2. Move file to cloud storage
3. If needed: Import file to restore

---

## 📱 Device Support

| Device | Status |
|--------|--------|
| Desktop (1920x1080) | ✅ Full support |
| Tablet (768px) | ✅ Full support |
| Mobile (375px) | ✅ Full support |
| Dark mode | ✅ All devices |

---

## 🔐 Security Reminders

⚠️ **Demo Version** (Not for real sensitive data):
- Passwords stored plaintext
- Tokens sent via console
- localStorage not encrypted
- Single browser instance

✅ **For Production Use**:
- Use HTTPS only
- Hash passwords with bcrypt
- Implement real email service
- Use secure cookies
- Add rate limiting
- Regular security updates

---

## 📞 Need Help?

### Check These First:
1. **AUTH_SYSTEM_COMPLETE.md** - Detailed authentication docs
2. **IMPLEMENTATION_SUMMARY.md** - Full feature documentation
3. **Browser Console** - Token appears here (F12)
4. **Error Messages** - Read what the app tells you

### Common Checks:
- [ ] localStorage enabled?
- [ ] JavaScript enabled?
- [ ] Using modern browser (Chrome, Firefox, Safari, Edge)?
- [ ] Port 5174 not blocked?
- [ ] No private/incognito mode?

---

## 🎉 You're Ready!

Your Cybersecurity Study Tracker is fully set up and ready to use.

**Start by**: Creating an account → Adding study entries → Tracking progress!

Happy studying! 🚀

---

**Quick Links**:
- 🏠 [Home](http://localhost:5174/)
- 📖 [Full Documentation](./AUTH_SYSTEM_COMPLETE.md)
- 📊 [Implementation Details](./IMPLEMENTATION_SUMMARY.md)
- 💻 [Source Code](./CyberTrackerR.jsx)
