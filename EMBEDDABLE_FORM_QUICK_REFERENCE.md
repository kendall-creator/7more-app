# Embeddable Form Quick Reference

## 📁 Files Created

### Core Files
- `embedded-form.html` - The embeddable web form (root directory)
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions

### Serverless Functions (for Vercel)
- `serverless-templates/vercel-form-config.js` - API endpoint for form configuration
- `serverless-templates/vercel-submit-participant.js` - API endpoint for form submissions

### App Integration Files
- `src/api/form-config-endpoint.ts` - Form configuration utilities
- `src/api/form-submission-endpoint.ts` - Submission handling logic
- `src/screens/EmbeddableFormScreen.tsx` - In-app management UI (already existed, enhanced)

## 🚀 Quick Deploy Checklist

### Before You Start
- [ ] Firebase configured in your app
- [ ] Firebase service account credentials ready
- [ ] Vercel account created (free tier)
- [ ] Wix website editor access

### Deployment Steps
1. [ ] Create Vercel project
2. [ ] Copy serverless functions to `/api/` folder
3. [ ] Copy `embedded-form.html` to `/public/` folder
4. [ ] Add Firebase environment variables in Vercel
5. [ ] Deploy to Vercel
6. [ ] Update `embedded-form.html` with your Vercel URLs
7. [ ] Test form submission
8. [ ] Copy iframe code from app
9. [ ] Embed in Wix website
10. [ ] Test end-to-end: website → Firebase → app

## 🔧 Configuration URLs

After Vercel deployment, you'll have:
- Form config: `https://your-project.vercel.app/api/form-config`
- Submit endpoint: `https://your-project.vercel.app/api/submit-participant`
- Embedded form: `https://your-project.vercel.app/embedded-form.html`

## 📝 Wix Embed Code Template

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

## 🔑 Environment Variables Needed

Set these in Vercel project settings:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

## ✅ Testing Checklist

### Test API Endpoints
- [ ] GET `/api/form-config` returns JSON
- [ ] Response includes form title, description, and fields
- [ ] Only enabled fields are included

### Test Web Form
- [ ] Form loads without errors
- [ ] Form displays correct title and description
- [ ] All enabled fields appear
- [ ] Required fields are marked with asterisk
- [ ] Date picker works for DOB and Release Date
- [ ] "Other" option shows text input
- [ ] Submit button is clickable

### Test Form Submission
- [ ] Fill out all required fields
- [ ] Submit the form
- [ ] Success message appears
- [ ] Check Firebase Console → Realtime Database → participants
- [ ] New entry appears with correct data
- [ ] History entry shows "Participant submitted intake form (web)"

### Test App Integration
- [ ] Open your app
- [ ] Navigate to participants list
- [ ] Verify web submission appears
- [ ] Check all fields populated correctly
- [ ] Verify status is "pending_bridge"
- [ ] Check timestamps are correct

## 🐛 Common Issues & Fixes

### Form Not Loading
- Check browser console (F12)
- Verify Vercel URLs in HTML file
- Test API endpoints directly

### CORS Errors
- Check CORS headers in serverless functions
- Ensure wildcard (*) origin is set (or your Wix domain)

### Submissions Not Appearing
- Verify Firebase credentials in Vercel
- Check Vercel function logs
- Test Firebase connection directly
- Verify database URL format

### Wix Iframe Issues
- Increase iframe height (try 1400px)
- Check iframe src URL
- Try on published Wix site (not just editor)

## 📞 Support

For detailed instructions, see `DEPLOYMENT_GUIDE.md`.

For Firebase setup, see `README.md`.

For in-app management, open the "Embeddable Form" screen in your app.

## 🎯 Success Criteria

You'll know it's working when:
1. ✅ Form loads on your Wix website
2. ✅ Submissions create new participants in Firebase
3. ✅ Participants appear in your app dashboard
4. ✅ All data fields match in-app form structure
5. ✅ No errors in browser console or Vercel logs
