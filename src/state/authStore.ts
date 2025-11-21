import { create } from "zustand";
import { User } from "../types";
import { useUsersStore } from "./usersStore";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  originalAdmin: User | null;
  loginError: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  impersonateUser: (user: User, adminUser: User) => void;
  stopImpersonation: () => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set) => ({
  currentUser: null,
  isAuthenticated: false,
  originalAdmin: null,
  loginError: null,

  login: async (email: string, password: string) => {
    console.log("\n🔐 AuthStore.login called:");
    console.log(`  Email: "${email}"`);
    console.log(`  Password length: ${password.length}`);

    // Clear previous error
    set({ loginError: null });

    // Check if users are loaded
    const usersCount = useUsersStore.getState().invitedUsers.length;
    console.log(`  Users in store: ${usersCount}`);

    if (usersCount === 0) {
      console.log("❌ No users loaded - cannot validate credentials");
      set({
        loginError: "Unable to connect to server. Please check your connection and try again.",
        isAuthenticated: false,
        currentUser: null
      });
      return false;
    }

    // Validate credentials against invited users
    const validatedUser = useUsersStore.getState().validateCredentials(email, password);

    if (!validatedUser) {
      console.log("❌ Credential validation failed");
      set({
        loginError: "Invalid email or password. Please check your credentials or contact an admin for access.",
        isAuthenticated: false,
        currentUser: null
      });
      return false;
    }

    console.log("✅ Login successful!");
    set({
      currentUser: validatedUser,
      isAuthenticated: true,
      loginError: null
    });
    return true;
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false, originalAdmin: null, loginError: null });
  },

  setUser: (user: User) => {
    set({ currentUser: user, isAuthenticated: true, loginError: null });
  },

  impersonateUser: (user: User, adminUser: User) => {
    set({ currentUser: user, originalAdmin: adminUser, isAuthenticated: true, loginError: null });
  },

  stopImpersonation: () => {
    set((state) => ({
      currentUser: state.originalAdmin,
      originalAdmin: null,
      isAuthenticated: true,
      loginError: null
    }));
  },

  clearError: () => {
    set({ loginError: null });
  },
}));

// Selectors
export const useCurrentUser = () => useAuthStore((s) => s.currentUser);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useUserRole = () => useAuthStore((s) => s.currentUser?.role);
export const useIsImpersonating = () => {
  const originalAdmin = useAuthStore((s) => s.originalAdmin);
  return originalAdmin !== null;
};
export const useOriginalAdmin = () => useAuthStore((s) => s.originalAdmin);
