# Firebase Environment Variables for Vercel

When deploying to Vercel, you need to add these environment variables in the Vercel dashboard:

## Required Environment Variables

### 1. FIREBASE_PROJECT_ID
- **Description**: Your Firebase project ID
- **Example**: `my-project-12345`
- **Where to find**: Firebase Console → Project Settings → General → Project ID

### 2. FIREBASE_PRIVATE_KEY
- **Description**: Private key from Firebase service account
- **Format**: Full private key including BEGIN and END markers
- **Example**:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
...
...rest of key...
-----END PRIVATE KEY-----
```
- **Where to find**:
  1. Go to Firebase Console
  2. Project Settings → Service Accounts
  3. Click "Generate New Private Key"
  4. Download the JSON file
  5. Copy the value of the `private_key` field
  6. Paste the entire key (including BEGIN and END lines) into Vercel

**Important Notes for Private Key**:
- Copy the ENTIRE key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Vercel will handle the newline characters automatically
- Do NOT remove or modify any characters in the key
- Keep the key secure and never commit it to your repository

### 3. FIREBASE_CLIENT_EMAIL
- **Description**: Service account email address
- **Example**: `firebase-adminsdk-xxxxx@my-project-12345.iam.gserviceaccount.com`
- **Where to find**: Same JSON file from step 2 above, look for `client_email` field

### 4. FIREBASE_DATABASE_URL
- **Description**: Your Firebase Realtime Database URL
- **Example**: `https://my-project-12345-default-rtdb.firebaseio.com`
- **Where to find**:
  1. Firebase Console → Realtime Database
  2. Look at the top of the page for the database URL
  3. It should end with `.firebaseio.com`

## How to Add Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Navigate to "Environment Variables" in the left sidebar
4. For each variable:
   - Enter the **Name** (e.g., `FIREBASE_PROJECT_ID`)
   - Enter the **Value** (the actual value from Firebase)
   - Select which environments to apply to (Production, Preview, Development)
   - Click "Add"
5. After adding all variables, redeploy your project for changes to take effect

## Security Best Practices

- ✅ Never commit these values to your GitHub repository
- ✅ Use Vercel's encrypted environment variables
- ✅ Restrict Firebase service account permissions to only what's needed
- ✅ Regularly rotate your Firebase service account keys
- ✅ Monitor your Firebase usage and set up alerts for unusual activity
- ❌ Never share these values publicly
- ❌ Never hardcode these values in your source code

## Verifying Your Setup

After adding the environment variables, you can test if they're working:

1. Deploy your project to Vercel
2. Visit: `https://your-project.vercel.app/api/form-config`
3. You should see a JSON response with the form configuration
4. If you see an error, check the Vercel deployment logs for details

## Troubleshooting

### Error: "Failed to initialize Firebase"
- Check that all 4 environment variables are set correctly
- Verify that the private key includes the BEGIN and END markers
- Make sure there are no extra spaces or characters

### Error: "Database URL is required"
- Double-check your `FIREBASE_DATABASE_URL` format
- It should start with `https://` and end with `.firebaseio.com`
- Make sure you're using the Realtime Database URL, not Firestore

### Error: "Permission denied"
- Check that your Firebase service account has the correct permissions
- Go to Firebase Console → Project Settings → Service Accounts
- Verify the service account has "Firebase Admin SDK" role

## Need Help?

If you continue to have issues:
1. Check the Vercel deployment logs for specific error messages
2. Review the Firebase Console for any security or permission issues
3. Verify all environment variables are correctly spelled and formatted
