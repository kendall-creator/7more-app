import { create } from "zustand";
import { ref, set as firebaseSet, onValue, update as firebaseUpdate, remove, get as firebaseGet } from "firebase/database";
import { database } from "../config/firebase";
import { User, UserRole, ReportingCategory, ReportingPermissions } from "../types";
import { FALLBACK_USERS } from "./fallbackUsers";

interface InvitedUser {
  id: string;
  name: string;
  nickname?: string; // Optional nickname
  email: string;
  phone?: string; // Phone number (optional)
  role: UserRole; // Primary role (required for backward compatibility)
  roles?: UserRole[]; // Optional: multiple roles
  password: string; // In production, this would be hashed
  invitedAt: string;
  invitedBy: string;
  requiresPasswordChange?: boolean;
  temporaryPassword?: string; // Store temporarily for email sending
  hasReportingAccess?: boolean; // Optional: grant specific users access to reporting (admin assigns)
  reportingCategories?: ReportingCategory[]; // Optional: specific categories user can view (if empty, can view all) - DEPRECATED
  reportingPermissions?: ReportingPermissions; // New granular permissions structure
}

interface UsersState {
  invitedUsers: InvitedUser[];
  isInitialized: boolean;
  isLoading: boolean;
}

interface UsersActions {
  addUser: (name: string, email: string, role: UserRole, password: string, invitedBy: string, phone?: string, nickname?: string) => Promise<{ success: boolean; password: string }>;
  removeUser: (userId: string) => Promise<void>;
  updateUser: (userId: string, updates: Partial<Omit<InvitedUser, "id">>) => Promise<void>;
  resetPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; password: string }>;
  changePassword: (userId: string, newPassword: string) => Promise<void>;
  getUserByEmail: (email: string) => InvitedUser | undefined;
  getUserById: (userId: string) => InvitedUser | undefined;
  validateCredentials: (email: string, password: string) => User | null;
  initializeDefaultAdmin: () => Promise<void>;
  initializeFirebaseListener: () => void;
  refreshFirebaseListener: () => void;
  fetchUsersDirectly: () => Promise<void>;
}

type UsersStore = UsersState & UsersActions;

let isListenerInitialized = false;

