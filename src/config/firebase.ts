import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";
import { FIREBASE_FALLBACK_CONFIG, isUsingFallbackConfig } from "./firebase-fallback";

// Helper to get env var with or without EXPO_PUBLIC_ prefix
const getEnvVar = (name: string): string | undefined => {
  return process.env[`EXPO_PUBLIC_${name}`] || process.env[name];
};

// Check if all required Firebase environment variables are set
const isFirebaseConfigured = () => {
  const requiredVars = [
    getEnvVar("FIREBASE_API_KEY"),
    getEnvVar("FIREBASE_AUTH_DOMAIN"),
    getEnvVar("FIREBASE_DATABASE_URL"),
    getEnvVar("FIREBASE_PROJECT_ID"),
    getEnvVar("FIREBASE_STORAGE_BUCKET"),
    getEnvVar("FIREBASE_MESSAGING_SENDER_ID"),
    getEnvVar("FIREBASE_APP_ID"),
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
      apiKey: getEnvVar("FIREBASE_API_KEY") || "",
      authDomain: getEnvVar("FIREBASE_AUTH_DOMAIN") || "",
      databaseURL: getEnvVar("FIREBASE_DATABASE_URL") || "",
      projectId: getEnvVar("FIREBASE_PROJECT_ID") || "",
      storageBucket: getEnvVar("FIREBASE_STORAGE_BUCKET") || "",
      messagingSenderId: getEnvVar("FIREBASE_MESSAGING_SENDER_ID") || "",
      appId: getEnvVar("FIREBASE_APP_ID") || "",
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
let auth: Auth | null = null;

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

  console.log("   Getting auth instance...");
  auth = getAuth(app);
  console.log("   ✅ Auth instance created");

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

export { database, auth };
export default app;
