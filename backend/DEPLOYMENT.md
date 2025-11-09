# Secure Email Backend - Deployment Guide

This backend handles email sending for your 7more app with **all credentials stored securely server-side** (never exposed to the client app).

## Security Features ✅

- ✅ **NO secrets in client app** - SMTP credentials stay server-side only
- ✅ **API key authentication** - Prevents unauthorized use of your email endpoint
- ✅ **Gmail App Password** - Uses secure app-specific password (not your real Gmail password)
- ✅ **Input validation** - Validates email addresses and required fields
- ✅ **Rate limiting** - Vercel automatically rate limits to prevent abuse
- ✅ **CORS protection** - Can be configured to only allow requests from your domain

---

## Prerequisites

1. **GitHub Account** - Free (to host your code)
2. **Vercel Account** - Free (to host your backend)
3. **Gmail App Password** - You already have this: `weacvrkmtgunrbek`

---

## Step 1: Create a GitHub Repository (5 minutes)

### Option A: Using GitHub Website (Recommended)

1. Go to https://github.com/new
2. Repository name: `7more-email-backend`
3. Description: "Secure email backend for 7more app"
4. Make it **Private** (recommended for security)
5. Click **"Create repository"**
6. You'll see instructions - **ignore them for now** (we'll push code in Step 2)

### Option B: Using GitHub Desktop

1. Open GitHub Desktop
2. File → New Repository
3. Name: `7more-email-backend`
4. Local Path: Choose where to save it
5. Click "Create Repository"
6. Click "Publish repository"
7. Make it **Private**

---

## Step 2: Push Backend Code to GitHub (2 minutes)

You have two options:

### Option A: Using Command Line (if you have access to a terminal)

```bash
# Navigate to the backend folder
cd /path/to/your/workspace/backend

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - secure email backend"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/7more-email-backend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Desktop

1. Open GitHub Desktop
2. File → Add Local Repository
3. Choose the `backend` folder from your workspace
4. Click "Add Repository"
5. Write commit message: "Initial commit - secure email backend"
6. Click "Commit to main"
7. Click "Publish branch"

### Option C: Manual Upload (if no Git access)

1. Go to your GitHub repository page
2. Click "uploading an existing file"
3. Drag and drop ALL files from the `backend` folder:
   - `api/send-email.js`
   - `package.json`
   - `vercel.json`
   - `.gitignore`
4. Click "Commit changes"

---

## Step 3: Deploy to Vercel (5 minutes)

### 3.1: Sign Up for Vercel

1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. **Free plan is perfect** - no credit card required

### 3.2: Import Your Repository

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find `7more-email-backend` in the list
3. Click **"Import"**

### 3.3: Configure Environment Variables (CRITICAL - DO NOT SKIP!)

**Before deploying**, you MUST add these environment variables:

Click **"Environment Variables"** and add these **4 secrets**:

| Name | Value | Notes |
|------|-------|-------|
| `BRIDGE_TEAM_EMAIL` | `bridgeteam@7more.net` | Your Bridge Team Gmail |
| `BRIDGE_TEAM_EMAIL_PASSWORD` | `weacvrkmtgunrbek` | Your Gmail App Password |
| `SMTP_HOST` | `smtp.gmail.com` | Gmail SMTP server |
| `SMTP_PORT` | `587` | SMTP port for STARTTLS |
| `API_SECRET_KEY` | **(Generate a random key)** | See below for how to generate |

**How to generate `API_SECRET_KEY`:**
- Go to https://www.uuidgenerator.net/ and copy the UUID
- OR use a strong random string (e.g., `7more_secure_key_2025_9a8b7c6d5e4f3g2h1i`)
- This is what your app will use to authenticate with the backend

### 3.4: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment to complete
3. You'll see "🎉 Congratulations!" when done
4. Copy your deployment URL (e.g., `https://7more-email-backend.vercel.app`)

---

## Step 4: Configure Your App (2 minutes)

Now that your backend is deployed, configure your app to use it:

### 4.1: Remove Old Credentials from .env

