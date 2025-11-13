import { create } from "zustand";
import { ref, set as firebaseSet, onValue, update as firebaseUpdate, remove } from "firebase/database";
import { database } from "../config/firebase";
import { TransitionalHome } from "../types";

interface TransitionalHomeState {
  transitionalHomes: TransitionalHome[];
  isLoading: boolean;
}

interface TransitionalHomeActions {
  addTransitionalHome: (home: Omit<TransitionalHome, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTransitionalHome: (id: string, updates: Partial<Omit<TransitionalHome, "id" | "createdAt">>) => Promise<void>;
  deleteTransitionalHome: (id: string) => Promise<void>;
  getActiveTransitionalHomes: () => TransitionalHome[];
  initializeFirebaseListener: () => void;
  initializeDefaultHomes: () => Promise<void>;
}

type TransitionalHomeStore = TransitionalHomeState & TransitionalHomeActions;

let isListenerInitialized = false;

// Default transitional home (Ben Reid / Southeast Texas Transitional Center)
const defaultHomes: TransitionalHome[] = [
  {
    id: "th_benreid",
    name: "Ben Reid / Southeast Texas Transitional Center",
    address: "",
    city: "",
    state: "TX",
    zipCode: "",
    phone: "",
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system",
    createdByName: "System",
  },
];

export const useTransitionalHomeStore = create<TransitionalHomeStore>()((set, get) => ({
  transitionalHomes: [],
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: () => {
    // Prevent multiple listener initializations
    if (isListenerInitialized) {
      console.log("⚠️ [TransitionalHome] listener already initialized, skipping...");
      return;
    }

    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    console.log("🔥 Initializing transitional home Firebase listener...");
    isListenerInitialized = true;

    const homesRef = ref(database, "transitionalHomes");

    onValue(homesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const homesArray = Object.values(data) as TransitionalHome[];
        console.log(`✅ Loaded ${homesArray.length} transitional homes from Firebase`);
        set({ transitionalHomes: homesArray, isLoading: false });
      } else {
        set({ transitionalHomes: [], isLoading: false });
      }
    }, (error) => {
      console.error("❌ Error in transitional home listener:", error);
      set({ isLoading: false });
    });
  },

  // Initialize default homes if none exist
  initializeDefaultHomes: async () => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const currentHomes = get().transitionalHomes;

    // Only initialize if no homes exist
    if (currentHomes.length === 0) {
      for (const home of defaultHomes) {
        const homeRef = ref(database, `transitionalHomes/${home.id}`);
        await firebaseSet(homeRef, home);
      }
    }
  },

  addTransitionalHome: async (homeData) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const newHome: TransitionalHome = {
      ...homeData,
      id: `th_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const homeRef = ref(database, `transitionalHomes/${newHome.id}`);
    await firebaseSet(homeRef, newHome);
  },

  updateTransitionalHome: async (id, updates) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const home = get().transitionalHomes.find((h) => h.id === id);
    if (!home) return;

    const updatedHome = {
      ...home,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const homeRef = ref(database, `transitionalHomes/${id}`);
    await firebaseSet(homeRef, updatedHome);
  },

  deleteTransitionalHome: async (id) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const homeRef = ref(database, `transitionalHomes/${id}`);
    await remove(homeRef);
  },

  getActiveTransitionalHomes: () => {
    return get().transitionalHomes.filter((h) => h.isActive);
  },
}));

// Selectors
export const useAllTransitionalHomes = () => useTransitionalHomeStore((s) => s.transitionalHomes);
export const useActiveTransitionalHomes = () => useTransitionalHomeStore((s) => s.getActiveTransitionalHomes());
