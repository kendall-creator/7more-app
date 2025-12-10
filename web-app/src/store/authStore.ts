import { create } from "zustand";
import { ref, onValue, get as firebaseGet } from "firebase/database";
import { database } from "../config/firebase";
import { User, InvitedUser } from "../types";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loginError: string | null;
  isLoading: boolean;
  users: InvitedUser[];
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  initializeUsersListener: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  loginError: null,
  isLoading: true,
  users: [],

  initializeUsersListener: () => {
    if (!database) {
      console.warn("Firebase not configured");
      set({ isLoading: false });
      return;
    }

    const usersRef = ref(database, "users");

    // Try direct fetch first
    firebaseGet(usersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const usersArray = Object.values(data) as InvitedUser[];
          console.log(`✅ Loaded ${usersArray.length} users`);
          set({ users: usersArray, isLoading: false });
        } else {
          set({ users: [], isLoading: false });
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        set({ isLoading: false });
      });

    // Set up real-time listener
    onValue(
      usersRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const usersArray = Object.values(data) as InvitedUser[];
          set({ users: usersArray, isLoading: false });
        }
      },
      (error) => {
        console.warn("Firebase listener error:", error);
      }
    );
  },

  login: async (email: string, password: string) => {
    set({ loginError: null });

    const { users } = get();

    if (users.length === 0) {
      set({
        loginError: "Unable to connect to server. Please try again.",
        isAuthenticated: false,
        currentUser: null,
      });
      return false;
    }

    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!user) {
      set({
        loginError: "Invalid email or password.",
        isAuthenticated: false,
        currentUser: null,
      });
      return false;
    }

    if (user.password !== password && user.password.trim() !== password.trim()) {
      set({
        loginError: "Invalid email or password.",
        isAuthenticated: false,
        currentUser: null,
      });
      return false;
    }

    const validatedUser: User = {
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      email: user.email,
      role: user.role,
      roles: user.roles,
      requiresPasswordChange: user.requiresPasswordChange,
    };

    set({
      currentUser: validatedUser,
      isAuthenticated: true,
      loginError: null,
    });

    // Store in localStorage for persistence
    localStorage.setItem("currentUser", JSON.stringify(validatedUser));

    return true;
  },

  logout: () => {
    localStorage.removeItem("currentUser");
    set({
      currentUser: null,
      isAuthenticated: false,
      loginError: null,
    });
  },

  clearError: () => {
    set({ loginError: null });
  },
}));

// Initialize from localStorage on load
const storedUser = localStorage.getItem("currentUser");
if (storedUser) {
  try {
    const user = JSON.parse(storedUser);
    useAuthStore.setState({
      currentUser: user,
      isAuthenticated: true,
    });
  } catch {
    localStorage.removeItem("currentUser");
  }
}
