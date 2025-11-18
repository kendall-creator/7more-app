# Web-Embeddable Forms

This folder contains standalone HTML forms that can be embedded directly into your website. Both forms submit data directly to Firebase and automatically sync with the mobile app.

## 📁 Files

### Forms
- **`participant-intake-form.html`** - Complete standalone participant intake form
- **`volunteer-intake-form.html`** - Complete standalone volunteer inquiry form
- **`example-landing-page.html`** - Beautiful example page showing how to link to both forms

### Documentation
- **`INTEGRATION_GUIDE.md`** - Complete 30+ page integration guide with step-by-step instructions
- **`QUICK_EMBED_CODES.md`** - Quick reference card with copy-paste embed codes
- **`README.md`** - This file

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Your Firebase Config
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll to "Your apps" section
5. Copy the Firebase configuration

### Step 2: Update Both Forms
Open both HTML files and replace this section at the top of the `<script>` tag:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 3: Upload & Test
1. Upload all HTML files to your web server
2. Visit the forms in your browser
3. Submit test data
4. Check Firebase Console to see the data
5. Check mobile app to see the new submissions

### Step 4: Embed on Your Website
Use one of these methods:

**Option 1: Direct Link**
```html
<a href="https://yourdomain.com/participant-intake-form.html">Apply Now</a>
```

**Option 2: iFrame**
```html
<iframe
  src="https://yourdomain.com/participant-intake-form.html"
  width="100%"
  height="1200px"
  frameborder="0"
></iframe>
```

**Option 3: Copy the example landing page**
Use `example-landing-page.html` as a starting point and customize it for your brand.

## 📋 What Each Form Does

### Participant Intake Form
- **Collects:** Name, DOB, gender, release date, facility, contact info
- **Submits to:** Firebase `/participants/{id}`
- **Status:** `pending_bridge`
- **Appears in:** Bridge Team Dashboard
- **What happens next:** Bridge Team member contacts participant

### Volunteer Intake Form
- **Collects:** Name, contact info, interest areas, donation amount
- **Submits to:** Firebase `/volunteerInquiries/{id}`
- **Status:** `new`
- **Appears in:** Admin Dashboard & Task lists
- **What happens next:** Tasks created based on selected interests, assigned team member follows up

## 🎨 Customization

### Change Colors
Both forms use inline CSS in the `<style>` section. Search for these colors to customize:

**Participant Form (Gray/Yellow theme):**
- Header: `#4b5563` (dark gray)
- Accent: `#eab308` (yellow)
- Button: `#4b5563` (dark gray)

**Volunteer Form (Indigo theme):**
- Header: `#4f46e5` (indigo)
- Accent: `#4f46e5` (indigo)
- Button: `#4f46e5` (indigo)

### Add Custom Fields
1. Add HTML input in the form body
2. Update JavaScript to include field in submission object
3. Update mobile app to display the field (optional)

See `INTEGRATION_GUIDE.md` for detailed instructions.

## 🔐 Security

### Firebase Database Rules
Make sure your Firebase Realtime Database allows writes:

```json
{
  "rules": {
    "participants": {
      ".write": "true",
      ".read": "auth != null"
    },
    "volunteerInquiries": {
      ".write": "true",
      ".read": "auth != null"
    }
  }
}
```

This allows anonymous writes (form submissions) but only authenticated users (mobile app) can read.

## 📱 Mobile Responsive

Both forms are fully responsive and work on:
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet (iPad, Android tablets)
- ✅ Mobile (iPhone, Android phones)
- ✅ All modern browsers

## 🐛 Troubleshooting

### Form not submitting?
1. Check browser console (F12) for errors
2. Verify Firebase config is correct
3. Check Firebase Database rules allow writes
4. Ensure you're using HTTPS (not HTTP)

### Data not appearing in app?
1. Check Firebase Console to see if data was written
2. Verify you're using the same Firebase project
3. Refresh the mobile app

### Styling looks broken?
1. Ensure viewport meta tag is present
2. Test on actual device (not just browser resize)
3. Check if website has conflicting CSS

See `INTEGRATION_GUIDE.md` for more detailed troubleshooting.

## 📖 Documentation

- **`INTEGRATION_GUIDE.md`** - Complete guide with:
  - Firebase configuration steps
  - Multiple embedding options
  - WordPress integration
  - React/Next.js integration
  - Security considerations
  - Customization guide
  - Testing checklist
  - Troubleshooting

- **`QUICK_EMBED_CODES.md`** - Quick reference with:
  - Copy-paste embed codes
  - WordPress shortcodes
  - Firebase hosting guide
  - Responsive layouts
  - Quick troubleshooting

## 🎯 Real-World Examples

### Church Website
```html
<!-- On your "Get Involved" page -->
<div class="involvement-options">
  <a href="/forms/participant-intake-form.html" class="btn">Need Support?</a>
  <a href="/forms/volunteer-intake-form.html" class="btn">Want to Volunteer?</a>
</div>
```

### Facebook Page
1. Host forms on Firebase (free)
2. Share direct link: `https://your-project.firebaseapp.com/participant-intake-form.html`
3. Track submissions in mobile app

### QR Code on Flyer
1. Generate QR code pointing to form
2. Print on flyers/posters
3. People scan and fill out form on their phone
4. Submissions automatically appear in app

## ✅ Testing Checklist

Before going live:

- [ ] Firebase config updated in both forms
- [ ] Forms uploaded to web server
- [ ] Submitted test data through participant form
- [ ] Verified data in Firebase Console `/participants/`
- [ ] Verified data appears in mobile app Bridge Team Dashboard
- [ ] Submitted test data through volunteer form
- [ ] Verified data in Firebase Console `/volunteerInquiries/`
- [ ] Verified inquiry appears in mobile app
- [ ] Tested on mobile device
- [ ] Added links from main website
- [ ] Shared URLs with team

## 🆘 Need Help?

1. Check `INTEGRATION_GUIDE.md` for detailed instructions
2. Check `QUICK_EMBED_CODES.md` for quick solutions
3. Review Firebase documentation at https://firebase.google.com/docs
4. Check browser console (F12) for error messages

## 📊 Form Statistics

### Participant Form
- **Fields:** 10 total (8 required, 2 optional)
- **Form height:** ~1200px
- **Mobile optimized:** Yes
- **Load time:** <1 second
- **Dependencies:** Firebase SDK (loaded from CDN)

### Volunteer Form
- **Fields:** 7 total (3 required, 4 optional + conditional)
- **Form height:** ~1400px
- **Mobile optimized:** Yes
- **Load time:** <1 second
- **Dependencies:** Firebase SDK (loaded from CDN)

## 🚀 Deployment Options

### Option 1: Your Web Server
Upload files via FTP, cPanel, or your hosting dashboard.

### Option 2: Firebase Hosting (Free)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Put forms in public/ folder
firebase deploy --only hosting
```

### Option 3: Netlify Drag & Drop
Drag the HTML files to [Netlify Drop](https://app.netlify.com/drop) for instant free hosting.

### Option 4: GitHub Pages
Push files to GitHub repo, enable GitHub Pages in repo settings.

## 🎉 You're Done!

Your forms are ready to embed. Here's what you've accomplished:

✅ Two beautiful, mobile-responsive forms
✅ Direct Firebase integration (no backend needed)
✅ Automatic sync with mobile app
✅ Professional design matching your brand
✅ Complete documentation and examples

**Next steps:**
1. Share form URLs with your team
2. Add links from your website
3. Print QR codes for physical locations
4. Share on social media

Need help? Check the documentation files in this folder.
