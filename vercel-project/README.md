# Participant Intake Form - Vercel Deployment

This is a serverless embeddable participant intake form that can be deployed on Vercel.

## Project Structure

```
├── api/
│   ├── form-config.js          # API endpoint to fetch form configuration
│   └── submit-participant.js   # API endpoint to submit participant data
├── public/
│   └── embedded-form.html      # The embeddable HTML form
├── package.json                # Node.js dependencies
├── vercel.json                 # Vercel configuration
└── README.md                   # This file
```

## Deployment Instructions

### 1. Upload to GitHub

1. Create a new private repository on GitHub
2. Upload all files from this ZIP to the repository
3. Commit and push the files

### 2. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`

### 3. Configure Environment Variables

In the Vercel dashboard, add the following environment variables:

#### Firebase Configuration (Required)

- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Your Firebase service account private key (include the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
- `FIREBASE_CLIENT_EMAIL` - Your Firebase service account email
- `FIREBASE_DATABASE_URL` - Your Firebase Realtime Database URL (e.g., `https://your-project.firebaseio.com`)

**Important**: When adding `FIREBASE_PRIVATE_KEY`, make sure to:
- Copy the entire private key including the BEGIN and END markers
- Vercel will automatically handle the newline characters
- Alternatively, you can replace actual newlines with `\n` (but not necessary in Vercel)

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for the deployment to complete
3. Your form will be available at: `https://your-project.vercel.app/embedded-form.html`

### 5. Update API URLs in the HTML

After deployment, you need to update the API URLs in `public/embedded-form.html`:

1. Open `public/embedded-form.html` in your GitHub repository
2. Find the `API_CONFIG` object (around line 236-239)
3. Replace `YOUR_API_BASE_URL` with your Vercel project URL:

```javascript
const API_CONFIG = {
  formConfigUrl: 'https://your-project.vercel.app/api/form-config',
  submitUrl: 'https://your-project.vercel.app/api/submit-participant'
};
```

4. Commit and push the changes
5. Vercel will automatically redeploy

## API Endpoints

After deployment, you will have these endpoints:

- `GET /api/form-config` - Returns the form configuration
- `POST /api/submit-participant` - Submits participant data to Firebase

## Embedding the Form

To embed this form on your website, use an iframe:

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

## Troubleshooting

### Build Errors

If you get build errors:
1. Make sure all environment variables are set correctly
2. Check that your Firebase service account has proper permissions
3. Review the Vercel deployment logs

### CORS Issues

The API endpoints are configured with CORS headers to allow cross-origin requests. If you still face CORS issues:
1. Check your browser console for specific errors
2. Verify that the API URLs in the HTML match your Vercel deployment URL

### Form Not Loading

If the form shows "Loading..." indefinitely:
1. Check browser console for errors
2. Verify the `formConfigUrl` in the HTML matches your API endpoint
3. Test the API endpoint directly: `https://your-project.vercel.app/api/form-config`

## Support

For issues or questions, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
