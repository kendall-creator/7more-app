import { create } from "zustand";

interface FirebaseErrorState {
  hasPermissionError: boolean;
  errorCount: number;
  lastError: string | null;
  setPermissionError: (error: string) => void;
  clearErrors: () => void;
}

export const useFirebaseErrorStore = create<FirebaseErrorState>()((set) => ({
  hasPermissionError: false,
  errorCount: 0,
  lastError: null,

  setPermissionError: (error: string) => {
    set((state) => ({
      hasPermissionError: true,
      errorCount: state.errorCount + 1,
      lastError: error,
    }));
  },

  clearErrors: () => {
    set({
      hasPermissionError: false,
      errorCount: 0,
      lastError: null,
    });
  },
}));
