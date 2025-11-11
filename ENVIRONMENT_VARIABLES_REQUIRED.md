# 🔑 REQUIRED ENVIRONMENT VARIABLES FOR 7MORE APP

**IMPORTANT:** If your environment variables disappear, copy these values into the **ENV tab** in your Vibecode mobile app.

This is a known issue with the Vibecode platform. Your environment variables are NOT stored in a `.env` file - they're managed by Vibecode through the ENV tab.

## How to Restore Your Environment Variables

1. Open your Vibecode mobile app
2. Go to the **ENV tab**
3. Add each variable below by copying the exact name and value

---

## Firebase Configuration (REQUIRED - for database)

```
FIREBASE_PROJECT_ID=more-47e56
FIREBASE_MEASUREMENT_ID=G-Q9V1QM2VKX
FIREBASE_MESSAGING_SENDER_ID=1092914331177
FIREBASE_API_KEY=AIzaSyB1vr2KGgfDz3rNsxuwDLN4-Ys_7o9r3wY
FIREBASE_AUTH_DOMAIN=more-47e56.firebaseapp.com
FIREBASE_DATABASE_URL=https://more-47e56-default-rtdb.firebaseio.com
FIREBASE_APP_ID=1:1092914331177:web:4e1e8c3edf2e22f49e88c3
FIREBASE_STORAGE_BUCKET=more-47e56.firebasestorage.app
```

## Backend Email Service (REQUIRED - for email button to work)

```
EXPO_PUBLIC_BACKEND_URL=http://172.17.0.1:3001
EXPO_PUBLIC_BACKEND_API_KEY=bridge-email-v1-7more-secure-2025
```

## Aircall SMS Integration (Optional - for SMS features)

```
AIRCALL_API_TOKEN=your_aircall_api_token
AIRCALL_API_ID=your_aircall_api_id
AIRCALL_FROM_NUMBER=your_aircall_phone_number
```

---

## Why Do My Environment Variables Keep Disappearing?

This appears to be a **Vibecode platform issue**. Environment variables in Vibecode are:
- Managed through the ENV tab in the mobile app
- NOT stored in `.env` files
- Injected at runtime by Vibecode's infrastructure

If they keep disappearing, it may be due to:
1. Workspace resets
2. App updates clearing the ENV tab
3. A bug in the Vibecode environment management system

**Solution:** Keep this document handy and re-add the variables through the ENV tab whenever they disappear.

---

## Quick Verification

To check if your environment variables are loaded, look at the app logs. You should see Firebase initialization and backend connection messages.

If you see errors about missing configuration, your environment variables need to be restored.

---

**Last Updated:** November 11, 2025
**Status:** Backend server is running on port 3001 and ready to send emails
