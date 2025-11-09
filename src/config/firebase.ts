import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

// Check if all required Firebase environment variables are set
const isFirebaseConfigured = () => {
  const requiredVars = [
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  ];

  return requiredVars.every(
    (v) => v && v !== "" && !v.startsWith("YOUR_")
  );
};

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
};

// Initialize Firebase only if properly configured
let app: FirebaseApp | null = null;
let database: Database | null = null;

if (isFirebaseConfigured()) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  database = getDatabase(app);
} else {
  console.warn(
    "Firebase is not configured. Please add Firebase environment variables in the ENV tab."
  );
}

export { database };
export default app;
