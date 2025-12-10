import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

// Firebase configuration - using the fallback config directly for the web app
const firebaseConfig = {
  apiKey: "AIzaSyAiYOUSiYKcgn-uAGi_rMLwMmNyENMSq20",
  authDomain: "sevenmore-app-5a969.firebaseapp.com",
  databaseURL: "https://sevenmore-app-5a969-default-rtdb.firebaseio.com",
  projectId: "sevenmore-app-5a969",
  storageBucket: "sevenmore-app-5a969.firebasestorage.app",
  messagingSenderId: "110371002953",
  appId: "1:110371002953:web:79c44b39188e2649a0fd98",
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let database: Database | null = null;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  database = getDatabase(app);
  console.log("✅ Firebase initialized for web app");
} catch (error) {
  console.error("❌ Failed to initialize Firebase:", error);
}

export { database };
export default app;
