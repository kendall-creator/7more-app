import { useUsersStore } from "../state/usersStore";

/**
 * Debug utility to list all users and their login info
 * This helps diagnose login issues
 */
export function debugListAllUsers() {
  const users = useUsersStore.getState().invitedUsers;

  console.log("==========================================");
  console.log("📋 ALL USERS IN DATABASE");
  console.log("==========================================");

  users.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.name}${user.nickname ? ` (${user.nickname})` : ""}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Requires Password Change: ${user.requiresPasswordChange ?? false}`);
    console.log(`   ID: ${user.id}`);
  });

  console.log("\n==========================================");
  console.log(`Total Users: ${users.length}`);
  console.log("==========================================\n");
}

/**
 * Find a user by name (case-insensitive partial match)
 */
export function findUserByName(searchName: string) {
  const users = useUsersStore.getState().invitedUsers;
  const normalizedSearch = searchName.toLowerCase();

  return users.filter(user =>
    user.name.toLowerCase().includes(normalizedSearch) ||
    (user.nickname && user.nickname.toLowerCase().includes(normalizedSearch))
  );
}

/**
 * Test login credentials for a user
 */
export function testLogin(email: string, password: string) {
  console.log("\n🔐 Testing Login Credentials");
  console.log("==========================================");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("==========================================");

  const user = useUsersStore.getState().getUserByEmail(email);

  if (!user) {
    console.log("❌ User not found with that email");
    console.log("Available emails:");
    useUsersStore.getState().invitedUsers.forEach(u => {
      console.log(`  - ${u.email} (${u.name})`);
    });
    return false;
  }

  console.log(`✅ User found: ${user.name}`);
  console.log(`   Stored password: "${user.password}"`);
  console.log(`   Provided password: "${password}"`);
  console.log(`   Match: ${user.password === password ? "✅ YES" : "❌ NO"}`);

  if (user.password !== password) {
    console.log("\n🔍 Password Comparison Details:");
    console.log(`   Stored length: ${user.password.length}`);
    console.log(`   Provided length: ${password.length}`);
    console.log(`   Stored (trimmed): "${user.password.trim()}"`);
    console.log(`   Provided (trimmed): "${password.trim()}"`);
  }

  console.log("==========================================\n");

  return user.password === password;
}