export const useUsersStore = create<UsersStore>()((set, get) => ({
  invitedUsers: [],
  isInitialized: false,
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: async () => {
    // Prevent multiple listener initializations
    if (isListenerInitialized) {
      console.log("⚠️ Users listener already initialized, skipping...");
      return;
    }

    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    console.log("🔥 Initializing users Firebase listener...");
    isListenerInitialized = true;
    set({ isLoading: true });

    const usersRef = ref(database, "users");

    // FIRST: Try direct fetch immediately (more reliable on problematic devices)
    try {
      console.log("   Attempting direct fetch first...");

      // Add a manual timeout to catch hanging requests
      const fetchPromise = firebaseGet(usersRef);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firebase fetch timeout after 5 seconds")), 5000)
      );

      const snapshot = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.values(data) as InvitedUser[];
        console.log(`✅ Direct fetch successful: ${usersArray.length} users loaded`);
        set({ invitedUsers: usersArray, isLoading: false });
      } else {
        console.log("✅ Direct fetch: No users in Firebase");
        set({ invitedUsers: [], isLoading: false });
      }
    } catch (directError: any) {
      console.error("❌ Direct fetch failed:");
      console.error("   Error type:", directError?.constructor?.name || "Unknown");
      console.error("   Error message:", directError?.message || String(directError));
      console.error("   Error code:", directError?.code || "no code");
      console.error("   This device cannot connect to Firebase. Using emergency fallback users.");

      // Use fallback users as last resort
      console.log(`⚠️ Loading ${FALLBACK_USERS.length} emergency fallback users`);
      set({ isLoading: false, invitedUsers: FALLBACK_USERS as any });
    }

    // SECOND: Set up real-time listener for updates (optional, but nice to have)
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.values(data) as InvitedUser[];
        console.log(`🔄 Real-time update: ${usersArray.length} users`);
        set({ invitedUsers: usersArray, isLoading: false });
      } else {
        console.log("🔄 Real-time update: No users");
        set({ invitedUsers: [], isLoading: false });
      }
    }, (error) => {
      console.error("❌ Real-time listener error:", error);
      // Don't clear users on listener error - keep the direct fetch data
    });
  },

  refreshFirebaseListener: () => {
    console.log("🔄 Force refreshing Firebase users listener...");

    if (!database) {
      console.warn("Firebase not configured. Cannot refresh listener.");
      return;
    }

    // Reset the initialization flag to allow reinitialization
    isListenerInitialized = false;

    // Clear current users while reloading
    set({ isLoading: true, invitedUsers: [] });

    // Call initialize again
    get().initializeFirebaseListener();

    console.log("✅ Firebase listener refresh initiated");
  },

  fetchUsersDirectly: async () => {
    console.log("🔄 Fetching users directly from Firebase (bypassing listener)...");

    if (!database) {
      console.warn("Firebase not configured. Cannot fetch users.");
      return;
    }

    try {
      set({ isLoading: true });
      const usersRef = ref(database, "users");
      const snapshot = await firebaseGet(usersRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.values(data) as InvitedUser[];
        console.log(`✅ Direct fetch: Loaded ${usersArray.length} users from Firebase`);
        set({ invitedUsers: usersArray, isLoading: false });
      } else {
        console.log("✅ Direct fetch: No users in Firebase");
        set({ invitedUsers: [], isLoading: false });
      }
    } catch (error) {
      console.error("❌ Error in direct fetch:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  addUser: async (name, email, role, password, invitedBy, phone, nickname) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const newUser: any = {
      id: `user_${Date.now()}`,
      name,
      email: email.toLowerCase().trim(),
      role, // Primary role (required)
      roles: [role], // Initialize roles array with the primary role
      password,
      invitedAt: new Date().toISOString(),
      invitedBy,
      requiresPasswordChange: false, // No longer forcing password changes
    };

    // Only add optional fields if they have values (Firebase doesn't allow undefined)
    if (nickname) {
      newUser.nickname = nickname;
    }
    if (phone) {
      newUser.phone = phone;
    }

    const userRef = ref(database, `users/${newUser.id}`);
    await firebaseSet(userRef, newUser);

    return {
      success: true,
      password: password,
    };
  },

  removeUser: async (userId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const userRef = ref(database, `users/${userId}`);
    await remove(userRef);
  },

  updateUser: async (userId, updates) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const userRef = ref(database, `users/${userId}`);
    await firebaseUpdate(userRef, updates);
  },

  resetPassword: async (userId, newPassword) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const userRef = ref(database, `users/${userId}`);
    await firebaseUpdate(userRef, {
      password: newPassword,
      requiresPasswordChange: false,
    });

    return {
      success: true,
      password: newPassword,
    };
  },

  changePassword: async (userId, newPassword) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const userRef = ref(database, `users/${userId}`);
    await firebaseUpdate(userRef, {
      password: newPassword,
      requiresPasswordChange: false,
      temporaryPassword: undefined,
    });
  },

  getUserByEmail: (email) => {
    return get().invitedUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
  },

  getUserById: (userId) => {
    return get().invitedUsers.find((u) => u.id === userId);
  },

  validateCredentials: (email, password) => {
    const user = get().getUserByEmail(email);

    // Debug logging for troubleshooting
    console.log("\n🔐 Validating Credentials:");
    console.log(`  Email: "${email}"`);
    console.log(`  User found: ${user ? "YES" : "NO"}`);

    if (!user) {
      console.log(`  ❌ No user found with email: ${email}`);
      return null;
    }

    console.log(`  User: ${user.name}`);
    console.log(`  Stored password: "${user.password}"`);
    console.log(`  Provided password: "${password}"`);
    console.log(`  Exact match: ${user.password === password ? "YES" : "NO"}`);

    // Try exact match first
    if (user.password === password) {
      console.log(`  ✅ Login successful (exact match)`);
      return {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        roles: user.roles,
        requiresPasswordChange: user.requiresPasswordChange,
      };
    }

    // Try trimmed comparison (to handle whitespace issues)
    if (user.password.trim() === password.trim()) {
      console.log(`  ✅ Login successful (trimmed match)`);
      console.log(`  ⚠️  WARNING: Password has whitespace issues. Consider fixing.`);
      return {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        roles: user.roles,
        requiresPasswordChange: user.requiresPasswordChange,
      };
    }

    console.log(`  ❌ Password mismatch`);
    console.log(`  Stored length: ${user.password.length}`);
    console.log(`  Provided length: ${password.length}`);
    return null;
  },

  initializeDefaultAdmin: async () => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const state = get();
    const adminEmail = "kendall@7more.net";

    // Always check if default admin exists, regardless of initialization state
    const existingAdmin = state.getUserByEmail(adminEmail);

    if (!existingAdmin) {
      const defaultAdmin: InvitedUser = {
        id: "admin_default",
        name: "Kendall",
        email: adminEmail,
        role: "admin", // Primary role (required)
        roles: ["admin"], // Initialize roles array
        password: "7moreHouston!",
        invitedAt: new Date().toISOString(),
        invitedBy: "system",
        requiresPasswordChange: false, // Default admin doesn't need to change password
      };

      const adminRef = ref(database, `users/${defaultAdmin.id}`);
      await firebaseSet(adminRef, defaultAdmin);
      console.log("Default admin account restored:", adminEmail);
    } else if (existingAdmin.id === "admin_default" && existingAdmin.requiresPasswordChange !== false) {
      // Update existing default admin to not require password change
      const adminRef = ref(database, `users/${existingAdmin.id}`);
      await firebaseUpdate(adminRef, {
        requiresPasswordChange: false,
      });
      console.log("Updated default admin to not require password change");
    }

    // Check if Deborah Walker (Debs) account exists
    const debsEmail = "debs@7more.net";
    const existingDebs = state.getUserByEmail(debsEmail);

    if (!existingDebs) {
      const debsUser: InvitedUser = {
        id: "user_debs_default",
        name: "Deborah Walker",
        nickname: "Debs",
        email: debsEmail,
        role: "admin", // Give Debs admin access for volunteer management
        roles: ["admin"],
        password: "dwalker", // Simple password: dwalker
        invitedAt: new Date().toISOString(),
        invitedBy: "system",
        requiresPasswordChange: false,
      };

      const debsRef = ref(database, `users/${debsUser.id}`);
      await firebaseSet(debsRef, debsUser);
      console.log("Default Debs account created:", debsEmail);
    }

    // Update isInitialized flag in Firebase
    if (!state.isInitialized) {
      const initRef = ref(database, "usersInitialized");
      await firebaseSet(initRef, true);
      set({ isInitialized: true });
    }
  },
}));

// Selectors
export const useInvitedUsers = () => useUsersStore((s) => s.invitedUsers);
export const useUsersByRole = (role: UserRole) =>
  useUsersStore((s) => s.invitedUsers.filter((u) => u.role === role));
