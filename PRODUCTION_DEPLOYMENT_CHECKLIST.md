# 7more Forms Production Deployment Checklist

**Goal**: Deploy your Participant Intake Form to https://forms.7more.net using your existing Firebase project, GitHub, Vercel, and Cloudflare.

**Time Required**: 30-60 minutes (mostly waiting for DNS propagation)

---

## PART 1: Get Firebase Credentials (15 minutes)

You need 4 pieces of information from your existing Firebase project.

### Step 1.1: Open Firebase Console
1. Go to https://console.firebase.google.com in your web browser
2. Click on your project: **sevenmore-app-5a969**
3. You should see the Firebase dashboard for your app

### Step 1.2: Generate Service Account Key
1. Look for the **gear icon (⚙️)** in the top left corner
2. Click it and select **"Project Settings"**
3. Click on the **"Service Accounts"** tab at the top
4. Scroll down and find the button that says **"Generate New Private Key"**
5. Click **"Generate New Private Key"**
6. A popup will appear - click **"Generate Key"** to confirm
7. A JSON file will download to your computer (something like `sevenmore-app-5a969-xxxxx.json`)
8. **Save this file somewhere safe - you'll need it in the next step**

### Step 1.3: Extract Values from the JSON File
1. Find the downloaded JSON file on your computer
2. Open it with any text editor (Notepad, TextEdit, VS Code, etc.)
3. You'll see a file with lots of text - don't worry, you just need to copy 3 values:

**Copy these values somewhere (Notes app, Word doc, etc.):**

**Value #1 - Project ID**
- Look for a line that says `"project_id":`
- Copy the value in quotes after it
- Should look like: `sevenmore-app-5a969`
- Label it: "FIREBASE_PROJECT_ID"

**Value #2 - Client Email**
- Look for a line that says `"client_email":`
- Copy the entire email address in quotes
- Should look like: `firebase-adminsdk-xxxxx@sevenmore-app-5a969.iam.gserviceaccount.com`
- Label it: "FIREBASE_CLIENT_EMAIL"

**Value #3 - Private Key** (IMPORTANT - this one is tricky!)
- Look for a line that says `"private_key":`
- Copy the ENTIRE value in quotes, including:
  - The opening quote
  - `-----BEGIN PRIVATE KEY-----`
  - All the weird letters, numbers, and `\n` characters
  - `-----END PRIVATE KEY-----`
  - The closing quote
- It will look like a huge mess - that's normal!
- Should start with: `"-----BEGIN PRIVATE KEY-----\nMIIEvQIB...`
- Should end with: `...END PRIVATE KEY-----\n"`
- Label it: "FIREBASE_PRIVATE_KEY"

