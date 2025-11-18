# 🚀 Deployment Instructions for forms.7more.net

## Overview

This guide will walk you through deploying your Participant Intake Form to a public HTTPS URL at `https://forms.7more.net`.

## ✅ What This Deployment Provides

- **Public HTTPS URL**: `https://forms.7more.net/embedded-form.html` (or `/` for root)
- **Automatic Sync**: Changes made in your app's form editor automatically reflect on the public form
- **Same Database**: Submissions go directly to your Firebase `participants` collection with status `pending_bridge`
- **Bridge Team Dashboard**: All submissions appear immediately in your app
- **Secure & Scalable**: Serverless functions with HTTPS support

---

## 📋 Prerequisites

Before you begin, make sure you have:

1. ✅ A GitHub account
2. ✅ A Vercel account (free tier is fine) - https://vercel.com
3. ✅ Access to your Firebase project
4. ✅ Access to your Cloudflare DNS settings for 7more.net

---

## 🔧 Step 1: Get Firebase Credentials

You need 4 environment variables from Firebase:

### 1.1 Go to Firebase Console
- Visit https://console.firebase.google.com
- Select your project: `sevenmore-app-5a969`

### 1.2 Generate Service Account Key
1. Click the gear icon (⚙️) → **Project Settings**
2. Go to **Service Accounts** tab
3. Click **"Generate New Private Key"**
4. Click **"Generate Key"** to download a JSON file

### 1.3 Extract These Values from the JSON:

Open the downloaded JSON file and find:

```json
{
  "project_id": "sevenmore-app-5a969",           ← FIREBASE_PROJECT_ID
  "private_key": "-----BEGIN PRIVATE KEY-----...", ← FIREBASE_PRIVATE_KEY (entire value)
  "client_email": "firebase-adminsdk-xxxxx@...",  ← FIREBASE_CLIENT_EMAIL
}
```

### 1.4 Get Database URL
1. In Firebase Console, go to **Realtime Database**
2. Copy the URL at the top (e.g., `https://sevenmore-app-5a969-default-rtdb.firebaseio.com`)
3. This is your `FIREBASE_DATABASE_URL`

**⚠️ IMPORTANT**: Keep these credentials secure! Never commit them to GitHub.

---

## 🐙 Step 2: Upload to GitHub

### 2.1 Create a New Repository
1. Go to https://github.com/new
2. Name it: `7more-forms-backend` (or any name you prefer)
3. Set it to **Private** (recommended for security)
4. **DO NOT** initialize with README, .gitignore, or license
5. Click **"Create repository"**

### 2.2 Upload Files

**Option A: Using GitHub Web UI (Easiest)**
1. On your new repository page, click **"uploading an existing file"**
2. Upload ALL files from `/home/user/workspace/vercel-project/`:
   - `api/` folder (with `form-config.js` and `submit-participant.js`)
   - `public/` folder (with `embedded-form.html` and `index.html`)
   - `package.json`
   - `vercel.json`
   - `.gitignore`
   - All other files EXCEPT `.env` (never upload .env!)
3. Write commit message: "Initial deployment setup"
4. Click **"Commit changes"**

**Option B: Using Git Command Line**
```bash
cd /home/user/workspace/vercel-project
git init
git add .
git commit -m "Initial deployment setup"
git remote add origin https://github.com/YOUR_USERNAME/7more-forms-backend.git
git push -u origin main
```

---

## ☁️ Step 3: Deploy to Vercel

### 3.1 Connect GitHub to Vercel
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Find and select your `7more-forms-backend` repository
5. Click **"Import"**

