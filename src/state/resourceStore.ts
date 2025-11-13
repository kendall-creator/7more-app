import { create } from "zustand";
import { ref, set as firebaseSet, onValue, update as firebaseUpdate, remove } from "firebase/database";
import { database } from "../config/firebase";
import { Resource } from "../types";

interface ResourceState {
  resources: Resource[];
  isLoading: boolean;
}

interface ResourceActions {
  addResource: (resource: Omit<Resource, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateResource: (id: string, updates: Partial<Omit<Resource, "id" | "createdAt">>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  getResourcesByCategory: (category: string) => Resource[];
  initializeFirebaseListener: () => void;
  initializeDefaultResources: () => Promise<void>;
}

type ResourceStore = ResourceState & ResourceActions;

let isListenerInitialized = false;

// Default resources for the nonprofit
const defaultResources: Resource[] = [
  {
    id: "res_clothing",
    title: "Clothing Resources",
    category: "Clothing",
    content: "Free clothing assistance programs:\n\n👕 Goodwill Career Center\n📍 123 Main Street, Houston, TX\n📞 (713) 555-0100\n🕐 Mon-Fri 9am-5pm, Sat 10am-3pm\nServices: Free professional clothing for interviews and work\n\n👔 Dress for Success Houston\n📍 456 Commerce St, Houston, TX\n📞 (713) 555-0200\n🕐 Tues-Thurs 10am-4pm\nServices: Complete professional wardrobe, styling consultation\n\n🎽 St. Vincent de Paul Clothing Closet\n📍 789 Westheimer Rd, Houston, TX\n📞 (713) 555-0300\n🕐 Mon, Wed, Fri 1pm-5pm\nServices: Free everyday clothing, shoes, accessories",
    description: "Organizations providing free clothing for interviews and daily wear",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "res_employment",
    title: "Employment Resources",
    category: "Employment",
    content: "Employment assistance programs:\n\n💼 Texas Workforce Solutions\n📍 555 Workforce Dr, Houston, TX\n📞 (713) 555-0400\n🌐 www.twc.texas.gov\n🕐 Mon-Fri 8am-5pm\nServices: Job search assistance, resume help, interview prep, computer access\n\n🔨 Goodwill Job Connection\n📍 321 Employment Ln, Houston, TX\n📞 (713) 555-0500\n🕐 Mon-Fri 9am-6pm\nServices: Job training, placement assistance, career counseling\n\n🏗️ Second Chance Program\n📍 888 Opportunity Blvd, Houston, TX\n📞 (713) 555-0600\n🕐 Mon, Wed, Fri 10am-3pm\nServices: Jobs for those with criminal history, paid training programs\n\n📋 Indeed.com - Filter by \"Fair Chance Employer\"\n📋 70MillionJobs.com - Jobs for people with records",
    description: "Job training, placement services, and resources for employment",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "res_cellphone",
    title: "Cell Phone Assistance",
    category: "Cell Phone",
    content: "Free and low-cost phone programs:\n\n📱 Lifeline Program (Federal)\n📞 1-800-234-9473\n🌐 www.lifelinesupport.org\nServices: Free cell phone + monthly minutes/data for qualifying households\nEligibility: SNAP, Medicaid, SSI, or low income\n\n📱 Assurance Wireless\n📞 1-888-321-5880\n🌐 www.assurancewireless.com\nServices: Free smartphone + unlimited talk/text + data\nEligibility: Government assistance programs\n\n📱 SafeLink Wireless\n📞 1-800-723-3546\n🌐 www.safelinkwireless.com\nServices: Free phone service for eligible customers\nEligibility: Based on income or participation in programs\n\n📱 Q Link Wireless\n📞 1-855-754-6543\n🌐 www.qlinkwireless.com\nServices: Free unlimited talk, text, and data\nEligibility: Medicaid, SNAP, SSI, or income-based",
    description: "Free phone programs and assistance for staying connected",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useResourceStore = create<ResourceStore>()((set, get) => ({
  resources: [],
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: () => {
    // Prevent multiple listener initializations
    if (isListenerInitialized) {
      console.log("⚠️ [Resource] listener already initialized, skipping...");
      return;
    }

    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    console.log("🔥 Initializing resource Firebase listener...");
    isListenerInitialized = true;

    const resourcesRef = ref(database, "resources");

    onValue(resourcesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const resourcesArray = Object.values(data) as Resource[];
        console.log(`✅ Loaded ${resourcesArray.length} resources from Firebase`);
        set({ resources: resourcesArray, isLoading: false });
      } else {
        set({ resources: [], isLoading: false });
      }
    }, (error) => {
      console.error("❌ Error in resource listener:", error);
      set({ isLoading: false });
    });
  },

  // Initialize default resources if none exist
  initializeDefaultResources: async () => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const currentResources = get().resources;

    // Only initialize if no resources exist
    if (currentResources.length === 0) {
      for (const resource of defaultResources) {
        const resourceRef = ref(database, `resources/${resource.id}`);
        await firebaseSet(resourceRef, resource);
      }
    }
  },

  addResource: async (resourceData) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const newResource: Resource = {
      ...resourceData,
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const resourceRef = ref(database, `resources/${newResource.id}`);
    await firebaseSet(resourceRef, newResource);
  },

  updateResource: async (id, updates) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const resource = get().resources.find((r) => r.id === id);
    if (!resource) return;

    const updatedResource = {
      ...resource,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const resourceRef = ref(database, `resources/${id}`);
    await firebaseSet(resourceRef, updatedResource);
  },

  deleteResource: async (id) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const resourceRef = ref(database, `resources/${id}`);
    await remove(resourceRef);
  },

  getResourcesByCategory: (category) => {
    return get().resources.filter((r) => r.category === category);
  },
}));

// Selectors
export const useAllResources = () => useResourceStore((s) => s.resources);
export const useResourceCategories = () => {
  const resources = useResourceStore((s) => s.resources);
  return [...new Set(resources.map((r) => r.category))];
};