### Step 1.4: Get Database URL
1. Go back to the Firebase Console (https://console.firebase.google.com)
2. Make sure you're still in the **sevenmore-app-5a969** project
3. In the left sidebar, look for **"Realtime Database"** and click it
4. At the top of the page, you'll see a URL
5. Copy that entire URL
6. Should look like: `https://sevenmore-app-5a969-default-rtdb.firebaseio.com`
7. Label it: "FIREBASE_DATABASE_URL"

**✅ CHECKPOINT**: You should now have 4 values saved:
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- FIREBASE_DATABASE_URL

**⚠️ IMPORTANT**: Keep these values private! Don't share them with anyone or post them publicly.

---

## PART 2: Upload Code to GitHub (10 minutes)

### Step 2.1: Create New GitHub Repository
1. Go to https://github.com/new in your web browser
2. **Repository name**: Type `7more-forms-backend`
3. **Description** (optional): Type "7more Participant Intake Form backend"
4. **Visibility**: Select **"Private"** (recommended for security)
5. **Important**: Do NOT check any of these boxes:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Click the green **"Create repository"** button
7. **Keep this page open** - you'll need it in the next step

### Step 2.2: Upload the Deployment Files
1. On the GitHub page from Step 2.1, you should see instructions for a new repository
2. Look for a link that says **"uploading an existing file"** and click it
3. Now you need to upload the files from the `7more-forms-deployment.zip` file
4. **First, unzip the file** on your computer (double-click it or right-click → Extract)
5. Once unzipped, you'll see several files and folders:
   - An `api` folder
   - A `public` folder
   - Files like `package.json`, `vercel.json`, `README.md`, etc.
6. **Drag ALL of these files and folders** into the GitHub upload area
   - **Exception**: Do NOT upload any file named `.env` or `.env.local` if you see one
7. At the bottom, in the "Commit changes" box, type: `Initial deployment setup`
8. Click the green **"Commit changes"** button
9. Wait for the upload to complete (should take 10-30 seconds)

**✅ CHECKPOINT**: You should now see all the files listed in your GitHub repository.

---

## PART 3: Deploy to Vercel (15 minutes)

### Step 3.1: Sign Up / Log In to Vercel
1. Go to https://vercel.com/signup
2. **If you don't have an account**: Click "Continue with GitHub" and follow the prompts
3. **If you have an account**: Log in

### Step 3.2: Import Your GitHub Repository
1. Once logged in, you'll see the Vercel dashboard
2. Click the button that says **"Add New..."** (top right corner)
3. Select **"Project"** from the dropdown
4. You'll see a list of your GitHub repositories
5. Find **"7more-forms-backend"** in the list
6. Click the **"Import"** button next to it
7. You'll be taken to a configuration page - **WAIT! Don't click Deploy yet!**

### Step 3.3: Configure the Project (leave defaults)
On the configuration page, you'll see several options. Here's what to do:

- **Framework Preset**: Leave as "Other" (it will auto-detect)
- **Root Directory**: Leave as `./`
- **Build Command**: Leave empty
- **Output Directory**: Leave as `public`
- **Install Command**: Leave as default

### Step 3.4: Add Environment Variables (CRITICAL STEP!)

**Before you click Deploy**, you MUST add your Firebase credentials:

1. On the same configuration page, look for a section called **"Environment Variables"**
2. You'll see a field to add variables one by one
3. Add each of these 4 variables using the values you saved in Part 1:

**Variable #1:**
- **Name**: Type `FIREBASE_PROJECT_ID`
- **Value**: Paste your project ID (e.g., `sevenmore-app-5a969`)
- Click **"Add"**

**Variable #2:**
- **Name**: Type `FIREBASE_CLIENT_EMAIL`
- **Value**: Paste your client email (the long firebase-adminsdk email)
- Click **"Add"**

**Variable #3:** (Most important!)
- **Name**: Type `FIREBASE_PRIVATE_KEY`
- **Value**: Paste your ENTIRE private key
  - This is the huge value that starts with `"-----BEGIN PRIVATE KEY-----`
  - Just paste it exactly as you copied it - including all the `\n` characters
  - Vercel will handle the formatting automatically
- Click **"Add"**

**Variable #4:**
- **Name**: Type `FIREBASE_DATABASE_URL`
- **Value**: Paste your database URL (e.g., `https://sevenmore-app-5a969-default-rtdb.firebaseio.com`)
- Click **"Add"**

3. For each variable, make sure you select which environments to use:
   - Check: **✅ Production**
   - Check: **✅ Preview**
   - Check: **✅ Development**

**✅ CHECKPOINT**: You should now see all 4 environment variables listed on the page.

### Step 3.5: Deploy!
1. Scroll down to the bottom of the page
2. Click the big blue **"Deploy"** button
3. Wait while Vercel builds and deploys your project (1-3 minutes)
4. You'll see a progress screen with logs - this is normal
5. When it's done, you'll see a success screen with confetti! 🎉
6. **Copy the URL** shown (it will look like: `https://7more-forms-backend-xxxxx.vercel.app`)

### Step 3.6: Test Your Deployment
1. Open a new browser tab
2. Go to: `https://YOUR-PROJECT-URL.vercel.app/api/form-config`
   - (Replace YOUR-PROJECT-URL with the actual URL from Step 3.5)
3. **Expected result**: You should see a bunch of JSON text with your form configuration
4. If you see an error, check the troubleshooting section at the end

**✅ CHECKPOINT**: Your form backend is now live on Vercel!

---

## PART 4: Configure Custom Domain (20-60 minutes - includes waiting time)

### Step 4.1: Add Domain in Vercel
1. In Vercel, go to your project dashboard
2. Click on the **"Settings"** tab at the top
3. In the left sidebar, click **"Domains"**
4. You'll see a field to add a domain
5. Type: `forms.7more.net`
6. Click **"Add"**
7. Vercel will show you a message about DNS configuration
8. **Copy the information** - you'll see something like:

```
Type: CNAME
Name: forms
Value: cname.vercel-dns.com
```

**Note**: The exact "Value" might be slightly different - copy whatever Vercel shows you!

9. **Keep this Vercel page open** - you'll come back to it

### Step 4.2: Add DNS Record in Cloudflare

Now you need to tell Cloudflare to point `forms.7more.net` to Vercel:

1. Open a new tab and go to https://dash.cloudflare.com
2. Log in to your Cloudflare account
3. Click on the **7more.net** domain
4. In the top menu, click **"DNS"**
5. Click the blue **"Add record"** button
6. Fill in the following:
   - **Type**: Select "CNAME" from the dropdown
   - **Name**: Type `forms` (just the word "forms")
   - **Target**: Paste the value from Vercel (e.g., `cname.vercel-dns.com`)
   - **Proxy status**: Click the orange cloud to turn it gray (DNS only)
     - **Important**: The cloud MUST be gray, not orange!
   - **TTL**: Leave as "Auto"
7. Click **"Save"**

**✅ CHECKPOINT**: You should now see the new CNAME record in your Cloudflare DNS list.

### Step 4.3: Wait for DNS Propagation

DNS changes take time to spread across the internet:

1. **Minimum wait time**: 5-10 minutes
2. **Maximum wait time**: 60 minutes (usually much faster)
3. Go back to the Vercel tab from Step 4.1
4. Refresh the page every few minutes
5. Eventually, you'll see a **green checkmark** next to `forms.7more.net`
6. When you see the checkmark, it means DNS is working!

**While you wait**, you can grab a coffee or move on to reading the next section.

### Step 4.4: Verify HTTPS is Working

Once DNS is verified in Vercel:

1. Open a new browser tab
2. Go to: `https://forms.7more.net/api/form-config`
   - **Important**: Use `https://` (secure)
3. **Expected result**: You should see JSON with your form configuration
4. Look for a **padlock icon** in the browser address bar (means HTTPS is working)

**✅ CHECKPOINT**: Your custom domain is now live with HTTPS!

---

## PART 5: Test Everything (10 minutes)

Run through these tests to make sure everything works:

### Test 1: Load the Form
1. Go to: `https://forms.7more.net/embedded-form.html`
2. **Expected**: The form loads with all your fields visible
3. **If it shows "Loading..." forever**, see troubleshooting section

### Test 2: Submit a Test Entry
1. Fill out the form completely with test data
2. Click "Submit"
3. **Expected**: You see a success message

### Test 3: Check Your App Dashboard
1. Open your 7more mobile app
2. Go to the Bridge Team Dashboard
3. **Expected**: You see the test submission you just made with status "pending_bridge"
4. **If you don't see it**, see troubleshooting section

### Test 4: Test Auto-Sync (Make Sure Edits Work)
1. In your 7more mobile app, go to the form editor
2. Change a field label (example: "First Name" → "Given Name")
3. Save the changes
4. Go back to `https://forms.7more.net/embedded-form.html` in your browser
5. Refresh the page (F5 or Cmd+R)
6. **Expected**: The label change appears!

### Test 5: Add a New Field
1. In your app, add a brand new field (example: "Middle Name")
2. Save the form
3. Refresh the public form
4. **Expected**: The new field appears in the form

**✅ CHECKPOINT**: If all 5 tests pass, your deployment is successful!

---

## PART 6: Embed in Wix (5 minutes)

### Step 6.1: Copy the Iframe Code

Copy this code exactly as shown:

```html
<iframe
  src="https://forms.7more.net/embedded-form.html"
  width="100%"
  height="1200"
  frameborder="0"
  style="border:none; border-radius:8px;">
</iframe>
```

### Step 6.2: Add to Your Wix Website

1. Log into your Wix account
2. Open your website in the Wix Editor
3. Go to the page where you want the form
4. Click the **"+"** button (Add Elements)
5. Select **"Embed"** from the menu
6. Choose **"HTML iframe"** or **"Embed Code"**
7. Paste the iframe code from Step 6.1
8. Adjust the size/position on the page as needed
9. Click **"Publish"** to make it live

### Step 6.3: Test on Wix

1. Visit your live website (the public URL)
2. Go to the page with the form
3. **Expected**: The form loads and works just like when you tested it directly

**Optional**: If the height doesn't look right:
- You can change `height="1200"` to a different number (try 1400 or 1600)
- Or use `height="100vh"` to make it fill the entire viewport

**✅ CHECKPOINT**: Your form is now embedded and working on your website!

---

## 🎉 YOU'RE DONE!

Your Participant Intake Form is now:
- ✅ Live at https://forms.7more.net/embedded-form.html
- ✅ Embedded on your Wix website
- ✅ Automatically syncing with your app
- ✅ Sending submissions directly to your Bridge Team Dashboard
- ✅ Updating automatically when you edit the form in your app

### What Happens Now?

**When you edit the form in your app:**
1. Edit any field, add/remove fields, change labels, etc.
2. Save the changes
3. The public form updates automatically within seconds
4. No need to touch Vercel, GitHub, or Wix again!

**When someone fills out the form:**
1. They fill it out on your website
2. It submits to your Firebase database
3. It appears instantly in your Bridge Team Dashboard
4. You can manage it like any other participant

---

## 🐛 TROUBLESHOOTING

### Problem: "Form shows 'Loading...' forever"

**Possible causes:**
- Firebase credentials are wrong
- API isn't responding

**How to fix:**
1. Open a browser and go to: `https://forms.7more.net/api/form-config`
2. Do you see JSON data or an error message?
3. If error, go to Vercel → Your Project → Settings → Environment Variables
4. Double-check all 4 variables are correct
5. If you need to fix them, edit them and then:
   - Go to Deployments tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

---

### Problem: "Form loads but submit button doesn't work"

**Possible causes:**
- Firebase permissions issue
- JavaScript error

**How to fix:**
1. Open the form in your browser
2. Press F12 (Windows) or Cmd+Option+I (Mac) to open developer tools
3. Click the "Console" tab
4. Try submitting the form again
5. Look for any error messages in red
6. Take a screenshot and send it for help

---

### Problem: "Changes in app don't appear on public form"

**Possible causes:**
- Browser cache
- Changes not saving in app

**How to fix:**
1. Make sure you clicked "Save" in the app form editor
2. Check Firebase Console:
   - Go to https://console.firebase.google.com
   - Open your project
   - Go to Realtime Database
   - Look for `formConfig/participantIntake`
   - Verify your changes are there
3. Hard refresh the browser:
   - Windows: Ctrl + Shift + R
   - Mac: Cmd + Shift + R
4. If still not working, clear your browser cache

---

### Problem: "Domain not working / shows Vercel error"

**Possible causes:**
- DNS not propagated yet
- CNAME record not configured correctly

**How to fix:**
1. Check Cloudflare DNS:
   - Log into Cloudflare
   - Go to 7more.net domain
   - Click DNS tab
   - Verify the CNAME record is there:
     - Type: CNAME
     - Name: forms
     - Target: cname.vercel-dns.com (or whatever Vercel told you)
     - Proxy: OFF (gray cloud, not orange)
2. Wait 15-30 more minutes for DNS to propagate
3. Check DNS propagation status: https://dnschecker.org
   - Enter: forms.7more.net
   - See if it's showing the Vercel address globally

---

### Problem: "Submissions not appearing in app dashboard"

**Possible causes:**
- Firebase write permissions issue
- Wrong database being used

**How to fix:**
1. Go to Firebase Console
2. Select your project
3. Go to Realtime Database
4. Look at the data - do you see a `participants` node?
5. Click on Database Rules tab
6. Make sure writes are allowed to `participants` collection
7. Try submitting another test entry
8. Refresh your app dashboard

---

## 📞 GETTING HELP

If you're still stuck after trying troubleshooting:

1. **Check Vercel Logs**:
   - Go to Vercel dashboard
   - Click on your project
   - Click "Deployments"
   - Click on the latest deployment
   - Click "View Function Logs"
   - Look for error messages

2. **Check Firebase Console**:
   - Make sure data is being written to the database
   - Check for any security rule violations

3. **Check Browser Console**:
   - Press F12 in your browser
   - Look for JavaScript errors (red text)

4. **Contact Support**:
   - Provide screenshots of any error messages
   - Include the URL you're trying to access
   - Mention which step you're on in this checklist

---

## 📝 QUICK REFERENCE

**Important URLs:**
- Public form: https://forms.7more.net/embedded-form.html
- API endpoint: https://forms.7more.net/api/form-config
- Vercel dashboard: https://vercel.com/dashboard
- Firebase Console: https://console.firebase.google.com
- Cloudflare DNS: https://dash.cloudflare.com

**Your GitHub Repository:**
- https://github.com/YOUR_USERNAME/7more-forms-backend

**Environment Variables (saved in Vercel):**
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- FIREBASE_DATABASE_URL

---

**✅ Deployment Complete! Your form is now live and will automatically update whenever you edit it in your app.**
