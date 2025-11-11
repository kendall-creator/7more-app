# Nonprofit Volunteer Management App

A comprehensive mobile application built with Expo and React Native to help nonprofit organizations manage their volunteer coordination and participant mentorship programs.

## IMPORTANT: Environment Variable Protection

**Your environment variables are protected with multiple safeguards:**
- `.env` file is in `.gitignore` - will never be committed to git
- `.env.backup` file created as recovery backup (also in `.gitignore`)
- `.env.example` template updated for easy restoration if needed
- **Backend has separate `.env` file** in `/backend/.env` with email credentials
- All environment variables are properly secured

**If your `.env` file gets deleted again:**
1. Check the `.env.backup` file in your workspace directory
2. Copy contents from `.env.backup` to a new `.env` file: `cp .env.backup .env`
3. Or reference `.env.example` and re-add your values from the ENV tab in Vibecode app

**Backend Email Service:**
- Backend server automatically starts with email credentials
- Server runs on port 3001 with Gmail SMTP configured
- Auto-start script available: `./backend/auto-start.sh`
- Backend `.env` contains: BRIDGE_TEAM_EMAIL, BRIDGE_TEAM_EMAIL_PASSWORD, EMAIL_API_KEY
- Frontend `.env` contains: EXPO_PUBLIC_BACKEND_URL, EXPO_PUBLIC_BACKEND_API_KEY

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

**Status**: ✅ **FULLY CONFIGURED & TESTED** - Email sending via Gmail SMTP

Your app now sends emails directly from **bridgeteam@7more.net** using Gmail SMTP with TLS encryption. This integration is specifically enabled for Bridge Team users, Bridge Team leaders, and admins.

**Current Configuration**:
- ✅ SMTP Server: smtp.gmail.com:587 (TLS)
- ✅ From Address: Bridge Team <bridgeteam@7more.net>
- ✅ Backend Server: Running on port 3001
- ✅ Test Email: Sent successfully to KendallBlanton11@gmail.com

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
3. Email is sent via Gmail SMTP through the secure backend server
4. Message sent from bridgeteam@7more.net with TLS encryption on port 587
5. Success/error confirmation displayed to user

**Technical Details**:
- Backend Server: Node.js + Express + Nodemailer
- SMTP Configuration: TLS on port 587 (not SSL)
- Code Locations:
  - Frontend API: `/src/api/gmail-smtp.ts`
  - Backend Server: `/backend/server.js`
- Environment Variables:
  - App: `EXPO_PUBLIC_BACKEND_URL`, `EXPO_PUBLIC_BACKEND_API_KEY`
  - Backend: `BRIDGE_TEAM_EMAIL`, `BRIDGE_TEAM_EMAIL_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `EMAIL_API_KEY`

**Security**:
- Gmail app password stored only on backend server (never exposed to client)
- API authentication required for all email requests
- TLS encryption for all SMTP connections

**Testing**:
- Test script available at `/test-email.js`
- Run: `node test-email.js` from workspace directory
- Successfully tested: Email sent to KendallBlanton11@gmail.com

**Backend Server Management**:
- Server runs automatically on port 3001
- Backend listens on 0.0.0.0 (all interfaces) to accept connections from mobile devices
- Default backend URL: http://172.17.0.1:3001 (Docker host IP)
- Check health: `curl http://172.17.0.1:3001/api/health`
- View logs: Check expo.log file or backend console output
- Restart if needed: `cd backend && node server.js > /tmp/backend-server.log 2>&1 &`
- **Backend now has its own `.env` file** with email credentials (separate from app `.env`)

**Troubleshooting Connection Issues**:
If you see "Network request failed" errors:
1. **Add environment variables in ENV tab** (most common fix):
   - `EXPO_PUBLIC_BACKEND_URL` = `http://172.17.0.1:3001`
   - `EXPO_PUBLIC_BACKEND_API_KEY` = `7more-secure-api-key-2024`
2. **Restart the Vibecode app** after adding ENV variables
3. Check logs for connection details: Look for "Backend URL:" in expo.log
4. Verify backend is running: Run `ps aux | grep "node server.js"`

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

## Features

### Role-Based Access

The app supports eight distinct user roles:

1. **Admin** - Complete overview of the program with metrics, analytics, and full access to all features including shift and mentorship management, form customization
2. **Bridge Team Leader** - Full admin capabilities but only for Bridge Team operations (can manage Bridge Team members, see only Bridge Team participants, tasks assigned to Bridge Team)
3. **Bridge Team** - Initial contact and participant intake management
4. **Mentorship Leader** - Assigns participants to mentors (can assign to themselves) and manages shifts
5. **Mentor** - Direct participant engagement, progress tracking, and shift volunteering
6. **Board Member** - View scheduler, can sign up for volunteer shifts, can have tasks assigned and assign tasks to others, read-only access to monthly reporting
7. **Lead Volunteer** - Can sign up for any available volunteer shift
8. **Support Volunteer** - Can only sign up for shifts specifically designated for support volunteers

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
