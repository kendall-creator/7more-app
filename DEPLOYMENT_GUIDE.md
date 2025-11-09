# Embeddable Participant Form - Deployment Guide

This guide explains how to deploy your embeddable participant form so it can be embedded on your Wix website and automatically sync with your app's database.

## 🎯 Overview

The embeddable form system consists of:
1. **Serverless API Functions** - Handle form configuration and submissions
2. **HTML Web Form** - The embeddable form interface
3. **Firebase Integration** - Stores submissions in the same database as your app

## 📋 Prerequisites

Before you begin, you'll need:
- Firebase project credentials (already configured in your app)
- A Vercel account (free tier works perfectly)
- Your Wix website editor access

## 🚀 Step-by-Step Deployment

### Step 1: Set Up Vercel Project

1. **Create a Vercel account** at https://vercel.com (if you don't have one)

2. **Create a new project** in Vercel:
   - Click "Add New..." → "Project"
   - Choose "Import from GitHub" or "Deploy from template"
   - For simplicity, you can create an empty project

3. **Create the following folder structure** in your Vercel project:
   ```
   your-vercel-project/
   ├── api/
   │   ├── form-config.js
   │   └── submit-participant.js
   ├── public/
   │   └── embedded-form.html
   └── package.json
   ```

4. **Copy the serverless functions**:
   - Copy `/serverless-templates/vercel-form-config.js` → `/api/form-config.js`
   - Copy `/serverless-templates/vercel-submit-participant.js` → `/api/submit-participant.js`

5. **Copy the HTML form**:
   - Copy `/embedded-form.html` → `/public/embedded-form.html`

6. **Create a package.json** file in the root:
   ```json
   {
     "name": "participant-form-api",
     "version": "1.0.0",
     "dependencies": {
       "firebase-admin": "^12.0.0"
     }
   }
   ```

### Step 2: Configure Firebase Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**

2. Add the following variables (get these from your Firebase project):

   - `FIREBASE_PROJECT_ID`
     - Value: Your Firebase project ID

   - `FIREBASE_PRIVATE_KEY`
     - Value: Your Firebase private key (from service account JSON)
     - Important: Keep the newlines as `\n`

   - `FIREBASE_CLIENT_EMAIL`
     - Value: Your Firebase client email (from service account JSON)

   - `FIREBASE_DATABASE_URL`
     - Value: Your Firebase Realtime Database URL
     - Format: `https://your-project.firebaseio.com`

#### How to Get Firebase Service Account Credentials:

1. Go to Firebase Console → Project Settings
2. Navigate to "Service Accounts" tab
3. Click "Generate New Private Key"
4. Download the JSON file
5. Extract the values:
   - `project_id` → FIREBASE_PROJECT_ID
   - `private_key` → FIREBASE_PRIVATE_KEY
   - `client_email` → FIREBASE_CLIENT_EMAIL
6. Get database URL from Realtime Database section

### Step 3: Deploy to Vercel

1. Push your code to GitHub (or upload directly to Vercel)

2. Vercel will automatically deploy your project

3. After deployment, your API endpoints will be available at:
   - `https://your-project.vercel.app/api/form-config`
   - `https://your-project.vercel.app/api/submit-participant`

4. Your form will be hosted at:
   - `https://your-project.vercel.app/embedded-form.html`

### Step 4: Update the HTML Form with Your API URLs

1. Edit the deployed `embedded-form.html` file

2. Update the `API_CONFIG` object with your Vercel URLs:
   ```javascript
   const API_CONFIG = {
     formConfigUrl: 'https://your-project.vercel.app/api/form-config',
     submitUrl: 'https://your-project.vercel.app/api/submit-participant'
   };
   ```

3. Redeploy to Vercel

### Step 5: Embed in Wix

#### Option 1: Using Wix HTML Embed (Recommended)

1. **Open your Wix Editor**

2. **Add HTML iframe element**:
   - Click the `+` button to add elements
   - Go to "Embed Code" → "HTML iframe"
   - Or search for "HTML iframe" in the add panel

