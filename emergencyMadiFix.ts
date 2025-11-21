/**
 * Emergency user credential checker and fixer
 * Run this to diagnose and fix Madi's login issue
 */

import { useUsersStore } from "./src/state/usersStore";
import { useAuthStore } from "./src/state/authStore";
import { ref, update as firebaseUpdate } from "firebase/database";
import { database } from "./src/config/firebase";

console.log("\n\n==============================================");
console.log("🚨 EMERGENCY LOGIN DIAGNOSTIC FOR MADI LOWRY");
console.log("==============================================\n");

setTimeout(async () => {
  // Get Madi's account
  const madi = useUsersStore.getState().getUserByEmail("mlowry@7more.net");

  if (!madi) {
    console.log("❌ CRITICAL: Madi's account not found!");
    console.log("Available emails:");
    useUsersStore.getState().invitedUsers.forEach(u => {
      console.log(`  - ${u.email} (${u.name})`);
    });
    return;
  }

  console.log("✅ Madi's account found");
  console.log("==========================================");
  console.log(`Name: ${madi.name}`);
  console.log(`Email: ${madi.email}`);
  console.log(`Password: "${madi.password}"`);
  console.log(`Password length: ${madi.password.length}`);
  console.log(`Password bytes: ${JSON.stringify([...madi.password].map(c => c.charCodeAt(0)))}`);
  console.log(`Role: ${madi.role}`);
  console.log("==========================================\n");

  // Test the exact credentials
  console.log("🧪 Testing login with exact credentials:");
  console.log(`  Email: mlowry@7more.net`);
  console.log(`  Password: mlowry`);

  const result = useUsersStore.getState().validateCredentials("mlowry@7more.net", "mlowry");

  if (result) {
    console.log("✅ SUCCESS! These credentials SHOULD work");
    console.log(`  User validated: ${result.name}`);
  } else {
    console.log("❌ FAILED! Credentials do not match");
    console.log("\n🔍 Investigating why...");

    // Check character by character
    const storedPassword = madi.password;
    const testPassword = "mlowry";

    console.log(`\nStored: "${storedPassword}"`);
    console.log(`Test:   "${testPassword}"`);
    console.log(`\nCharacter comparison:`);

    for (let i = 0; i < Math.max(storedPassword.length, testPassword.length); i++) {
      const storedChar = storedPassword[i] || "(none)";
      const testChar = testPassword[i] || "(none)";
      const match = storedChar === testChar ? "✓" : "✗";

      console.log(`  [${i}] Stored: '${storedChar}' (${storedChar.charCodeAt(0)}) vs Test: '${testChar}' (${testChar.charCodeAt(0)}) ${match}`);
    }

    // Try to fix it
    console.log("\n🔧 ATTEMPTING TO FIX PASSWORD...");

    if (database) {
      try {
        const userRef = ref(database, `users/${madi.id}`);
        await firebaseUpdate(userRef, {
          password: "mlowry", // Reset to clean password
        });

        console.log("✅ PASSWORD RESET SUCCESSFUL!");
        console.log("   Madi can now login with:");
        console.log("   Email: mlowry@7more.net");
        console.log("   Password: mlowry");
      } catch (error) {
        console.error("❌ Failed to reset password:", error);
      }
    }
  }

  console.log("\n==============================================\n");
}, 2000);

export {};
