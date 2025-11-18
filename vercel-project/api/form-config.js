// Vercel Serverless Function: /api/form-config.js
//
// This is a serverless function template for Vercel deployment.
// Place this file in: /api/form-config.js (at root of your Vercel project)
//
// SETUP:
// 1. Copy this file to your Vercel project
// 2. Set up Firebase Admin SDK environment variables in Vercel dashboard
// 3. Deploy to Vercel
// 4. Your endpoint will be: https://your-project.vercel.app/api/form-config

const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

// Default form configuration (fallback)
const defaultFormConfig = {
  id: "intake_form_config",
  title: "Participant Intake Form",
  description: "Please complete all fields to begin your journey with us",
  fields: [
    {
      id: "participantNumber",
      label: "Participant Number",
      type: "text",
      required: true,
      placeholder: "Enter your participant number",
    },
    {
      id: "firstName",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "First name",
    },
    {
      id: "lastName",
      label: "Last Name",
      type: "text",
      required: true,
      placeholder: "Last name",
    },
    {
      id: "dateOfBirth",
      label: "Date of Birth",
      type: "date",
      required: true,
    },
    {
      id: "gender",
      label: "Gender",
      type: "radio",
      required: true,
      options: ["Male", "Female", "Other"],
    },
    {
      id: "phoneNumber",
      label: "Phone Number (Optional)",
      type: "text",
      required: false,
      placeholder: "Enter phone number",
    },
    {
      id: "email",
      label: "Email Address (Optional)",
      type: "text",
      required: false,
      placeholder: "Enter email address",
    },
    {
      id: "releaseDate",
      label: "Release Date",
      type: "date",
      required: true,
    },
    {
      id: "releasedFrom",
      label: "Facility Released From",
      type: "select",
      required: true,
      options: ["Pam Lychner", "Huntsville", "Plane", "Hawaii", "Other"],
    },
  ],
  updatedAt: new Date().toISOString(),
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Fetch form config from Firebase Realtime Database
    const db = admin.database();
    const configRef = db.ref('formConfig/participantIntake');
    const snapshot = await configRef.once('value');

    let config = snapshot.val();

    // If no config exists in Firebase, use default
    if (!config) {
      console.log('No config found in Firebase, using default config');
      config = defaultFormConfig;
    }

    // Ensure fields are enabled and sorted by order
    if (config.fields) {
      config.fields = config.fields
        .filter(f => f.enabled !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error fetching form config:', error);
    // Fallback to default config on error
    return res.status(200).json({
      success: true,
      data: defaultFormConfig,
      warning: 'Using default configuration due to error',
    });
  }
};
