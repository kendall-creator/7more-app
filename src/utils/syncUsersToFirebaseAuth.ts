import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, update as firebaseUpdate } from "firebase/database";
import { auth, database } from "../config/firebase";
import { useUsersStore } from "../state/usersStore";

/**
 * Sync existing users from database to Firebase Authentication
 * This should be run once to migrate existing users
 */
export const syncUsersToFirebaseAuth = async () => {
  if (!auth || !database) {
    console.error("Firebase not configured");
    return;
  }

  const users = useUsersStore.getState().invitedUsers;
  console.log(`🔄 Syncing ${users.length} users to Firebase Auth...`);

  let syncedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const user of users) {
    // Skip if user already has a Firebase UID
    if ((user as any).firebaseUid) {
      console.log(`⏭️  Skipping ${user.email} - already synced`);
      skippedCount++;
      continue;
    }

    try {
      // Create Firebase Auth user
      console.log(`🔐 Creating Firebase Auth user for ${user.email}...`);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      // Update database with Firebase UID
      const userRef = ref(database, `users/${user.id}`);
      await firebaseUpdate(userRef, {
        firebaseUid: userCredential.user.uid,
      });

      console.log(`✅ Synced ${user.email}`);
      syncedCount++;
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        console.log(`⚠️  ${user.email} already exists in Firebase Auth`);
        skippedCount++;
      } else {
        console.error(`❌ Error syncing ${user.email}:`, error.message);
        errorCount++;
      }
    }
  }

  console.log("\n📊 Sync Results:");
  console.log(`   ✅ Synced: ${syncedCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📋 Total: ${users.length}`);

  return {
    synced: syncedCount,
    skipped: skippedCount,
    errors: errorCount,
    total: users.length,
  };
};
