# Firebase Setup Guide for Multi-Device Data Sync

## What Was Changed

Your volunteer management app has been upgraded from local-only storage to **Firebase Realtime Database**. This means:

✅ **Before**: Each device had its own separate data (no syncing)
✅ **After**: All devices share the same data in real-time

## Your Action Required: Set Up Firebase (5-10 minutes)

### Step-by-Step Instructions

#### 1. Create a Firebase Account & Project

1. Go to https://console.firebase.google.com/
2. Sign in with your Google account (or create one)
3. Click **"Add project"** or **"Create a project"**
4. Enter project name: `volunteer-management` (or your choice)
5. Disable Google Analytics (not needed)
6. Click **"Create Project"**
7. Wait for Firebase to finish setting up

#### 2. Create a Realtime Database

1. In your new Firebase project, look at the left sidebar
2. Click **"Build"** → **"Realtime Database"**
3. Click the **"Create Database"** button
4. **Choose a location** closest to you:
   - `us-central1` (United States)
   - `europe-west1` (Belgium)
   - `asia-southeast1` (Singapore)
5. **Security rules**: Select **"Start in test mode"**
   - This allows you to test without authentication
   - We'll secure it later (see Step 5)
6. Click **"Enable"**
7. Wait for the database to be created

#### 3. Get Your Firebase Configuration

1. Click the **gear icon** ⚙️ next to "Project Overview" in the top left
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section (at the bottom)
4. You'll see "There are no apps in your project"
5. Click the **web icon** `</>` (it looks like `</>`)
6. **Register app**:
   - App nickname: `Volunteer App` (or anything you want)
   - Don't check "Firebase Hosting"
   - Click **"Register app"**
7. You'll see a **firebaseConfig** code block. It looks like this:

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

8. **Copy all 7 values** - you'll need them in the next step

#### 4. Add Firebase Credentials to Vibecode App

**METHOD 1: Using Vibecode ENV Tab (Easiest)**

1. Open your **Vibecode mobile app**
2. Tap the **ENV tab** at the bottom
3. Add each of these environment variables by tapping the "+" button:

| Variable Name | Your Value (from Step 3) |
|---------------|--------------------------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Your `apiKey` value |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Your `authDomain` value |
| `EXPO_PUBLIC_FIREBASE_DATABASE_URL` | Your `databaseURL` value |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Your `projectId` value |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Your `storageBucket` value |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your `messagingSenderId` value |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Your `appId` value |

4. After adding all 7 variables, restart the app

**METHOD 2: If You Can't Use ENV Tab**

Just send me a message with your 7 Firebase config values and I'll add them to the code for you.

#### 5. Test Multi-Device Sync

1. **Open the app on your device**
2. Log in as admin: `kendall@7more.net` / `7moreHouston!`
3. **Add a test participant** or **create a shift**
4. **Open the app on a second device** (or share login with someone)
5. Log in with the same credentials
6. **You should see the same data on both devices!**
7. Make a change on one device - it should appear on the other instantly

#### 6. Secure Your Database (After Testing)

**IMPORTANT**: Test mode allows anyone with your database URL to read/write data. After you confirm everything works, secure your database:

1. Go back to **Firebase Console** → **Realtime Database**
2. Click the **"Rules"** tab at the top
3. You'll see test mode rules that look like:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

4. **Replace** with these secure rules:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

5. Click **"Publish"**

**Note**: Since we're not using Firebase Authentication yet, you may want to keep test mode active for now. Just be aware that your database is publicly accessible until you implement authentication.

## Troubleshooting

### Problem: "App won't load" or "Infinite loading"
- Make sure all 7 environment variables are added correctly
- Restart the Vibecode app completely
- Check that your `databaseURL` ends with `.firebaseio.com` or `.firebasedatabase.app`

### Problem: "Data not syncing between devices"
- Check your internet connection on both devices
- Open Firebase Console → Realtime Database → Data tab
- Verify that data is appearing in the Firebase console
- Check that both devices have the same Firebase credentials

### Problem: "Permission denied" error
- Go to Firebase Console → Realtime Database → Rules
- Make sure rules are set to test mode (Step 2, #5)
- If you changed to secure rules, switch back to test mode temporarily

### Problem: "Previous data is gone"
- This is expected - Firebase uses a new database
- Your old data was stored locally on your device
- You'll need to re-enter any existing data into the Firebase database

## What Happens Next

Once Firebase is set up:

✅ All users see the same participants, shifts, and resources
✅ Changes sync instantly across all devices
✅ Data is automatically backed up to the cloud
✅ Multiple staff can work simultaneously without conflicts
✅ No more "different versions" of data on different devices

## Need Help?

If you run into any issues:
1. Check the Troubleshooting section above
2. Take a screenshot of any error messages
3. Send me a message describing what's not working
4. I can help debug and fix any issues

## Cost

Firebase has a **generous free tier** that should be sufficient for most nonprofit organizations:

- **Free tier includes**:
  - 1 GB stored data
  - 10 GB/month downloaded
  - 100 simultaneous connections

For a typical nonprofit volunteer program, this should be more than enough. You can monitor your usage in the Firebase Console.
