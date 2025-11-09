import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserRole } from "../types";

interface UserState {
  users: User[];
}

interface UserActions {
  addUser: (email: string, name: string, role: UserRole, password: string) => boolean;
  getAllUsers: () => User[];
  getUsersByRole: (role: UserRole) => User[];
  deleteUser: (userId: string) => void;
}

type UserStore = UserState & UserActions;

// Default admin user
const defaultUsers: User[] = [
  {
    id: "admin_default",
    name: "Admin",
    email: "admin@7more.org",
    role: "admin",
  },
];

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: defaultUsers,

      addUser: (email: string, name: string, role: UserRole, password: string) => {
        // Check if email already exists
        const existingUser = get().users.find((u) => u.email === email);
        if (existingUser) {
          return false;
        }

        const newUser: User = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          email,
          role,
        };

        set((state) => ({
          users: [...state.users, newUser],
        }));

        return true;
      },

      getAllUsers: () => {
        return get().users;
      },

      getUsersByRole: (role: UserRole) => {
        return get().users.filter((u) => u.role === role);
      },

      deleteUser: (userId: string) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }));
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selectors
export const useAllUsers = () => useUserStore((s) => s.users);
