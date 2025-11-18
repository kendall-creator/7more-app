# Embeddable Web Forms - Integration Guide

## Overview

This guide shows you how to embed the 7more Participant and Volunteer intake forms directly into your website. Both forms submit data directly to your Firebase database, automatically syncing with your mobile app.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Configuration](#firebase-configuration)
3. [Participant Intake Form](#participant-intake-form)
4. [Volunteer Intake Form](#volunteer-intake-form)
5. [Embedding Options](#embedding-options)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before integrating the forms, ensure you have:

✅ Your Firebase project set up (same one used by the mobile app)
✅ Firebase Realtime Database enabled
✅ Access to your website's HTML/code
✅ Firebase configuration credentials (API key, database URL, etc.)

---

## Firebase Configuration

### Step 1: Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll to "Your apps" section
5. Select your web app (or create one if needed)
6. Copy the Firebase configuration object

It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 2: Update the Forms

Open each HTML file (`participant-intake-form.html` and `volunteer-intake-form.html`) and replace this section:

```javascript
// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
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

With your actual Firebase configuration.

### Step 3: Enable Firebase Hosting (Optional)

If you want to host the forms on Firebase:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

---

## Participant Intake Form

### File Location
`/home/user/workspace/embeddable-forms/participant-intake-form.html`

### Features
- Collects all participant information (name, DOB, gender, release date, facility, etc.)
- Beautiful, mobile-responsive design
- Submits directly to Firebase Realtime Database
- Automatically appears in the mobile app's Bridge Team dashboard
- Form validation and error handling
- Success confirmation message

### Embedding Options

#### Option 1: Direct Page (Recommended)
Upload `participant-intake-form.html` to your website and link to it:

```html
<a href="https://yourdomain.com/participant-intake-form.html">Participant Intake Form</a>
```

#### Option 2: iFrame Embed
Embed the form within an existing page:

```html
<iframe
  src="https://yourdomain.com/participant-intake-form.html"
  width="100%"
  height="1200px"
  frameborder="0"
  style="border: none; max-width: 700px; margin: 0 auto; display: block;"
></iframe>
```

#### Option 3: Full Page Integration
Copy the entire HTML content and paste it into your website's page template.

---

## Volunteer Intake Form

### File Location
`/home/user/workspace/embeddable-forms/volunteer-intake-form.html`

### Features
- Collects volunteer information (name, contact info)
- Multiple interest area checkboxes (Bridge Team, Clothing Donation, etc.)
- Conditional fields (monetary donation amount, other description)
- Beautiful, mobile-responsive design
- Submits directly to Firebase Realtime Database
- Automatically creates tasks in the mobile app based on selected interests
- Form validation and error handling

### Embedding Options

#### Option 1: Direct Page (Recommended)
Upload `volunteer-intake-form.html` to your website and link to it:

```html
<a href="https://yourdomain.com/volunteer-intake-form.html">Volunteer Inquiry Form</a>
```

#### Option 2: iFrame Embed
Embed the form within an existing page:

```html
<iframe
  src="https://yourdomain.com/volunteer-intake-form.html"
  width="100%"
  height="1400px"
  frameborder="0"
  style="border: none; max-width: 700px; margin: 0 auto; display: block;"
></iframe>
```

#### Option 3: Full Page Integration
Copy the entire HTML content and paste it into your website's page template.

---

## Embedding Options

### Option 1: Host on Your Domain (Recommended)

**Pros:**
- Full control over the form
- No cross-origin issues
- Better SEO
- Custom URL (e.g., yourdomain.com/volunteer)

**Steps:**
1. Upload the HTML file to your web server
2. Link to it from your main website
3. Update Firebase config in the file

**Example File Structure:**
```
yourdomain.com/
├── index.html
├── about.html
├── forms/
│   ├── participant-intake.html
│   └── volunteer-inquiry.html
```

---

### Option 2: Firebase Hosting (Free & Fast)

**Pros:**
- Free hosting
- Fast global CDN
- SSL certificate included
- Easy deployment

**Steps:**
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Place forms in `public/` folder
5. Deploy: `firebase deploy --only hosting`

Your forms will be available at:
- `https://your-project.firebaseapp.com/participant-intake-form.html`
- `https://your-project.firebaseapp.com/volunteer-intake-form.html`

**Link from Your Website:**
```html
<a href="https://your-project.firebaseapp.com/participant-intake-form.html">
  Apply as Participant
</a>

<a href="https://your-project.firebaseapp.com/volunteer-intake-form.html">
  Volunteer with Us
</a>
```

---

### Option 3: iFrame Embed

**Pros:**
- Embed forms directly in existing pages
- No navigation away from your site
- Seamless user experience

**Cons:**
- Height needs to be specified
- Some mobile browsers don't like iframes

**Full Example:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Join Our Program</title>
  <style>
    .form-wrapper {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }

    .form-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    iframe {
      width: 100%;
      border: none;
      display: block;
    }
  </style>
</head>
<body>
  <div class="form-wrapper">
    <h1>Participant Application</h1>
    <p>Fill out the form below to get started with our program.</p>

    <div class="form-container">
      <iframe
        src="https://yourdomain.com/participant-intake-form.html"
        height="1200px"
        title="Participant Intake Form"
      ></iframe>
    </div>
  </div>
</body>
</html>
```

---

### Option 4: WordPress Integration

If your website uses WordPress:

#### Using HTML Block (Gutenberg Editor):
1. Edit your page
2. Add an "Custom HTML" block
3. Paste the iframe code:

```html
<iframe
  src="https://yourdomain.com/participant-intake-form.html"
  width="100%"
  height="1200px"
  frameborder="0"
  style="border: none; max-width: 700px; margin: 0 auto; display: block;"
></iframe>
```

#### Using Shortcode:
Add this to your theme's `functions.php`:

```php
function participant_form_shortcode() {
  return '<iframe
    src="https://yourdomain.com/participant-intake-form.html"
    width="100%"
    height="1200px"
    frameborder="0"
    style="border: none; max-width: 700px; margin: 0 auto; display: block;"
  ></iframe>';
}
add_shortcode('participant_form', 'participant_form_shortcode');

function volunteer_form_shortcode() {
  return '<iframe
    src="https://yourdomain.com/volunteer-intake-form.html"
    width="100%"
    height="1400px"
    frameborder="0"
    style="border: none; max-width: 700px; margin: 0 auto; display: block;"
  ></iframe>';
}
add_shortcode('volunteer_form', 'volunteer_form_shortcode');
```

Then use in your pages:
```
[participant_form]
[volunteer_form]
```

---

### Option 5: React/Next.js Integration

If your website is built with React or Next.js:

```jsx
// components/ParticipantForm.jsx
export default function ParticipantForm() {
  return (
    <div className="form-wrapper">
      <iframe
        src="https://yourdomain.com/participant-intake-form.html"
        width="100%"
        height="1200px"
        frameBorder="0"
        style={{
          border: 'none',
          maxWidth: '700px',
          margin: '0 auto',
          display: 'block'
        }}
        title="Participant Intake Form"
      />
    </div>
  );
}
```

---

## Form Data Flow

### Participant Form Flow:
1. User fills out form on your website
2. Form validates data (required fields, date formats)
3. JavaScript creates participant object with all data
4. Data is saved to Firebase: `/participants/{participantId}`
5. Mobile app automatically receives new participant
6. Participant appears in "Pending Bridge Team" status
7. Bridge Team members see the new participant in their dashboard

### Volunteer Form Flow:
1. User fills out form and selects interest areas
2. Form validates data (required fields, conditional fields)
3. JavaScript creates volunteer inquiry object
4. Data is saved to Firebase: `/volunteerInquiries/{inquiryId}`
5. Mobile app automatically receives new inquiry
6. Tasks are created based on routing rules for each interest area
7. Assigned team members receive tasks to follow up

---

## Customization

### Changing Form Styles

Both forms use inline CSS. To customize:

1. Open the HTML file
2. Find the `<style>` section in the `<head>`
3. Modify colors, fonts, spacing, etc.

**Example - Change Primary Color:**

For Participant Form (gray/yellow theme):
```css
/* Change header background */
.form-header {
  background: #YOUR_COLOR; /* Change from #4b5563 */
}

/* Change selected option color */
.radio-option.selected label {
  color: #YOUR_COLOR; /* Change from #eab308 */
}
```

For Volunteer Form (indigo theme):
```css
/* Change header background */
.form-header {
  background: #YOUR_COLOR; /* Change from #4f46e5 */
}

/* Change checkbox selected background */
.checkbox-icon {
  background: #YOUR_COLOR; /* Change from #4f46e5 */
}
```

### Adding Custom Fields

To add a custom field to the Participant Form:

1. Add the HTML input in the form:
```html
<div class="form-group">
  <label class="form-label">Custom Field</label>
  <input type="text" name="customField" class="form-input" placeholder="Enter value">
</div>
```

2. Update the JavaScript to include it in the participant object:
```javascript
const participant = {
  // ... existing fields
  customField: data.customField || null,
  // ... rest of fields
};
```

3. Update your mobile app to display this field if needed

---

## Security Considerations

### Firebase Security Rules

Make sure your Firebase Realtime Database rules allow writes to the `participants` and `volunteerInquiries` paths:

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

**Important:** The `.write: "true"` allows anonymous writes (form submissions from the web). This is required for the forms to work. However, only authenticated users (mobile app) can read the data.

### CORS (Cross-Origin Resource Sharing)

If you're hosting the forms on a different domain than your main website, you may need to configure CORS:

1. Firebase automatically handles CORS
2. If using a custom backend, ensure CORS headers are set:
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Troubleshooting

### Issue: Form submissions not appearing in the app

**Solutions:**
1. ✅ Check Firebase configuration is correct
2. ✅ Verify Firebase Database URL ends with `.firebaseio.com`
3. ✅ Check Firebase console to see if data is being written
4. ✅ Ensure Firebase Realtime Database rules allow writes
5. ✅ Check browser console for JavaScript errors (F12)

### Issue: "Firebase not configured" error

**Solution:**
Make sure you replaced all placeholder values in the `firebaseConfig` object with your actual Firebase credentials.

### Issue: Form shows but submit button doesn't work

**Solutions:**
1. ✅ Open browser console (F12) and check for errors
2. ✅ Verify Firebase scripts are loading (check Network tab)
3. ✅ Ensure you're using HTTPS (not HTTP) to serve the form
4. ✅ Check if browser is blocking third-party scripts

### Issue: iFrame not displaying properly

**Solutions:**
1. ✅ Increase iframe height (try 1200px for participant, 1400px for volunteer)
2. ✅ Check if website has X-Frame-Options header blocking iframes
3. ✅ Try the direct page method instead

### Issue: Form looks broken on mobile

**Solution:**
The forms are fully responsive and should work on all devices. If they don't:
1. ✅ Add viewport meta tag to your page: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
2. ✅ Ensure iframe has `width="100%"` attribute
3. ✅ Test on actual device (not just browser resize)

### Issue: Date pickers not working on iOS

**Solution:**
iOS Safari uses native date pickers. They work differently but are fully functional. No action needed.

---

## Testing Checklist

Before going live, test the following:

### Participant Form:
- [ ] All required fields show validation errors when empty
- [ ] Date picker works for Date of Birth and Release Date
- [ ] Gender radio buttons work
- [ ] Phone and email fields are optional
- [ ] "Released From" dropdown shows "Other" text field when selected
- [ ] Form submits successfully
- [ ] Success message displays after submission
- [ ] Data appears in Firebase console under `/participants/`
- [ ] Data appears in mobile app's Bridge Team dashboard
- [ ] Form resets after successful submission

### Volunteer Form:
- [ ] All required fields show validation errors when empty
- [ ] Can select multiple interest areas
- [ ] "Monetary Donation" shows amount field when checked
- [ ] "Other" shows description field when checked
- [ ] Amount field only accepts numbers
- [ ] Form submits successfully with multiple interests selected
- [ ] Success message displays after submission
- [ ] Data appears in Firebase console under `/volunteerInquiries/`
- [ ] Inquiry appears in mobile app
- [ ] Form resets after successful submission

---

## Quick Start Checklist

- [ ] Copy both HTML files to your web server
- [ ] Replace Firebase config with your credentials in both files
- [ ] Test both forms by submitting sample data
- [ ] Verify data appears in Firebase console
- [ ] Verify data appears in mobile app
- [ ] Add links to forms from your main website
- [ ] Share form URLs with your team
- [ ] Done! 🎉

---

## Support & Next Steps

### Need Help?
- Check the mobile app's README.md for more information
- Review Firebase documentation: https://firebase.google.com/docs
- Check browser console (F12) for error messages

### Future Enhancements:
- Add Google reCAPTCHA for spam protection
- Add email confirmation after form submission
- Create custom thank you pages
- Add analytics tracking
- Multi-language support

---

## Example Complete Integration

Here's a complete example of a landing page that includes both forms:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>7more - Get Involved</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #f9fafb;
    }

    .hero {
      background: linear-gradient(135deg, #4b5563 0%, #1f2937 100%);
      color: white;
      padding: 60px 20px;
      text-align: center;
    }

    .hero h1 {
      font-size: 48px;
      margin: 0 0 20px 0;
    }

    .hero p {
      font-size: 20px;
      opacity: 0.9;
    }

    .options {
      max-width: 1200px;
      margin: 60px auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }

    .option-card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .option-card h2 {
      font-size: 28px;
      margin: 0 0 16px 0;
      color: #1f2937;
    }

    .option-card p {
      font-size: 16px;
      color: #6b7280;
      margin: 0 0 24px 0;
    }

    .cta-button {
      display: inline-block;
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 600;
      color: white;
      background: #4f46e5;
      text-decoration: none;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .cta-button:hover {
      background: #4338ca;
    }

    .cta-button.secondary {
      background: #4b5563;
    }

    .cta-button.secondary:hover {
      background: #374151;
    }

    @media (max-width: 768px) {
      .options {
        grid-template-columns: 1fr;
      }

      .hero h1 {
        font-size: 32px;
      }
    }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Get Involved with 7more</h1>
    <p>Join us in making a difference in the lives of those returning from incarceration</p>
  </div>

  <div class="options">
    <div class="option-card">
      <h2>Need Support?</h2>
      <p>If you are recently released and looking for support, resources, and mentorship, apply to our program.</p>
      <a href="/forms/participant-intake-form.html" class="cta-button secondary">
        Apply as Participant
      </a>
    </div>

    <div class="option-card">
      <h2>Want to Help?</h2>
      <p>Join our team of volunteers and help make a lasting impact in your community.</p>
      <a href="/forms/volunteer-intake-form.html" class="cta-button">
        Volunteer with Us
      </a>
    </div>
  </div>
</body>
</html>
```

---

## Summary

You now have:
1. ✅ **Participant Intake Form** - `/embeddable-forms/participant-intake-form.html`
2. ✅ **Volunteer Intake Form** - `/embeddable-forms/volunteer-intake-form.html`
3. ✅ **Complete integration guide** with multiple embedding options
4. ✅ **Direct Firebase integration** - no backend required
5. ✅ **Mobile-responsive design** that works on all devices
6. ✅ **Automatic data sync** with your mobile app

**Next Steps:**
1. Replace Firebase config with your credentials
2. Upload forms to your web server
3. Test submissions
4. Link from your main website
5. Share with your team

That's it! Your forms are ready to go live. 🚀
