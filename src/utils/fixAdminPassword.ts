/**
 * One-time utility to fix the admin account's requiresPasswordChange flag
 * Run this once by importing it in App.tsx temporarily
 */

import { ref, update as firebaseUpdate, get as firebaseGet, remove as firebaseRemove } from "firebase/database";
import { database } from "../config/firebase";

export const fixAdminPasswordFlag = async () => {
  if (!database) {
    console.warn("Firebase not configured");
    return;
  }

  try {
    // Get the current admin data
    const adminRef = ref(database, "users/admin_default");
    const snapshot = await firebaseGet(adminRef);

    if (snapshot.exists()) {
      // Update the admin to not require password change and ensure correct password
      await firebaseUpdate(adminRef, {
        requiresPasswordChange: false,
        password: "7moreHouston!",
      });

      // Remove the temporaryPassword field if it exists
      const tempPasswordRef = ref(database, "users/admin_default/temporaryPassword");
      await firebaseRemove(tempPasswordRef);

      console.log("✅ Admin account fixed - password reset to 7moreHouston! and password change requirement removed");
    } else {
      console.log("Admin account not found in database");
    }
  } catch (error) {
    console.error("Error fixing admin password flag:", error);
  }
};
