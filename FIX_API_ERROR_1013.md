# Fix for NSURLErrorDomain error -1013 (Too Many Redirects)

## What This Error Means
**HTTP Request Too Much Redirect** - Your API is redirecting in loops, causing iOS to abort the request after 16+ redirects.

## What I Fixed

### 1. ✅ Fixed Routing Loop in vercel.json
Changed from `routes` to `rewrites` to prevent redirect loops:

**Before (causing loops):**
```json
"routes": [
  { "src": "/api/(.*)", "dest": "/api/$1" },
  { "src": "/(.*)", "dest": "/public/$1" }
]
```

**After (fixed):**
```json
"rewrites": [
  { "source": "/api/:path*", "destination": "/api/:path*" },
  { "source": "/", "destination": "/public/index.html" },
  { "source": "/:path*", "destination": "/public/:path*" }
]
```

### 2. ⚠️ You Still Need: Firebase Admin Credentials

Your API endpoints need these environment variables in Vercel:

## How to Get Firebase Admin Credentials

1. **Go to Firebase Console:**
   https://console.firebase.google.com/project/sevenmore-app-5a969/settings/serviceaccounts/adminsdk

2. **Click "Generate New Private Key"**

3. **Download the JSON file** - It will look like:
   ```json
   {
     "project_id": "sevenmore-app-5a969",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...",
     "client_email": "firebase-adminsdk-xxxxx@sevenmore-app-5a969.iam.gserviceaccount.com"
   }
   ```

4. **Add to Vercel Environment Variables:**
   - Go to: https://vercel.com/dashboard
   - Click your project: **7more-embedded-form1**
   - Go to **Settings** → **Environment Variables**
   - Add these 4 variables:

   ```
   FIREBASE_PROJECT_ID = sevenmore-app-5a969
   FIREBASE_DATABASE_URL = https://sevenmore-app-5a969-default-rtdb.firebaseio.com
   FIREBASE_PRIVATE_KEY = (paste the entire private_key from the JSON, including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)
   FIREBASE_CLIENT_EMAIL = (paste client_email from the JSON)
   ```

   **IMPORTANT:** Keep the quotes and newlines in the private key exactly as they are!

## Deploy the Fix

### Option 1: Redeploy via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click your project: **7more-embedded-form1**
3. Go to **Deployments**
4. Click **...** on the latest deployment
5. Click **Redeploy**

### Option 2: Upload Updated Files
1. Extract `vercel-project-updated.zip` (I created this earlier)
2. Upload to Vercel via their dashboard

## Test After Deployment

1. Visit: https://7more-embedded-form1.vercel.app/api/form-config
   - Should return JSON with form fields (not redirect)

2. Try the form in your iframe on your website
   - Should load without the -1013 error

## Still Getting the Error?

Check these:

1. **Clear iOS cache** - Close and reopen your browser/app
2. **Check API response directly** - Visit the API URL in a browser to confirm no redirects
3. **Verify environment variables** - Make sure all 4 Firebase variables are set in Vercel
4. **Check Firebase Rules** - Make sure your database allows writes from the server

## Why This Happened

The old `routes` configuration in Vercel was causing the API endpoints to redirect multiple times before landing on the correct destination. The new `rewrites` configuration handles this more cleanly without creating redirect chains.
