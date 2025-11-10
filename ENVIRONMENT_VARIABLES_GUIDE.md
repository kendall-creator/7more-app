# 🔒 Environment Variables Guide - KEEP THIS SAFE!

## ⚠️ Critical Information

Your environment variables are disappearing because:
1. **`.env` files are NOT tracked by git** (in `.gitignore`)
2. **Vibecode workspace may reset** between sessions
3. **You must use the ENV tab in the Vibecode mobile app** to persist them

---

## ✅ Required Environment Variables

Add these **exactly as shown** in the Vibecode app ENV tab:

### Firebase (REQUIRED for app to work)
```
EXPO_PUBLIC_FIREBASE_API_KEY = AIzaSyAiYOUSiYKcgn-uAGi_rMLwMmNyENMSq20
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = sevenmore-app-5a969.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL = https://sevenmore-app-5a969-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID = sevenmore-app-5a969
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = sevenmore-app-5a969.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 110371002953
EXPO_PUBLIC_FIREBASE_APP_ID = 1:110371002953:web:79c44b39188e2649a0fd98
```

### Optional (add if you have them)
```
EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY = (your OpenAI key)
EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY = (your Anthropic key)
EXPO_PUBLIC_EMAIL_API_KEY = re_aL2c1wUv_D1dhwGMonohYjTUEkNdPc3E9
EXPO_PUBLIC_EMAIL_FROM = bridgeteam@7more.net
```

---

## 🔄 After Adding Variables - IMPORTANT!

**You MUST reload the app** for environment variables to take effect:

### Method 1: Shake to Reload (iOS)
1. Shake your phone
2. Tap "Reload"

### Method 2: Force Close and Reopen
1. Swipe up to close the Vibecode app completely
2. Reopen it
3. Changes should be applied

---

## 📋 How to Add Variables in Vibecode App

1. Open **Vibecode mobile app**
2. Tap the **ENV tab** (usually at the bottom or in settings)
3. For each variable:
   - Tap **"Add Variable"** or **"+"**
   - Enter **Variable Name** (e.g., `EXPO_PUBLIC_FIREBASE_API_KEY`)
   - Enter **Value** (e.g., `AIzaSyAiYOUSiYKcgn-uAGi_rMLwMmNyENMSq20`)
   - Tap **Save**
4. After adding all variables, **reload the app**

---

## 🛡️ Safeguards I've Created

### 1. Fallback Configuration File
I've created a backup configuration that will warn you if variables are missing.

### 2. Visual Indicators
Your app now shows:
- ✅ **Green indicator** = Firebase connected
- ⚠️ **Warning message** = Firebase not configured

### 3. This Documentation
Keep this file as a reference for your Firebase credentials.

---

## 🚨 How to Prevent This Issue

### DO ✅
- **Always use the ENV tab** in Vibecode app for environment variables
- **Keep this file** as a backup reference
- **Reload the app** after adding/changing variables
- **Check the LOGS tab** to verify Firebase is connected

### DON'T ❌
- Don't create `.env` files manually (they will be deleted)
- Don't commit API keys to git (security risk)
- Don't expect variables to persist across workspace resets without using the ENV tab

---

## 🔍 How to Verify Variables Are Working

### Check Logs
1. Open Vibecode app
2. Go to **LOGS tab**
3. Look for:
   - ❌ BAD: `"Firebase is not configured"`
   - ✅ GOOD: No Firebase warnings, app works normally

### Check in App
1. Try adding a participant
2. Try creating a shift
3. If it works and saves, Firebase is connected!

---

## 📞 Troubleshooting

### Issue: "Firebase is not configured" warning in logs
**Solution:**
1. Double-check all 7 Firebase variables are in ENV tab
2. Make sure there are no typos in variable names
3. Reload the app (shake → reload)
4. Close and reopen Vibecode app completely

### Issue: Variables keep disappearing
**Solution:**
1. Confirm you're adding them via ENV tab (not manually creating `.env`)
2. Check if Vibecode app is logged in/synced properly
3. Contact Vibecode support if issue persists

### Issue: App works but data doesn't sync between devices
**Solution:**
1. Verify FIREBASE_DATABASE_URL is correct
2. Check Firebase console for database rules
3. Confirm all devices are using the same Firebase project

---

## 🔐 Security Note

Your API keys are now documented in this file. This file is in your git repository, which means:

- ✅ **Safe for Firebase keys** - These are client-side keys with security rules
- ⚠️ **Remove any sensitive keys** - Don't add server-side private keys here
- 🔒 **Never share this repo publicly** - Keep it private on GitHub

---

## 📝 Quick Reference Card

**Vibecode App → ENV Tab → Add These 7 Variables:**

1. `EXPO_PUBLIC_FIREBASE_API_KEY`
2. `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
3. `EXPO_PUBLIC_FIREBASE_DATABASE_URL`
4. `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
5. `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
6. `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` ← **Don't forget this one!**
7. `EXPO_PUBLIC_FIREBASE_APP_ID`

**Then: Shake phone → Reload → Verify in LOGS tab**

---

Last Updated: 2025-11-10
Firebase Project: sevenmore-app-5a969
