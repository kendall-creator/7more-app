# ⚡ QUICK FIX: Email Backend Not Reachable from Mobile

## The Problem

Your backend is running on `localhost:3001`, but React Native on mobile **cannot access localhost**. You're seeing:

```
❌ Error sending email via backend: TypeError: Network request failed
```

## The Solution (5 minutes)

Deploy your backend to **Render.com** (free) to get a public URL like:
```
https://7more-email-backend.onrender.com
```

This URL works from **anywhere** including mobile devices!

---

## Step-by-Step Fix

### 1. Push to GitHub (2 min)

**Easiest method** - Upload via GitHub web:

1. Go to https://github.com/new
2. Create repo: `7more-email-backend` (Private)
3. Click "uploading an existing file"
4. Upload from `/home/user/workspace/backend/`:
   - `server.js`
   - `package.json`
   - `.gitignore`
   - `render.yaml`
   - `.env.example`

   **⚠️ DO NOT upload `.env`** (it has secrets!)

5. Commit changes

**OR** use Git command:
```bash
cd /home/user/workspace/backend
git remote add origin https://github.com/YOUR_USERNAME/7more-email-backend.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Render (3 min)

1. Go to https://render.com/ → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect `7more-email-backend` repo
4. Settings:
   - Runtime: Node
   - Build: `npm install`
   - Start: `node server.js`
   - Plan: **Free**

5. **Add Environment Variables**:
   ```
   BRIDGE_TEAM_EMAIL = bridgeteam@7more.net
   BRIDGE_TEAM_EMAIL_PASSWORD = weacvrkmtgunrbek
   SMTP_HOST = smtp.gmail.com
   SMTP_PORT = 587
   EMAIL_API_KEY = bridge-email-v1-7more-secure-2025
   ```

6. Click **"Create Web Service"**
7. Wait 2-3 minutes for deployment

### 3. Update Your App

Copy your Render URL (e.g., `https://7more-email-backend.onrender.com`)

**In Vibecode ENV tab** or edit `.env`:
```bash
EXPO_PUBLIC_EMAIL_BACKEND_URL=https://7more-email-backend.onrender.com
```

### 4. Test!

1. Restart app
2. Click Email button
3. ✅ Should work!

---

## Full Instructions

See **`DEPLOY_TO_RENDER.md`** for detailed guide with screenshots and troubleshooting.

---

## Why This Is Necessary

| Setup | Works On... | Issue |
|-------|-------------|-------|
| `localhost:3001` | ✅ Your computer | ❌ Mobile can't access |
| `172.17.0.2:3001` | ✅ Docker network | ❌ Mobile can't access |
| `https://backend.onrender.com` | ✅ **Everywhere!** | ✅ **No issues!** |

Mobile devices need a **public URL** - not localhost!

---

## Cost

- ✅ **Free** ($0/month)
- ✅ 750 hours/month (24/7 operation)
- ⚠️ Sleeps after 15 min inactivity (30sec wake-up time)

---

## Already Have Git/GitHub?

Your backend is **ready to push**:
```bash
cd /home/user/workspace/backend
git remote add origin https://github.com/YOUR_USERNAME/7more-email-backend.git
git branch -M main
git push -u origin main
```

Then deploy to Render following steps above!
