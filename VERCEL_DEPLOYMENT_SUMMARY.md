# Vercel Deployment Package - Quick Start Guide

## Package Location

Your Vercel-ready project has been exported to:
**`/home/user/workspace/vercel-project.zip`**

## What's Included

```
vercel-project/
├── api/
│   ├── form-config.js          ✅ API endpoint for form configuration
│   └── submit-participant.js   ✅ API endpoint for form submission
├── public/
│   └── embedded-form.html      ✅ The embeddable HTML form
├── package.json                ✅ Node.js dependencies
├── vercel.json                 ✅ Vercel configuration
├── .gitignore                  ✅ Git ignore file
├── .env.example                ✅ Environment variables template
├── ENVIRONMENT_VARIABLES.md    ✅ Detailed env setup guide
└── README.md                   ✅ Full deployment instructions
```

## Firebase Environment Variables Required

When you deploy to Vercel, you must add these 4 environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | `my-project-12345` |
| `FIREBASE_PRIVATE_KEY` | Private key from service account (include BEGIN/END lines) | `-----BEGIN PRIVATE KEY-----\n...` |
| `FIREBASE_CLIENT_EMAIL` | Service account email | `firebase-adminsdk-xxx@...` |
| `FIREBASE_DATABASE_URL` | Realtime Database URL | `https://...firebaseio.com` |

## Quick Deployment Steps

### 1. Upload to GitHub
- Extract the ZIP file
- Create a new private repository on GitHub
- Upload all files from the extracted folder
- Commit and push

### 2. Deploy on Vercel
- Go to vercel.com
- Click "Add New Project"
- Import your GitHub repository
- Add the 4 Firebase environment variables (see ENVIRONMENT_VARIABLES.md)
- Click "Deploy"

### 3. Update API URLs
After deployment:
- Open `public/embedded-form.html` in your GitHub repo
- Find line 236-239 (API_CONFIG)
- Replace `YOUR_API_BASE_URL` with your Vercel URL
- Example: `https://your-project.vercel.app`
- Commit and push (auto-redeploys)

### 4. Access Your Form
Your form will be available at:
`https://your-project.vercel.app/embedded-form.html`

### 5. Embed on Your Website
```html
<iframe
  src="https://your-project.vercel.app/embedded-form.html"
  width="100%"
  height="800"
  frameborder="0"
  style="border: none; max-width: 700px; margin: 0 auto; display: block;"
>
</iframe>
```

## Important Notes

⚠️ **Security**:
- The private key must include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Never commit environment variables to GitHub
- Keep your Firebase service account secure

⚠️ **After First Deploy**:
- You MUST update the API URLs in `embedded-form.html`
- The form will not work until you replace `YOUR_API_BASE_URL`

## Getting Firebase Credentials

1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Click "Generate New Private Key"
4. Download the JSON file
5. Use values from the JSON for your environment variables:
   - `project_id` → FIREBASE_PROJECT_ID
   - `private_key` → FIREBASE_PRIVATE_KEY (copy entire key)
   - `client_email` → FIREBASE_CLIENT_EMAIL
6. Get Database URL from Realtime Database section

## Need More Help?

- See `README.md` for full deployment instructions
- See `ENVIRONMENT_VARIABLES.md` for detailed env variable setup
- Check Vercel deployment logs if you encounter errors

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- GitHub Issues: Contact your development team

---

**Created**: November 9, 2025
**Package Version**: 1.0.0
