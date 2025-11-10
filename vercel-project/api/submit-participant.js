// Vercel Serverless Function: /api/submit-participant.js
//
// This is a serverless function template for Vercel deployment.
// Place this file in: /api/submit-participant.js (at root of your Vercel project)
//
// SETUP:
// 1. Copy this file to your Vercel project
// 2. Set up Firebase Admin SDK environment variables in Vercel dashboard:
//    - FIREBASE_PROJECT_ID
//    - FIREBASE_PRIVATE_KEY
//    - FIREBASE_CLIENT_EMAIL
//    - FIREBASE_DATABASE_URL
// 3. Deploy to Vercel
// 4. Your endpoint will be: https://your-project.vercel.app/api/submit-participant

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

// Calculate age from date of birth
function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// Calculate days since release (time out)
function calculateTimeOut(releaseDateString) {
  const release = new Date(releaseDateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - release.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Generate unique ID
function generateId() {
  return `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    // Validate required data
    if (!formData || !formData.firstName || !formData.lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Get the actual releasedFrom value (handle "Other" case)
    const releasedFromValue = formData.releasedFrom === 'Other'
      ? formData.releasedFrom_other
      : formData.releasedFrom;

    // Calculate age and timeOut
    const age = calculateAge(formData.dateOfBirth);
    const timeOut = calculateTimeOut(formData.releaseDate);

    // Create new participant object
    const participantId = generateId();
    const now = new Date().toISOString();

    const newParticipant = {
      id: participantId,
      participantNumber: formData.participantNumber || "",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
      age,
      gender: formData.gender || "",
      phoneNumber: formData.phoneNumber || null,
      email: formData.email || null,
      releaseDate: new Date(formData.releaseDate).toISOString(),
      timeOut,
      releasedFrom: releasedFromValue || "",
      status: "pending_bridge",
      submittedAt: now,
      movedToBridgeAt: now,
      completedGraduationSteps: [],
      notes: [],
      history: [
        {
          id: `history_${Date.now()}`,
          type: "form_submitted",
          description: "Participant submitted intake form (web)",
          createdAt: now,
        },
      ],
    };

    // Save to Firebase
    const db = admin.database();
    const participantRef = db.ref(`participants/${participantId}`);
    await participantRef.set(newParticipant);

    return res.status(200).json({
      success: true,
      message: "Thank you! Your information has been received. Our Bridge Team will contact you soon.",
      participantId: participantId,
    });
  } catch (error) {
    console.error('Error submitting participant form:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit form. Please try again.',
    });
  }
};
