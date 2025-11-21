import { useUsersStore } from "../state/usersStore";
import { ref, update as firebaseUpdate } from "firebase/database";
import { database } from "../config/firebase";

/**
 * Fix common login issues for a specific user
 * This helps resolve password problems, email mismatches, etc.
 */
export async function fixUserLoginIssue(searchTerm: string) {
  const users = useUsersStore.getState().invitedUsers;
  const normalizedSearch = searchTerm.toLowerCase();

  // Find user by name or email
  const user = users.find(u =>
    u.name.toLowerCase().includes(normalizedSearch) ||
    u.email.toLowerCase().includes(normalizedSearch) ||
    (u.nickname && u.nickname.toLowerCase().includes(normalizedSearch))
  );

  if (!user) {
    console.log(`❌ User not found matching: "${searchTerm}"`);
    console.log("Available users:");
    users.forEach(u => console.log(`  - ${u.name} (${u.email})`));
    return false;
  }

  console.log("\n🔍 Found User:");
  console.log("==========================================");
  console.log(`Name: ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Current Password: "${user.password}"`);
  console.log(`Role: ${user.role}`);
  console.log(`Requires Password Change: ${user.requiresPasswordChange ?? false}`);
  console.log("==========================================\n");

  // Check for common issues
  const issues: string[] = [];

  if (user.password.includes(" ")) {
    issues.push(`Password contains spaces: "${user.password}"`);
  }

  if (user.password.trim() !== user.password) {
    issues.push(`Password has leading/trailing whitespace`);
  }

  if (user.email.trim() !== user.email) {
    issues.push(`Email has leading/trailing whitespace`);
  }

  if (user.email !== user.email.toLowerCase()) {
    issues.push(`Email is not lowercase: "${user.email}"`);
  }

  if (issues.length > 0) {
    console.log("⚠️  Potential Issues Found:");
    issues.forEach(issue => console.log(`  - ${issue}`));
    console.log("");
  } else {
    console.log("✅ No obvious issues found with credentials");
  }

  return {
    user,
    issues,
    canLogin: issues.length === 0
  };
}

/**
 * Reset a user's password (admin function)
 */
export async function resetUserPassword(searchTerm: string, newPassword: string) {
  if (!database) {
    console.error("❌ Firebase not configured");
    return false;
  }

  const users = useUsersStore.getState().invitedUsers;
  const normalizedSearch = searchTerm.toLowerCase();

  const user = users.find(u =>
    u.name.toLowerCase().includes(normalizedSearch) ||
    u.email.toLowerCase().includes(normalizedSearch) ||
    (u.nickname && u.nickname.toLowerCase().includes(normalizedSearch))
  );

  if (!user) {
    console.log(`❌ User not found matching: "${searchTerm}"`);
    return false;
  }

  console.log(`\n🔐 Resetting password for: ${user.name} (${user.email})`);
  console.log(`   Old password: "${user.password}"`);
  console.log(`   New password: "${newPassword}"`);

  try {
    const userRef = ref(database, `users/${user.id}`);
    await firebaseUpdate(userRef, {
      password: newPassword.trim(), // Trim to avoid whitespace issues
      requiresPasswordChange: false,
    });

    console.log("✅ Password reset successful!");
    console.log(`   ${user.name} can now login with email: ${user.email}`);
    console.log(`   Password: ${newPassword.trim()}`);

    return true;
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    return false;
  }
}

/**
 * List all users in the system
 */
export function listAllUsers() {
  const users = useUsersStore.getState().invitedUsers;

  console.log("\n📋 ALL USERS IN SYSTEM");
  console.log("==========================================");

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name}${user.nickname ? ` (${user.nickname})` : ""}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password: "${user.password}"`);
  });

  console.log(`\nTotal: ${users.length} users`);
  console.log("==========================================\n");
}
