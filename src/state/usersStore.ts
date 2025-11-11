import { create } from "zustand";
import { ref, set as firebaseSet, onValue, update as firebaseUpdate, remove } from "firebase/database";
import { database } from "../config/firebase";
import { User, UserRole } from "../types";

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
}

type UsersStore = UsersState & UsersActions;

export const useUsersStore = create<UsersStore>()((set, get) => ({
  invitedUsers: [],
  isInitialized: false,
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: () => {
    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    const usersRef = ref(database, "users");

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.values(data) as InvitedUser[];
        set({ invitedUsers: usersArray, isLoading: false });
      } else {
        set({ invitedUsers: [], isLoading: false });
      }
    });
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
    if (!user || user.password !== password) {
      return null;
    }

    // Return User object without password
    return {
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      email: user.email,
      role: user.role, // Primary role (required)
      roles: user.roles, // Optional roles array
      requiresPasswordChange: user.requiresPasswordChange,
    };
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
