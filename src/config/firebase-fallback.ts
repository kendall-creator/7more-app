/**
 * Firebase Configuration Fallback
 *
 * This file serves as a backup when environment variables are not available.
 * It should ONLY be used as a last resort fallback.
 *
 * IMPORTANT: Always prefer using environment variables via the ENV tab in Vibecode app.
 */

export const FIREBASE_FALLBACK_CONFIG = {
  apiKey: "AIzaSyAiYOUSiYKcgn-uAGi_rMLwMmNyENMSq20",
  authDomain: "sevenmore-app-5a969.firebaseapp.com",
  databaseURL: "https://sevenmore-app-5a969-default-rtdb.firebaseio.com",
  projectId: "sevenmore-app-5a969",
  storageBucket: "sevenmore-app-5a969.firebasestorage.app",
  messagingSenderId: "110371002953",
  appId: "1:110371002953:web:79c44b39188e2649a0fd98",
};

/**
 * Check if we're using fallback config
 * Returns true if environment variables are missing and fallback is being used
 */
export const isUsingFallbackConfig = () => {
  return !process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
         process.env.EXPO_PUBLIC_FIREBASE_API_KEY === "" ||
         process.env.EXPO_PUBLIC_FIREBASE_API_KEY.startsWith("YOUR_");
};
