# How to Get Your Firebase Configuration

Follow these steps to get your Firebase configuration credentials:

## Step 1: Go to Firebase Console

Visit: **https://console.firebase.google.com/**

## Step 2: Select Your Project

Click on your project from the list (the same project used by your mobile app).

## Step 3: Go to Project Settings

Click the **gear icon** ⚙️ next to "Project Overview" in the left sidebar, then click **"Project settings"**.

## Step 4: Scroll to "Your apps"

Scroll down to the section labeled **"Your apps"** or **"Firebase SDK snippet"**.

## Step 5: Find or Create a Web App

If you already have a web app registered:
- Click on the **`</>`** icon (web app)
- Click **"Config"** radio button

If you don't have a web app:
- Click **"Add app"** button
- Select the web icon **`</>`**
- Give it a nickname (e.g., "7more Forms")
- Click **"Register app"**

## Step 6: Copy the Configuration

You'll see code that looks like this:

```javascript
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuv",
  authDomain: "your-project-12345.firebaseapp.com",
  databaseURL: "https://your-project-12345-default-rtdb.firebaseio.com",
  projectId: "your-project-12345",
  storageBucket: "your-project-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
};
```

**Copy this entire object!**

## Step 7: Update the Forms

### For Participant Form (`participant-intake-form.html`)

1. Open `participant-intake-form.html` in a text editor
2. Find this section near the bottom (inside the `<script>` tag):

```javascript
// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Replace it with your actual Firebase config from Step 6
4. Save the file

### For Volunteer Form (`volunteer-intake-form.html`)

Repeat the same process for the volunteer form.

## Step 8: Verify Database URL

**IMPORTANT:** Make sure your `databaseURL` ends with `.firebaseio.com` or `.firebasedatabase.app`

✅ Correct:
```javascript
databaseURL: "https://your-project.firebaseio.com"
```

❌ Wrong:
```javascript
databaseURL: "https://your-project.firebaseapp.com"  // This is authDomain, not databaseURL
```

If you don't see a `databaseURL` in your config:
1. Go to Firebase Console
2. Click **"Realtime Database"** in the left sidebar
3. Copy the URL shown at the top (e.g., `https://your-project-default-rtdb.firebaseio.com`)
4. Add it manually to your config:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",  // Add this line
  projectId: "...",
  // ... rest of config
};
```

## Example: Before and After

### BEFORE (placeholder values):
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### AFTER (real values):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuv",
  authDomain: "my-nonprofit-app.firebaseapp.com",
  databaseURL: "https://my-nonprofit-app-default-rtdb.firebaseio.com",
  projectId: "my-nonprofit-app",
  storageBucket: "my-nonprofit-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
};
```

## Security Note

⚠️ **Is it safe to put API keys in HTML?**

Yes! These Firebase web API keys are designed to be public. They identify your Firebase project but don't grant access without proper Firebase Security Rules.

Your Firebase Realtime Database rules should be:
```json
{
  "rules": {
    "participants": {
      ".write": "true",
      ".read": "auth != null"
    },
    "volunteerInquiries": {
      ".write": "true",
      ".read": "auth != null"
    }
  }
}
```

This allows:
- ✅ Anyone to write (submit forms)
- ✅ Only authenticated users (mobile app) to read
- ❌ Public cannot read sensitive data

## Troubleshooting

### Error: "Firebase not configured"
- Double-check that you replaced ALL placeholder values
- Make sure you didn't accidentally delete any quotes or commas

### Error: "Permission denied"
- Check your Firebase Database rules
- Ensure `.write: "true"` is set for the paths

### Forms submit but data not appearing in app
- Verify you're using the same Firebase project
- Check the databaseURL is correct
- Refresh the mobile app

### Can't find databaseURL in config
- Go to Firebase Console → Realtime Database
- Copy the URL at the top of the page
- Add it manually to your config

## Next Steps

Once you've updated the Firebase config:

1. ✅ Upload forms to your web server
2. ✅ Test by submitting sample data
3. ✅ Check Firebase Console to see the data
4. ✅ Check mobile app to see new submissions
5. ✅ Share form URLs with your team

## Visual Reference

```
Firebase Console
├── Project Overview
├── ⚙️ Project settings  ← CLICK HERE
│   ├── General
│   ├── Usage and billing
│   └── Your apps  ← SCROLL TO THIS SECTION
│       ├── iOS apps
│       ├── Android apps
│       └── Web apps  ← FIND OR ADD WEB APP
│           └── Config  ← COPY THIS
```

## Need Help?

If you're stuck:
1. Make sure you're logged into the correct Firebase account
2. Verify you selected the right project
3. Check that Realtime Database is enabled in Firebase Console
4. Review the full `INTEGRATION_GUIDE.md` for detailed instructions

---

**That's it!** Once you have the config, the rest is just copy-paste. The forms will work immediately once uploaded to your website.
