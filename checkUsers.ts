/**
 * This is a standalone script to check all users in the Firebase database
 * Run this to see all user accounts and their credentials
 */

import { useUsersStore } from "./src/state/usersStore";

// Wait for Firebase to load
setTimeout(() => {
  const users = useUsersStore.getState().invitedUsers;

  console.log("\n\n==========================================");
  console.log("📋 ALL USERS IN DATABASE");
  console.log("==========================================\n");

  if (users.length === 0) {
    console.log("❌ No users found. Firebase may not be loaded yet.");
  } else {
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}${user.nickname ? ` (${user.nickname})` : ""}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password: "${user.password}"`);
      console.log(`   Requires Password Change: ${user.requiresPasswordChange ?? false}`);
      console.log("");
    });

    console.log(`Total Users: ${users.length}`);

    // Check for Madi specifically
    const madi = users.find(u =>
      u.name.toLowerCase().includes("madi") ||
      (u.nickname && u.nickname.toLowerCase().includes("madi"))
    );

    if (madi) {
      console.log("\n🔍 FOUND MADI LOWRY:");
      console.log("==========================================");
      console.log(`Name: ${madi.name}`);
      console.log(`Email: ${madi.email}`);
      console.log(`Password: "${madi.password}"`);
      console.log(`Password Length: ${madi.password.length}`);
      console.log(`Has Spaces: ${madi.password.includes(" ") ? "YES" : "NO"}`);
      console.log(`Has Trimming Issues: ${madi.password !== madi.password.trim() ? "YES" : "NO"}`);
      console.log("==========================================\n");
    } else {
      console.log("\n❌ MADI LOWRY NOT FOUND IN DATABASE");
      console.log("Available names:");
      users.forEach(u => console.log(`  - ${u.name}`));
    }
  }

  console.log("==========================================\n\n");
}, 3000); // Wait 3 seconds for Firebase to load

export {}; // Make this a module