3. **Configure the iframe**:
   - Click the iframe element
   - Click "Enter Code"
   - Paste the following code:
   ```html
   <iframe
     src="https://your-project.vercel.app/embedded-form.html"
     width="100%"
     height="1200"
     frameborder="0"
     scrolling="auto"
     style="border: none; overflow: hidden;"
   ></iframe>
   ```

4. **Adjust sizing**:
   - Set the iframe width to 100% of the container
   - Set minimum height to 1200px (adjust based on your form length)

5. **Publish your site**

#### Option 2: Using Wix Custom Element

1. Add a "Custom Element" to your page
2. Set the tag name to `iframe`
3. Set the `src` attribute to your Vercel form URL
4. Configure width and height attributes

## 🔄 How Auto-Sync Works

### When You Update the In-App Form:

The embeddable form will automatically reflect changes if you implement dynamic config loading:

1. **Update form fields in your app** using the Edit Intake Form screen
2. **Store the updated config in Firebase** (you'll need to add this functionality)
3. **The web form fetches config** from Firebase on page load
4. **Changes appear immediately** on your website

### Current Configuration Method:

Currently, the form config is hardcoded in the serverless function. To make it truly dynamic:

1. **Store form config in Firebase**:
   ```javascript
   // In your app, after updating form config:
   const db = firebase.database();
   await db.ref('formConfig').set(formConfig);
   ```

2. **Update the serverless function** to fetch from Firebase:
   ```javascript
   // In vercel-form-config.js:
   const db = admin.database();
   const configRef = db.ref('formConfig');
   const snapshot = await configRef.once('value');
   const config = snapshot.val() || defaultFormConfig;
   ```

## ✅ Testing Your Deployment

### Test the API Endpoints:

1. **Test form config endpoint**:
   ```
   https://your-project.vercel.app/api/form-config
   ```
   Should return JSON with form configuration

2. **Test the embedded form**:
   ```
   https://your-project.vercel.app/embedded-form.html
   ```
   Should display the complete form

3. **Test form submission**:
   - Fill out the form completely
   - Submit
   - Check Firebase Console → Realtime Database → participants
   - Verify new participant appears
   - Check your app dashboard to see the submission

### Verify in Your App:

1. Open your app
2. Navigate to the participants list (Bridge Team dashboard)
3. Look for submissions with history entry: "Participant submitted intake form (web)"
4. Verify all data is correct

## 🔒 Security Considerations

### CORS Configuration:
The serverless functions currently allow all origins (`*`). For production:

```javascript
// In your serverless functions:
const allowedOrigins = [
  'https://your-wix-site.com',
  'https://www.your-wix-site.com'
];

const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

### Rate Limiting:
Consider adding rate limiting to prevent abuse:
- Use Vercel's built-in rate limiting
- Or add a service like Upstash Redis for rate limiting

### Data Validation:
The serverless functions validate required fields. Consider adding:
- Email format validation
- Phone number format validation
- CAPTCHA or reCAPTCHA integration

## 🐛 Troubleshooting

### Form Not Loading:
- Check browser console for errors
- Verify API URLs are correct in `embedded-form.html`
- Test API endpoints directly in browser
- Check Vercel function logs for errors

### Submissions Not Appearing in App:
- Verify Firebase credentials in Vercel
- Check Firebase Realtime Database rules
- Look at Vercel function logs
- Ensure database URL is correct

### CORS Errors:
- Verify CORS headers in serverless functions
- Check that Wix site URL is allowed
- Clear browser cache and try again

### Wix Iframe Not Displaying:
- Check iframe height (make it taller)
- Verify the src URL is correct
- Check Wix editor console for errors
- Try publishing and viewing on live site

## 📞 Need Help?

If you encounter issues:
1. Check Vercel function logs (Vercel dashboard → your project → Functions tab)
2. Check browser console (F12 → Console tab)
3. Verify Firebase credentials are correct
4. Test API endpoints in Postman or browser

## 🎉 You're Done!

Your embeddable form is now:
- ✅ Live on your Wix website
- ✅ Syncing with your app's Firebase database
- ✅ Using the same participant data structure
- ✅ Accessible via secure HTTPS

Participants can now submit forms through your website, and they'll appear automatically in your app's dashboard!
