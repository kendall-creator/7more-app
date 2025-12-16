import { create } from "zustand";
import { ref, set as firebaseSet, update as firebaseUpdate, remove } from "firebase/database";
import { database } from "../config/firebase";
import { UserRole, InvitedUser } from "../types";
import { useAuthStore } from "./authStore";

interface UsersState {
  isLoading: boolean;
}

interface UsersActions {
  addUser: (
    name: string,
    email: string,
    role: UserRole,
    password: string,
    invitedBy: string,
    phone?: string,
    nickname?: string
  ) => Promise<{ success: boolean; password: string }>;
  removeUser: (userId: string) => Promise<void>;
  updateUser: (userId: string, updates: Partial<Omit<InvitedUser, "id">>) => Promise<void>;
  resetPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; password: string }>;
  getUserByEmail: (email: string) => InvitedUser | undefined;
  getUserById: (userId: string) => InvitedUser | undefined;
}

type UsersStore = UsersState & UsersActions;

export const useUsersStore = create<UsersStore>()((set, get) => ({
  isLoading: false,

  addUser: async (name, email, role, password, invitedBy, phone, nickname) => {
    if (!database) {
      throw new Error("Firebase not configured");
    }

    const newUser: InvitedUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email: email.toLowerCase().trim(),
      role,
      roles: [role],
      password,
      invitedAt: new Date().toISOString(),
      invitedBy,
      requiresPasswordChange: false,
      ...(nickname && { nickname }),
      ...(phone && { phone }),
    };

    const userRef = ref(database, `users/${newUser.id}`);
    await firebaseSet(userRef, newUser);

    return {
      success: true,
      password: password,
    };
  },

  removeUser: async (userId) => {
    if (!database) {
      throw new Error("Firebase not configured");
    }

    const userRef = ref(database, `users/${userId}`);
    await remove(userRef);
  },

  updateUser: async (userId, updates) => {
    if (!database) {
      throw new Error("Firebase not configured");
    }

    const userRef = ref(database, `users/${userId}`);
    await firebaseUpdate(userRef, updates);
  },

  resetPassword: async (userId, newPassword) => {
    if (!database) {
      throw new Error("Firebase not configured");
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

  getUserByEmail: (email) => {
    const users = useAuthStore.getState().users;
    return users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
  },

  getUserById: (userId) => {
    const users = useAuthStore.getState().users;
    return users.find((u) => u.id === userId);
  },
}));

// Selectors
export const useInvitedUsers = () => useAuthStore((s) => s.users);

