import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, Database } from "firebase/database";

// Firebase configuration - this is a demo config, user should replace with their own
// These are PUBLIC keys - it's safe to expose them in client code
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey-ReplaceWithYourOwnKey",
  authDomain: "your-app.firebaseapp.com",
  databaseURL: "https://your-app-default-rtdb.firebaseio.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
let app: any;
let database: Database | null = null;

export const initializeFirebase = () => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      database = getDatabase(app);
    }
    return database;
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return null;
  }
};

// Submit a form to Firebase
export const submitFormToFirebase = async (formData: any) => {
  try {
    const db = database || initializeFirebase();
    if (!db) throw new Error("Firebase not initialized");

    const submissionsRef = ref(db, "intake-submissions");
    await push(submissionsRef, {
      ...formData,
      submittedAt: new Date().toISOString(),
      synced: false
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting form:", error);
    return { success: false, error: String(error) };
  }
};

// Listen for new submissions
export const listenForSubmissions = (callback: (submission: any) => void) => {
  try {
    const db = database || initializeFirebase();
    if (!db) throw new Error("Firebase not initialized");

    const submissionsRef = ref(db, "intake-submissions");

    return onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        Object.keys(data).forEach((key) => {
          const submission = data[key];
          if (!submission.synced) {
            callback({ id: key, ...submission });
          }
        });
      }
    });
  } catch (error) {
    console.error("Error listening for submissions:", error);
    return () => {};
  }
};

// Mark submission as synced
export const markSubmissionSynced = async (submissionId: string) => {
  try {
    const db = database || initializeFirebase();
    if (!db) throw new Error("Firebase not initialized");

    const { ref: dbRef, update } = await import("firebase/database");
    const submissionRef = dbRef(db, `intake-submissions/${submissionId}`);
    await update(submissionRef, { synced: true });
  } catch (error) {
    console.error("Error marking submission as synced:", error);
  }
};

// Get the public form URL
export const getPublicFormUrl = () => {
  // This will be the URL where the form HTML is hosted
  // For now, we'll use a GitHub Pages URL or similar
  return "https://yourusername.github.io/intake-form";
};

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "AIzaSyDemoKey-ReplaceWithYourOwnKey";
};
