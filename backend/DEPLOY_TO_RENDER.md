# 🚀 Quick Deploy to Render.com (5 Minutes - FREE)

## Why This Fixes Your Issue

React Native on mobile **cannot access localhost** - it needs a public URL like `https://your-backend.onrender.com`.

Render.com provides:
- ✅ **Free hosting** (no credit card required)
- ✅ **Public HTTPS URL** (works from mobile devices)
- ✅ **Auto-deployment** from GitHub
- ✅ **Environment variables** (secure credential storage)

---

## Step 1: Push Backend to GitHub (2 minutes)

### Option A: Using GitHub Web Interface (Easiest)

1. **Create a new repository**:
   - Go to https://github.com/new
   - Name: `7more-email-backend`
   - Make it **Private** (recommended)
   - Click "Create repository"

2. **Upload files**:
   - Click "uploading an existing file"
   - Drag and drop these files from `/home/user/workspace/backend/`:
     - `server.js`
     - `package.json`
     - `.gitignore`
     - `render.yaml`
     - `.env.example` (NOT `.env` - that has secrets!)
   - Commit message: "Initial commit - secure email backend"
   - Click "Commit changes"

### Option B: Using Git Command Line

```bash
cd /home/user/workspace/backend

# Initialize git repository
git init

# Add all files (except .env which is in .gitignore)
git add .

# Commit
git commit -m "Initial commit - secure email backend"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/7more-email-backend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Render (3 minutes)

### 2.1: Sign Up for Render

1. Go to https://render.com/
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### 2.2: Create New Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Find and select `7more-email-backend`
4. Click **"Connect"**

### 2.3: Configure Service

Render will auto-detect settings, but verify:

- **Name**: `7more-email-backend` (or any name you prefer)
- **Region**: Choose closest to you (Oregon, Ohio, Frankfurt, Singapore)
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Plan**: **Free** ✅

### 2.4: Add Environment Variables (CRITICAL!)

Before clicking "Create Web Service", scroll down to **"Environment Variables"** and add these 5 secrets:

| Key | Value |
|-----|-------|
| `BRIDGE_TEAM_EMAIL` | `bridgeteam@7more.net` |
| `BRIDGE_TEAM_EMAIL_PASSWORD` | `weacvrkmtgunrbek` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `EMAIL_API_KEY` | `bridge-email-v1-7more-secure-2025` |

**Important**: Mark `BRIDGE_TEAM_EMAIL_PASSWORD` and `EMAIL_API_KEY` as **secret** (click the lock icon).

### 2.5: Deploy!

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. You'll see build logs in real-time
4. When you see "Your service is live 🎉", deployment is complete!

---

## Step 3: Get Your Public URL

Once deployed, Render gives you a URL like:

```
https://7more-email-backend.onrender.com
```

**Copy this URL** - you'll need it in the next step.

---

## Step 4: Update Your App Configuration

Now update your Vibecode app to use the public backend URL:

### Option A: Using Vibecode ENV Tab (Recommended)

1. Open Vibecode app
2. Go to **ENV** tab
3. Update this variable:
   ```
   EXPO_PUBLIC_EMAIL_BACKEND_URL=https://7more-email-backend.onrender.com
   ```
   (Replace with your actual Render URL)

### Option B: Edit .env File Directly

Open `/home/user/workspace/.env` and change line 17:

```bash
# OLD:
EXPO_PUBLIC_EMAIL_BACKEND_URL=http://localhost:3001

# NEW (replace with your Render URL):
EXPO_PUBLIC_EMAIL_BACKEND_URL=https://7more-email-backend.onrender.com
```

---

## Step 5: Test!

1. **Restart your app** (close and reopen in Vibecode)
2. Go to Bridge Team Follow-Up Form
3. Select resources
4. Click **Email** button
5. ✅ **Email should send successfully!**

---

## Verify Deployment

### Test Backend Health

Open in browser or use curl:
```
https://7more-email-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "7more Email Backend"
}
```

### Check Logs

In Render dashboard:
1. Click your service
2. Go to "Logs" tab
3. You'll see:
   ```
   🚀 7more Email Backend running on port 10000
   📧 Email service: bridgeteam@7more.net
   🔐 API Key configured: Yes
   ```

---

## Cost & Limits

**Render Free Tier**:
- ✅ **$0/month** forever
- ✅ 750 hours/month (enough for 24/7 operation)
- ⚠️ Spins down after 15 minutes of inactivity (takes ~30 seconds to wake up)
- ✅ 400 build minutes/month
- ✅ Unlimited bandwidth

**First email after inactivity**: May take 30-60 seconds (backend waking up)
**Subsequent emails**: Instant

### To Keep Backend Always Running (Optional)

Upgrade to paid tier ($7/month) to prevent spin-down.

---

## Troubleshooting

### ❌ "Build failed" Error

**Solution**: Check you uploaded all required files:
- `server.js`
- `package.json`
- `.gitignore`

### ❌ "Service unavailable" Error

**Solution**: Check environment variables are set correctly in Render dashboard.

### ❌ "Unauthorized" Error in App

**Solution**: Make sure `EXPO_PUBLIC_EMAIL_API_KEY` (in app) matches `EMAIL_API_KEY` (in Render).

### ⚠️ Backend Takes Long to Respond First Time

**This is normal** - Render free tier spins down after 15 minutes of inactivity. First request takes 30 seconds to wake up.

---

## Alternative: Railway.com (Also Free)

If you prefer Railway instead:

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `7more-email-backend`
5. Add same environment variables
6. Deploy!

Railway gives you: `https://7more-email-backend.up.railway.app`

---

## Summary

After deployment:

✅ Backend running on public HTTPS URL
✅ Accessible from mobile devices
✅ All credentials secure (server-side only)
✅ Email sending fully operational
✅ $0/month cost

**Total time**: ~5 minutes
**Difficulty**: Easy (just clicking through forms)

Once deployed, your email button will work perfectly! 🎉
