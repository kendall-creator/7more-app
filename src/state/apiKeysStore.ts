import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ApiKeysState {
  resendApiKey: string | null;
  setResendApiKey: (key: string) => void;
  getResendApiKey: () => string | null;
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set, get) => ({
      resendApiKey: null,

      setResendApiKey: (key: string) => {
        set({ resendApiKey: key });
      },

      getResendApiKey: () => {
        // First check the persisted store
        const storedKey = get().resendApiKey;
        if (storedKey) {
          return storedKey;
        }

        // Fall back to environment variable
        const envKey = process.env.EXPO_PUBLIC_RESEND_API_KEY;
        if (envKey) {
          // Save it to the store for future use
          set({ resendApiKey: envKey });
          return envKey;
        }

        return null;
      },
    }),
    {
      name: "api-keys-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
