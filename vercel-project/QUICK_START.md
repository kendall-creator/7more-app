# Quick Start Guide - Deploy in 15 Minutes ⚡

This is the fastest path to deploy your Participant Intake Form to `https://forms.7more.net`.

## 📦 What You Have

Inside `7more-forms-deployment.zip`:
- ✅ Serverless API functions (already configured for Firebase)
- ✅ Public embeddable form (already pointing to forms.7more.net)
- ✅ Full deployment documentation
- ✅ Everything ready to go!

---

## ⚡ 3-Step Deployment

### Step 1: Get Firebase Credentials (5 minutes)

1. Go to https://console.firebase.google.com
2. Select project: `sevenmore-app-5a969`
3. Click ⚙️ → **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"** → Download JSON
5. Open the JSON file and copy these 4 values:
   - `project_id` → Save as FIREBASE_PROJECT_ID
   - `client_email` → Save as FIREBASE_CLIENT_EMAIL
   - `private_key` → Save as FIREBASE_PRIVATE_KEY (entire value with BEGIN/END)
6. Go to **Realtime Database** → Copy the URL at top → Save as FIREBASE_DATABASE_URL

---

### Step 2: Deploy to Vercel (5 minutes)

1. **Upload to GitHub**:
   - Create new private repo: https://github.com/new
   - Name it: `7more-forms-backend`
   - Upload all files from `7more-forms-deployment.zip`
   - Commit changes

2. **Deploy on Vercel**:
   - Go to https://vercel.com/dashboard
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repo
   - Before deploying, click **"Environment Variables"**
   - Add all 4 Firebase variables (from Step 1)
   - Select: Production, Preview, Development
   - Click **"Deploy"**
   - Wait 1-2 minutes

3. **Test**:
   - Visit: `https://your-project.vercel.app/api/form-config`
   - Should see JSON response ✅

---

### Step 3: Configure Domain (5 minutes)

1. **In Vercel**:
   - Go to Settings → Domains
   - Add: `forms.7more.net`
   - Copy the DNS record shown

2. **In Cloudflare**:
   - Log into Cloudflare
   - Select `7more.net` domain
   - Go to DNS → Add record
   - Type: CNAME
   - Name: `forms`
   - Target: `cname.vercel-dns.com` (from Vercel)
   - Proxy: OFF (gray cloud)
   - Save

3. **Wait**:
   - DNS takes 5-60 minutes
   - Vercel auto-verifies and enables HTTPS
   - You'll see ✅ when ready

---

## 🎯 Final Step: Embed in Wix

Once `https://forms.7more.net` is live, add this to Wix:

```html
<iframe
  src="https://forms.7more.net/embedded-form.html"
  width="100%"
  height="1200"
  frameborder="0"
  style="border:none; border-radius:8px;">
</iframe>
```

**How to add**:
1. Edit Wix page
2. Click **"+"** → **"Embed"** → **"HTML iframe"**
3. Paste code above
4. Publish

---

## ✅ Verification

Test these 5 things:

1. ✅ Form loads: `https://forms.7more.net/embedded-form.html`
2. ✅ Submit test data → Check Bridge Team Dashboard in app
3. ✅ Edit field label in app → Refresh form → See change
4. ✅ Add new field in app → Refresh form → See new field
5. ✅ Form works embedded in Wix

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Form not loading | Check Vercel logs, verify env variables |
| Submit not working | Check Firebase permissions, console errors |
| Changes not appearing | Hard refresh (Ctrl+Shift+R) |
| DNS not working | Wait longer, verify Cloudflare record |

Full docs: See `DEPLOYMENT_INSTRUCTIONS.md`

---

## 🎉 Done!

Your form is now live and auto-syncs with your app. Any changes you make in the app's form editor will instantly appear on the public form - no code changes needed!

**Public URL**: https://forms.7more.net/embedded-form.html
