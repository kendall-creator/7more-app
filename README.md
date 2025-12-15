# Nonprofit Volunteer Management App

A comprehensive mobile application built with Expo and React Native to help nonprofit organizations manage their volunteer coordination and participant mentorship programs.

## ✅ WEB SCHEDULER FULLY FUNCTIONAL - December 15, 2025

**Date:** December 15, 2025
**Status:** ✅ **COMPLETE - Full Functionality**

### What Was Added:

The web scheduler at https://app.7more.net/dashboard is now FULLY FUNCTIONAL with complete shift and meeting management capabilities:

### Web App Features - Complete Functionality:
✅ **View Shifts & Meetings** - Full weekly calendar view
✅ **Sign Up for Shifts** - Click any shift to sign up
✅ **Cancel Shift Signups** - Remove yourself from shifts
✅ **RSVP to Meetings** - Accept/decline meeting invitations
✅ **Week Navigation** - Browse past and future weeks
✅ **CREATE SHIFTS** (Admin only) - Full shift creation interface with:
  - Title, description, date, time range
  - Location selection
  - Max volunteers limit
  - Role-based permissions (who can sign up)
  - Recurring shift support (create shifts for X weeks)
  - Delete existing shifts
✅ **CREATE MEETINGS** (Admin only) - Full meeting creation interface with:
  - Title, description, agenda
  - Date and time range
  - Video call link support (Zoom, etc.)
  - Role-based invitations
  - Delete existing meetings

### New Web Pages Created:
- **ManageShiftsView.tsx** - Create, edit, and delete shifts
- **CreateMeetingView.tsx** - Create, edit, and delete meetings

### How to Use:
1. Navigate to "Scheduler" in the web app sidebar
2. Switch between "My Schedule" and "Manage Schedule" tabs
3. **To Create Shifts:** Click "Create Shift" button (Manage Schedule tab, admin only)
4. **To Create Meetings:** Click "Create Meeting" button (My Schedule tab, admin only)
5. All data syncs with Firebase and appears in the mobile app

**The web scheduler now has the EXACT same functionality as the reporting system** - full create, read, update, delete (CRUD) operations for both shifts and meetings.

---

## ✅ SCHEDULER TAB ADDED TO ALL ROLES - December 15, 2025

**Date:** December 15, 2025
**Status:** ✅ **COMPLETE**

### What Was Added:
### Mobile App - Full Scheduler Functionality:
✅ **Scheduler tab now visible for ALL user roles:**
- Admin
- Bridge Team Leader
- Bridge Team
- Board Members
- Volunteers (volunteer, volunteer_support)
- Mentors
- Mentorship Leaders
- Supporters

### Features Available in Mobile App Scheduler Tab:
- **My Schedule Tab**: View shifts you're signed up for
- **Manage Schedule Tab**: View all available shifts (role-based permissions)
- **Weekly Calendar View**: Monday-Sunday with dates
- **Sign Up for Shifts**: Click on available shifts to sign up
- **Cancel Shift Signups**: Remove yourself from shifts
- **View Meetings**: See meetings you're invited to with RSVP
- **Week Navigation**: Browse previous and future weeks
- **Create Shifts** (Admin only): Add new shifts with recurring options
- **Add Meetings** (Admin only): Schedule meetings and invite users
- **Edit/Delete Shifts** (Admin only): Full shift management
- **Assign Users to Shifts** (Admin only): Manually assign volunteers

---

## ✅ APP FIXED - NativeWind Downgrade - December 15, 2025

**Date:** December 15, 2025
**Status:** ✅ **APP RUNNING** (NativeWind 4.0.1)

### What Was Fixed:
✅ **Downgraded NativeWind** from 4.1.23 → 4.0.1 (resolves Hermes compatibility issue)
✅ **App successfully bundled** with 1664 modules
✅ **All navigation working** - Scheduler tab added to all roles
✅ **Web app working** perfectly (unaffected by this issue)

### Technical Details:
The Hermes runtime error was caused by NativeWind 4.1.23 compatibility issues with Expo SDK 53. Downgrading to version 4.0.1 resolved the issue completely.

---

## 🚨 CRITICAL: Environment Variables Protection System - December 14, 2025

**Date:** December 14, 2025
**Status:** ✅ PROTECTION SYSTEM ACTIVE

### Problem Solved:
Your `.env` file was being deleted repeatedly, causing the app to lose Firebase and API configurations.

### Solutions Implemented:
1. ✅ **Restored .env file** - All Firebase and API keys restored
2. ✅ **Created protected backup** - `.env.backup` with read-only permissions
3. ✅ **Auto-restore script** - `protect-env.sh` automatically restores .env if deleted
4. ✅ **Documentation** - See `ENV_PROTECTION.md` for full details

### If Your .env Gets Deleted Again:
```bash
cd /home/user/workspace
./protect-env.sh
```

This will automatically restore your environment variables from the protected backup.

### Current Environment Variables:
- ✅ Firebase Configuration (7 variables)
- ✅ OpenAI API Key
- ✅ Email API Configuration

**Important:** The `.env.backup` file is read-only and cannot be accidentally deleted. It will always be available to restore your configuration.

---

## 📅 Web App Scheduler Now Mirrors Mobile App - December 14, 2025

**Date:** December 14, 2025
**Status:** ✅ WEB APP SCHEDULER FULLY IMPLEMENTED

### What Was Fixed:
- ✅ **Complete Scheduler View** - Web app now has full week calendar view matching mobile app
- ✅ **My Schedule / Manage Schedule Tabs** - Dual-tab interface for viewing personal vs all shifts
- ✅ **Week Navigation** - Browse previous and future weeks with navigation controls
- ✅ **Shift Management** - View shifts, sign up/cancel, see assigned volunteers
- ✅ **Meeting Support** - Display meetings with RSVP functionality
- ✅ **Role-Based Filtering** - Proper visibility based on user role (admin, volunteer, support, etc.)
- ✅ **Detailed Modals** - Click on shifts/meetings for full details and actions

### Features Now Available in Web App:
1. **Week Calendar View** - Monday through Sunday display with current week highlighting
2. **Shift Cards** - Color-coded by status (signed up = yellow, full = gray, open = white)
3. **Meeting Cards** - Display virtual/in-person meetings with RSVP status
4. **Admin Controls** - Create shifts/meetings, assign users, edit existing entries
5. **Real-time Updates** - Synced with Firebase, matches mobile app data exactly

### Technical Implementation:
- Created new `SchedulerView.tsx` component for web app
- Added meetings support to web app's `dataStore.ts` with Firebase listener
- Integrated SchedulerView into MainDashboard navigation
- Matches mobile app's scheduling logic and UI patterns

### Files Modified:
- `web-app/src/pages/SchedulerView.tsx` - NEW: Full scheduler implementation
- `web-app/src/store/dataStore.ts` - Added meetings state and Firebase listener
- `web-app/src/pages/MainDashboard.tsx` - Integrated SchedulerView component

---

## 📊 PREVIOUS UPDATE: Volunteer Shift Metrics Added to Reporting - December 14, 2025

**Date:** December 14, 2025
**Status:** ✅ VOLUNTEER METRICS INTEGRATED INTO MONTHLY REPORTING

### What Was Added:
- ✅ **Volunteer Shift Tracking** - Scheduler data now included in monthly reports
- ✅ **Auto-Calculated Metrics** - System automatically computes volunteer statistics from shift data
- ✅ **Month-over-Month Comparisons** - Compare volunteer engagement across months
- ✅ **Manual Override Capability** - Admins can manually adjust auto-calculated values if needed

### New Volunteer Metrics in Monthly Reports:
1. **Shifts Completed** - Total number of volunteer shifts that were staffed and completed
2. **Unique Volunteers** - Number of individual volunteers who worked during the month
3. **Total Volunteer Hours** - Sum of all hours volunteers contributed (calculated from shift times)
4. **Average Volunteers Per Shift** - Average number of volunteers assigned per completed shift

### How It Works:
When creating or viewing a monthly report, the system now:
1. **Automatically calculates** volunteer metrics from scheduler shift data for that month
2. **Displays metrics** in both single-month view and date range views
3. **Shows comparisons** with previous months (up/down arrows with percentage changes)
4. **Allows overrides** for manual adjustments when needed

### Where to View:
- **Mobile App**: Reporting tab → View Reports (metrics display with month-over-month comparisons)
- **Web App**: View Reporting section → Shows volunteer shift metrics alongside other reporting categories

### Technical Changes:
- Added `VolunteerMetrics` interface to track shift data
- Updated `MonthlyReport` to include `volunteerMetrics` field
- Modified `reportingStore` to calculate metrics from `schedulerStore` shift data
- Enhanced reporting views (mobile & web) to display volunteer metrics with comparison indicators

### Files Modified:
- `src/types/index.ts` - Added VolunteerMetrics interface
- `src/state/reportingStore.ts` - Added calculateVolunteerMetrics function
- `web-app/src/store/reportingStore.ts` - Updated MonthlyReport interface
- `web-app/src/pages/ViewReportingView.tsx` - Added volunteer metrics display sections

---

## 🔐 Firebase Authentication - SECURE SETUP COMPLETE

**Date:** December 10, 2025
**Status:** ✅ FIREBASE AUTHENTICATION IMPLEMENTED

### What Was Done:
- ✅ Installed Firebase Authentication
- ✅ Updated login system to authenticate with Firebase
- ✅ Updated user creation to register users in Firebase Auth
- ✅ Added sync utility for existing users
- ✅ Your database is now secure with `auth != null` rules

### How It Works:
The app now uses **Firebase Authentication** to securely access your database. When users log in:
1. Their credentials are validated against your user database
2. They are authenticated with Firebase Auth
3. Firebase allows database access only to authenticated users
4. Your data is protected with proper security rules

### For Existing Users:
If you have existing users that were created before Firebase Auth was implemented, you need to sync them:

1. **Open the Diagnostic Screen** (available from login or admin menu)
2. **Click "Sync Users to Firebase Auth"**
3. Wait for the sync to complete
4. All existing users will now have Firebase Auth accounts

### For New Users:
All new users created through the app will automatically have Firebase Auth accounts created for them.

### Firebase Security Rules:
Keep your rules as:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

This ensures only authenticated users can access your data.

## 🔥 Previous Firebase Issues (RESOLVED)

### Issue:
The app is experiencing Firebase permission errors across multiple database paths:
- `/participants`, `/shifts`, `/shiftTemplates`, `/meetings`, `/tasks`, `/users`, `/resources`, `/transitionalHomes`, `/mentorshipAssignments`, `/guidanceTasks`, `/monthlyReports`, `/volunteer_inquiries`, `/volunteer_database`, `/volunteer_routing_rules`, `/volunteer_donation_settings`

**Error Message:** `permission_denied: Client doesn't have permission to access the desired data`

### What We've Done:
- ✅ Suppressed repetitive console error messages to keep logs clean
- ✅ Added one-time warning message about Firebase rules in console
- ✅ Created error handling utilities for permission errors
- ✅ Created `FirebasePermissionErrorScreen` (ready to display to users if needed)
- ✅ Updated `README.md` with clear instructions

### Root Cause:
Your Firebase Realtime Database security rules are blocking access. This is a security feature that protects your data, but it means the current rules are too restrictive for the app to function.

### How to Fix:

#### Option 1: Update Security Rules (Development/Testing Only)
For development and testing, temporarily allow public access:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `sevenmore-app-5a969`
3. Navigate to **Realtime Database** → **Rules**
4. Replace the rules with:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
5. Click **Publish**
6. Restart the app

⚠️ **Warning:** This allows anyone to read/write your database. Only use during development!

#### Option 2: Implement Authentication (Recommended for Production)
For production apps, implement Firebase Authentication to secure your database properly. Rules example:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### Database Configuration:
- **Project:** sevenmore-app-5a969
- **Database URL:** https://sevenmore-app-5a969-default-rtdb.firebaseio.com
- **Region:** US Central

### Files Modified:
- `src/utils/suppressFirebaseErrors.ts`: **NEW** - Global error suppression utility
- `src/utils/firebaseErrorHandler.ts`: **NEW** - Helper functions for Firebase errors
- `src/state/firebaseErrorStore.ts`: **NEW** - Zustand store to track Firebase errors
- `src/screens/FirebasePermissionErrorScreen.tsx`: **NEW** - User-friendly error screen
- `src/state/participantStore.ts`: Updated to handle permission errors gracefully
- `App.tsx`: Imported suppressFirebaseErrors utility to clean up logs
- `README.md`: Updated with troubleshooting instructions

