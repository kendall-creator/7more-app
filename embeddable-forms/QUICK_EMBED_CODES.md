# Quick Embed Codes - Copy & Paste

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your Firebase Config
Go to Firebase Console → Project Settings → Your Web App
Copy the config object that looks like this:

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
Open each HTML file and replace the Firebase config at the top of the `<script>` section.

### Step 3: Upload & Embed
Use one of the embed codes below.

---

## 📝 Participant Intake Form

### Direct Link
```html
<a href="https://yourdomain.com/participant-intake-form.html">
  Apply as Participant
</a>
```

### iFrame Embed (Recommended)
```html
<iframe
  src="https://yourdomain.com/participant-intake-form.html"
  width="100%"
  height="1200px"
  frameborder="0"
  style="border: none; max-width: 700px; margin: 0 auto; display: block;"
  title="Participant Intake Form"
></iframe>
```

### Button with Link
```html
<a
  href="https://yourdomain.com/participant-intake-form.html"
  style="display: inline-block; padding: 16px 32px; background: #4b5563; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;"
>
  Apply Now
</a>
```

---

## 🤝 Volunteer Intake Form

### Direct Link
```html
<a href="https://yourdomain.com/volunteer-intake-form.html">
  Volunteer with Us
</a>
```

### iFrame Embed (Recommended)
```html
<iframe
  src="https://yourdomain.com/volunteer-intake-form.html"
  width="100%"
  height="1400px"
  frameborder="0"
  style="border: none; max-width: 700px; margin: 0 auto; display: block;"
  title="Volunteer Intake Form"
></iframe>
```

### Button with Link
```html
<a
  href="https://yourdomain.com/volunteer-intake-form.html"
  style="display: inline-block; padding: 16px 32px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;"
>
  Volunteer Today
</a>
```

---

## 📱 Responsive Both Forms Side-by-Side

```html
<div style="max-width: 1200px; margin: 40px auto; padding: 0 20px;">
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">

    <!-- Participant Form Card -->
    <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
      <h2 style="font-size: 28px; margin: 0 0 16px 0; color: #1f2937;">Need Support?</h2>
      <p style="font-size: 16px; color: #6b7280; margin: 0 0 24px 0;">
        Recently released and looking for support, resources, and mentorship? Apply to our program.
      </p>
      <a
        href="https://yourdomain.com/participant-intake-form.html"
        style="display: inline-block; padding: 16px 32px; background: #4b5563; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;"
      >
        Apply as Participant
      </a>
    </div>

    <!-- Volunteer Form Card -->
    <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
      <h2 style="font-size: 28px; margin: 0 0 16px 0; color: #1f2937;">Want to Help?</h2>
      <p style="font-size: 16px; color: #6b7280; margin: 0 0 24px 0;">
        Join our team of volunteers and help make a lasting impact in your community.
      </p>
      <a
        href="https://yourdomain.com/volunteer-intake-form.html"
        style="display: inline-block; padding: 16px 32px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;"
      >
        Volunteer with Us
      </a>
    </div>

  </div>
</div>

<!-- Mobile responsive styles -->
<style>
  @media (max-width: 768px) {
    div[style*="grid-template-columns"] {
      grid-template-columns: 1fr !important;
    }
  }
</style>
```

---

## 🎨 WordPress Shortcodes

Add to your theme's `functions.php`:

```php
// Participant Form Shortcode
function participant_form_shortcode() {
  return '<iframe
    src="' . site_url() . '/participant-intake-form.html"
    width="100%"
    height="1200px"
    frameborder="0"
    style="border: none; max-width: 700px; margin: 0 auto; display: block;"
    title="Participant Intake Form"
  ></iframe>';
}
add_shortcode('participant_form', 'participant_form_shortcode');

// Volunteer Form Shortcode
function volunteer_form_shortcode() {
  return '<iframe
    src="' . site_url() . '/volunteer-intake-form.html"
    width="100%"
    height="1400px"
    frameborder="0"
    style="border: none; max-width: 700px; margin: 0 auto; display: block;"
    title="Volunteer Intake Form"
  ></iframe>';
}
add_shortcode('volunteer_form', 'volunteer_form_shortcode');
```

Then use in your pages/posts:
```
[participant_form]
[volunteer_form]
```

---

## 🔗 Custom Domain Setup (Firebase Hosting)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login and initialize:
```bash
firebase login
firebase init hosting
```

3. Place forms in `public/` folder

4. Deploy:
```bash
firebase deploy --only hosting
```

5. Your forms will be at:
- `https://your-project.firebaseapp.com/participant-intake-form.html`
- `https://your-project.firebaseapp.com/volunteer-intake-form.html`

---

## ✅ Quick Testing Checklist

- [ ] Replace Firebase config with your credentials
- [ ] Upload both HTML files to your server
- [ ] Test participant form submission
- [ ] Check Firebase console for new data under `/participants/`
- [ ] Test volunteer form submission
- [ ] Check Firebase console for new data under `/volunteerInquiries/`
- [ ] Verify data appears in mobile app
- [ ] Test on mobile device
- [ ] Add links to your website
- [ ] Done! 🎉

---

## 📞 Quick Troubleshooting

### Form not submitting?
1. Check browser console (F12) for errors
2. Verify Firebase config is correct
3. Check Firebase Database rules allow writes

### Data not in app?
1. Verify Firebase Database URL is correct
2. Check you're looking at the right Firebase project
3. Refresh the mobile app

### iFrame not showing?
1. Increase iframe height
2. Check X-Frame-Options on your server
3. Try direct link instead

---

## 📂 File Locations

```
/home/user/workspace/embeddable-forms/
├── participant-intake-form.html      # Main participant form
├── volunteer-intake-form.html        # Main volunteer form
├── INTEGRATION_GUIDE.md              # Full documentation
└── QUICK_EMBED_CODES.md              # This file
```

---

## 🎯 What Happens After Submission?

### Participant Form:
1. Data saved to Firebase: `/participants/{id}`
2. Status: `pending_bridge`
3. Appears in: Bridge Team Dashboard
4. Bridge Team member contacts participant

### Volunteer Form:
1. Data saved to Firebase: `/volunteerInquiries/{id}`
2. Tasks created based on selected interests
3. Appears in: Admin Dashboard & Task lists
4. Assigned team member follows up

---

That's it! Copy the embed code you need and paste it into your website. Make sure to replace `yourdomain.com` with your actual domain.

For detailed documentation, see `INTEGRATION_GUIDE.md`.
