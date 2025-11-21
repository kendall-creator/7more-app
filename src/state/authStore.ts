import { create } from "zustand";
import { User } from "../types";
import { useUsersStore } from "./usersStore";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  originalAdmin: User | null; // Store original admin when impersonating
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
    console.log("\n🔐 AuthStore.login called");
    console.log(`  Email: "${email}"`);
    console.log(`  Password: "${password}"`);

    try {
      // Clear previous error
      set({ loginError: null });

      // EMERGENCY FALLBACK: If Firebase hasn't loaded users, check hardcoded credentials
      const loadedUsers = useUsersStore.getState().invitedUsers;
      console.log(`  Users currently loaded: ${loadedUsers.length}`);

      if (loadedUsers.length === 0) {
        console.log("⚠️  WARNING: No users loaded from Firebase - using emergency fallback");

        // Hardcoded emergency credentials for critical users
        const emergencyUsers = [
          { email: "mlowry@7more.net", password: "mlowry", name: "Madi Lowry", role: "bridge_team_leader", id: "emergency_madi" },
          { email: "kendall@7more.net", password: "7moreHouston!", name: "Kendall", role: "admin", id: "emergency_kendall" },
          { email: "pauljalfaro@hotmail.com", password: "palfaro", name: "Paul Alfaro", role: "mentorship_leader", id: "emergency_paul" },
        ];

        const emergencyUser = emergencyUsers.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (emergencyUser) {
          console.log("✅ EMERGENCY LOGIN SUCCESS - Firebase bypassed");
          set({
            currentUser: {
              id: emergencyUser.id,
              name: emergencyUser.name,
              email: emergencyUser.email,
              role: emergencyUser.role as any,
              requiresPasswordChange: false
            },
            isAuthenticated: true,
            loginError: null
          });
          return true;
        } else {
          console.log("❌ Emergency fallback: credentials not found");
          set({
            loginError: "Cannot connect to server. Please refresh the page and try again.",
            isAuthenticated: false,
            currentUser: null
          });
          return false;
        }
      }

      // Normal path: Validate credentials against invited users
      console.log("  Calling validateCredentials...");
      const validatedUser = useUsersStore.getState().validateCredentials(email, password);

      console.log("  validateCredentials returned:");
      console.log(`  Result: ${validatedUser ? "User object" : "null/undefined"}`);
      console.log(`  Result type: ${typeof validatedUser}`);
      console.log(`  Result value:`, validatedUser);

      if (!validatedUser) {
        console.log("  ❌ Login FAILED - validatedUser is falsy");
        set({
          loginError: "Invalid email or password. Please check your credentials or contact an admin for access.",
          isAuthenticated: false,
          currentUser: null
        });
        return false;
      }

      console.log("  ✅ Login SUCCESS - setting user state");
      set({
        currentUser: validatedUser,
        isAuthenticated: true,
        loginError: null
      });
      return true;
    } catch (error) {
      console.error("❌ EXCEPTION in AuthStore.login:", error);
      set({
        loginError: "Login error. Please try again.",
        isAuthenticated: false,
        currentUser: null
      });
      return false;
    }
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
  // Use the originalAdmin directly and convert to boolean in component
  const originalAdmin = useAuthStore((s) => s.originalAdmin);
  return originalAdmin !== null;
};
export const useOriginalAdmin = () => useAuthStore((s) => s.originalAdmin);
