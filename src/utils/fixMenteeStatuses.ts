import { useParticipantStore } from "../state/participantStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MENTEE_STATUS_FIX_KEY = "menteeStatusFixApplied_v1";

/**
 * One-time fix for existing participants with completed initial contact
 * but missing menteeStatus field.
 *
 * This function checks if initial contact was completed but menteeStatus
 * is not set to "contacted_initial", and fixes it.
 *
 * This runs once per app installation and stores a flag in AsyncStorage
 * to prevent re-running on subsequent app launches.
 */
export async function fixMenteeStatusesOnce() {
  try {
    // Check if fix has already been applied
    const fixApplied = await AsyncStorage.getItem(MENTEE_STATUS_FIX_KEY);

    if (fixApplied === "true") {
      console.log("✅ Mentee status fix already applied, skipping...");
      return;
    }

    console.log("🔧 Running one-time mentee status fix...");

    // Wait a bit for Firebase to load participants
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Run the fix
    const fixCount = await useParticipantStore.getState().fixMenteeStatuses();

    if (fixCount > 0) {
      console.log(`✅ Mentee status fix complete: ${fixCount} participants updated`);
    } else {
      console.log("✅ Mentee status fix complete: No participants needed updating");
    }

    // Mark fix as applied
    await AsyncStorage.setItem(MENTEE_STATUS_FIX_KEY, "true");
    console.log("✅ Mentee status fix flag saved");

  } catch (error) {
    console.error("❌ Error in mentee status fix:", error);
    // Don't throw - we don't want to break the app if this fails
  }
}

/**
 * Force re-run the mentee status fix (for testing/debugging)
 * This clears the flag and runs the fix again
 */
export async function forceFixMenteeStatuses() {
  try {
    console.log("🔧 Forcing mentee status fix...");

    // Clear the flag
    await AsyncStorage.removeItem(MENTEE_STATUS_FIX_KEY);

    // Run the fix
    await fixMenteeStatusesOnce();

  } catch (error) {
    console.error("❌ Error forcing mentee status fix:", error);
  }
}