### 3.2 Configure Project
- **Framework Preset**: Leave as "Other" (auto-detected)
- **Root Directory**: `./` (leave default)
- **Build Command**: Leave empty (serverless functions don't need build)
- **Output Directory**: Leave as `public`

### 3.3 Add Environment Variables

**BEFORE** clicking Deploy, add these environment variables:

Click **"Environment Variables"** and add:

| Name | Value | Notes |
|------|-------|-------|
| `FIREBASE_PROJECT_ID` | `sevenmore-app-5a969` | Your project ID |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxxxx@...` | From JSON file |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----...` | **Full key including BEGIN/END markers** |
| `FIREBASE_DATABASE_URL` | `https://sevenmore-app-5a969-default-rtdb.firebaseio.com` | Your database URL |

**Environment Selection**: Select all three:
- ✅ Production
- ✅ Preview
- ✅ Development

**⚠️ CRITICAL**: For `FIREBASE_PRIVATE_KEY`:
- Copy the **ENTIRE** private key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Vercel handles newlines automatically - just paste it as-is
- Don't remove any characters or modify the key

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait 1-2 minutes for deployment to complete
3. You'll see a success message with a URL like `https://7more-forms-backend.vercel.app`

### 3.5 Test the Deployment
1. Visit: `https://your-project.vercel.app/api/form-config`
2. You should see JSON response with form configuration
3. Visit: `https://your-project.vercel.app/embedded-form.html`
4. You should see the form loading

**If you see errors**, check the Vercel deployment logs for details.

---

## 🌐 Step 4: Configure Custom Domain (forms.7more.net)

### 4.1 Add Domain in Vercel
1. In your Vercel project, go to **Settings** → **Domains**
2. Enter: `forms.7more.net`
3. Click **"Add"**
4. Vercel will show you DNS records to add

Vercel will show something like:
```
Type: CNAME
Name: forms
Value: cname.vercel-dns.com
```

### 4.2 Add DNS Record in Cloudflare
1. Log into Cloudflare
2. Select the `7more.net` domain
3. Go to **DNS** → **Records**
4. Click **"Add record"**
5. Add the CNAME record:
   - **Type**: CNAME
   - **Name**: `forms`
   - **Target**: `cname.vercel-dns.com` (or whatever Vercel showed)
   - **Proxy status**: DNS only (gray cloud, not orange)
   - **TTL**: Auto
6. Click **"Save"**

### 4.3 Wait for DNS Propagation
- DNS changes can take 5-60 minutes
- Vercel will automatically verify the domain
- Once verified, you'll see a ✅ checkmark in Vercel

### 4.4 Enable HTTPS
- Vercel automatically provisions an SSL certificate
- This happens automatically once DNS is verified
- Your form will be accessible at `https://forms.7more.net`

---

## 🎯 Step 5: Test Everything

### Test 1: Form Configuration API
Visit: `https://forms.7more.net/api/form-config`

Expected: JSON response with your form fields

### Test 2: Load the Form
Visit: `https://forms.7more.net/embedded-form.html`

Expected: Form loads with all fields visible

### Test 3: Submit the Form
1. Fill out the form completely
2. Click "Submit"
3. Expected: Success message appears

### Test 4: Check Bridge Team Dashboard
1. Open your mobile app
2. Go to Bridge Team Dashboard
3. Expected: The submission appears with status `pending_bridge`

### Test 5: Test Auto-Sync
1. In your mobile app, go to form editor
2. Change a field label (e.g., "First Name" → "Given Name")
3. Save the changes
4. Refresh `https://forms.7more.net/embedded-form.html`
5. Expected: The label change appears immediately

### Test 6: Add a New Field
1. In your mobile app, add a new field (e.g., "Middle Name")
2. Save the changes
3. Refresh the public form
4. Expected: New field appears in the form

---

## 📝 Step 6: Embed in Wix

### Final iframe Code

Once your domain is live, use this iframe code in Wix:

```html
<iframe
  src="https://forms.7more.net/embedded-form.html"
  width="100%"
  height="1200"
  frameborder="0"
  style="border:none; border-radius:8px;">
</iframe>
```

### How to Add in Wix:
1. Edit your Wix page
2. Click **"+"** → **"Embed"** → **"HTML iframe"**
3. Paste the iframe code above
4. Adjust height if needed (the form adapts to number of fields)
5. Publish your page

### Responsive Sizing:
The form is mobile-responsive. For best results:
- **Desktop**: Height: 1200px
- **Mobile**: Height: auto (or 1400px for safety)

You can also use this if you want it to fill the entire page:
```html
<iframe
  src="https://forms.7more.net/embedded-form.html"
  style="width:100%; height:100vh; border:none;">
</iframe>
```

---

## 🔄 Automatic Updates

### How It Works:
1. You edit the form in your mobile app
2. Changes are saved to Firebase Realtime Database at `formConfig/participantIntake`
3. The public form fetches configuration from Firebase on every page load
4. No Wix updates needed - the iframe stays the same!

### What Updates Automatically:
- ✅ Field labels
- ✅ Field types (text, select, date, etc.)
- ✅ Required/optional status
- ✅ Field options (dropdown choices)
- ✅ Field order
- ✅ New fields added
- ✅ Fields removed/disabled
- ✅ Form title and description

---

## 🐛 Troubleshooting

### Form shows "Loading..." indefinitely
**Cause**: API not responding
**Fix**:
1. Check `https://forms.7more.net/api/form-config` in browser
2. If it errors, check Vercel logs
3. Verify environment variables are set correctly
4. Make sure Firebase credentials are correct

### Form loads but submit fails
**Cause**: Submission API issue or Firebase permissions
**Fix**:
1. Open browser console (F12) and check for errors
2. Verify Firebase Database Rules allow writes to `participants`
3. Check Vercel deployment logs for errors
4. Test API directly: `https://forms.7more.net/api/submit-participant`

### Changes in app don't appear on public form
**Cause**: Not syncing to Firebase or cache issue
**Fix**:
1. Check if changes are saving in Firebase Console: `formConfig/participantIntake`
2. Hard refresh the page: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Clear browser cache
4. Check form editor in app - make sure "Save" is working

### SSL/HTTPS not working
**Cause**: DNS not configured correctly or still propagating
**Fix**:
1. Verify DNS record in Cloudflare
2. Wait 30-60 minutes for DNS propagation
3. Check domain status in Vercel → Settings → Domains
4. If still failing, remove and re-add domain in Vercel

### "Permission denied" errors in Vercel logs
**Cause**: Firebase service account doesn't have proper permissions
**Fix**:
1. In Firebase Console → Project Settings → Service Accounts
2. Make sure the service account has "Firebase Admin SDK" role
3. Generate a new private key and update Vercel environment variables
4. Redeploy the project

### CORS errors
**Cause**: Should not happen with proper setup, but can occur with custom configurations
**Fix**:
1. The API already includes CORS headers
2. Make sure you're using the HTTPS URL (not HTTP)
3. Check browser console for specific CORS error details

---

## 🔒 Security Best Practices

✅ **DO**:
- Keep Firebase credentials in Vercel environment variables only
- Use private GitHub repository
- Set Firebase Database Rules to validate data
- Monitor Firebase usage for unusual activity
- Regularly rotate Firebase service account keys (every 90 days)

❌ **DON'T**:
- Never commit `.env` or credentials to GitHub
- Don't share Firebase credentials publicly
- Don't use the same service account for multiple projects
- Don't disable Firebase security rules for convenience

---

## 📊 Monitoring & Maintenance

### Check Deployment Status
- Vercel Dashboard: https://vercel.com/dashboard
- View logs, analytics, and function invocations

### Monitor Form Submissions
- Check your Bridge Team Dashboard in the app
- All submissions appear in real-time

### Update Dependencies (Optional)
Every 3-6 months, update `firebase-admin` in `package.json`:
```bash
cd vercel-project
npm install firebase-admin@latest
git commit -am "Update firebase-admin"
git push
```
Vercel will auto-deploy the update.

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Form loads at `https://forms.7more.net/embedded-form.html`
- [ ] Form configuration API works: `https://forms.7more.net/api/form-config`
- [ ] Test submission goes through successfully
- [ ] Submission appears in Bridge Team Dashboard with status `pending_bridge`
- [ ] Edit a field label in app → Refresh public form → Change appears
- [ ] Add a new field in app → Refresh public form → New field appears
- [ ] Remove/disable a field in app → Refresh public form → Field disappears
- [ ] HTTPS certificate is active (green padlock in browser)
- [ ] Form works on mobile devices
- [ ] Form is embedded in Wix and displays correctly

---

## 🎉 You're Done!

Your public Participant Intake Form is now live at:
**https://forms.7more.net/embedded-form.html**

All changes made in your app's form editor will automatically appear on this public form without any additional updates needed.

---

## 📞 Support

If you encounter issues:

1. **Check Vercel Logs**: Vercel Dashboard → Your Project → Deployments → [Latest] → View Logs
2. **Check Firebase Console**: Verify data is being written to `participants` collection
3. **Browser Console**: Press F12 and check for JavaScript errors
4. **DNS Status**: Use https://dnschecker.org to verify `forms.7more.net` is resolving correctly

---

## 🔗 Quick Reference Links

- **Public Form**: https://forms.7more.net/embedded-form.html
- **API Config**: https://forms.7more.net/api/form-config
- **API Submit**: https://forms.7more.net/api/submit-participant
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com
- **Cloudflare DNS**: https://dash.cloudflare.com

---

**Last Updated**: November 2024
**Deployment Package Version**: 1.0
