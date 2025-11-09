import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUsersStore } from "../state/usersStore";

/**
 * Backup users to a JSON string that can be saved/shared
 */
export const backupUsers = async (): Promise<string> => {
  try {
    const usersData = await AsyncStorage.getItem("users-storage");
    if (!usersData) {
      throw new Error("No user data found");
    }
    return usersData;
  } catch (error) {
    console.error("Error backing up users:", error);
    throw error;
  }
};

/**
 * Restore users from a backup JSON string
 */
export const restoreUsers = async (backupData: string): Promise<boolean> => {
  try {
    // Validate the backup data
    const parsed = JSON.parse(backupData);
    if (!parsed.state || !parsed.state.invitedUsers) {
      throw new Error("Invalid backup data format");
    }

    // Save to AsyncStorage
    await AsyncStorage.setItem("users-storage", backupData);

    // Force reload the store
    // The store will automatically load from AsyncStorage on next read
    return true;
  } catch (error) {
    console.error("Error restoring users:", error);
    return false;
  }
};

/**
 * Export users as a downloadable/shareable format
 */
export const exportUsersToJSON = () => {
  const store = useUsersStore.getState();
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    users: store.invitedUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      invitedAt: u.invitedAt,
      invitedBy: u.invitedBy,
      // Don't include password in export for security
    })),
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Get a count of users by role for verification
 */
export const getUserStats = () => {
  const store = useUsersStore.getState();
  const stats = {
    total: store.invitedUsers.length,
    admin: store.invitedUsers.filter((u) => u.role === "admin").length,
    bridge_team: store.invitedUsers.filter((u) => u.role === "bridge_team").length,
    mentorship_leader: store.invitedUsers.filter((u) => u.role === "mentorship_leader").length,
    mentor: store.invitedUsers.filter((u) => u.role === "mentor").length,
  };
  return stats;
};

/**
 * Ensure default admin exists - call this on app start
 */
export const ensureDefaultAdmin = async () => {
  const store = useUsersStore.getState();
  const adminEmail = "kendall@7more.net";
  const existingAdmin = store.getUserByEmail(adminEmail);

  if (!existingAdmin) {
    console.log("Default admin not found, creating...");
    store.addUser("Kendall", adminEmail, "admin", "7moreHouston!", "system");
    return true;
  }

  return false;
};
