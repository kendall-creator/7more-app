# ✅ Email Now Uses Resend (No Backend Needed!)

## What Changed

Your app now sends emails directly using **Resend API** - no custom backend required!

### Benefits:
- ✅ **Simpler setup** - Just add one API key, no backend deployment
- ✅ **More reliable** - Resend handles deliverability and infrastructure
- ✅ **Free tier** - 100 emails/day, 3,000/month
- ✅ **Professional** - Better email delivery than SMTP
- ✅ **Reply-To support** - Recipients can reply to bridgeteam@7more.net

---

## Setup Instructions (5 minutes)

### Step 1: Sign Up for Resend
1. Go to https://resend.com
2. Click "Get Started" and sign up (free)
3. Verify your email address

### Step 2: Get Your API Key
1. After signing in, go to the **API Keys** section
2. Click "Create API Key"
3. Give it a name like "7more App"
4. Select permissions: **Sending access**
5. Click "Create"
6. **Copy the API key** (starts with `re_...`)

### Step 3: Add API Key to Your App
**In the Vibecode App:**
1. Open the **ENV tab**
2. Add this variable:
   ```
   EXPO_PUBLIC_EMAIL_API_KEY=re_your_api_key_here
   ```
3. (Optional) Add custom sender:
   ```
   EXPO_PUBLIC_EMAIL_FROM=7more <noreply@yourdomain.com>
   ```

**Note:** If you do not add a custom sender, emails will be sent from `onboarding@resend.dev` (which is fine for testing!)

### Step 4: (Optional) Add Your Domain
To send from your own domain (e.g., `noreply@7more.org`):

1. In Resend dashboard, go to **Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `7more.org`)
4. Follow DNS setup instructions
5. Once verified, update `EXPO_PUBLIC_EMAIL_FROM` in ENV tab

### Step 5: Test It!
1. Open your app
2. Go to Bridge Team Follow-Up Form
3. Add a resource and click the email button
4. Check the logs in the LOGS tab to see if email was sent successfully

---

## Environment Variables Required

### Required:
```
EXPO_PUBLIC_EMAIL_API_KEY=re_xxxxxxxxxxxxx
```

### Optional:
```
EXPO_PUBLIC_EMAIL_FROM=7more <noreply@yourdomain.com>
```

**If not set:**
- Emails will be sent from `onboarding@resend.dev` (Resend's default test sender)
- This works fine for testing and even production if you do not mind the sender address

---

## How It Works

### Bridge Team Emails:
- **From:** Your custom domain or `onboarding@resend.dev`
- **Reply-To:** `bridgeteam@7more.net` (so recipients can reply to your real email)
- **To:** Participant email address

### Welcome/Reset Emails:
- **From:** Your custom domain or `onboarding@resend.dev`
- **To:** User email address

---

## Troubleshooting

### "Email service not configured" error
- Make sure you added `EXPO_PUBLIC_EMAIL_API_KEY` to the ENV tab
- Restart the app after adding the env variable

### Emails not being received
- Check spam folder
- Verify the API key is correct (starts with `re_`)
- Check the LOGS tab for error messages
- Make sure you are on Resend's free tier (100 emails/day limit)

### Want to use your own domain?
- Follow Step 4 above to add and verify your domain in Resend
- Update `EXPO_PUBLIC_EMAIL_FROM` with your custom sender

---

## Cost

**Free Tier:**
- 100 emails per day
- 3,000 emails per month
- All features included

**Paid Plans (if you need more):**
- $20/month for 50,000 emails
- Pay-as-you-go options available

For most nonprofits, the free tier is more than enough!

---

## Questions?

- Resend Docs: https://resend.com/docs
- Resend Support: https://resend.com/support
- Your email service code: `/src/services/emailService.ts`
