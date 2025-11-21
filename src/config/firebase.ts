import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { FIREBASE_FALLBACK_CONFIG, isUsingFallbackConfig } from "./firebase-fallback";

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

// Firebase configuration - with fallback support
const getFirebaseConfig = () => {
  // First try to use environment variables
  if (isFirebaseConfigured()) {
    return {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "",
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
    };
  }

  // Fall back to hardcoded config
  console.warn(
    "⚠️ Using fallback Firebase configuration. Please add Firebase environment variables in the ENV tab for better security."
  );
  return FIREBASE_FALLBACK_CONFIG;
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
let app: FirebaseApp | null = null;
let database: Database | null = null;

try {
  console.log("🔥 Starting Firebase initialization...");
  console.log(`   Using config: ${isUsingFallbackConfig() ? "FALLBACK" : "ENV VARS"}`);

  if (getApps().length === 0) {
    console.log("   No existing Firebase app, creating new one...");
    app = initializeApp(firebaseConfig);
    console.log("   ✅ Firebase app initialized");
  } else {
    console.log("   Existing Firebase app found, reusing...");
    app = getApps()[0];
  }

  console.log("   Getting database instance...");
  database = getDatabase(app);
  console.log("   ✅ Database instance created");

  // Log status for debugging
  if (isUsingFallbackConfig()) {
    console.log("✅ Firebase initialized with fallback config");
  } else {
    console.log("✅ Firebase initialized with environment variables");
  }
} catch (error: any) {
  console.error("❌ Failed to initialize Firebase:");
  console.error("   Error message:", error?.message || String(error));
  console.error("   Error code:", error?.code || "no code");
  console.error("   Error stack:", error?.stack || "no stack");
  console.error("   Firebase config being used:", JSON.stringify(firebaseConfig, null, 2));
}

export { database };
export default app;