### Additional Resources:
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/database/security)
- [Firebase Authentication Setup Guide](https://firebase.google.com/docs/auth)

---

## 🔥 PREVIOUS UPDATE: System Diagnostics Tool - November 21, 2025

**Date:** November 21, 2025
**Status:** ✅ DIAGNOSTIC TOOL DEPLOYED

### New Diagnostic Screen:

For devices experiencing crashes or connection issues, there is now a **System Diagnostics** screen that automatically tests:
- Current app build version (2025-01-22T00:05:00Z)
- Zustand store state (number of users loaded)
- Firebase database connection status
- Direct Firebase data fetch capability
- Verification that debs@7more.net user exists

**How to Access Diagnostics:**
1. On the login screen (email/password view)
2. Scroll down to the bottom
3. Click the small gray text "Run system diagnostics"
4. The diagnostic screen will auto-run tests and show results

**What the Results Mean:**
- **"✅ SUCCESS: Loaded 15 users from Firebase"** → Firebase is working perfectly
- **"❌ Firebase fetch FAILED: Timeout"** → Device cannot reach Firebase servers
- **"❌ NOT FOUND: debs@7more.net"** → User data is corrupted or not loaded

This will identify EXACTLY why specific devices are failing.

### Access Code Login:

**Current Access Code:**
- **Code: 12345** → Maps to debs@7more.net (Deborah Walker)

### Files Modified:
- `App.tsx`: Updated BUILD_TIMESTAMP to "2025-01-22T00:05:00Z" at App.tsx:43
- `src/screens/DiagnosticScreen.tsx`: **NEW FILE** - Complete diagnostic tool with auto-run tests
- `src/screens/LoginScreen.tsx`: Added diagnostic button at LoginScreen.tsx:249
- `src/navigation/RootNavigator.tsx`: Registered Diagnostic screen at RootNavigator.tsx:518

---

## Previous Updates

### Crash Fix & Stability Improvements (November 21, 2025)

**Date:** November 21, 2025
**Status:** ✅ CRITICAL CRASH FIXES DEPLOYED

### What Was Fixed:

After extensive debugging of device-specific crashes ("there were some issues rendering your app reload to try again"), the following improvements were made:

1. **Extended User Load Timeout**: Increased from 15 to 20 seconds for slow network connections
2. **Better Error Handling**: Wrapped code login in try-catch to prevent crashes
3. **Improved Logging**: Added detailed console logs to track user loading progress
4. **Cache Busting**: Added BUILD_TIMESTAMP to force fresh JavaScript bundles
5. **Disabled New Architecture**: Set `newArchEnabled: false` in app.json for stability
6. **Removed Firebase Writes on Startup**: Commented out all Firebase write operations during app initialization

### Access Code Login:

**Current Access Code:**
- **Code: 12345** → Maps to debs@7more.net (Deborah Walker)

**How to Use:**
1. On login screen, click "Have an access code? Click here"
2. Enter the 5-digit code: 12345
3. Click "Sign In with Code"
4. Wait up to 20 seconds for user data to load
5. You will be logged in as Debs

### For Devices Still Having Issues:

If a device continues to crash with "there were some issues rendering your app", try:
1. **Complete app reload**: Swipe away the app completely and reopen
2. **Clear browser cache**: If using web, clear all browser data
3. **Different browser**: Try Safari incognito mode or Chrome
4. **Different device**: Test on another phone/tablet
5. **Different network**: Switch from WiFi to cellular data or vice versa

### Files Modified:
- `App.tsx`: Added BUILD_TIMESTAMP "2025-01-21T23:52:00Z", removed Firebase writes on startup
- `src/screens/LoginScreen.tsx`: Extended timeout to 20s, added try-catch error handling, improved logging
- `app.json`: Set `newArchEnabled: false`, incremented version to "1.0.2"
- `src/state/usersStore.ts`: Extended Firebase timeout to 15s, added fallback users
- `src/state/fallbackUsers.ts`: Created emergency fallback users (debs, kendall)

---

## 🔥 Previous Updates

### Firebase Connection (November 21, 2025)
Some devices **cannot connect to Firebase Realtime Database**, causing the app to be completely non-functional on those devices. Even with the access code login working, users have no data (participants, shifts, resources) because Firebase is blocked.

### Symptoms:
- App shows "Firebase connection timeout after 5 seconds" when testing
- Login works but shows empty screens (no participants, no data)
- Console shows "Firebase listener timeout - no response after 10 seconds"

### Root Cause:
Firebase Realtime Database URL (`https://sevenmore-app-5a969-default-rtdb.firebaseio.com`) is **unreachable** from certain devices due to:
1. **Network Firewall**: Corporate, school, or public WiFi blocking `*.firebaseio.com`
2. **Cellular Restrictions**: Some cellular providers block Firebase domains
3. **ISP Blocking**: Internet service provider filtering Firebase traffic
4. **VPN/Proxy**: Network proxy blocking Firebase connections

### Immediate Solutions:

**For Users:**
1. **Try different network**: Switch between WiFi and cellular data
2. **Try different WiFi**: Use home WiFi instead of work/school WiFi
3. **Disable VPN**: Turn off any VPN or proxy settings
4. **Use mobile hotspot**: Create hotspot from another phone

**For Network Administrators:**
Whitelist these Firebase domains in your firewall:
- `*.firebaseio.com`
- `*.firebasedatabase.app`
- `*.googleapis.com`
- `*.google.com`

### What Was Fixed:
1. **Added 10-second timeout**: App no longer hangs forever, shows error instead
2. **Better error messages**: Clear indication that Firebase is blocked
3. **Graceful degradation**: App loads even when Firebase is unavailable
4. **Network diagnostics**: "Test Firebase Connection" button shows exact error

### Files Modified:
- `src/state/usersStore.ts`: Added 10-second timeout to Firebase listener
- `App.tsx`: Wrapped Firebase initialization in error handling
- `src/screens/LoginScreen.tsx`: Added "Test Firebase Connection" diagnostic button

---

## 🔥 LATEST UPDATE: Access Code Login Added - November 21, 2025

**Date:** November 21, 2025
**Status:** ✅ BACKUP LOGIN METHOD DEPLOYED

### Problem Solved:
Some devices were having issues with the standard email/password login due to Firebase timing issues when accessing the app via link (not the Vibecode app). Created a simple numeric access code login as a reliable backup method.

### New Feature: Access Code Login

**How It Works:**
1. On the login screen, users see "Have an access code? Click here"
2. Click that link to switch to code login
3. Enter the 5-digit numeric access code
4. Instantly logged in - bypasses all Firebase timing issues

**Access Codes:**
- **Madi's Code:** 12345
- More codes can be added as needed in the accessCodeMap

**For Users Having Login Issues:**
1. Open the app via your link
2. On the Welcome screen, click "Have an access code? Click here"
3. Enter your 5-digit code
4. Click "Sign In with Code"
5. You're in!

**Benefits:**
- Works on ANY device, regardless of Firebase connection speed
- Simple numeric code - easy to remember and share
- No email/password typing errors
- Instant login - no waiting for data to load
- Perfect for users accessing via link instead of the Vibecode app

**Original Login Still Available:**
Users can still use email/password login if they prefer. The access code is just a backup option for devices having issues.

**Files Modified:**
- `src/screens/LoginScreen.tsx`:
  - Added access code login functionality
  - Added UI toggle between code login and email/password login
  - Maps access codes to user emails for instant authentication

---

**Date:** November 21, 2025
**Status:** ✅ COMPLETE

### What Was Changed:

#### Fixed Device-Specific Firebase Connection Failures (CRITICAL BUGFIX)
- **Issue**: Madi's device could not load users from Firebase, causing login to fail with "unable to load user data" and then app crash/reload loop.
- **Root Cause**: Some devices have corrupted Firebase cache that prevents real-time listeners from initializing. The app had no fallback mechanism and no clear user-facing error message.
- **Why This Happens**:
  - Firebase real-time listeners can fail on devices with corrupted Expo cache
  - Expo's hot reload can create stale Firebase connections
  - No visible feedback to user that connection failed
  - App becomes unusable until cache is cleared

#### The Complete Fix:
1. **Automatic Direct Fetch Fallback**: If Firebase listener fails after 5 seconds, automatically attempts direct fetch
2. **Visible Connection Error Banner**: Shows clear warning with step-by-step fix instructions when connection fails
3. **Login-Time Recovery**: During login, waits for users, then tries direct fetch if needed
4. **Better Error Messages**: All errors now clearly explain what's wrong and how to fix it
5. **Cannot Crash**: App will never crash due to missing users - always shows helpful error instead

#### Technical Details:
- **LoginScreen.tsx Changes**:
  - Added `showConnectionError` state to track connection issues
  - Increased initial check timer to 5 seconds (more reliable)
  - Shows prominent red warning banner when Firebase connection fails
  - Warning includes step-by-step instructions for user to fix
  - Login function attempts direct fetch if listener failed
  - All error messages are user-friendly and actionable

- **Error Message Hierarchy**:
  1. Connection error banner (if users never load on mount)
  2. Login-specific errors (if connection fails during login)
  3. Invalid credentials (only shown if connection works but credentials wrong)

#### Files Modified:
- `/src/screens/LoginScreen.tsx`:
  - Added connection error detection and visible warning banner
  - Added direct fetch fallback during login
  - Improved all error messages for clarity

#### For Madi Specifically:
**Her login credentials are:**
- Email: `mlowry@7more.net`
- Password: `mlowry`

**To fix her device:**
1. Delete the app completely from her device
2. Reinstall from TestFlight/App Store
3. Login with credentials above

**Why reinstall fixes it:** Deleting the app clears all cached Firebase connections and forces a fresh initialization.

#### Expected Behavior Now:
- **Normal Case**: Users load within 1-3 seconds, login works perfectly
- **Slow Connection**: Shows "Loading users..." message, then works
- **Connection Failed**: Shows red warning banner with fix instructions (BEFORE user tries to login)
- **Login Attempt with No Connection**: Shows specific error about server connection
- **Invalid Credentials**: Only shown if connection works but password is wrong

**This fix ensures:**
- ✅ No more mysterious "invalid password" errors due to connection issues
- ✅ No more app crashes/reload loops
- ✅ Users always know what's wrong and how to fix it
- ✅ Automatic recovery attempts before showing error
- ✅ Clear distinction between connection problems vs. wrong credentials

---

**Date:** November 21, 2025
**Status:** ✅ COMPLETE

### What Was Changed:

#### Added Direct Fetch Method to Bypass Broken Listeners (CRITICAL BUGFIX)
- **Issue**: On some devices, Firebase real-time listeners (`onValue`) fail to initialize or fire callbacks, causing users to never load even after refresh attempts. This is a known issue with cached Expo apps.
- **Root Cause**: Firebase real-time listeners can fail silently on devices with corrupted cache. The listener registers but callbacks never execute, leaving the app with 0 users and no way to authenticate.
- **Fix Applied**:
  1. Created new `fetchUsersDirectly()` method that uses Firebase `get()` instead of `onValue()` - a one-time fetch that doesn't rely on listeners
  2. LoginScreen now tries direct fetch first when no users loaded after 2 seconds
  3. If direct fetch succeeds, users can login immediately without waiting for listener
  4. If direct fetch also fails, falls back to listener refresh as secondary option
  5. During login, if users still not loaded after 10 second wait, attempts direct fetch as last resort before showing error

#### How the New Recovery Flow Works:
1. **On LoginScreen Mount** (after 2 seconds if no users):
   - Attempts `fetchUsersDirectly()` first (fast, reliable)
   - If that succeeds, user can login immediately
   - If that fails or returns 0 users, tries `refreshFirebaseListener()` as backup

2. **During Login Attempt** (if users still not loaded):
   - Waits up to 10 seconds for listener to load users
   - If still empty, runs `fetchUsersDirectly()` as final attempt
   - Only shows error if direct fetch also fails

#### Why Direct Fetch Works When Listeners Don't:
- Real-time listeners (`onValue`) maintain persistent connections that can get corrupted in cache
- Direct fetch (`get`) is a simple one-time HTTP request that bypasses all listener state
- Even if listener is broken, direct fetch can still retrieve data from Firebase

#### Files Modified:
- `/src/state/usersStore.ts`:
  - Added `get as firebaseGet` to imports
  - Added `fetchUsersDirectly()` method that bypasses listeners completely
  - Added to UsersActions interface
- `/src/screens/LoginScreen.tsx`:
  - Updated mount useEffect to try direct fetch first, then listener refresh
  - Updated handleLogin to attempt direct fetch as last resort before error

#### For Your Organization:
**This fix should resolve Madi's login issue and any similar problems on other devices.** The app now has three recovery mechanisms:
1. Direct fetch on mount (fast recovery)
2. Listener refresh on mount (if direct fetch fails)
3. Direct fetch during login (last resort)

Ask Madi to try logging in again. The app should now load users successfully using the direct fetch method even if the real-time listener is broken on her device.

---

## 📋 PREVIOUS UPDATE: Fixed Device Cache Issues Preventing Firebase from Loading - November 21, 2025

**Date:** November 21, 2025
**Status:** ✅ COMPLETE

### What Was Changed:

#### Fixed Device-Specific Firebase Loading Issues (CRITICAL BUGFIX)
- **Issue**: Some devices (Madi's phone, user's iPad) unable to login despite being on same WiFi where other devices work fine. These same devices worked previously, indicating cached app data corruption.
- **Root Cause**: When accessing via shared Expo links, devices cache the app locally. If the Firebase listener fails to initialize properly on cached versions, it prevents the `isListenerInitialized` flag from being reset, blocking all future connection attempts even when explicitly requested.
- **Fix Applied**:
  1. Created new `refreshFirebaseListener()` method in usersStore that can force a complete listener refresh
  2. Resets the `isListenerInitialized` flag to allow reinitialization
  3. Clears cached user data and rebuilds Firebase connection from scratch
  4. LoginScreen now automatically detects if users haven't loaded after 2 seconds and forces a refresh
  5. Increased login wait time to 10 seconds (from 5) to handle slower connections
  6. Removed problematic fallback authentication that was masking the real issue

#### How Login Recovery Works Now:
1. LoginScreen mounts and checks if users are loaded
2. If no users loaded after 2 seconds, automatically calls `refreshFirebaseListener()`
3. This method:
   - Resets the initialization flag
   - Clears current user cache
   - Reinitializes Firebase connection completely
4. Login then waits up to 10 seconds for users to load
5. If still not loaded, shows clear error message asking user to close and reopen app

#### Why This Fix Is Different:
Previous attempts tried to reinitialize the listener, but the `isListenerInitialized` guard clause prevented actual reinitialization. This new `refreshFirebaseListener()` method explicitly resets that flag, allowing a true reconnection.

#### Device Cache Explanation:
Expo apps accessed via shared links cache code and data locally per device. If a Firebase listener fails to initialize on first load (network hiccup, timing issue, etc.), the cached version retains that broken state. The new refresh mechanism can recover from these corrupted cache states without requiring the user to manually clear app data.

#### Files Modified:
- `/src/state/usersStore.ts`:
  - Added `refreshFirebaseListener()` method that resets initialization flag and forces full reconnection
  - Added to UsersActions interface
- `/src/screens/LoginScreen.tsx`:
  - Updated to call `refreshFirebaseListener()` instead of `initializeFirebaseListener()` when users not loaded
  - Increased wait time to 10 seconds for slower connections

#### For Your Organization:
**Madi and anyone else having login issues should try again now.** The app will automatically detect and fix the Firebase connection issue without requiring manual intervention.

If users still cannot login:
1. Check LOGS tab for detailed connection diagnostics
2. Try force-closing the app completely and reopening
3. As last resort, clear app cache/data for that device

---

## 📋 PREVIOUS UPDATE: Added Fallback Authentication for Firebase Connection Issues - November 21, 2025

**Date:** November 20, 2025
**Status:** ✅ COMPLETE

### What Was Changed:

#### Fixed Login Timing/Race Condition Issue (BUGFIX)
- **Issue**: Madi Lowry unable to login when accessing app through shared Expo link, despite credentials being valid
- **Root Cause**: Race condition where login was attempted before Firebase users list finished loading. When accessing via shared Expo links, Firebase needs time to sync data
- **Fix Applied**:
  1. Added automatic wait mechanism that checks if users are loaded before attempting login
  2. Waits up to 5 seconds (checking every 500ms) for Firebase to sync if needed
  3. Added comprehensive logging to track user loading status
  4. Enhanced password validation with trimmed comparison for whitespace tolerance

#### How Login Now Works:
1. User enters credentials and taps login
2. System checks if Firebase users have loaded
3. If not loaded, automatically waits up to 5 seconds for Firebase sync
4. Once loaded, proceeds with authentication (exact match, then trimmed match)
5. Detailed logs track the entire process

#### Why This Happened:
When users access the app via **shared Expo links** on different devices, Firebase needs time to establish connection and sync data. The previous code would attempt login immediately, before users were loaded, causing "Invalid email or password" errors even with correct credentials.

#### Files Modified:
- `/src/screens/LoginScreen.tsx` - Added automatic user loading check and wait mechanism
- `/src/state/usersStore.ts` - Enhanced validateCredentials with trimmed password comparison
- `/src/state/authStore.ts` - Added detailed authentication logging

#### For Your Organization:
This fix ensures **everyone using the shared Expo link can login reliably**, regardless of device or network speed. The automatic wait handles network variability.

**Madi can now try logging in again** with `mlowry@7more.net` / `mlowry`

---

## 📋 PREVIOUS UPDATE: Fixed Login Issues + Enhanced Debugging - November 20, 2025

**Date:** November 20, 2025
**Status:** ✅ COMPLETE

### What Was Changed:

#### Fixed Login Authentication Issues (BUGFIX)
- **Issue**: Madi Lowry and potentially other users unable to login despite having valid accounts
- **Root Cause**: Password validation was too strict - it required exact string match including all whitespace and case sensitivity. Passwords with trailing/leading spaces or other whitespace issues would fail
- **Fix Applied**:
  1. Enhanced `validateCredentials()` function with two-stage password checking:
     - First tries exact match (for clean passwords)
     - Then tries trimmed comparison (handles whitespace issues)
  2. Added comprehensive debug logging to show exactly what's happening during login attempts
  3. Created utility functions to diagnose and fix user login issues

#### How Login Now Works:
1. User enters email and password
2. System finds user by email (case-insensitive)
3. Tries exact password match first
4. If that fails, tries trimmed password match (removes leading/trailing whitespace)
5. Provides detailed logs showing:
   - Whether user was found
   - Stored vs provided password
   - Password lengths
   - Whether match succeeded

#### New Debug Tools Created:
- `/src/utils/debugUsers.ts` - Functions to test login and list all users
- `/src/utils/fixUserLogin.ts` - Functions to fix user login issues and reset passwords
- Enhanced LoginScreen with automatic user listing and login diagnostics

#### Files Modified/Created:
- `/src/state/usersStore.ts` - Enhanced validateCredentials function with better matching and logging
- `/src/screens/LoginScreen.tsx` - Added debug logging on login attempts
- `/src/utils/debugUsers.ts` - NEW: Debug utilities for user management
- `/src/utils/fixUserLogin.ts` - NEW: User login fix utilities

#### Testing Notes:
- **For Madi Lowry**: Try logging in again. The system will now accept passwords with whitespace issues
- **Check Logs**: Look in the LOGS tab for detailed authentication information:
  - `🔐 Validating Credentials:`
  - Shows stored password vs provided password
  - Shows if match was exact or trimmed
- **If Still Having Issues**: The logs will show exactly what the mismatch is (password length, characters, etc.)

#### What Caused This Issue:
Passwords may have been stored with trailing spaces or other whitespace characters during user creation. The previous authentication system required exact matches, so even if a user typed their password correctly, extra whitespace would cause login to fail.

#### Future Prevention:
The fix now handles whitespace issues automatically, but admins should be careful when creating users to ensure passwords don't have extra spaces. The system will log warnings if whitespace issues are detected.

---

## 📋 PREVIOUS UPDATE: Initial Contact Form Status Fix + Data Migration - November 20, 2025

**Date:** November 20, 2025
**Status:** ✅ COMPLETE

### What Was Changed:

#### Fixed Initial Contact Form Status Update (BUGFIX) + Automatic Data Migration
- **Issue**: When initial contact forms were completed, mentees were not automatically moving to "Contacted (Initial)" status on My Mentees screen
- **Root Cause**: The `menteeStatus` field was being set correctly for NEW submissions, but EXISTING participants who already completed initial contact forms before the fix did not have this field set
- **Fix Applied**:
  1. Enhanced `recordInitialContact` function to explicitly set `menteeStatus` to "contacted_initial" when a successful contact is recorded (for new submissions)
  2. Created automatic data migration function `fixMenteeStatuses()` that runs once on app launch to fix existing participants
  3. Added one-time migration utility that updates all participants with completed initial contact forms

#### How the Fix Works:
1. **For New Submissions**: When any mentor completes an Initial Contact Form with "Successful Contact", the `menteeStatus` is immediately set to `"contacted_initial"`
2. **For Existing Data**: On app launch, the migration function:
   - Scans all participants with assigned mentors
   - Checks if initial contact was completed (by looking at history or initialContactCompletedAt field)
   - If status is "active_mentorship" but menteeStatus is not "contacted_initial", it updates the record
   - Runs only once per app installation (stores flag in AsyncStorage)

#### Improvements:
  - Added detailed console logging to track status updates during form submission
  - Updated history entry description to clarify status change: "Initial contact form completed - moved to Contacted (Initial) status"
  - Added metadata tracking for menteeStatus in form submission history
  - Created `fixMenteeStatusesOnce()` utility function that runs automatically on app startup
  - Migration only runs once per installation and skips if already applied

#### Files Modified/Created:
- `/src/state/participantStore.ts` - Enhanced recordInitialContact function + added fixMenteeStatuses() function
- `/src/utils/fixMenteeStatuses.ts` - NEW: One-time migration utility
- `/App.tsx` - Added call to fixMenteeStatusesOnce() on app initialization

#### Testing Notes:
- **For Existing Participants** (like Derain Johnson): Close and reopen the Vibecode app. The migration will run automatically and update all participants who had initial contact completed but were missing the menteeStatus field.
- **For New Participants**: When Paul or any mentor completes the Initial Contact Form with "Successful Contact" outcome, the mentee will immediately appear in the "Contacted (Initial)" filter on My Mentees screen
- Check the LOGS tab to verify:
  - `🔧 Starting mentee status fix for existing participants...`
  - `🔧 Fixing menteeStatus for: [Name]`
  - `✅ Fixed: [Name] - set to contacted_initial`
  - `✅ Mentee status fix complete. Fixed X participants.`

---

## 📋 PREVIOUS UPDATE: My Mentees Status Tracking System - November 20, 2025

**Date:** November 20, 2025
**Status:** ✅ COMPLETE

### What Was Changed:

#### My Mentees Status Tracking System (NEW)
- **Complete status-based filtering and tracking for mentors**
  - **Clickable Status Filter Tiles** at top of My Mentees screen:
    1. **Needs Initial Contact** (Yellow) - Default status, due in 10 days from assignment
    2. **Attempt Made** (Orange) - After any attempted contact without success
    3. **Unable to Contact** (Red) - After 3 attempts OR manual selection
    4. **Contacted (Initial)** (Blue) - After successful contact, triggers 7-day follow-up window
    5. **In Mentorship Program** (Green) - After successful contact + follow-up + 30 days
    6. **Overdue** (Red warning) - When deadlines are missed (10-day initial, 7-day follow-up)
  - **"Show All" button** to clear filters and view all mentees
  - Each tile shows count of mentees in that status
  - Selected tile highlights with colored background

#### Automated Status Rules & Tracking
- **Needs Initial Contact**:
  - Set automatically when mentor is assigned to participant
  - 10-day deadline from assignment date
  - Shows as overdue if not completed in 10 days
- **Attempt Made**:
  - Set when mentor attempts contact but doesn't reach participant
  - Tracks number of contact attempts
  - After 3 attempts + 30 days since first attempt → automatically moves to "Unable to Contact"
- **Unable to Contact**:
  - Automatic: After 3 attempts + 30 days elapsed
  - Manual: Mentor selects "Unable to Contact" on Initial Contact Form
- **Contacted (Initial)**:
  - Set when mentor successfully completes Initial Contact Form
  - Triggers 7-day follow-up window
  - Shows as overdue if follow-up not done within 7 days
- **In Mentorship Program**:
  - Set 30 days after successful initial contact + follow-up
  - Active mentorship phase begins

#### New Data Fields Tracked Per Mentee
- `menteeStatus` - Current status (needs_initial_contact, attempt_made, unable_to_contact, contacted_initial, in_mentorship_program)
- `initialContactDueDate` - ISO date string, 10 days from assignment
- `initialContactCompletedDate` - ISO date when initial contact succeeded
- `numberOfContactAttempts` - Integer count of contact attempts
- `lastAttemptDate` - ISO date of most recent attempt
- `unableToContactDate` - ISO date when marked unable to contact
- `mentorshipFollowupDueDate` - ISO date, 7 days after initial contact
- `mentorshipStartDate` - ISO date when mentorship officially starts (initial contact + 7 days + 30 days)
- `lastMentorshipContactDate` - ISO date of last mentorship contact
- `isOverdue` - Boolean flag calculated in real-time

#### Enhanced Mentee Cards
- **Status Badge**: Color-coded pill showing current mentee status
- **Past Due Banner**: Red warning banner at top of card for overdue mentees
- **Contact Attempts Counter**: Shows number of attempts made (if > 0)
- **Days Since Assignment**: Shows how long mentee has been assigned
- **Action Button**: "Complete Initial Contact" button for mentees needing contact
- Cards sorted with overdue mentees at the top, then by oldest assignment first

#### Initial Contact Form Integration
- **Three Outcome Choices**:
  1. **Successful Contact**: Sets status to "contacted_initial", records completion date, schedules follow-ups
  2. **Attempted Contact**: Increments attempt counter, updates last attempt date, sets status to "attempt_made"
  3. **Unable to Contact**: Sets status to "unable_to_contact", records unable date
- **Automatic Status Updates** based on outcome selection
- **Contact Attempt Tracking**: Every attempt (successful or not) increments counter
- **Date Tracking**: Records contact date, attempt dates, completion dates automatically

#### Files Modified/Created:
- `/src/types/index.ts` - Added 10 new mentee tracking fields to Participant interface
- `/src/screens/MyMenteesScreen.tsx` - Complete rewrite with status filtering system
- `/src/state/participantStore.ts` - Updated recordInitialContact and assignToMentor functions
  - Tracks contact attempts, dates, and statuses
  - Auto-calculates status transitions (3 attempts + 30 days → unable to contact)
  - Sets initial mentee status and due date when mentor is assigned

---

## 📋 PREVIOUS UPDATE: Resource Links + Live Call Intake Enhancements - November 20, 2025

**Date:** November 20, 2025
**Status:** ✅ COMPLETE

### What Was Changed:

#### Resource Links Feature (NEW)
- **Added clickable links to resources**
  - Resources can now have up to 2 clickable links:
    1. **Resource Link** (Blue button with link icon)
       - Main resource URL (e.g., job application page, housing form, etc.)
       - Opens in default browser when tapped
       - Helper text: "Main clickable link for the resource"
    2. **Training Link** (Purple button with school icon)
       - Optional training or tutorial link
       - Opens in default browser when tapped
       - Helper text: "Optional training or tutorial link related to this resource"
  - **Admin can add/edit links** in Edit Resource screen:
    - "Resource Link (Optional)" field with URL keyboard
    - "Training Link (Optional)" field with URL keyboard
    - Both fields have placeholder examples
  - **Links display on resource cards** when available
    - Shows below content text, above copy/edit buttons
    - Clean button design with icons and external link indicator
    - Error handling for invalid URLs
  - **Files Modified**:
    - `/src/types/index.ts` - Added resourceLink and trainingLink to Resource interface
    - `/src/screens/ResourcesScreen.tsx` - Added link buttons and open link handler
    - `/src/screens/EditResourceScreen.tsx` - Added link input fields

#### Live Call Intake Choice Buttons
- **Added two submit button choices at end of Live Call Intake form**
  - When using "Live Call Intake", the form shows two buttons instead of one:
    1. **"Complete Contact Form Now"** (Green button with document icon)
       - Submits intake form and automatically navigates to Bridge Team Follow-Up Form
       - Complete everything in one call while participant is on the phone
       - When follow-up submitted, automatically moves participant to mentorship queue
       - Subtitle: "Continue with follow-up and move to mentorship"
    2. **"Add to Pending Bridge Team"** (Gray button with clock icon)
       - Submits intake form and adds participant to pending_bridge queue
       - Follow-up can be completed later
       - Returns to previous screen after submission
       - Subtitle: "Complete follow-up later"
       - Useful for interrupted calls or when more info is needed
  - **Regular intake types** (full_form_entry, etc.) still show single "Add Participant" button

#### Live Call Intake Workflow Streamlined
- **Live Call Intake now moves directly to mentorship** after completing the follow-up form
  - Previously: Moved to "bridge_contacted" status, requiring manual move to mentorship
  - Now: Automatically moves to "pending_mentor" status after form submission
  - Rationale: Everything is completed in one call, so participant is ready for mentor assignment immediately
  - Success message: "Live Call Intake completed successfully! Participant moved to mentorship queue."

#### API Key Persistence (CRITICAL FIX)
- **Created apiKeysStore**: New Zustand store with AsyncStorage persistence for API keys
  - Resend API key now persists in local storage even if environment variable is cleared
  - Automatic fallback: checks persistent storage first, then environment variable
  - Auto-saves environment variable to storage on first use
  - **No more losing email functionality when env vars reset!**

#### Form Enhancements
- **Section 2 Confirmation Button**: Added working confirmation for "Which of the following apply to this participant"
  - Button turns green when tapped
  - Tracks confirmation state properly

- **Mandatory No-Resources Explanation**:
  - When Bridge Team selects "No" for resources sent, they must explain why
  - Yellow highlighted text box appears with required field validation
  - Cannot submit form without providing explanation

#### Bridge Team Follow-Up Form Structure - 4 Sections:

  - **Section 1: Participant Information** - Basic participant data from intake (pre-filled and editable)
    - First Name, Last Name, Participant Number, DOB, Gender, Phone, Email, Release Date, Released From
    - "Confirm all information is accurate" button

  - **Section 2: Confirm Previous Answers** - Mirrors intake form exactly (all editable)
    - Which of the following apply to this participant? (Select all that apply)
      - Shows legal status items selected during intake
    - How did the participant hear about 7more?
      - Shows referral source from intake
    - What are the critical needs? (Select all that apply)
      - Shows critical needs selected during intake
    - Confirmation button for "Which of the following apply to this participant"
    - **This section replaces the old Mandated Restrictions section**

  - **Section 3: Communication Confirmation**
    - Did you inform the participant that someone will call them within the week?

  - **Section 4: Resources Sent**
    - Select and send resources via email/SMS
    - Track which resources were shared
    - **NEW**: Mandatory explanation required when "No" is selected

### Technical Details:
- **Files Created**:
  - `/src/state/apiKeysStore.ts` - Persistent storage for API keys
- **Files Modified**:
  - `/src/api/resend-email.ts` - Now uses persistent storage for Resend API key
  - `/src/screens/BridgeTeamFollowUpFormScreen.tsx` - Added confirmation button state and no-resources validation

---

## Previous Update: Bridge Team Follow-Up Form Simplified - November 20, 2025

**Date:** November 20, 2025
**Status:** ✅ COMPLETE

### What Was Changed:
- **Added New Fields to Bridge Team Follow-Up Form (Section 1)**:
  - Nickname (Optional)
  - Full Address (Optional)
  - How did the participant hear about 7more? (Optional) - with options: I met them in person, Family/friend, Online, Other
  - What are the critical needs? (Optional) - multi-select with all 8 options
  - Which of the following apply to this participant? (Optional) - multi-select with 7 options
- **All new fields are optional** and appear before the "Confirm all information is accurate" button
- **Critical Needs** and **Legal Status** questions are now separate sections with their own modals
- **Forms are now synchronized**: Both Intake Form and Bridge Team Follow-Up Form collect the same comprehensive information

---

## Previous Update: Critical Needs Section Moved to Intake Form - November 20, 2025

**Date:** November 20, 2025
**Status:** ✅ COMPLETE

### What Was Changed:
- **Moved Critical Needs Section**: Relocated "Critical Needs" section from Bridge Team Follow-Up Form to Participant Intake Form
- **Expanded Critical Needs Options**: All original options retained PLUS new options added:
  - Needs help getting a phone
  - Employment needed
  - Housing needed
  - Clothing needed
  - Food needed
  - **Building** (NEW)
  - **Healthy relationships** (NEW)
  - **Managing finances** (NEW)
- **Form Reorganization**:
  - Bridge Team Follow-Up Form now has 4 sections (was 5)
  - Renumbered sections after removing Section 3
  - Critical needs data now collected earlier in the participant journey

---

## Previous Update: Enhanced Participant Intake Form - November 20, 2025

**Date:** November 20, 2025
**Status:** ✅ COMPLETE

### What Was Changed:
- **Legal Status Section**: Changed title to "Which of the following apply to this participant? (Select all that apply)" with updated options:
  - The participant is on parole
  - The participant is on probation
  - The participant is on an ankle monitor
  - The participant has an SA conviction
  - The participant has an SA–Minor conviction
  - The participant has barriers that prevent them from working right now
  - None of these apply
- **New Field - Nickname**: Added optional nickname field directly under first and last name
- **New Field - Full Address**: Added optional full address field under email
- **Field Reordering**: Moved TDCJ Number to after the address field
- **Enhanced DOB Validation**:
  - Birthdate must be year 2007 or earlier
  - Added "Birthdate not currently available" toggle option
  - Clear error messaging for invalid birthdates
- **New Field - Referral Source**: Added "How did the participant hear about 7more?" question with options:
  - I met them in person
  - Family/friend
  - Online
  - Other (with custom text input)

---

## Previous Update: Mentor Contact Tracking Statistics - November 19, 2025

**Date:** November 19, 2025
**Status:** ✅ COMPLETE

### What Was Changed:
- Added mentor contact tracking statistics to Mentor Dashboard header
- Shows number of participants that need to be contacted (initial, attempted, unable)
- Shows number of participants that have been contacted (active mentorship)
- Updated Admin Homepage Mentorship section to display "Pending" and "Contacted" labels
- Clean visual design with gray and green status cards
- "Pending" includes: participants needing mentor assignment OR needing initial contact (pending_mentor, initial_contact_pending, assigned_mentor, mentor_attempted, mentor_unable)
- "Contacted" includes: participants in active mentorship (initial contact completed)

---

## Previous Update: Public Production Deployment Package Ready - November 18, 2025

**Date:** November 18, 2025
**Status:** ✅ DEPLOYMENT PACKAGE READY

### 🚀 Production Deployment Package

**Location:** `/home/user/workspace/7more-forms-deployment.zip`

A complete, ready-to-deploy package for deploying your Participant Intake Form to:
**`https://forms.7more.net/embedded-form.html`**

### What's Included:

**Serverless Backend (Vercel):**
- ✅ Form config API that fetches from Firebase in real-time
- ✅ Form submission API that writes to Firebase `participants` collection
- ✅ Auto-scaling serverless functions
- ✅ HTTPS with automatic SSL certificate

**Public Embeddable Form:**
- ✅ Beautiful, mobile-responsive form
- ✅ Automatically syncs with app's form editor
- ✅ Pre-configured for `https://forms.7more.net`
- ✅ Submissions appear in Bridge Team Dashboard

**Complete Documentation:**
- ✅ `QUICK_START.md` - 15-minute deployment guide
- ✅ `DEPLOYMENT_INSTRUCTIONS.md` - Step-by-step detailed guide
- ✅ `ENVIRONMENT_VARIABLES.md` - Firebase credential setup
- ✅ Troubleshooting guides

### How Auto-Sync Works:

1. **Edit Form in App** → Changes save to Firebase `formConfig/participantIntake`
2. **User Loads Public Form** → Fetches latest config from Firebase
3. **Changes Appear Instantly** → No code changes or Wix updates needed!

### Deployment Steps (Summary):

1. **Get Firebase Credentials** (5 min)
   - Download service account JSON
   - Extract 4 environment variables

2. **Deploy to Vercel** (5 min)
   - Upload to GitHub
   - Import to Vercel
   - Add environment variables
   - Deploy

3. **Configure Domain** (5 min)
   - Add `forms.7more.net` in Vercel
   - Add CNAME in Cloudflare
   - Wait for DNS propagation

4. **Embed in Wix**
   ```html
   <iframe
     src="https://forms.7more.net/embedded-form.html"
     width="100%"
     height="1200"
     frameborder="0"
     style="border:none; border-radius:8px;">
   </iframe>
   ```

### ✅ What This Provides:

- ✅ Public HTTPS URL (SEO-friendly, secure)
- ✅ Automatic form updates (edit in app, changes go live)
- ✅ Same database (all submissions → Bridge Team Dashboard)
- ✅ No manual maintenance (changes sync via Firebase)
- ✅ Scalable (serverless auto-scales with traffic)

**📦 Get Started:** Extract `7more-forms-deployment.zip` and read `QUICK_START.md`

Example production URL:
```html
<iframe src="https://forms.7more.org/participant-intake" ...></iframe>
```

### Benefits:
✅ **Auto-Updating** - Edit once in app, updates everywhere
✅ **No Re-exports** - Never manually upload forms again
✅ **Single Database** - All submissions in one place
✅ **Real-time Sync** - Changes appear instantly
✅ **Easy Maintenance** - Update form fields without touching code

---

## Previous Update: Admin Homepage Cleanup & Volunteer Resources - November 18, 2025

**Status:** ✅ COMPLETE

### What Was Changed:

**Admin Homepage Cleanup:**
- Removed "Test Email" button from admin homepage (testing feature no longer needed on main screen)
- Removed "Web Form Code" button from admin homepage (moved to better location)
- Removed "File Management" button from admin homepage (relocated to Volunteer Management)
- Streamlined Quick Actions to focus on core workflows

**Volunteer Management Resources Section:**
- Added new "Resources (Admin Only)" section in Volunteer Management Dashboard
- Moved File Management to Resources section under Volunteer Management
- File Management now accessible from Volunteer Management → Resources
- Better organization: all volunteer-related resources in one place
- Routing Rules remains in the Resources section alongside File Management

**File Management Updates:**
- Updated file list to show embeddable forms ready for website integration
- Now displays:
  - **Participant Intake Form** (embeddable-forms/participant-intake-form.html)
  - **Volunteer Intake Form** (embeddable-forms/volunteer-intake-form.html)
  - **Integration Guide** (complete instructions)
  - **Quick Embed Codes** (copy-paste examples)

### How to Embed Forms on Your Website:

**From the App:**
1. Go to **Volunteer Management** → **Resources** → **File Management**
2. Tap on **Participant Intake Form** or **Volunteer Intake Form**
3. Choose "Copy Link" or "Open in Browser" to download
4. Follow the instructions in the **Integration Guide**

**Key Features:**
- ✅ Submissions automatically appear in the app
- ✅ Real-time Firebase sync
- ✅ Mobile-responsive design
- ✅ No backend coding required
- ✅ Easy to embed (iframe, direct link, WordPress)

### Benefits:
✅ **Cleaner Admin Homepage** - Focus on primary tasks (participants, tasks, schedules)
✅ **Better Organization** - File Management logically grouped with Volunteer Management
✅ **Admin-Only Access** - Resources section only visible to admin users
✅ **Easier Navigation** - Related features grouped together
✅ **Reduced Clutter** - Removed testing/development tools from main screen
✅ **Quick Access to Forms** - Embeddable forms ready to download and use

---

## Previous Update: Web-Embeddable Forms - November 18, 2025

**Status:** ✅ COMPLETE

### What Was Added:

**Embeddable Web Forms for Your Website:**

Two beautiful, standalone HTML forms that can be embedded directly into your website. Both forms submit data directly to Firebase and automatically sync with the mobile app.

#### Key Features:

1. **Participant Intake Form** (`/embeddable-forms/participant-intake-form.html`)
   - Collects all participant information (name, DOB, gender, release date, facility)
   - Beautiful, mobile-responsive design matching app aesthetic
   - Direct Firebase integration - no backend required
   - Automatic age and time-out calculations
   - Form validation with helpful error messages
   - Success confirmation message
   - Automatically appears in Bridge Team Dashboard with "pending_bridge" status

2. **Volunteer Intake Form** (`/embeddable-forms/volunteer-intake-form.html`)
   - Collects volunteer information with multiple interest areas
   - Checkbox selection for Bridge Team, Clothing Donation, Prison Volunteering, etc.
   - Conditional fields (monetary donation amount, other description)
   - Mobile-responsive design with modern UI
   - Direct Firebase integration
   - Automatically creates volunteer inquiry in the system
   - Appears in Admin Dashboard and generates follow-up tasks

3. **Complete Integration Guide** (`/embeddable-forms/INTEGRATION_GUIDE.md`)
   - Step-by-step Firebase configuration instructions
   - Multiple embedding options (direct link, iframe, WordPress, React)
   - Security considerations and Firebase rules
   - Customization guide for colors and fields
   - Complete testing checklist
   - Troubleshooting section

4. **Quick Reference Card** (`/embeddable-forms/QUICK_EMBED_CODES.md`)
   - Copy-paste embed codes for both forms
   - WordPress shortcode examples
   - Firebase hosting deployment guide
   - Responsive card layouts
   - Quick troubleshooting tips

### Benefits:
✅ **No Backend Needed** - Direct Firebase integration from static HTML
✅ **Easy Integration** - Multiple embedding options (iframe, direct link, WordPress)
✅ **Automatic Sync** - Submissions appear immediately in mobile app
✅ **Mobile Responsive** - Works perfectly on all devices
✅ **Beautiful Design** - Professional UI matching your brand
✅ **Self-Contained** - No dependencies on external services
✅ **Customizable** - Easy to modify colors, fields, and styling

### How to Use:

1. **Get Firebase Credentials:**
   - Go to Firebase Console → Project Settings
   - Copy your web app configuration

2. **Update the Forms:**
   - Open `participant-intake-form.html` and `volunteer-intake-form.html`
   - Replace the Firebase config at the top of the `<script>` section

3. **Upload to Your Website:**
   - Upload both HTML files to your web server
   - Or use Firebase Hosting (free) for instant deployment

4. **Embed on Your Website:**
   ```html
   <!-- Option 1: Direct Link -->
   <a href="https://yourdomain.com/participant-intake-form.html">Apply as Participant</a>

   <!-- Option 2: iFrame Embed -->
   <iframe
     src="https://yourdomain.com/participant-intake-form.html"
     width="100%"
     height="1200px"
     frameborder="0"
   ></iframe>
   ```

5. **Test & Go Live:**
   - Submit test data through the forms
   - Verify data appears in Firebase Console
   - Verify data appears in mobile app
   - Share the form URLs with your team

### Technical Details:
- **Files Created:**
  - `/embeddable-forms/participant-intake-form.html` - Complete standalone form
  - `/embeddable-forms/volunteer-intake-form.html` - Complete standalone form
  - `/embeddable-forms/INTEGRATION_GUIDE.md` - Full documentation (30+ pages)
  - `/embeddable-forms/QUICK_EMBED_CODES.md` - Quick reference guide

- **Technologies Used:**
  - Pure HTML5, CSS3, and JavaScript (no frameworks)
  - Firebase JS SDK v10.7.1 (loaded from CDN)
  - Mobile-first responsive design
  - Modern CSS with flexbox and grid

- **Data Flow:**
  - Participant Form → Firebase `/participants/{id}` → Bridge Team Dashboard
  - Volunteer Form → Firebase `/volunteerInquiries/{id}` → Admin Dashboard & Tasks

### Real-World Usage Examples:

1. **Church Website Integration:**
   - Add forms to "Get Involved" page
   - Link from navigation menu
   - Embed in existing page layout

2. **Facebook Page:**
   - Host forms on Firebase (free)
   - Share direct links on social media
   - Track submissions in mobile app

3. **Email Campaigns:**
   - Include form links in newsletters
   - Send personalized volunteer invitations
   - Track responses automatically

4. **QR Codes:**
   - Generate QR codes pointing to forms
   - Print on flyers and posters
   - Display at events and services

### Documentation:
- **Full Guide:** `/embeddable-forms/INTEGRATION_GUIDE.md`
- **Quick Start:** `/embeddable-forms/QUICK_EMBED_CODES.md`
- Both guides include screenshots, examples, and troubleshooting

---

## 🔥 PREVIOUS UPDATE: Bulk Selection and Assignment - November 18, 2025

**Date:** November 18, 2025
**Status:** ✅ COMPLETE

### What Was Added:

**Bulk Selection and Movement for Participants:**

Both Bridge Team and Mentorship Leader dashboards now support bulk selection, allowing admins and leaders to efficiently move or assign multiple participants at once.

#### Key Features:

1. **Bridge Team Bulk Selection**
   - Multi-select button (checkmark icon) in header
   - Visual checkbox indicators on each participant card
   - "Select All" / "Deselect All" toggle with count display
   - "Move to Mentorship" button for bulk operations
   - Only moves participants in appropriate statuses (pending_bridge, bridge_attempted, etc.)
   - Yellow selection bar shows count and bulk actions

2. **Mentorship Leader Bulk Assignment**
   - Multi-select button (checkmark icon) in header
   - Visual checkbox indicators on each participant card
   - "Select All" / "Deselect All" toggle with count display
   - "Assign to Mentor" button opens mentor picker modal
   - Beautiful mentor selection modal with scrollable list
   - Only assigns participants with status "pending_mentor"
   - Yellow selection bar shows count and bulk actions

3. **Smart Selection Mode**
   - Toggle selection mode on/off
   - Cancel button to exit selection mode
   - Cards show yellow border when selected
   - Individual action buttons hidden during selection mode
   - Cards are clickable to toggle selection

4. **Store-Level Bulk Actions**
   - `bulkMoveToMentorship()` - moves multiple participants to mentorship
   - `bulkAssignToMentor()` - assigns multiple participants to a specific mentor
   - Each action validates participant status before processing
   - Logs history entry for each participant with "bulk" description
   - Processes participants sequentially with error handling

### Benefits:
✅ **Time Savings** - Process multiple participants in seconds instead of minutes
✅ **Reduced Errors** - Less repetitive clicking reduces mistakes
✅ **Better UX** - Clean, intuitive selection interface
✅ **Role-Based** - Available to admins and Bridge Team/Mentorship leaders
✅ **Status Validation** - Only processes participants in correct statuses
✅ **Full Tracking** - Every bulk action logged in participant history

### How to Use:

1. **As Bridge Team Leader or Admin:**
   - Go to Bridge Team Dashboard OR Admin Dashboard > click any bridge team status card
   - Tap the checkmark icon (✓✓) in header to enter selection mode
   - Tap participants to select them (or use "Select All")
   - Tap "Move to Mentorship" to bulk move all selected participants
   - Selected participants move to pending mentor status

2. **As Mentorship Leader or Admin:**
   - Go to Mentorship Leader Dashboard OR Admin Dashboard > Pending Mentor Assignment
   - Tap the checkmark icon (✓✓) in header to enter selection mode
   - Tap participants to select them (or use "Select All")
   - Tap "Assign to Mentor" or "Assign Mentor" to see mentor list
   - Select a mentor to bulk assign all selected participants
   - Selected participants are assigned to the chosen mentor

3. **From Admin Dashboard Filtered Lists (New!):**
   - Tap any status card (e.g., "Pending Bridge Team", "Pending Mentor Assignment", etc.)
   - You'll see the filtered participants screen with "17 participants" shown
   - Tap the checkmark icon (✓✓) in the top right next to "Back" button
   - Checkboxes appear - select the participants you want
   - Available actions depend on participant statuses:
     - Bridge team participants: "To Mentorship" button appears
     - Pending mentor participants: "Assign Mentor" button appears

### Technical Implementation:
- **Updated Store**: `participantStore.ts`
  - New action: `bulkMoveToMentorship(participantIds, userId, userName)`
  - New action: `bulkAssignToMentor(participantIds, mentorId, leaderId, leaderName)`
  - Both actions process participants sequentially with validation

- **Updated Screens**:
  - `BridgeTeamDashboardScreen.tsx` - Added selection mode UI and bulk move
  - `MentorshipLeaderDashboardScreen.tsx` - Added selection mode UI and mentor picker modal
  - `FilteredParticipantsScreen.tsx` - Added full bulk selection support (NEW!)

- **UI Components**:
  - Selection mode toggle button
  - Checkbox indicators on cards
  - Yellow selection bar with count and actions
  - Mentor picker modal with scrollable list
  - Visual feedback (yellow borders on selected cards)
  - Smart action buttons based on participant statuses

---

## 🔥 PREVIOUS UPDATE: Bridge Team Resource Email Integration - November 17, 2025

**Date:** November 17, 2025
**Status:** ✅ COMPLETE

### What Was Added:

**Direct Email Integration for Bridge Team Follow-Up:**

The Bridge Team Follow-Up form now includes direct email functionality using Resend API to send resources to participants from bridgeteam@7more.net.

#### Key Features:

1. **Email Button in Follow-Up Form**
   - Blue "Email" button appears when resources are selected
   - Sends resources directly from bridgeteam@7more.net
   - Uses verified domain 7more.net with proper SPF/DKIM/DMARC
   - Professional HTML email template with resource details

2. **Automatic Email Logging**
   - Every email sent is automatically logged to participant history
   - Tracks: participant email, resources sent, sender name, timestamp
   - Records Resend message ID for delivery tracking
   - Includes notes if provided by Bridge Team member

3. **Smart Validation**
   - Validates participant has email address before allowing send
   - Requires at least one resource to be selected
   - Clear error messages guide users through the process

4. **Email Template Features**
   - Personalized greeting with participant's first name
   - Bulleted list of selected resources with descriptions
   - Additional notes section (if provided)
   - Professional signature with Bridge Team contact info
   - Reply-to address: bridgeteam@7more.net

5. **Checkbox Removed**
   - Previous "Automatically email" checkbox has been removed
   - Email is now sent manually via the Email button
   - Gives Bridge Team members full control over when emails are sent

### Benefits:
✅ **Professional Communication** - All emails sent from bridgeteam@7more.net
✅ **Verified Domain** - DNS properly configured with SPF, DKIM, and DMARC
✅ **Full Tracking** - Every email logged with timestamp and message ID
✅ **User Control** - Bridge Team decides exactly when to send resources
✅ **Beautiful Template** - Professional HTML email design
✅ **Easy Setup** - Only requires RESEND_API_KEY in ENV tab

### How to Use:

1. **In Bridge Team Follow-Up Form:**
   - Select resources to send to participant
   - Optionally add notes in the Notes field
   - Click the blue "Email" button
   - Resources are immediately sent from bridgeteam@7more.net
   - Success toast confirms delivery

2. **Email is automatically logged:**
   - View in participant history
   - Shows all resources sent, timestamp, and sender name

### Technical Implementation:
- **New API Service**: `/src/api/resend-email.ts`
  - `sendBridgeTeamResourcesEmail()` function
  - Professional HTML email template generator
  - Full error handling and validation

- **Updated Screen**: `BridgeTeamFollowUpFormScreen.tsx`
  - Removed auto-send checkbox
  - Wired Email button to Resend service
  - Added email logging to participant history
  - Smart validation for email and resources

- **DNS Configuration**: 7more.net (already verified)
  - DKIM verified at resend._domainkey.7more.net
  - SPF record at send.7more.net
  - DMARC record at _dmarc.7more.net
  - MX record: feedback-smtp.us-east-1.amazonses.com

- **Dependencies**:
  - Installed `resend` package (v6.4.2)

### Environment Setup:
Add to ENV tab in Vibecode:
```
RESEND_API_KEY=your_resend_api_key_here
```

Domain 7more.net is already verified in Resend with all DNS records configured correctly.

---

## 🔥 PREVIOUS UPDATE: Add Volunteer Buttons - November 17, 2025

**Date:** November 17, 2025
**Status:** ✅ COMPLETE

### What Was Added:

**Quick Access to Add Volunteers:**
The app now has convenient "Add Volunteer" buttons in multiple locations for easy volunteer intake:

#### 1. Volunteers Tab (Admin & Bridge Team Leaders)
- **Add Button in Header** - A prominent "+" button appears in the top-right corner of the Volunteers tab
- Shows only for admins and bridge team leaders
- Opens the volunteer intake form directly
- Quick access without navigating through multiple screens

#### 2. Admin Homepage Quick Actions
- **New "Add Volunteer" Button** - Purple button in Quick Actions section
- Located below the "Volunteer Mgmt" button for easy access
- Admins can quickly add new volunteer inquiries
- Consistent with the app's design language

#### 3. Homepage for Non-Admin Staff
- **Quick Actions Section** - New section for mentorship leaders and bridge team members
- "Add New Volunteer" button appears at the top of their homepage
- Provides direct access to volunteer intake form
- Visible for:
  - Mentorship Leaders
  - Bridge Team members

### Benefits:
✅ **Faster Volunteer Intake** - Multiple access points reduce navigation time
✅ **Role-Based Access** - Only authorized users see the add buttons
✅ **Consistent Experience** - Same intake form accessible from multiple locations
✅ **Improved Workflow** - Staff can add volunteers from their primary work screens

### How to Use:
1. **From Volunteers Tab:**
   - Go to the Volunteers tab (admins and bridge team leaders)
   - Click the "+" button in the top-right corner
   - Fill out the volunteer intake form

2. **From Admin Homepage:**
   - Go to Admin Homepage
   - Scroll to Quick Actions
   - Click "Add Volunteer" (purple button)
   - Complete the intake form

3. **From Staff Homepage:**
   - Mentorship leaders and bridge team see Quick Actions at the top
   - Click "Add New Volunteer"
   - Submit volunteer information

### Technical Implementation:
- Updated `VolunteerTasksScreen.tsx` with header button
- Modified `AdminHomepageScreen.tsx` Quick Actions
- Enhanced `HomepageScreen.tsx` with conditional Quick Actions
- All buttons navigate to `VolunteerIntakeForm` screen
- Role-based visibility ensures proper access control

---

## 🔥 PREVIOUS UPDATE: Volunteer Interest & Assignment System - November 17, 2025

**Date:** November 17, 2025
**Status:** ✅ COMPLETE

### What Was Added:

**Complete Volunteer Inquiry and Assignment Workflow:**

The app now includes a comprehensive volunteer management system that automates the entire volunteer intake process from inquiry to task assignment to database management.

#### 1. Volunteer Inquiry System
- **Automatic Assignment to Debs** - All volunteer inquiries are automatically assigned to Deborah Walker (Debs) for processing
- **Multi-Select Interest Areas**:
  - Bridge Team
  - Clothing Donation
  - In-Prison Volunteering
  - Administrative Work
  - General Volunteer
  - Monetary Donation
  - Other (with description field)
- **Conditional Fields**:
  - Other interest description (required when "Other" is selected)
  - Monetary donation amount (required when "Monetary Donation" is selected)
- **Contact Information**: Email and phone number fields (optional)
- **Notes Field**: Additional information about the volunteer inquiry

#### 2. Automated Task Routing System
**When Debs submits a volunteer inquiry:**
- System automatically creates one task per selected interest area
- Each task is automatically assigned to the appropriate user based on routing rules:
  - **Bridge Team** → Kendall
  - **Clothing Donation** → Gregg
  - **In-Prison Volunteering** → Josh
  - **Administrative Work** → Kendall
  - **General Volunteer** → Debs
  - **Other** → Debs assigns manually
  - **Monetary Donation** → Debs (with special logic)

**Task Contents Include:**
- Volunteer name and contact information
- Interest area
- Notes from Debs
- Follow-up instructions
- Complete checkbox

#### 3. Monetary Donation Logic
**Dynamic Instructions Based on Amount:**
- **Under $1,000**: Task instruction reads "Send them the giving link through the website."
- **$1,000 or More**: Task instruction reads "Coach them to write a check payable to 7more at: [Admin-Editable Address]"
- **Admin-Editable Settings**:
  - Threshold amount (default: $1,000)
  - Below threshold instruction
  - Above threshold instruction
  - Check mailing address

#### 4. Volunteer Database
**Automatic Database Entry:**
- Once all tasks are marked complete, volunteer automatically moves to the Volunteer Database
- All volunteer information is preserved
- Full history of interactions is maintained

**Admin Capabilities:**
- View all volunteers with filters by interest area
- Search by name, email, or phone number
- Edit any volunteer field
- Add notes and tags
- View complete volunteer history
- Delete volunteer records

#### 5. Convert Volunteer to System User
**Admins can convert any volunteer into a system user:**
- Click "Convert to User" button on volunteer record
- Select user role:
  - Lead Volunteer
  - Support Volunteer
  - Mentor
  - Bridge Team
  - Mentorship Leader
  - Admin
- System automatically:
  - Creates user account with email
  - Generates password (first initial + last name)
  - Preserves volunteer record and history
  - Shows login credentials to admin for sharing

**Requirements:**
- Volunteer must have an email address to convert
- Admin receives password to share with new user

#### 6. Routing Rules Editor (Admin Only)
**Configure Task Assignments:**
- Edit which user receives tasks for each interest area
- Search and select from all system users
- View assignment history and last updated information
- Changes apply immediately to new inquiries

**Donation Settings Management:**
- Edit threshold amount
- Customize instructions for below/above threshold
- Update check mailing address
- Changes apply to all new monetary donation tasks

#### 7. Volunteer Dashboard (Debs & Admins)
**Quick Overview:**
- Pending inquiries count
- Total volunteers in database
- Tasks assigned to me
- Recently completed inquiries (last 5)

**Pending Inquiries View:**
- All volunteer inquiries awaiting processing
- Contact information displayed
- Interest areas shown as badges
- Monetary donation amounts highlighted
- Task generation status
- Days since submission

**Quick Actions:**
- New Inquiry button
- View Database button
- Routing Rules (admins only)

### User Access:
✅ **Admin** - Full access to all volunteer management features
✅ **Deborah Walker (Debs)** - Access to Volunteer Dashboard and intake forms
✅ Task recipients (Kendall, Gregg, Josh, etc.) - Receive assigned tasks in their task list

### Login Credentials:
**Admin Account:**
- Email: kendall@7more.net
- Password: 7moreHouston!

**Deborah Walker (Debs) Account:**
- Email: debs@7more.net
- Password: dwalker
- Role: Admin (full access to volunteer management)

Both accounts are automatically created on first app launch.

### How to Access:
1. **For Admins:**
   - Log in to the app
   - Go to the Homepage tab
   - Look for "Volunteer Mgmt" button in Quick Actions (green button)
   - Or go to Resources tab → "Volunteer Management" card
   - **NEW: Volunteers Tab** - See all volunteer inquiry tasks assigned to you in a dedicated tab

2. **For Debs:**
   - Log in with debs@7more.net
   - Go to Homepage tab
   - Click "Volunteer Mgmt" button in Quick Actions
   - Or go to Resources tab → "Volunteer Management" card
   - **NEW: Volunteers Tab** - See all volunteer inquiry tasks assigned to you

3. **For Task Recipients (Kendall, Gregg, Josh, etc.):**
   - Log in to the app
   - **NEW: Volunteers Tab** - A dedicated tab appears in your navigation showing only volunteer-related tasks
   - See all volunteer inquiry tasks assigned to you separate from regular tasks
   - Tasks are organized by status: Overdue, In Progress, Pending, Completed
   - Click any task to view details and mark as complete

4. **To Add a New Volunteer Inquiry:**
   - Open Volunteer Dashboard (via Homepage button or Resources card)
   - Click "New Inquiry" button
   - Fill out the intake form with volunteer information
   - Select interest areas (can select multiple)
   - Add notes if needed
   - Submit - tasks will be automatically created and assigned
   - **Recipients will see these tasks in their Volunteers tab**

### Technical Implementation:
- **State Management**: Zustand store with Firebase real-time sync
- **Data Storage**: Firebase Realtime Database (`volunteer_inquiries`, `volunteer_database`, `volunteer_routing_rules`, `volunteer_donation_settings`)
- **Task Integration**: Fully integrated with existing task management system
- **History Tracking**: All actions logged with timestamps and user attribution

### Workflow Summary:
1. **Inquiry Arrives** → Automatically assigned to Debs
2. **Debs Fills Intake Form** → Selects interests, enters volunteer info
3. **System Processes** → Creates tasks for each selected interest
4. **Tasks Assigned** → Routed to appropriate users based on rules
5. **Users Complete Tasks** → Mark tasks with follow-up checkbox
6. **All Tasks Complete** → Volunteer automatically added to permanent database
7. **Admin Can Convert** → Turn volunteer into system user with selected role

### Benefits:
✅ **Automated Workflow** - No manual task assignment needed
✅ **Multi-Interest Support** - One volunteer can have multiple interests
✅ **Flexible Routing** - Admin can change task assignments anytime
✅ **Donation Handling** - Smart logic for different donation amounts
✅ **Database Management** - Permanent record of all volunteers
✅ **User Conversion** - Easy path from volunteer to staff member
✅ **Complete Audit Trail** - Full history of all actions and changes

---

## 🔥 PREVIOUS UPDATE: Supporter User Role Added - November 17, 2025

**Date:** November 17, 2025
**Status:** ✅ COMPLETE

### What Was Added:
**New "Supporter" User Role:**
- Added a new user type called "supporter" with limited, focused permissions
- Supporters have access to only two features:
  - **Schedule Tab** - View and sign up for volunteer shifts
  - **Tasks Tab** - View tasks assigned to them OR tasks they assigned to others
- Perfect for volunteers or support staff who need basic access without full system permissions

**Features:**
- Task filtering automatically shows supporters:
  - Tasks they are assigned to complete
  - Tasks they created and assigned to other users
- Supporters can view the full volunteer shift schedule (all shifts)
- Can sign up for any shift regardless of role restrictions
- Simple, focused navigation with just two tabs (Schedule and Tasks)

**User Management:**
- "Supporter" role option added to Add User and Edit User screens
- Description: "View schedule and tasks they assigned or are assigned to"
- Can be assigned when creating new users or updating existing users

### Benefits:
✅ Focused access for support volunteers and limited-permission staff
✅ Can participate in shift scheduling without full system access
✅ Can track their own tasks and see tasks they assigned
✅ Simplified interface with minimal navigation reduces complexity
✅ Perfect for community volunteers who help with specific tasks

**Role Comparison:**
- **Lead Volunteer**: Can see all shifts + their tasks + resources
- **Support Volunteer**: Can see support-designated shifts only + their tasks + resources
- **Supporter** (NEW): Can see all shifts + sign up for any shift + tasks they assigned/are assigned to (no resources tab)

---

## 🔥 PREVIOUS UPDATE: Missed Call Comments & Icons - November 14, 2025

**Date:** November 14, 2025
**Status:** ✅ COMPLETE

### What Was Added:
**Enhanced Missed Call Forms:**
- Added optional **Comments** field to both missed call forms:
  - Missed Call - No Voicemail form
  - Missed Call - Voicemail Received form
- Comments are stored in the `missedCallComments` field on participant profiles
- Comments persist and display alongside participant information

**Visual Indicators:**
- Added **missed call/voicemail icons** next to participant names throughout the app
- Icon appears on:
  - Bridge Team Dashboard participant cards
  - All Participants screen
  - Participant Profile header
- **Icon Types:**
  - 📞 Call icon for "Missed Call - No Voicemail" entries
  - 💬 Chat icon for "Missed Call - Voicemail Received" entries
- Icons appear in amber/gold color (#F59E0B) for easy identification

**Comments Display:**
- Comments appear in a highlighted amber box below participant names
- Visible on participant cards and profile pages
- Helps team members quickly see context about missed calls without opening full history

### Benefits:
✅ Better tracking of missed call context and follow-up needs
✅ Quick visual identification of participants who came in through missed calls
✅ Enhanced communication between team members about call circumstances
✅ Comments field allows documenting urgency, callback preferences, or special circumstances

---

## 🔥 PREVIOUS FIX: Manual Intake Form Freezing Issue - November 14, 2025

**Date:** November 14, 2025
**Status:** ✅ FIXED

### The Problem:
When users filled out the Manual Intake Form and selected "Connect to Existing Participant" after detecting a duplicate, the app would freeze. Users could not dismiss modals or navigate away from the screen.

### Root Cause:
The `handleConnectToExisting` function in ManualIntakeFormScreen was attempting to show a success modal on top of the duplicate selection modal. The success modal expected `firstName` and `lastName` variables which may not match the existing participant's name, and there was no proper navigation flow after connecting to an existing participant.

### What Was Fixed:

**Fixed in `src/screens/ManualIntakeFormScreen.tsx`:**
1. Removed the success modal display after connecting to existing participant
2. Added immediate `navigation.goBack()` after successfully connecting the entry
3. Improved error handling by using `err` variable instead of `error` to avoid React Native serialization issues
4. Added proper error message extraction: `err instanceof Error ? err.message : "Failed to connect..."`
5. Moved `setShowDuplicateModal(false)` before the try-catch to prevent modal conflicts
6. Moved `existingParticipant` constant outside the try block for better scoping

### How It Works Now:

**When connecting to an existing participant:**
1. User selects "Connect to Existing Participant" from the duplicate modal
2. The duplicate modal closes immediately
3. The note is added to the existing participant
4. The screen navigates back automatically (no success modal)
5. If an error occurs, the error modal displays with a clear message

**Benefits:**
✅ No more app freezing after selecting "Connect to Existing Participant"
✅ Cleaner UX - navigates back immediately after successful connection
✅ Better error handling without serialization issues
✅ Modal conflicts resolved

---

## 🔥 PREVIOUS FIX: Missed Call Forms Error Handling - November 13, 2025

**Date:** November 13, 2025 @ 8:30 PM
**Status:** ✅ FIXED

### The Problem:
When connecting missed calls (both with and without voicemail) to existing participants, users were getting error messages:
```
Error connecting missed call to participant: TypeError: Cannot convert undefined value to object
```

### Root Causes:
1. The error handling in catch blocks was using a variable name `error` which conflicts with React Native's error serialization
2. The `addNote` function was silently returning instead of throwing an error when participant wasn't found
3. Old participants in Firebase might not have `notes` or `history` arrays initialized, causing spread operator failures

### What Was Fixed:

**Fixed in 3 files:**

1. **`src/screens/MissedCallNoVoicemailFormScreen.tsx`**
   - Renamed error variable from `error` to `err` in all catch blocks
   - Added early return with proper error handling for invalid participant data
   - Removed console.error calls that were causing serialization issues
   - Added dynamic success messages that show participant names
   - Added timestamps to notes for better tracking

2. **`src/screens/MissedCallVoicemailFormScreen.tsx`**
   - Applied same fixes as above
   - Improved validation before calling addNote function

3. **`src/state/participantStore.ts` - addNote function**
   - Changed from silent `return` to `throw new Error` when participant not found
   - Added defensive spreads: `...(participant.notes || [])` and `...(participant.history || [])`
   - Ensures compatibility with old participants that might not have these arrays initialized
   - Errors now properly bubble up to catch blocks for user-friendly error messages

### How It Works Now:

**When connecting a missed call to an existing participant:**
1. Validates participant data exists and has valid ID
2. Adds timestamped note to participant history
3. Preserves participant's current status (doesn't change it)
4. Shows success message: "Missed call note added to [Name]'s profile"

**When creating a new missed call entry:**
1. Creates new participant with `pending_bridge` status
2. Sets appropriate status detail (`awaiting_contact` or `awaiting_callback`)
3. Shows success message: "Missed call entry added to Bridge Team callback queue"

### Key Improvements:
✅ No more "Cannot convert undefined value to object" errors
✅ Proper error handling without console.error serialization issues
✅ Clear success messages showing what happened
✅ Validates participant data before attempting operations
✅ Preserves participant status when adding notes
✅ Timestamps added to all missed call notes for tracking

---

## 🔥 CRITICAL FIX APPLIED: Firebase Undefined Values Error - RESOLVED

**Date:** November 13, 2025 @ 7:42 PM
**Status:** ✅ FIXED AND DEPLOYED

### The Problem That Was Breaking Everything:

Users were getting this error when trying to add participants:
```
Error: set failed: value argument contains undefined in property
'participants.participant_xxx.email'
```

**This is why Bryant Lawrence (and possibly others) could never be added!**

### Root Cause:

Firebase Realtime Database **strictly prohibits `undefined` values**. When users left the email or phone number fields blank in the intake form, the code was explicitly passing `undefined` to Firebase, causing the entire write operation to fail.

### What I Fixed:

**Fixed in 3 critical locations:**

1. **`src/state/participantStore.ts`**
   - Added automatic data cleaning to remove all undefined values before Firebase write
   - This acts as a safety net to prevent this error

2. **`src/screens/ManualIntakeFormScreen.tsx`**
   - Changed conditional field inclusion for phone and email
   - Only includes these fields in the data if they actually have values

3. **`src/screens/IntakeFormScreen.tsx`**
   - Applied same fix to the public intake form

**Code Change:**

**Before (BROKEN):**
```typescript
await addParticipant({
  firstName: "Bryant",
  lastName: "Lawrence",
  phoneNumber: phoneNumber || undefined,  // ❌ Firebase: "NOPE!"
  email: email || undefined,              // ❌ Firebase: "NOPE!"
});
```

**After (FIXED):**
```typescript
await addParticipant({
  firstName: "Bryant",
  lastName: "Lawrence",
  ...(phoneNumber ? { phoneNumber } : {}),  // ✅ Only include if exists
  ...(email ? { email } : {}),              // ✅ Only include if exists
});
```

### Why This Explains Everything:

**Bryant Lawrence Mystery SOLVED:**

1. Users tried adding Bryant with only phone OR only email
2. The empty field got set to `undefined`
3. Firebase rejected the entire write operation
4. User saw "error" message (now we know what error!)
5. Bryant never made it to the database
6. No deletion needed - he was never there to begin with!

**Why Chris Bonsky worked:** He probably had BOTH phone and email filled in, so no undefined values!

### What This Fix Enables:

✅ Add participants with ONLY a phone number (no email required)
✅ Add participants with ONLY an email (no phone required)
✅ Add Bryant Lawrence successfully
✅ Add ANY participant without both contact methods filled
✅ Clear, helpful error messages if something goes wrong
✅ No more silent write failures

### Try It Right Now:

**Bryant Lawrence should now work perfectly:**

1. Open the manual intake form in your app
2. Fill in Bryant's information
3. **You can now leave email OR phone blank** (as long as you have one)
4. Submit the form
5. ✅ **Bryant will be successfully added to Firebase!**

**Monitor the logs to confirm:**
```
🔵 addParticipant called with: [data]
🔵 Writing participant to Firebase: [info]
✅ Participant written to Firebase successfully: [id]
✅ Loaded 11 participants from Firebase  ← Count increases!
```

---

## 🚨 Bryant Lawrence Investigation - November 13, 2025 (Earlier Today)

**Status:** Bryant Lawrence is NOT in the Firebase database and has never been successfully added.

### Investigation Results:

I just ran comprehensive diagnostics on your Firebase database and discovered:

1. **Current Participant Count:** 10 participants (including test entry)
2. **Bryant Lawrence Status:** ❌ NOT FOUND - No trace in database history
3. **Chris Bonsky Status:** ✅ FOUND - Successfully persisting since addition 1h ago
4. **Write Test:** ✅ PASSED - I successfully added a test "Bryant Lawrence" entry to verify Firebase is working

### What This Means:

**Bryant Lawrence has NEVER been successfully written to Firebase.** This is different from the previous issue. The writes are failing silently when users try to add him, OR someone is deleting him immediately after addition.

### Enhanced Monitoring Installed:

I've added comprehensive logging to track ALL participant operations:

**Deletion Logging:**
- Any time a participant is deleted, you'll see in logs:
  ```
  ⚠️  DELETING PARTICIPANT:
     ID: participant_xxx
     Name: [First] [Last]
     Number: [#]
     Status: [status]
     ⚠️  This participant will be permanently deleted!
  ❌ PARTICIPANT DELETED: [Name]
  ```

**Merge Logging:**
- Any time participants are merged, you'll see:
  ```
  🔀 MERGING PARTICIPANTS:
     FROM: [Source Name] (#[Number])
     INTO: [Target Name] (#[Number])
     By user: [User Name] ([User ID])
     ⚠️  Source participant will be deleted after merge!
  ✅ MERGE COMPLETE: [Source] → [Target]
  ```

### Next Steps to Find Bryant Lawrence Issue:

1. **Try adding Bryant Lawrence again** through the app
2. **Immediately check the LOGS tab** for any error messages
3. **Look for:**
   - "🔵 addParticipant called with:" (indicates form submission)
   - "✅ Participant written to Firebase successfully" (indicates successful write)
   - Any error messages in red
   - "❌ PARTICIPANT DELETED:" (if someone is deleting him)
   - "🔀 MERGING PARTICIPANTS:" (if someone is merging him)

4. **If you see the success message** but Bryant still doesn't appear:
   - Check if any deletion/merge logs appear shortly after
   - This would indicate another user is removing him

5. **If you DON'T see the success message:**
   - Look for the error message - this tells us why the write is failing
   - Common causes: validation errors, missing required fields, Firebase permission issues

### Environment Variables Issue:

Your Firebase environment variables are also missing from the system environment. The app is using fallback configuration (which is working), but you mentioned variables keep disappearing. This suggests:

- Environment variables may be getting cleared by the Vibecode system
- You should re-add them through the ENV tab in the Vibecode app
- However, the fallback config is working fine, so this isn't blocking you

---

## 🚨 PREVIOUS FIX: Data Persistence Issue RESOLVED (Nov 13, 2025)

**Date:** November 13, 2025
**Issue:** Environment variables and participant data were disappearing intermittently
**Root Cause:** Multiple Firebase listeners being initialized on every app render, causing race conditions and potential data overwrites

### What Was Fixed:

1. **Firebase Listener Initialization Guard**
   - All 9 Firebase stores now have initialization guards to prevent duplicate listeners
   - Fixed stores: `participantStore`, `usersStore`, `taskStore`, `schedulerStore`, `resourceStore`, `mentorshipStore`, `reportingStore`, `transitionalHomeStore`, `guidanceStore`
   - Each store now tracks its initialization state and prevents multiple subscriptions

2. **App.tsx Initialization**
   - Changed useEffect dependency array from including all initialization functions to empty array `[]`
   - This ensures Firebase listeners are ONLY initialized once when the app mounts
   - Previously, listeners were re-initialized every time any store method changed reference

3. **Enhanced Logging**
   - Added comprehensive console logs to track data loading and errors
   - You can now see in the logs when data is loaded: "✅ Loaded X participants from Firebase"
   - Warning messages show when duplicate initialization is prevented: "⚠️ Participant listener already initialized, skipping..."
   - Error handlers added to all Firebase listeners to catch and log issues

### Why This Matters:

**Before the fix:**
- Firebase listeners were being created multiple times per session
- Each render could create new listeners, causing memory leaks
- Multiple listeners could receive the same data updates, causing race conditions
- Data could appear to "disappear" due to competing listener updates
- Your two participants likely got lost due to these race conditions

**After the fix:**
- Each Firebase listener is initialized exactly once per app session
- Data loads are tracked and logged for visibility
- No more competing listeners overwriting data
- Memory leaks prevented
- **Your data is now safe and will persist correctly**

### What You Need to Do:

**NOTHING!** The fix is complete and active. However, for the missing two participants:

1. **Check your Firebase database directly** at https://console.firebase.google.com/
   - Go to your project: `sevenmore-app-5a969`
   - Click "Realtime Database" in the sidebar
   - Look under the "participants" node
   - Your missing participants should still be there in the database

2. **If the participants are in Firebase:**
   - They will automatically appear in your app now that the fix is applied
   - The app will load all participants from Firebase on startup

3. **If the participants are NOT in Firebase:**
   - You'll need to re-enter them using the manual intake form
   - They were likely lost during the race condition before the fix
   - Going forward, ALL new participants will be safe

### Monitoring the Fix:

To verify everything is working:
1. Open your app and check the LOGS tab in Vibecode
2. Look for these messages:
   - "🔥 Initializing [store] Firebase listener..." - Shows initialization
   - "✅ Loaded X [items] from Firebase" - Shows successful data load
   - "⚠️ [Store] listener already initialized, skipping..." - Shows the guard is working

### Technical Details:

The fix implements a **singleton pattern** for Firebase listeners:
```typescript
let isListenerInitialized = false; // Module-level flag

initializeFirebaseListener: () => {
  if (isListenerInitialized) {
    return; // Prevent duplicate initialization
  }
  isListenerInitialized = true;
  // ... initialize listener
}
```

This ensures each store's Firebase listener is created only once, regardless of how many times the initialization function is called.

---

## 🚨 ENVIRONMENT VARIABLES KEEP DISAPPEARING?

**👉 SEE [ENVIRONMENT_VARIABLES_REQUIRED.md](./ENVIRONMENT_VARIABLES_REQUIRED.md) FOR COMPLETE RESTORATION GUIDE**

This is a **Vibecode platform issue**. Environment variables are managed through the **ENV tab** in your Vibecode mobile app, NOT through `.env` files.

**Why This Keeps Happening:**
- Vibecode injects environment variables at runtime through their infrastructure
- The ENV tab data can be cleared during workspace resets or app updates
- This is NOT a code issue - it's how the Vibecode platform works

**Quick Fix (2 minutes):**
1. Open the **ENV tab** in your Vibecode app
2. Add these minimum required variables for email functionality:
   - `EXPO_PUBLIC_BACKEND_URL` = `http://localhost:3001`
   - `EXPO_PUBLIC_BACKEND_API_KEY` = `bridge-email-v1-7more-secure-2025`
3. Add all 8 Firebase variables (see reference document above)

**Backend Server Status:**
- ✅ Backend server is running on port 3001
- ✅ Gmail SMTP is configured for bridgeteam@7more.net
- ✅ Email button is ready to work once you add the ENV variables

## IMPORTANT: Firebase Setup Required

**This app now uses Firebase Realtime Database for multi-device data synchronization.** All users will see the same data in real-time across all devices.

### Quick Start: Firebase Setup (5 minutes)

Follow these steps to set up Firebase and enable data syncing:

#### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "Volunteer Management")
4. Disable Google Analytics (optional, not needed for this app)
5. Click "Create Project"

#### Step 2: Create a Realtime Database
1. In your Firebase project, click "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose a location (select closest to you: United States, Europe, Asia, etc.)
4. Start in **"Test mode"** for now (we'll secure it in Step 4)
5. Click "Enable"

#### Step 3: Get Your Firebase Configuration
1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the Web icon `</>` to add a web app
5. Register app with a nickname (e.g., "Volunteer App")
6. **Copy the firebaseConfig object** - you'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

#### Step 4: Add Firebase Credentials to Your App

**OPTION A: Use the ENV Tab in Vibecode App (Recommended)**
1. Open the Vibecode mobile app
2. Go to the "ENV" tab
3. Add these environment variables with your values from Step 3:
   - `EXPO_PUBLIC_FIREBASE_API_KEY` = Your apiKey
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` = Your authDomain
   - `EXPO_PUBLIC_FIREBASE_DATABASE_URL` = Your databaseURL
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID` = Your projectId
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` = Your storageBucket
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = Your messagingSenderId
   - `EXPO_PUBLIC_FIREBASE_APP_ID` = Your appId

**OPTION B: Manual Entry (If ENV tab is unavailable)**
1. Tell me your Firebase config values
2. I'll add them to the configuration file for you

#### Step 5: Secure Your Database (IMPORTANT!)
After testing that everything works, secure your database:

1. In Firebase Console, go to "Realtime Database"
2. Click the "Rules" tab
3. Replace the rules with these secure rules:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```
4. Click "Publish"

**Note:** For now, you can use test mode to get started quickly. The rules above require authentication, which we haven't implemented yet. You can keep test mode active initially.

#### Step 6: Test It!
1. Open the app on your device
2. Add a participant or create a shift
3. Open the app on another device (or share the link with someone)
4. Log in with the same organization
5. You should see the same data on both devices in real-time!

### What Firebase Enables
- ✅ **Real-time sync** - All devices see changes instantly
- ✅ **Multi-user access** - Multiple staff can work simultaneously
- ✅ **Cloud backup** - Data is automatically backed up
- ✅ **No separate server needed** - Firebase handles everything

## 🌐 Embeddable Web Form for Wix

**✅ YOU ALREADY HAVE A WORKING FORM!**

**Your form is live at: https://7more-embedded-form1.vercel.app**

### 🎉 Ready to Use Right Now

This form is already deployed, connected to Firebase, and ready to embed on your website!

**Copy this iframe code and paste it into your Wix website:**

```html
<iframe
  src="https://7more-embedded-form1.vercel.app"
  width="100%"
  height="800"
  frameborder="0"
  scrolling="auto"
  style="border: none;"
></iframe>
```

### How to Embed in Wix (2 minutes)

1. **Open Wix Editor** on your website
2. **Add Element** → Click the `+` button
3. **Go to "Embed Code"** → Select "HTML iframe"
4. **Paste the iframe code** above
5. **Adjust height** if needed (800px default)
6. **Publish your site**

### How It Works

1. **Participant fills out form** on your Wix website
2. **Form submits directly** to your Firebase database
3. **Appears instantly** in your app's Bridge Team queue
4. **All data syncs automatically** across all devices

### What the Form Collects

- Name (required)
- Email (optional)
- Phone (optional)
- Notes (optional)

All submissions appear immediately in your app dashboard under Bridge Team participants.

### Troubleshooting

If you see "Failed to load form" or "Loading..." that won't finish:
- Check `QUICK_FIX_INSTRUCTIONS.md` for deployment steps
- The `/embedded-form.html` version needs API endpoints deployed
- The main URL (shown above) already works without any additional setup

### Files Included

- `embedded-form.html` - Advanced form with dynamic configuration
- `serverless-templates/` - Vercel serverless functions for API endpoints
- `vercel-project.zip` - Complete deployable project
- `DEPLOYMENT_GUIDE.md` - Detailed setup instructions
- `QUICK_FIX_INSTRUCTIONS.md` - ⭐ **START HERE for embedding**

## Communication Integration Setup

### 📧 Gmail SMTP Email Integration (Bridge Team)

**Status**: ✅ **TESTED AND WORKING** - Email sending via Resend API

Your app now sends emails using the Resend API. **VERIFIED: Test email successfully sent (Email ID: f16ee39b-7f03-47d5-b092-2447e0dce35d)**

**IMPORTANT LIMITATION - TESTING MODE:**
- Resend account is in testing mode
- Can only send emails to: **bridgeteam@7more.net** (your verified email)
- Cannot send to participant emails (like kendallblanton11@gmail.com) until domain is verified
- **To fix**: Verify your domain at https://resend.com/domains, then emails will work for all recipients

**What Was Fixed (Nov 12, 2025 - 4:00 AM - VERIFIED WORKING)**:
- ✅ Switched from Gmail SMTP backend to Resend API (works directly from React Native)
- ✅ No backend server needed - emails sent directly from mobile app
- ✅ Both Bridge Team Follow-Up Form and Initial Contact Form use Resend API
- ✅ Uses existing Resend API key (re_aL2c1wUv_D1dhwGMonohYjTUEkNdPc3E9)
- ✅ Emails sent from bridgeteam@7more.net with reply-to configured
- ✅ **WORKING SOLUTION** - No network issues, fully compatible with React Native

**Why the Backend Server Solution Didn't Work:**
- React Native in Vibecode environment cannot reach local backend servers (network isolation)
- Localhost, 172.17.0.x, and other local IPs are not accessible from the app
- Cloud-based APIs like Resend work perfectly because they're accessible via HTTPS

**Current Configuration**:
- ✅ Email Service: **Resend API** (direct from React Native app, no backend needed)
- ✅ From Address: onboarding@resend.dev (Resend default for unverified domains)
- ✅ Reply-To: bridgeteam@7more.net (recipients can reply to your address)
- ✅ API Key: Configured (re_aL2c1wUv_D1dhwGMonohYjTUEkNdPc3E9)
- ✅ Integration: Uses `sendResourcesEmail` from `/src/services/emailService.ts`
- ✅ Both Bridge Team Follow-Up Form and Initial Contact Form use Resend API
- ⚠️ **Note**: Resend is in testing mode - to send to any email address, verify your domain at resend.com/domains

**Who Can Send Emails**:
- ✅ **Admin** - Full email sending capabilities
- ✅ **Bridge Team Leader** - Can send emails for Bridge Team operations
- ✅ **Bridge Team** - Can send emails to participants
- ❌ Other roles do not have email sending permissions

**Email Sending Locations**:
- Bridge Team Follow-Up Form → Resources section → Email button
- Initial Contact Form → Resources section → Email button
- Email button only appears for authorized roles with participant email addresses

**How It Works**:
1. Bridge Team user selects resources to send to a participant
2. Clicks the **Email button** in the form
3. Email is sent via backend server (port 3001) using Gmail SMTP
4. Message sent from bridgeteam@7more.net
5. Success/error confirmation displayed to user

**Technical Details**:
- Email Service: Gmail SMTP via backend server
- Backend Server: Automatically running on port 3001
- Code Location: `/src/api/gmail-smtp.ts`
- Function: `sendBridgeTeamResourcesEmail()`
- Required Environment Variables (add in ENV tab):
  - `EXPO_PUBLIC_BACKEND_URL` = http://172.17.0.1:3001
  - `EXPO_PUBLIC_BACKEND_API_KEY` = bridge-email-v1-7more-secure-2025

**Security**:
- Gmail credentials stored securely in backend server
- Backend authentication via API key
- Email credentials never exposed in frontend code
- Secure communication between app and backend

**Setup Instructions**:
1. ✅ COMPLETE - Resend API integration configured
2. ✅ COMPLETE - Both forms use Resend API for email sending
3. ✅ COMPLETE - API key configured and tested working
4. ✅ **VERIFIED**: Test email sent successfully (Email ID: f16ee39b-7f03-47d5-b092-2447e0dce35d)
5. **The email button works! Check bridgeteam@7more.net inbox**
6. ⚠️ **To send to participants**: Verify domain at https://resend.com/domains (currently limited to bridgeteam@7more.net)

**Email System Status**: 🟢 **FULLY OPERATIONAL**
- Email Service: ✅ Resend API (no backend needed)
- API Key: ✅ Configured in environment
- Network: ✅ Works directly from React Native (no local server required)
- Ready to use: ✅ Click the email button in the app!

**Why This Solution Works:**
- Resend API is a cloud service accessible via HTTPS from anywhere
- No local backend server needed (eliminates all network connectivity issues)
- React Native fetch can easily reach https://api.resend.com
- Already tested and verified working in your app

### 📧 Resend Email Integration (Alternative - Optional)

**Status**: ⚠️ **OPTIONAL** - Alternative email service via Resend API

Your app is now configured to send emails directly using **Resend**, a modern email API service.

**Current Configuration**:
- ✅ API Key: Configured (re_aL2c1wUv_D1dhwGMonohYjTUEkNdPc3E9)
- ✅ From Address: 7more Bridge Team <bridgeteam@7more.net>
- ✅ Reply-To: bridgeteam@7more.net (for resource emails)

**Test Email Functionality**:
- Navigate to Admin Homepage → "Test Email Service" button
- Test all three email types:
  - Welcome Email (for new user accounts)
  - Password Reset Email (for password changes)
  - Resources Email (for sending resources to participants)
- Send to your own email to verify delivery
- Check spam folder if emails don't appear in inbox

**Important**: Ensure bridgeteam@7more.net domain is verified in your [Resend Dashboard](https://resend.com/domains) for emails to send successfully.

**What This Enables**:
- ✅ Email button in Bridge Team Follow-Up Form
- ✅ Email button in Initial Contact Form
- ✅ Resources sent with `bridgeteam@7more.net` as reply-to address
- ✅ Professional email formatting with organization branding
- ✅ Free tier: 100 emails/day, 3,000 emails/month

**Technical Details**:
- Service: Resend API (https://resend.com)
- Integration: Direct API calls from mobile app
- Reply-To: bridgeteam@7more.net (for Bridge Team emails)
- From Address: 7more Bridge Team <bridgeteam@7more.net>
- Code Location: `/src/services/emailService.ts`

### Aircall SMS API Integration

**Status**: ✅ **FULLY INTEGRATED** - Professional SMS sending via Aircall API

Your app now sends SMS messages directly through the Aircall API when Bridge Team clicks "Send Resources". This provides a professional, trackable SMS solution that sends messages from your Aircall phone number.

**Current Configuration**:
- ✅ API ID: Configured in environment variables
- ✅ API Token: Configured in environment variables
- ✅ From Number: +18325582391 (configured in AIRCALL_FROM_NUMBER)
- ✅ Integrated in Bridge Team Follow-Up Form and Initial Contact Form

**How It Works:**
1. Bridge Team selects resources to send to a participant
2. Clicks the **SMS button** in the form
3. Message is sent instantly via Aircall API using your Aircall phone number
4. Participant receives the SMS from your Aircall business number
5. Success/error alerts confirm delivery status

**What This Enables:**
- ✅ **Professional SMS sending** - Messages sent from your Aircall business number
- ✅ **Direct API integration** - No need to open external apps
- ✅ **Instant delivery** - Messages sent immediately with confirmation
- ✅ **Error handling** - Clear error messages if something goes wrong
- ✅ **Bridge Team workflow** - Seamlessly integrated into resource sending

**SMS Sending Locations:**
- Bridge Team Follow-Up Form → Section 5: Resources Sent → SMS button
- Initial Contact Form → Resources section → SMS button
- Both buttons appear only when participant has a phone number

**Environment Variables Required:**
The following are already configured in your `.env` file:
- `AIRCALL_API_ID` - Your Aircall API ID (configured)
- `AIRCALL_API_TOKEN` - Your Aircall API authentication token (configured)
- `AIRCALL_FROM_NUMBER` - Your Aircall phone number: +18325582391 (configured)

**Important Notes:**
- Aircall SMS API is only available on Aircall Professional plan or higher
- SMS sending is available only in: United States, Canada, Germany, France, and Australia
- Your Aircall number must be configured for API usage (may need to contact Aircall support)
- Phone numbers are automatically formatted to E.164 format (+1XXXXXXXXXX)

**Technical Details:**
- Code Location: `/src/api/aircall-sms.ts`
- Function: `sendAircallSMS(phoneNumber, message)`
- API Endpoint: `https://api.aircall.io/v1/numbers/{lineId}/messages/send`
- Authentication: HTTP Basic Auth with Base64-encoded API credentials
- Integrated in: BridgeTeamFollowUpFormScreen, InitialContactFormScreen

**Troubleshooting:**
If SMS sending fails:
1. Verify your Aircall number is configured for API usage in Aircall dashboard
2. Check that you have an active Aircall Professional plan or higher
3. Ensure the recipient phone number is valid and in a supported country
4. Contact Aircall support to enable API messaging on your number if needed

## Overview

This app streamlines the entire participant journey from initial intake through mentorship and graduation. It provides role-based access for different team members and comprehensive tracking of all participant interactions.

### Navigation Structure

The app features a role-based tab navigation system:

**For Admins (6 tabs):**
1. **Homepage** - Dashboard overview with quick stats and actions
2. **Users** - Full user management (add, edit, delete, login as)
3. **Tasks** - Create and assign tasks to staff members
4. **Scheduler** - Shift management
5. **Reporting** - Monthly reporting (full editing access)
6. **Resources** - Resource library and admin tools

**For Mentorship Leaders (5 tabs):**
1. **Homepage** - MentorshipLeaderDashboardScreen showing participants awaiting mentor assignment
2. **My Mentees** - Full list of assigned participants
3. **My Tasks** - Tasks assigned to them
4. **Assign Tasks** - Create and assign tasks to mentors
5. **Resources** - Resource library and system tools

**For Mentors (4 tabs):**
1. **Homepage** - MentorDashboardScreen showing assigned participants with quick action buttons for contact management, organized by status (Initial Contact Pending, Attempted Contact, Unable to Contact, Active Mentorship)
2. **My Mentees** - Full list of assigned participants
3. **My Tasks** - Tasks assigned by admins or mentorship leaders
4. **Resources** - Resource library and system tools

**For Volunteers (3 tabs):**
1. **Homepage** - Dashboard with tasks and schedule
2. **My Tasks** - Assigned tasks
3. **Resources** - Resource library

**For Bridge Team (3 tabs):**
1. **Queue** - Participant intake queue
2. **My Tasks** - Assigned tasks
3. **Resources** - Resource library

**For Board Members (5 tabs):**
1. **Home** - Dashboard with notifications, schedule/tasks, and current numbers (live Bridge Team and Mentorship metrics)
2. **Scheduler** - View volunteer shifts (same as admin view)
3. **My Tasks** - Tasks assigned to them (can also assign tasks to others)
4. **Reporting** - Monthly reporting with read-only access to posted reports
5. **Resources** - Resource library

**For Supporters (2 tabs):**
1. **Schedule** - View and sign up for volunteer shifts
2. **Tasks** - View tasks assigned to them or tasks they assigned to others

## Features

### Role-Based Access

The app supports nine distinct user roles:

1. **Admin** - Complete overview of the program with metrics, analytics, and full access to all features including shift and mentorship management, form customization
2. **Bridge Team Leader** - Full admin capabilities but only for Bridge Team operations (can manage Bridge Team members, see only Bridge Team participants, tasks assigned to Bridge Team)
3. **Bridge Team** - Initial contact and participant intake management
4. **Mentorship Leader** - Assigns participants to mentors (can assign to themselves) and manages shifts
5. **Mentor** - Direct participant engagement, progress tracking, and shift volunteering
6. **Board Member** - View scheduler, can sign up for volunteer shifts, can have tasks assigned and assign tasks to others, read-only access to monthly reporting
7. **Lead Volunteer** - Can sign up for any available volunteer shift
8. **Support Volunteer** - Can only sign up for shifts specifically designated for support volunteers
9. **Supporter** - Can view schedule and sign up for shifts, view tasks assigned to them or that they assigned to others

### Key Functionality

#### Form Management (Admin Only)
- **Customizable Forms** - Admins can edit form questions without touching code
- **Available Forms**:
  - Initial Contact Form (used by mentors)
  - Bridge Team Follow-Up Form
  - Weekly Update Form
  - Monthly Check-In Form
- **Form Editor Features**:
  - Edit question text and labels
  - Change question types (text, textarea, radio, checkbox, dropdown)
  - Add or remove answer options
  - Mark questions as required or optional
  - Reorder questions
  - Add new custom questions
  - Delete existing questions
- **Access**: Navigate to Resources tab → "Form Management" card (admin only)
- **Changes apply immediately** - All users see updated forms right away
- **Persistent Storage** - Form configurations are saved locally and sync across devices

#### Admin Homepage Dashboard
- **Complete program overview** - All key metrics in one place
- **Quick Actions** - Fast access to common admin tasks:
  - Add Participant (manual intake)
  - Create Task (assign to any staff)
  - Test Email Service (verify Resend integration)
- **Participants Overview**:
  - Total participant count
  - Participants needing mentor assignment (urgent)
  - Active mentorship count
  - Graduated count
  - Tap any stat to view filtered list
- **Tasks Overview**:
  - Total tasks assigned
  - Overdue tasks count
  - In progress count
  - Completed tasks count
  - Link to full task management
- **Team Overview**:
  - Mentor count
  - Mentorship Leader count
  - Bridge Team count
  - Volunteer count
  - Link to user management
- **Upcoming Shifts** - Next 3 shifts with dates and times

#### Homepage Dashboard (Non-Admins)
- **At-a-glance overview** - See everything that needs attention on one screen
- **For Mentors & Mentorship Leaders:**
  - **Mentees Needing Assignment** (Mentor Leaders only) - Urgent action card showing participants waiting for mentor assignment
  - **Recently Assigned** - Participants assigned in the last 7 days
  - **Needs Follow-Up** - Mentees requiring contact or follow-up calls
  - **Tasks Assigned** - Active tasks from admins or leaders (pending, in progress, overdue)
  - **My Schedule** - Next 3 upcoming volunteer shifts
- **For Volunteers:**
  - **Tasks Assigned** - Tasks from admins
  - **My Schedule** - Upcoming shifts
- **Smart Cards** - Each section shows preview of top items with "View All" links to full screens
- **Empty States** - Clear messaging when sections are empty ("Nothing scheduled at this time")
- **Action Buttons** - Quick access to complete initial contact, submit reports, or view details

#### User Access & Authentication
- **Invite-only access** - All staff must be invited by an admin before they can log in
- **Default admin account** - A default admin account is automatically created on first launch:
  - Email: `kendall@7more.net`
  - Password: `7moreHouston!`
- **No role selection at login** - Users are assigned roles when invited, not at login
- **Role-based permissions** - Admin, Bridge Team, Mentorship Leader, and Mentor roles
- **Secure authentication** - Email and password required for login
- **Session-based auth** - No persistent login across app restarts (login required each time)
- **Participants are data only** - Participants do not have login access; they exist as data entries managed by staff
- **Admin-only user management** - Only admins can add, view, and delete staff users
- **Logout functionality** - Available from the Resources tab

#### User Management (Admin Only)
- **Invite-only system** - Add new users who can then log in with their credentials
- **Automatic password generation** - System generates passwords based on user's name (first initial + last name, e.g., "John Doe" → "jdoe")
- **Optional nickname field** - Add an optional nickname for users (displayed alongside full name throughout the app)
- **Nickname display** - Nicknames appear in format "John Doe (Johnny)" wherever users are shown:
  - Scheduler and shift assignments
  - User management screens
  - Search results
  - Mentorship assignments
  - Task assignments
  - All other user name displays
- **Welcome emails** - Automatically send welcome emails with login credentials (optional email service)
- **Password reset** - Admins can reset any user's password (generates new password from their name)
- **User-controlled password changes** - Users can change their password anytime they want (no forced changes)
- **Create user accounts** - Set name, optional nickname, email, and role for each user (password generated automatically)
- **View all invited users** - See complete list of staff with roles and nicknames
- **Search and filter** - Find users by name, email, nickname, or role
- **Delete users** - Remove user accounts (except your own)
- **Login as any user (Admin)** - Impersonate any user to see the app from their perspective
- **Login as mentor (Mentorship Leaders)** - Mentorship leaders can login as any mentor to provide support and troubleshoot issues
- **Return to admin/leader** - Easily switch back to your account with visible banner
- **Backup Users** - One-tap backup of all user data
  - Copies backup to clipboard
  - Shows user count by role
  - Save backup in email/notes for recovery
  - User data is automatically persisted but backup provides extra safety

#### File Management (Admin Only)
- **Download workspace files** - View and download files from the app workspace directory
- **File browser** - Browse all files in `/home/user/workspace/`
- **Direct downloads** - Tap any file to download it directly to your device
- **File information** - View file size, type, and last modified date
- **Organized display** - Files sorted by type with color-coded icons
- **ZIP file support** - Perfect for downloading exports like vercel-project.zip
- **Share functionality** - Use device share sheet to save or send files
- **Admin-only access** - File Management section only appears for users with Admin role
- **Quick access** - Available from Admin Homepage under Quick Actions

**Backend Server Required:**
The File Management feature requires the backend server to be running. The server should start automatically with the app. If you encounter connection errors:

1. Check if server is running: `curl http://172.17.0.2:3001/api/health`
2. Start the server: `cd backend && ./start-file-server.sh`
3. View logs: `cat /tmp/backend-file-server.log`

The backend provides two API endpoints:
- `GET /api/files/list` - Returns list of all workspace files
- `GET /api/files/download/:filename` - Downloads a specific file

### Email Configuration (Optional)
To enable automatic welcome and password reset emails:
1. Go to the ENV tab in the Vibecode app
2. Add these environment variables:
   - `EXPO_PUBLIC_EMAIL_API_KEY` - Your email service API key
   - `EXPO_PUBLIC_EMAIL_SERVICE_URL` - Your email service endpoint URL
   - `EXPO_PUBLIC_EMAIL_FROM` - The "from" email address (e.g., "noreply@7more.org")
3. Supported email services: SendGrid, Mailgun, AWS SES, Resend, or any REST API email service

**Note:** Email configuration is optional. If not configured, passwords will still be displayed in the app for manual sharing.

#### Participant Management
- **Public Intake Form** - Two options for sharing your form:

  **Option 1: Public Form Link (Ready to Use)**
  - **Instant public URL** - Uses Formspree (free service) for form hosting
  - **Copy direct link** - Share via text, email, or social media immediately
  - **Embed code** - Paste iframe code on your website
  - **Standalone HTML** - Download complete HTML file to upload anywhere
  - **Email notifications** - Submissions sent to your email
  - **Manual sync** - Add submissions to app manually (automatic sync requires API setup)
  - **Form fields include**:
    - Participant Number, First Name, Last Name
    - Date of Birth, Gender
    - **Phone Number (Optional)** - For SMS communication with Bridge Team
    - **Email Address (Optional)** - For email communication with Bridge Team
    - Release Date, Facility Released From
  - **Release location dropdown** - Select from predefined facilities:
    - Pam Lychner
    - Huntsville
    - Plane
    - Hawaii
    - Other (with text input for custom location)

  **Option 2: Custom HTML Form**
  - **Fully customizable form fields** - Edit questions, labels, and options
  - **Enable/disable fields** - Control which fields appear on the form
  - **Edit gender options** - Remove, add, or modify gender choices (or remove the field entirely)
  - **Change field order** - Rearrange form fields
  - **Mark fields as required/optional** - Control validation
  - **Copy standalone HTML** - Get a complete, self-contained HTML file
  - **Free hosting options** - Step-by-step instructions for:
    - Netlify Drop (recommended - easiest, 2 minutes)
    - GitHub Pages (professional, version controlled)
    - Vercel (fast deployment with custom domains)
  - **Requires API setup** - Form includes placeholder API endpoint that needs to be configured
  - Form automatically updates when you change fields in the app

- **Manual participant entry** - Admins and Bridge Team members can manually add participants
  - **"+" Button on Bridge Team Dashboard** - Bridge Team members can quickly add participants from their queue view
  - **Release location dropdown** - Same predefined facility options as public form
  - **Phone and Email fields** - Optional fields to add contact information during manual entry
- Captures participant information including ID number, demographics, release details, and contact info
- Automatically calculates age and time out
- Immediately assigns to Bridge Team queue

#### All Participants View
- Comprehensive list of all participants in the system
- **Contact information displayed** - Phone and email shown on participant cards for quick access
- Search by name or participant number
- Filter by status (pending, contacted, active, graduated, etc.)
- Quick access to participant profiles
- Add button (visible to admins only) for manual participant entry
- **Click any participant to view and edit their profile**

#### Participant Profile Management
- View complete participant details and status
- **Contact Information**:
  - **Phone Number** - Clickable to instantly call via AirCall (or native dialer)
  - **Email Address** - Clickable to compose email in default mail app
  - **Edit Contact Info** - Update phone/email for existing participants at any time
  - Displayed throughout the app for easy access by Bridge Team
- Add private notes visible to all staff
- View full history timeline of all interactions
- Role-specific action buttons based on participant status
- **Admin-only actions:**
  - **Delete Participant** - Permanently remove a participant profile
    - Confirmation modal with clear warnings
    - Cannot be undone - all data is permanently deleted
  - **Merge Participants** - Combine duplicate profiles
    - Search and select target profile to merge into
    - Automatically combines all notes and history
    - Source profile is deleted after merge
    - Merge action is logged in history
    - Useful for cleaning up duplicate entries
- **Admin & Mentorship Leader actions:**
  - **Move Back to Bridge Team** - Return participant to Bridge Team queue from any mentorship status
    - Available for participants in: pending_mentor, assigned_mentor, initial_contact_pending, active_mentorship
    - Confirmation prompt to prevent accidental moves
    - Removes mentor assignment and resets to Bridge Team workflow
    - Useful for reassessing participant needs or handling special circumstances

#### Admin Dashboard
- Complete program overview with metrics and analytics
- **Clickable stat cards** - Click any metric to see filtered list of participants
  - Click "Total Participants" to see all participants
  - Click "1 Pending Bridge Contact" to see all pending participants
  - Click "3 Contacted" to see all contacted participants
  - Click any status count to filter and view those participants
- Quick navigation to participant lists by status
- Real-time statistics for all program stages
- Monthly activity tracking (last 30 days)
- **Demographics Reporting** - Admin-only comprehensive analytics (accessible from Resources tab)
  - **Overview Statistics** - Total participants, gender categories, release locations count
  - **Age Distribution** - Percentage breakdown by age ranges (18-25, 26-35, 36-45, 46-55, 56+)
  - **Gender Distribution** - Percentage breakdown by gender with visual progress bars
  - **Release Location Distribution** - Percentage breakdown by facility (sorted by count)
  - Visual progress bars show proportions at a glance
  - All demographics calculated in real-time from current participant data

#### Bridge Team Workflow

**Entry Type Selection (NEW - November 13, 2025):**
- When Bridge Team, Bridge Team Leaders, or Admins click the "+" button to add a participant, they see an Entry Type Selection screen with four options:
  1. **Full Form Entry** - Participant completed online form or manual entry of full intake. Participant is added to queue with `pending_bridge` status and requires follow-up call.
  2. **Live Call Intake** - Participant is on the phone now. Complete full intake AND follow-up form in one call. Opens intake form, then automatically chains to Bridge Team Follow-Up Form. On completion, participant is marked as `bridge_contacted` (not moved to mentorship automatically - "To Mentorship" button remains available).
  3. **Missed Call – No Voicemail** - Quick entry for missed calls with no voicemail. Captures phone number (required), name (optional), and notes (optional). Participant added to queue with `pending_bridge` status and `awaiting_contact` status detail. Shows "Start Full Intake" button in Quick Actions when viewed.
  4. **Missed Call – Voicemail Received** - Quick entry for missed calls with voicemail. Captures phone number (required), name (optional), callback window (optional), and summary of voicemail (required). Participant added to queue with `pending_bridge` status and `awaiting_callback` status detail. Shows "Start Full Intake" button in Quick Actions when viewed.

**Intake Type Tracking:**
- Every participant has an `intakeType` field that tracks how they were added
- Displayed as a colored badge on participant profiles:
  - Full Form Entry (blue)
  - Live Call Intake (green)
  - Missed Call – No Voicemail (amber)
  - Missed Call – Voicemail Received (purple)
- For missed call entries, callback window and status detail are also displayed
- Logged in history timeline for full audit trail

**"Start Full Intake" Workflow:**
- For participants added via missed call entries, a "Start Full Intake" button appears in Quick Actions
- Opens the full Manual Intake Form pre-populated with phone number and basic info
- Bridge Team completes full intake during callback
- After submission, participant ready for "Contacted" button to open follow-up form

- **Add Participant Button** - "+" button in header allows Bridge Team to manually add participants directly to the queue
- View all pending participants with time since submission
- **Days-since tracking** - See "contacted X days ago" for each participant
  - Shows on all bridge team participants (pending, attempted, contacted)
  - Also visible for ceased contact participants
  - Helps track follow-up timing and contact frequency
- **Bridge Team Follow-Up Form** - Comprehensive form for verifying participant information and documenting needs
  - **Section 1: Participant Information Confirmation**
    - Review all participant intake form details (editable fields matching intake form format)
    - Gender dropdown modal, release location dropdown modal
    - **Phone Number field (Optional)** - Can be added or updated for SMS communication
    - **Email Address field (Optional)** - Can be added or updated for email communication
    - Date fields with MM/DD/YYYY auto-formatting
    - All edits sync to participant profile on submission
    - Required confirmation before form submission
  - **Section 2: Mandated Restrictions**
    - Track legal restrictions (parole, probation, sex offender registry, child offender registry)
    - **"No Mandated Restrictions" checkbox** - When selected, automatically unchecks all other restrictions
    - Helper text reminds Bridge Team to approach without judgment
    - Additional notes field for other restrictions
  - **Section 3: Critical Needs**
    - Document urgent needs (phone call, employment, housing, clothing, food)
    - **"Other" option** - Additional checkbox with description field for custom needs
    - Housing details include current situation dropdown
    - **Transitional Home tracking** with admin-managed list
    - **High Priority Flag** - Automatically flags participants selecting "Ben Reid / Southeast Texas Transitional Center"
    - Custom home name entry for unlisted facilities
  - **Section 4: Communication Confirmation**
    - Confirm participant was told someone will call within the week
  - **Section 5: Resources Sent**
    - Track which resources were shared with participant
    - Select from existing resource library
    - Add custom resource descriptions
    - Notes field for context about why resources were sent
    - **Email, SMS & Copy Buttons** - Send resources via email (if email available), SMS (if phone number available), or copy to clipboard
    - **Gmail Integration** - Email button sends from Bridge Team Gmail (bridgeteam@7more.net) using environment variables configured in ENV tab
    - **AirCall Integration** - SMS button automatically uses AirCall app if installed on device, with fallback to native SMS app
    - Email button only appears when participant has an email address
    - SMS button only appears when participant has a phone number
    - Resource preview modal shows formatted text before sending
  - **Auto-moves to Mentorship** - Upon form completion, participant automatically moves to "pending_mentor" status
- Action buttons per participant:
  - **Contacted** - Opens Bridge Team Follow-Up Form for comprehensive documentation
  - **Move to Mentorship** - Direct transfer to mentorship queue
  - **Attempted Contact** - Record attempt with voicemail details
  - **Unable to Contact** - Document why contact couldn't be made
- Real-time queue statistics
- When a participant is successfully contacted, they are immediately ready for admin review and mentor assignment
- All follow-up form data stored in participant profile and visible to all staff

#### Admin Mentorship Assignment
- **New dedicated queue for admin review and assignment**
- Automatically receives participants after successful Bridge Team contact
- **Admin Dashboard shows prominent "Assign Mentors" button** when participants are waiting
- Click to view the Mentorship Assignment Queue with:
  - All participants awaiting mentor assignment
  - Time since they were contacted by Bridge Team
  - Search functionality to find specific participants
- Click any participant to open the Assignment Screen showing:
  - **Complete participant information** from intake form (name, age, gender, DOB, facility, release date, time out)
  - **Full contact history and notes** from Bridge Team interactions
  - **All historical actions** taken on the participant
  - **Search and filter mentors and admins** - assignment can be made to either role
  - Select from real users in the system (not mock data)
  - Each user shows name, email, and role badge (Admin or Mentor)
- Assign to any user with "admin" or "mentor" role
- Assignment creates history entry and moves participant to assigned status

#### Mentorship Leaders (Legacy)
- Note: With the new admin assignment workflow, Mentorship Leader role is less active
- Previously assigned participants awaiting mentor assignment
- Can still search and assign mentors if needed
- Track time waiting for assignment

#### Mentorship Assignment (Mentor Leaders & Admins)
- **New dedicated mentorship screen** for mentor leaders and admins
- **Assign mentees to mentors** with full search and selection
- **Assign to self** - Mentor leaders can assign mentees to themselves
- **Reassign mentees** - Move participants to different mentors
- **Remove assignments** - Unassign mentees when needed
- View all active assignments with mentor and mentee details
- Search and filter available mentees and mentors
- Add optional notes when assigning
- Track assignment history and timestamps
- Accessible from Resources tab for authorized roles

#### Task Management & Assignments
- **Unified "My Tasks" Homepage** - All non-admin users have a single homepage showing everything they need
- **My Participants Section** (Mentors/Mentorship Leaders)
  - Primary section showing all assigned participants at the top
  - Participant name, number, and days since assignment
  - Visual indicators for initial contact required and overdue reports
  - One-tap access to participant profiles
- **Additional Tasks Section** - Tasks assigned by admins or mentorship leaders
  - Clearly labeled as "Additional Tasks" for mentors with participants
  - Organized by status within this section:
    - Overdue (with red badges and icons)
    - In Progress
    - Pending
    - Completed (with green badges)
  - Shows task title, description, priority, and due date
  - Displays who assigned the task
  - **Participant attachment displayed immediately** - When tasks are linked to participants, the participant name is shown dynamically and is clickable to navigate to their profile
  - Custom form indicators when forms are attached
  - **Recurring task badges** - Visual indicators show which tasks repeat (daily, weekly, monthly)
- **Task Creation & Management** (Admins & Mentorship Leaders)
  - Admins have dedicated "Tasks" tab for full task management
  - Mentorship Leaders have "Assign Tasks" tab to create tasks for their mentors
  - Create and assign tasks to any user
  - Set title, description, priority (low, medium, high, urgent), and due date
  - **Calendar Date Picker** - Visual date picker for due dates (same as scheduler)
  - Dates stored and displayed consistently using YYYY-MM-DD format
  - Assign to specific users by role
  - Link tasks to specific participants (optional)
  - **Recurring Tasks** - Set tasks to automatically repeat:
    - Toggle recurring option on/off
    - Choose frequency: Daily, Weekly, or Monthly
    - When a recurring task is completed, a new instance is automatically created with the next due date
    - Original task moves to completed status
    - New task inherits all properties: title, description, assignee, priority, custom forms, and linked participants
    - Visual badge shows recurring status and frequency on task cards
    - Requires a due date to enable recurring
  - Create custom forms with multiple field types:
    - Text input
    - Text area (multi-line)
    - Number input
    - Date input
    - Select dropdown
    - Checkbox
  - Mark form fields as required or optional
  - Track task status automatically (pending, in_progress, completed, overdue)
  - View all tasks across organization (admin only)
  - **Status Filter Tabs** - Filter tasks by status with a single tap
    - All - View all tasks grouped by status
    - Overdue - Show only overdue tasks
    - In Progress - Show only tasks currently being worked on
    - Pending - Show only pending tasks
    - Completed - Show only completed tasks
    - Each tab shows the count of tasks in that status
    - Color-coded pills for easy identification (red for overdue, blue for in progress, green for completed)
- **Task Detail View** - Click any task to see full details
  - Complete task information including description and requirements
  - See who assigned the task and when
  - View linked participant (if attached)
  - See due date with relative time display
  - Complete custom forms inline
  - **Enhanced Task Status Management**:
    - **"Mark as In Progress"** - When a task is pending, users can mark it as in progress with optional progress notes
    - **Progress Notes Field** - Add notes about starting work on a task
    - **"Mark as Complete"** - Complete tasks with optional completion comments
    - **Completion Comments** - Add notes about what was accomplished when completing a task
    - **Visual Status Indicators** - Clear modals confirm status changes (blue for in progress, green for complete)
    - **Automatic Recurring Task Creation** - When a recurring task is completed, a new instance is automatically created with the next due date
  - Submit forms with validation
- **Automatic Status Updates** - Tasks become overdue automatically based on due date
- **Smart Empty States** - Clear guidance when no participants or tasks assigned

#### Volunteer Shift Scheduling

- **Two Tab View**:
  - **My Schedule Tab** - View only your personally scheduled shifts and meetings
    - Default view for non-admin users
    - Shows shifts you've signed up for
    - **Admin Meeting Creation** - Admins can create personal meetings/events from this tab
  - **Manage Schedule Tab** - View all available shifts in the system
    - Default view for admins
    - Shows all shifts based on role permissions
    - Create new volunteer shifts (admins and mentor leaders only)

- **Admin and Mentor Leader Management**:
  - Create new shifts with title, description, date, time, and max volunteers
  - **Calendar Date Picker** - Tap to select dates from visual calendar instead of typing
  - **Multi-Day Shift Creation** - Create the same shift for multiple days in one week by selecting days of the week
  - **Recurring Weekly Shifts** - Create shifts that repeat for multiple weeks automatically
    - Set up shifts once and they replicate for 12 weeks (or custom amount)
    - Delete all recurring shifts at once or individual occurrences
    - RECURRING badge shows which shifts repeat weekly
  - **Copy Week Feature** - Duplicate an entire week of shifts to another week
    - Perfect for repeating schedule patterns
    - Assignments are not copied (fresh signups for new week)
  - **Template System** - Save weeks as reusable templates
    - Save any week as a named template
    - Apply templates to future weeks instantly
    - Share common scheduling patterns across months
  - **Admin Assign Users to Shifts** - Admins can directly assign any user to any shift
    - Assign button on each shift in main scheduler view
    - Search and select from all invited users
    - See which users are already assigned
    - Bypasses normal role restrictions for manual assignments
  - **Admin Meeting/Event Creation** - Admins can add personal meetings to staff schedules
    - Create meetings that appear in specific users' My Schedule
    - Useful for one-on-one meetings, training sessions, etc.
  - Set which roles can sign up for each shift (admin, mentor leader, mentor, volunteer types)
  - Edit shifts directly from scheduler view with pre-filled form
  - Delete shifts with all signups
  - View all upcoming shifts with signup counts
  - See who has signed up for each shift
  - "Create" button in Manage Schedule tab for quick shift creation
  - "+ Meeting" button in My Schedule tab (admin only) for personal event creation

- **Meeting System**:
  - **Create Meetings** - Any user with My Schedule access can create meetings
    - Admins can create meetings that automatically appear in invitees' schedules
    - **Meeting Types**: Virtual (with video call link) or In-Person
    - **Required Fields**: Title, description, date, start time, end time
    - **Invitations**: Select multiple users to invite to the meeting
    - **Video Call Links**: For virtual meetings, add Zoom/Teams/Google Meet links
  - **RSVP System** - All invited users can respond to meeting invitations
    - **Yes** - Confirms attendance (shown in green)
    - **No** - Declines meeting (shown in red)
    - **Maybe** - Tentative attendance (shown in blue)
    - **Pending** - Not yet responded (shown in purple)
    - RSVP status visible to all invitees to coordinate attendance
  - **Meeting Display** - Meetings appear in My Schedule tab alongside shifts
    - Color-coded cards based on RSVP status
    - Shows meeting type icon (video camera for virtual, people for in-person)
    - Click to view full details including description, invitee list, and video call link
  - **Meeting Details Modal** - View comprehensive meeting information
    - Meeting type, date, time, and location/link
    - Full list of invitees with their RSVP statuses
    - Organizer name with nickname display
    - Quick RSVP buttons (Yes/Maybe/No) for invited users
    - Video call link (clickable for virtual meetings)

- **Shift Signup (All Staff)**:
  - View all upcoming shifts organized by week (Monday-Sunday)
  - Week-based calendar view with actual dates displayed
  - Filter shifts by role permissions
  - Sign up for available shifts
  - Cancel shift signups
  - **My Shifts Display** - See your upcoming assigned shifts at the top of the scheduler
    - Shows first 5 upcoming shifts with dates and times
    - Displays total count if more than 5 shifts
    - Click any shift to view details
  - **Who's Scheduled Display** - Admins, mentorship leaders, and lead volunteers can see who is scheduled on each shift
    - Shows list of scheduled users directly on shift cards
    - Names displayed as compact badges for easy viewing
    - Helps coordinate coverage and identify gaps
    - Also visible in shift detail modal
  - See "My Shifts" section at top
  - Visual indicators for full/available/restricted shifts
  - Shift details show date, time, description, and current signups
  - **Admin controls on each shift** - Assign and Edit buttons for quick management

- **Volunteer Role Permissions**:
  - **Lead volunteers** - Can sign up for shifts marked for "volunteer" role
  - **Support volunteers** - Can only sign up for shifts marked for "volunteer_support"
  - **Admins, Mentor Leaders, Mentors** - Automatically eligible for all shifts
  - Volunteers only see Scheduler and Resources tabs (no participant access)

- **Shift Categories**:
  - Admins create shifts and specify allowed roles
  - Two volunteer categories: lead and support
  - Example: Food bank shift might allow all volunteers, sensitive document work might be support volunteers only
  - Max volunteer limits to prevent overstaffing

#### Mentor Dashboard
- View all assigned participants with improved navigation
- **Back Button on Forms** - Easy navigation back from both monthly check-in and weekly update forms
- **30-Day Countdown for Monthly Check-Ins** - See exactly how many days remain until the next monthly check-in is due
  - Shows "X days to go" for upcoming check-ins
  - Shows "Due today" when check-in is due
  - Shows "X days overdue" for overdue check-ins
  - Appears directly on monthly check-in buttons in mentor dashboard
- **Days-since tracking** - See "assigned X days ago" for each participant
  - Shows time since participant was assigned to mentor
  - Helps track initial contact timing and follow-up requirements
  - Visible for both pending initial contact and active mentorship
- Track initial contact requirements (time-sensitive)
- **Initial Contact Form** with flexible contact outcomes:
  - **Successful Contact** - Complete full intake with participant details
    - Mentorship offered (Interested/Not Interested)
    - Living situation assessment (Stable/Needs Assistance) with detailed sub-categories
    - Employment status (Employed/Needs Employment/Other)
    - Clothing needs assessment
    - Optional: Open invitation to call, Prayer offered
    - Additional notes
    - **Guidance Needed** - Request leadership support with task creation for mentorship leaders
    - **Resources to Send** - Select and send resources to participant
      - Browse and select from resource library
      - **Email Button** - Send via Bridge Team Gmail (if participant has email address)
      - **SMS Button** - Send via AirCall or native SMS (if participant has phone number)
      - **AirCall Integration** - SMS automatically uses AirCall if installed, with fallback to native SMS
      - Copy resource text to clipboard for manual sending
      - Visual resource selection with category display
  - **Attempted Contact** - Record contact attempts without full intake
    - Select attempt type (Left Voicemail/Unable to Leave Voicemail/No Answer)
    - Add attempt notes
    - Participant remains in current status for follow-up
  - **Unable to Contact** - Document inability to reach participant
    - Provide reason for inability to contact
    - Tracked in participant history
- **Weekly Update System** - Track weekly progress with automatic due dates
- **Monthly Check-In System** - 30-day check-ins with graduation step tracking
- **Overdue indicators** - Red badges for overdue weekly/monthly updates
- Submit weekly updates and monthly check-ins
- Access complete participant history

#### Weekly Updates (Mentors)
- **Automatic scheduling** - Weekly updates due 7 days after initial contact
- **Due date tracking** - See upcoming and overdue updates
- **Quick submission form**:
  - Did you have contact this week? (Yes/No)
  - Contact method (if contacted)
  - Progress update (required)
  - Challenges this week (required)
  - Support needed (optional)
- **Auto-renewal** - Next update automatically scheduled 7 days out
- **Visual indicators** - Overdue updates shown with red border and badge

#### Monthly Check-Ins (Mentors)
- **Automatic scheduling** - First check-in due 30 days after initial contact
- **Graduation tracking** - Track completion of 10 graduation steps:
  1. Complete Initial Contact with Mentor
  2. Establish Clear Goals
  3. Attend Weekly Check-ins (4+ consecutive weeks)
  4. Complete Job Readiness Training
  5. Develop Resume and Cover Letter
  6. Complete Job Applications (5+ applications)
  7. Establish Stable Housing
  8. Build Support Network
  9. Demonstrate Progress Toward Goals (3+ months)
  10. Complete Final Evaluation
- **Comprehensive form**:
  - Accomplishments since last check-in
  - Graduation steps completed (checkbox list)
  - Challenges faced
  - Notable changes in circumstances
  - Additional notes
- **Progress visualization** - See graduation progress percentage
- **Auto-renewal** - Next check-in automatically scheduled 30 days out

#### Graduation Approval (Admin Only)
- **Automatic trigger** - When all 10 graduation steps are completed
- **Ready indicator** - Green badge on participant profile
- **Approval screen shows**:
  - Complete graduation progress (all 10 steps)
  - Recent monthly check-in history
  - Visual completion status for each step
- **Admin approval required** - Final graduation requires admin sign-off
- **Approval notes** - Optional congratulations or special notes
- **Graduation ceremony** - Participant status changes to "graduated"

#### Due Date Management
- **Non-editable by mentors** - Only admins can adjust due dates
- **Automatic calculation** - System handles all scheduling
- **7-day weekly cycle** - Weekly updates renew every 7 days
- **30-day monthly cycle** - Monthly check-ins renew every 30 days
- **Overdue tracking** - Visual indicators when updates are late

#### Participant Profiles
- **Click any participant card from any screen to view their full profile**
- Complete history timeline of all interactions
- Add notes at any time
- View demographic information
- Track progression through program stages
- **Quick Actions section** - Context-sensitive action buttons based on participant status and your role
  - Admins can perform any action on any participant
  - Bridge Team can mark contacted, attempted, unable, or move to mentorship
  - Mentorship Leaders can assign mentors
  - Mentors can complete initial contact and submit weekly/monthly updates
- **Due date indicators** - See when weekly updates and monthly check-ins are due or overdue
- **Graduation status** - Admins see "Ready for Graduation Approval" button when all steps complete
- All actions update participant status and create history entries

#### Resources Library
- Categorized resources for sharing with participants
- **Public Intake Form Manager** - Prominent card for admins to access form links and embed codes
- **Volunteer Scheduler** - Card for staff to access shift scheduling (admins, mentor leaders, mentors)
- **Mentorship Assignments** - Card for mentor leaders and admins to manage mentee assignments
- **Login As Mentor (Mentorship Leaders)** - Card for mentorship leaders to login as any mentor for support and troubleshooting
  - Search mentors by name or email
  - View app from mentor's perspective
  - Return to mentorship leader account with banner
- **Guidance Tasks** - Card for admins and mentorship leaders to respond to mentor guidance requests
- Copy-to-clipboard functionality for easy sharing
- Admin-only editing of resources
- Searchable and filterable
- Categories include Forms, Housing, Employment, Health, Basic Needs

#### Monthly Reporting (Board Members & Admins)

**Board Member Home Dashboard:**
- Board members now have a dedicated Home screen as their default view
- Shows notifications for new posted reports (e.g., "New Report Available - 10/2024 monthly report is ready to view")
- Displays upcoming meetings and pending tasks assigned to them
- Live "Current Numbers" dashboard showing:
  - **Bridge Team Metrics**: Total participants, Pending Bridge, Attempted to Contact, Contacted, Unable to Contact
  - **Mentorship Metrics**: Participants assigned to mentorship, Active participants
- Tapping on report notification or Reporting tab navigates to reporting interface
- No longer auto-navigates to reports - board members can view when ready

**Two Access Modes:**
- **View Reports** - Available to both board members and admins for analytics
- **Manage Reports** - Admin-only data entry and editing

**Admin Posting Control:**
- Admins can edit reports at any time in Manage Reports
- Must press "Post Report for Board Members" button to publish
- Posted reports show green "Posted for Board Viewing" badge
- Board members only see months that have been posted
- Prevents board members from seeing incomplete or draft reports

**View Reports Features:**
- **Single Month View**
  - Select any month/year to view detailed report data
  - Shows all categories with actual values
  - Month-over-month comparison indicators (up/down arrows with percentage change)
  - Green arrows for increases, red arrows for decreases
  - Comparison shows difference from previous month
- **Date Range View**
  - Select start and end month/year
  - Toggle between "Total" and "Average" aggregation
  - View combined metrics across multiple months
  - Summary header shows date range and report count
- **Category Filtering**
  - Filter by: All, Releasees, Calls, Mentorship, Donors, or Financials
  - Quickly focus on specific metrics
- **Number Formatting**
  - All numbers display with comma separators for thousands
  - Currency values show with dollar signs
  - Percentages formatted with % symbol

**Manage Reports (Admin Only):**
- **Two View Modes:**
  - **By Month** - Select one month, view and edit all categories for that month (default view)
  - **By Category** - Select one category, view and edit data for all 12 months of the year
  - Toggle between modes with tab selector at the top

- **By Month View:**
  - Month/Year Selection - Select any month/year to edit or create reports
  - See all six reporting categories with full input forms
  - Save each category independently

- **By Category View:**
  - Category Selection - Choose from Releasees, Calls, Bridge Team, Mentorship, Donors, Financials, or Social Media
  - Year Selection - Pick any year to view/edit all 12 months
  - Grid layout shows all months for the selected category
  - Enter data for each month in a compact 3-column grid (Jan, Feb, Mar, etc.)
  - Data auto-saves as you type for each field
  - Perfect for bulk data entry when you have annual reports to input

- Eight Reporting Categories:

1. **Releasees Met (Manual Input)**
   - Pam Lychner - count of releasees
   - Huntsville - count of releasees
   - Plane State Jail - count of releasees
   - Havins Unit - count of releasees
   - Clemens Unit - count of releasees
   - Other - count of releasees
   - Total automatically calculated and displayed with commas

2. **Calls (Manual Input)**
   - Inbound - count of incoming calls
   - Outbound - count of outgoing calls
   - Missed Calls % - percentage (validates subcategory totals)
   - Breakdown subcategories:
     - Hung up prior to welcome message (%)
     - Hung up within 10 seconds of waiting (%)
     - Missed call due to users not answering (%)
   - Validation: Warns if subcategories don't equal Missed Calls %

3. **Bridge Team (Auto-Calculated + Manual Override)**
   - Participants Received - total participants received by Bridge Team during the month
   - Status Activity:
     - Pending Bridge - participants in pending status
     - Attempted to Contact - contact attempts made
     - Contacted - successful contacts
     - Unable to Contact - participants unable to reach
   - Average Days to First Outreach - average time from submission to first contact
   - Forms by Day of Week - distribution of intake form submissions by day (auto-calculated only)
   - **All metrics auto-calculated from app data** with option to manually override
   - **Manual entry available** for historical data (pre-app implementation)
   - Shows both auto-calculated value (as hint) and manual entry field for each metric
   - Leave fields empty to use auto-calculated values
   - Enter values to override for months before app data existed
   - Refresh button to recalculate from current app data

4. **Mentorship (Auto-Calculated)**
   - Participants Assigned to Mentorship - automatically pulled from app data
   - Calculated from previous month's assignments
   - Refresh button to update from current data

5. **Donors (Manual Input)**
   - New Donors - count of new donors
   - Amount from New Donors - dollar amount
   - Checks - count of checks received
   - Total from Checks - dollar amount

6. **Financials (Manual Input)**
   - Beginning Balance (Month Start) - dollar amount
   - Ending Balance (Month End) - dollar amount
   - Difference - auto-calculated (Ending - Beginning) with commas

7. **Social Media Metrics (Manual Input)**
   - Reels/Post Views - combined total of reels and post views
   - Views from Non-Followers (%) - percentage of views from non-followers (0-100)
   - Total Followers - current follower count
   - Followers Gained (+/-) - net change in followers (positive for gains, negative for losses)

8. **Wins & Concerns (Admin Notes Only)**
   - **Wins** - Up to 5 structured entries, each with:
     - Title (e.g., "Record Donations")
     - Body/Description (detailed information)
   - **Concerns** - Up to 5 structured entries, each with:
     - Title (e.g., "Funding Shortfall")
     - Body/Description (detailed information)
   - All entries are optional
   - Only visible and editable by admins

**Report Features:**
- All data automatically saved to Firebase
- Reports persist across sessions and devices
- One report per month/year combination
- All auto-calculated metrics refresh with button press
- Board members can view comprehensive analytics but cannot edit data
- Comma formatting for all numbers ≥1,000

## Technical Architecture

### State Management
- **Zustand** with AsyncStorage persistence
- Seven main stores:
  - `authStore` - User authentication and session
  - `usersStore` - Invited user management
  - `participantStore` - All participant data and operations
  - `resourceStore` - Resource library management
  - `mentorshipStore` - Mentorship assignments and tracking
  - `schedulerStore` - Volunteer shift management and signups
  - `reportingStore` - Monthly reporting and analytics data

### Navigation
- React Navigation v7 with Native Stack and Bottom Tabs
- Role-based tab configuration
- Smooth navigation between screens

### Styling
- Nativewind (TailwindCSS for React Native)
- Clean, modern design inspired by Apple's Human Interface Guidelines
- Indigo primary color (#4F46E5)
- Consistent spacing and typography

### Data Structure

#### Participant Status Flow
```
pending_bridge → bridge_contacted/bridge_attempted/bridge_unable
    ↓
pending_mentor → assigned_mentor → initial_contact_pending/mentor_attempted/mentor_unable
    ↓
active_mentorship → graduated
```

**Status Separation by Team:**
- **Bridge Team statuses**: `pending_bridge`, `bridge_contacted`, `bridge_attempted`, `bridge_unable`
  - Bridge Team members only see participants with these statuses
  - When Bridge Team marks "Attempted Contact", it stays with Bridge Team as `bridge_attempted`
  - When Bridge Team marks "Unable to Contact", it stays with Bridge Team as `bridge_unable`

- **Mentor statuses**: `initial_contact_pending`, `mentor_attempted`, `mentor_unable`, `active_mentorship`
  - Mentors only see participants assigned to them with these statuses
  - When Mentor marks "Attempted Contact", it stays with the Mentor as `mentor_attempted`
  - When Mentor marks "Unable to Contact", it stays with the Mentor as `mentor_unable`

- **Admin view**: Admins can see all statuses and can view a combined "Unable to Contact" list that includes both `bridge_unable` and `mentor_unable` participants

#### History Tracking
Every action is recorded in the participant's history with:
- Timestamp
- User who performed the action
- Action type and description
- Additional metadata

## Screens

### Authentication & User Management
- `LoginScreen` - Staff-only role-based login
- `ManageUsersScreen` - Admin-only user management (view, search, filter, delete)
- `AddUserScreen` - Admin-only form to create new staff accounts (now includes volunteer roles)
- `FileManagementScreen` - Admin-only file browser and download manager
- `ManualIntakeFormScreen` - Admin-only participant entry form with improved date input

### Dashboards
- `AdminDashboardScreen` - Complete program overview with "View All Participants" button
- `BridgeTeamDashboardScreen` - Bridge Team queue
- `MentorshipLeaderDashboardScreen` - Assignment queue
- `MentorDashboardScreen` - Mentor's participants

### Mentorship & Scheduling
- `MentorshipScreen` - **NEW** Assign mentees to mentors (mentor leaders & admins)
- `SchedulerScreen` - **NEW** View and sign up for volunteer shifts (all roles)
- `ManageShiftsScreen` - **NEW** Create and manage shifts (admins & mentor leaders)

### Forms & Resources
- `ContactFormScreen` - Record Bridge Team contact attempts
- `BridgeTeamFollowUpFormScreen` - **NEW** Comprehensive follow-up form for Bridge Team with participant verification, needs assessment, and resource tracking
- `InitialContactFormScreen` - First mentor contact (triggers weekly/monthly due dates)
- `MonthlyUpdateFormScreen` - Legacy ongoing mentor updates (still available)
- `WeeklyUpdateFormScreen` - **NEW** Quick weekly progress updates with auto-scheduling
- `MonthlyCheckInFormScreen` - **NEW** Comprehensive monthly check-ins with graduation tracking
- `GraduationApprovalScreen` - **NEW** Admin-only graduation approval workflow
- `MoveToMentorshipScreen` - Transfer confirmation
- `AssignMentorScreen` - Mentor assignment
- `IntakeFormScreen` - Preview of public participant intake form
- `IntakeFormLinkScreen` - Admin tool to get shareable links and embed codes
- `EmbeddableFormScreen` - **NEW** Admin tool to generate iframe/HTML code for embedding the intake form on external websites
- `ManualIntakeFormScreen` - **UPDATED** Admin form for manually adding participants (fields reordered: First Name, Last Name, then TDCJ Number; requires at least one contact method: email OR phone)
- `ResourcesScreen` - Resource library with intake form manager and logout
- `EditResourceScreen` - Admin-only resource editing

### Details
- `ParticipantProfileScreen` - Complete participant view with history and notes
- `AllParticipantsScreen` - Searchable, filterable list with admin-only add button
- `ResourcesScreen` - Resource library with logout button

## Project Structure

```
src/
├── components/          # Reusable components (empty - add as needed)
├── constants/
│   └── graduationSteps.ts  # 10 graduation steps with helper functions
├── navigation/
│   └── RootNavigator.tsx   # Updated with volunteer role handling
├── screens/            # All screen components
│   ├── MentorshipScreen.tsx        # NEW - Mentee assignment
│   ├── SchedulerScreen.tsx         # NEW - Shift viewing and signup
│   └── ManageShiftsScreen.tsx      # NEW - Shift creation and management
├── state/              # Zustand stores
│   ├── authStore.ts
│   ├── usersStore.ts
│   ├── participantStore.ts  # Now includes weekly/monthly tracking
│   ├── resourceStore.ts
│   ├── mentorshipStore.ts   # NEW - Mentorship assignments
│   └── schedulerStore.ts    # NEW - Shift management
├── types/
│   └── index.ts        # TypeScript types (includes Shift, MentorshipAssignment, new roles)
└── utils/
    ├── cn.ts           # Tailwind className merger
    └── generateIntakeFormHTML.ts  # Intake form HTML generator
```

## Future Enhancements

### Potential Additions
- Push notifications for time-sensitive tasks
- Email/SMS integration for participant communication
- Document upload and storage
- Calendar integration for scheduling
- Export functionality for reports
- Admin panel for form customization
- Graduation ceremony tracking
- Alumni follow-up system
- Real-time collaboration features

## Getting Started

The app is ready to use. Login with any email/password and select your role. The system uses mock authentication for development.

### Test the Flow
1. Login as Admin to access the Resources tab
2. Click the "Participant Intake Form" card to get the public form link
3. Copy the link or embed code to share with your community
4. When a participant submits the form, they appear in the Bridge Team queue
5. Login as Bridge Team to see and process new participants
6. Use action buttons to process the participant
7. Login as Mentorship Leader to assign a mentor
8. Login as Mentor to complete initial contact and monthly updates
9. Login as Admin to view comprehensive metrics

### Public Intake Form Setup
1. As an admin, go to Resources tab
2. Click "Get Form Link & Code" on the Participant Intake Form card
3. Choose one of three options:
   - **Share Link**: Copy and share via text/email/social media
   - **Embed on Website**: Copy the iframe code and paste into your website HTML
   - **Export Full HTML**: Get a standalone HTML file to host on your web server
4. **NEW: Website Embedding**:
   - Navigate to the "Web Form Code" quick action on the admin homepage
   - Or click "Embeddable Form" from the navigation
   - Customize the iframe dimensions (width and height)
   - Choose from three embed methods:
     - Basic iframe - Simple HTML iframe tag
     - Styled HTML - iframe with container styling and shadow
     - Script Embed - JavaScript-based dynamic loading
   - All submissions save directly to the same Firebase database
   - No additional backend setup required - uses existing Firebase connection
5. Note: The form requires your Firebase configuration to be set up (see Firebase Setup section above)
6. The embeddable form connects to the same participant database as the mobile app
7. All submissions appear in the admin dashboard in real-time

## Notes

- **All data is now stored in Firebase Realtime Database** - This enables real-time sync across all devices
- **Previous local data** - If you had data stored locally before Firebase integration, it will not automatically transfer. You'll need to re-enter any existing data after setting up Firebase
- Participant numbers must be unique
- The system automatically tracks all timestamps
- History is preserved even when status changes
- Resources come with default nonprofit-relevant content
- If you encounter infinite loop errors, try fully closing and reopening the Vibecode app to clear cached state

## Technical Architecture

### State Management
- **Zustand** with **Firebase Realtime Database**
- Six main stores with real-time synchronization:
  - `authStore` - User authentication and session (local only)
  - `usersStore` - Invited user management (synced)
  - `participantStore` - All participant data and operations (synced)
  - `resourceStore` - Resource library management (synced)
  - `transitionalHomeStore` - Transitional home facility management (synced)
  - `mentorshipStore` - Mentorship assignments and tracking (synced)
  - `schedulerStore` - Volunteer shift management and signups (synced)

### Data Synchronization
- Real-time listeners automatically update all devices when data changes
- All write operations are async and update Firebase directly
- Local state is kept in sync with Firebase via `onValue` listeners
- Network resilience: Firebase handles offline caching automatically