**IMPORTANT**: Remove these from your `.env` file (they're now server-side only):
- ❌ Remove: `BRIDGE_TEAM_EMAIL_PASSWORD=weacvrkmtgunrbek`
- ❌ Remove: `SMTP_HOST=smtp.gmail.com`
- ❌ Remove: `SMTP_PORT=587`
- ❌ Remove: `SMTP_SECURE=false`

Keep only:
- ✅ Keep: `BRIDGE_TEAM_EMAIL=bridgeteam@7more.net` (this is safe to keep in client)

### 4.2: Add Backend Configuration to ENV Tab

In the Vibecode app, go to the **ENV** tab and add these **2 NEW variables**:

```
EXPO_PUBLIC_EMAIL_BACKEND_URL=https://YOUR-DEPLOYMENT-URL.vercel.app
EXPO_PUBLIC_EMAIL_API_KEY=YOUR-API-SECRET-KEY-FROM-STEP-3
```

**Example:**
```
EXPO_PUBLIC_EMAIL_BACKEND_URL=https://7more-email-backend.vercel.app
EXPO_PUBLIC_EMAIL_API_KEY=7more_secure_key_2025_9a8b7c6d5e4f3g2h1i
```

**Note:** These are safe to expose because:
- The URL is just an endpoint (anyone can see it anyway)
- The API key only allows sending emails (not reading/accessing anything)
- Your actual SMTP password stays hidden server-side

---

## Step 5: Test the Integration (5 minutes)

### 5.1: Test Email Sending

1. Open your 7more app
2. Log in as Bridge Team
3. Go to a participant with an email address
4. Open Bridge Team Follow-Up Form
5. Go to Section 5 (Resources Sent)
6. Select a resource
7. Click **Email** button
8. Check the participant's email inbox!

### 5.2: Check Logs (if something goes wrong)

If email doesn't send:

1. Go to https://vercel.com/dashboard
2. Click your `7more-email-backend` project
3. Click "Logs" tab
4. See detailed error messages

Common issues:
- ❌ "Unauthorized" → Check `EXPO_PUBLIC_EMAIL_API_KEY` matches `API_SECRET_KEY` in Vercel
- ❌ "Email service not configured" → Check all 5 environment variables in Vercel
- ❌ "Invalid credentials" → Check Gmail App Password is correct

---

## Step 6: Lock Down Security (Optional - Recommended)

### 6.1: Restrict CORS to Your Domain Only

After testing, update `/backend/api/send-email.js` line 12:

```javascript
// BEFORE (allows all domains):
"Access-Control-Allow-Origin": "*",

// AFTER (only allow your domain):
"Access-Control-Allow-Origin": "https://yourapp.com",
```

Then redeploy by pushing to GitHub (Vercel auto-deploys on git push).

### 6.2: Monitor Usage

1. Go to Vercel dashboard
2. Click your project
3. Check "Analytics" tab to see:
   - How many emails are sent
   - Response times
   - Error rates

### 6.3: Set Up Email Alerts (Free)

1. In Vercel dashboard → Settings → Notifications
2. Enable "Failed Deployments"
3. Enable "Production Errors"
4. You'll get email alerts if anything breaks

---

## Cost Analysis

**Total Cost: $0/month** ✅

- GitHub Private Repo: **Free**
- Vercel Hobby Plan: **Free**
  - 100 GB bandwidth/month
  - Unlimited API requests
  - Perfect for non-profit use
- Gmail SMTP: **Free**

Even with heavy use, you'll stay within free tiers.

---

## Maintenance

### Update Backend Code

If you need to update the backend:

1. Edit `/backend/api/send-email.js`
2. Push to GitHub
3. Vercel **automatically redeploys** (no manual steps!)

### Rotate API Key (Recommended Every 6 Months)

1. Generate new API secret key
2. Update in Vercel: Project → Settings → Environment Variables
3. Update in your app's ENV tab: `EXPO_PUBLIC_EMAIL_API_KEY`

### Monitor Email Deliverability

Check Gmail's "Sent" folder periodically:
1. Log into bridgeteam@7more.net
2. Check "Sent" folder to verify emails are going out
3. Check for bounce-backs or delivery failures

---

## Troubleshooting

### Email Not Sending?

**Step 1: Check Backend Logs**
1. Go to Vercel dashboard → Logs
2. Look for errors in the last hour

**Step 2: Verify Environment Variables**
1. Vercel dashboard → Project → Settings → Environment Variables
2. Make sure all 5 variables are set correctly

**Step 3: Test Backend Directly**

Use a tool like Postman or curl:

```bash
curl -X POST https://YOUR-DEPLOYMENT-URL.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-API-SECRET-KEY" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email from 7more backend"
  }'
```

If this works, the issue is in your app configuration.
If this fails, the issue is in your backend configuration.

### "Invalid credentials" Error?

Your Gmail App Password might have expired or been revoked:

1. Go to https://myaccount.google.com/security
2. Sign in with bridgeteam@7more.net
3. Go to "2-Step Verification" → "App passwords"
4. Generate a NEW app password
5. Update in Vercel environment variables

### Rate Limited by Gmail?

Gmail has sending limits:
- 500 emails per day (for free Gmail)
- 2,000 emails per day (for Google Workspace)

If you hit limits, emails will fail. Consider upgrading to Google Workspace.

---

## Security Checklist ✅

Before going to production, verify:

- ✅ All SMTP credentials are ONLY in Vercel environment variables
- ✅ NO `BRIDGE_TEAM_EMAIL_PASSWORD` in your app's .env file
- ✅ GitHub repository is **Private** (not public)
- ✅ API secret key is strong and random
- ✅ CORS is configured (optional but recommended)
- ✅ You can send test emails successfully
- ✅ Vercel email notifications are enabled

---

## Support

If you encounter issues:

1. Check Vercel logs first (most issues show up here)
2. Check expo.log in your app for client-side errors
3. Verify all environment variables are set correctly
4. Test the backend endpoint directly with curl

**Need help?** Open an issue with:
- Error message from Vercel logs
- Error message from expo.log
- Steps you've already tried
