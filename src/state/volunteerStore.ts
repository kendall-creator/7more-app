import { create } from "zustand";
import { ref, set as firebaseSet, onValue, update as firebaseUpdate } from "firebase/database";
import { database } from "../config/firebase";
import {
  VolunteerInquiry,
  VolunteerRecord,
  VolunteerRoutingRule,
  MonetaryDonationSettings,
  VolunteerInterestArea,
  HistoryEntry,
} from "../types";

interface VolunteerState {
  inquiries: VolunteerInquiry[];
  volunteers: VolunteerRecord[];
  routingRules: VolunteerRoutingRule[];
  donationSettings: MonetaryDonationSettings;
  isLoading: boolean;
}

interface VolunteerActions {
  // Inquiry Management
  addInquiry: (inquiry: Omit<VolunteerInquiry, "id" | "status" | "assignedToDebs" | "assignedToDebsAt" | "generatedTaskIds" | "allTasksComplete" | "submittedAt" | "history">) => Promise<string>;
  updateInquiryStatus: (inquiryId: string, status: "pending" | "in_progress" | "completed") => Promise<void>;
  addTaskToInquiry: (inquiryId: string, taskId: string) => Promise<void>;
  markInquiryTasksComplete: (inquiryId: string) => Promise<void>;
  addInquiryHistoryEntry: (inquiryId: string, entry: Omit<HistoryEntry, "id" | "createdAt">) => Promise<void>;

  // Volunteer Database Management
  moveInquiryToDatabase: (inquiryId: string, userId: string, userName: string) => Promise<void>;
  addVolunteerRecord: (volunteer: Omit<VolunteerRecord, "id" | "addedAt" | "totalContactAttempts" | "history">, userId: string, userName: string) => Promise<void>;
  updateVolunteerRecord: (volunteerId: string, updates: Partial<VolunteerRecord>) => Promise<void>;
  deleteVolunteerRecord: (volunteerId: string) => Promise<void>;
  addVolunteerHistoryEntry: (volunteerId: string, entry: Omit<HistoryEntry, "id" | "createdAt">) => Promise<void>;

  // Routing Rules Management
  updateRoutingRule: (interestArea: VolunteerInterestArea, userId: string, userName: string, updatedBy: string, updatedByName: string) => Promise<void>;
  getRoutingRuleForInterest: (interestArea: VolunteerInterestArea) => VolunteerRoutingRule | undefined;

  // Donation Settings Management
  updateDonationSettings: (settings: Partial<MonetaryDonationSettings>, updatedBy: string, updatedByName: string) => Promise<void>;

  // Getters
  getInquiryById: (id: string) => VolunteerInquiry | undefined;
  getVolunteerById: (id: string) => VolunteerRecord | undefined;
  getInquiriesForDebs: () => VolunteerInquiry[];
  getPendingInquiries: () => VolunteerInquiry[];

  // Firebase listener
  initializeFirebaseListener: () => void;
}

type VolunteerStore = VolunteerState & VolunteerActions;

let isListenerInitialized = false;

// Default routing rules (Debs manually assigns unless admin changes)
const DEFAULT_ROUTING_RULES: VolunteerRoutingRule[] = [
  { interestArea: "bridge_team", assignedToUserId: "default_kendall", assignedToUserName: "Kendall" },
  { interestArea: "clothing_donation", assignedToUserId: "default_gregg", assignedToUserName: "Gregg" },
  { interestArea: "in_prison_volunteering", assignedToUserId: "default_josh", assignedToUserName: "Josh" },
  { interestArea: "administrative_work", assignedToUserId: "default_kendall", assignedToUserName: "Kendall" },
  { interestArea: "general_volunteer", assignedToUserId: "default_debs", assignedToUserName: "Debs" },
  { interestArea: "monetary_donation", assignedToUserId: "default_debs", assignedToUserName: "Debs" },
  { interestArea: "other", assignedToUserId: "default_debs", assignedToUserName: "Debs" },
];

// Default monetary donation settings
const DEFAULT_DONATION_SETTINGS: MonetaryDonationSettings = {
  threshold: 1000,
  belowThresholdInstruction: "Send them the giving link through the website.",
  aboveThresholdInstruction: "Coach them to write a check payable to 7more at:",
  checkAddress: "123 Main St, Houston, TX 77001",
};

export const useVolunteerStore = create<VolunteerStore>()((set, get) => ({
  inquiries: [],
  volunteers: [],
  routingRules: DEFAULT_ROUTING_RULES,
  donationSettings: DEFAULT_DONATION_SETTINGS,
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: () => {
    if (isListenerInitialized) {
      console.log("⚠️ Volunteer listener already initialized, skipping...");
      return;
    }

    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    console.log("🔥 Initializing volunteer Firebase listener...");
    isListenerInitialized = true;

    // Initialize default routing rules if they don't exist
    const routingRulesInitRef = ref(database!, "volunteer_routing_rules");
    onValue(routingRulesInitRef, (snapshot) => {
      if (!snapshot.exists()) {
        const rulesData: Record<string, VolunteerRoutingRule> = {};
        DEFAULT_ROUTING_RULES.forEach((rule) => {
          rulesData[rule.interestArea] = rule;
        });
        firebaseSet(routingRulesInitRef, rulesData);
      }
    }, { onlyOnce: true });

    // Initialize default donation settings if they don't exist
    const donationSettingsInitRef = ref(database!, "volunteer_donation_settings");
    onValue(donationSettingsInitRef, (snapshot) => {
      if (!snapshot.exists()) {
        firebaseSet(donationSettingsInitRef, DEFAULT_DONATION_SETTINGS);
      }
    }, { onlyOnce: true });

    // Listen to inquiries
    const inquiriesRef = ref(database!, "volunteer_inquiries");
    onValue(inquiriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const inquiriesArray = Object.values(data) as VolunteerInquiry[];
        console.log(`✅ Loaded ${inquiriesArray.length} volunteer inquiries from Firebase`);
        set({ inquiries: inquiriesArray });
      } else {
        console.log("✅ No volunteer inquiries in Firebase");
        set({ inquiries: [] });
      }
    }, (error) => {
      console.warn("Volunteer inquiries listener unavailable");
    });

    // Listen to volunteer database
    const volunteersRef = ref(database!, "volunteer_database");
    onValue(volunteersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const volunteersArray = Object.values(data) as VolunteerRecord[];
        console.log(`✅ Loaded ${volunteersArray.length} volunteer records from Firebase`);
        set({ volunteers: volunteersArray });
      } else {
        console.log("✅ No volunteer records in Firebase");
        set({ volunteers: [] });
      }
    }, (error) => {
      console.warn("Volunteer database listener unavailable");
    });

    // Listen to routing rules
    const routingRulesRef = ref(database!, "volunteer_routing_rules");
    onValue(routingRulesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const rulesArray = Object.values(data) as VolunteerRoutingRule[];
        console.log(`✅ Loaded ${rulesArray.length} routing rules from Firebase`);
        set({ routingRules: rulesArray });
      } else {
        console.log("✅ No routing rules in Firebase, using defaults");
        set({ routingRules: DEFAULT_ROUTING_RULES });
      }
    }, (error) => {
      console.warn("Routing rules listener unavailable");
    });

    // Listen to donation settings
    const donationSettingsRef = ref(database!, "volunteer_donation_settings");
    onValue(donationSettingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log("✅ Loaded donation settings from Firebase");
        set({ donationSettings: data as MonetaryDonationSettings });
      } else {
        console.log("✅ No donation settings in Firebase, using defaults");
        set({ donationSettings: DEFAULT_DONATION_SETTINGS });
      }
    }, (error) => {
      console.warn("Donation settings listener unavailable");
    });

    set({ isLoading: false });
  },

  addInquiry: async (inquiryData) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const inquiryId = `vol_inquiry_${Date.now()}`;
    const now = new Date().toISOString();

    const newInquiry: VolunteerInquiry = {
      ...inquiryData,
      id: inquiryId,
      status: "pending",
      assignedToDebs: true,
      assignedToDebsAt: now,
      generatedTaskIds: [],
      allTasksComplete: false,
      submittedAt: now,
      history: [
        {
          id: `history_${Date.now()}`,
          type: "note_added",
          description: "Volunteer inquiry submitted",
          details: `Interests: ${inquiryData.selectedInterests.join(", ")}`,
          createdAt: now,
        },
      ],
    };

    const inquiryRef = ref(database, `volunteer_inquiries/${inquiryId}`);
    await firebaseSet(inquiryRef, newInquiry);
    console.log("✅ Volunteer inquiry added to Firebase:", inquiryId);

    return inquiryId;
  },

  updateInquiryStatus: async (inquiryId, status) => {
    if (!database) {
      throw new Error("Firebase not configured.");
    }

    const updates: Record<string, unknown> = {
      status,
    };

    if (status === "completed") {
      updates.completedAt = new Date().toISOString();
    }

    const inquiryRef = ref(database, `volunteer_inquiries/${inquiryId}`);
    await firebaseUpdate(inquiryRef, updates);
    console.log(`✅ Inquiry ${inquiryId} status updated to ${status}`);
  },

  addTaskToInquiry: async (inquiryId, taskId) => {
    if (!database) {
      throw new Error("Firebase not configured.");
    }

    const inquiry = get().getInquiryById(inquiryId);
    if (!inquiry) {
      throw new Error("Inquiry not found");
    }

    const updatedTaskIds = [...inquiry.generatedTaskIds, taskId];
    const inquiryRef = ref(database, `volunteer_inquiries/${inquiryId}`);
    await firebaseUpdate(inquiryRef, { generatedTaskIds: updatedTaskIds });
    console.log(`✅ Task ${taskId} added to inquiry ${inquiryId}`);
  },

  markInquiryTasksComplete: async (inquiryId) => {
    if (!database) {
      throw new Error("Firebase not configured.");
    }

    const updates = {
      allTasksComplete: true,
      status: "completed",
      completedAt: new Date().toISOString(),
    };

    const inquiryRef = ref(database, `volunteer_inquiries/${inquiryId}`);
    await firebaseUpdate(inquiryRef, updates);
    console.log(`✅ All tasks for inquiry ${inquiryId} marked complete`);
  },

  addInquiryHistoryEntry: async (inquiryId, entry) => {
    if (!database) {
      throw new Error("Firebase not configured.");
    }

    const inquiry = get().getInquiryById(inquiryId);
    if (!inquiry) {
      throw new Error("Inquiry not found");
    }

    const historyEntry: HistoryEntry = {
      ...entry,
      id: `history_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedHistory = [...inquiry.history, historyEntry];
    const inquiryRef = ref(database, `volunteer_inquiries/${inquiryId}`);
    await firebaseUpdate(inquiryRef, { history: updatedHistory });
  },

  moveInquiryToDatabase: async (inquiryId, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured.");
    }

    const inquiry = get().getInquiryById(inquiryId);
    if (!inquiry) {
      throw new Error("Inquiry not found");
    }

    const now = new Date().toISOString();
    const volunteerId = `vol_${Date.now()}`;

    const volunteerRecord: VolunteerRecord = {
      id: volunteerId,
      originalInquiryId: inquiryId,
      firstName: inquiry.firstName,
      lastName: inquiry.lastName,
      email: inquiry.email,
      phoneNumber: inquiry.phoneNumber,
      interests: inquiry.selectedInterests,
      otherInterestDescription: inquiry.otherInterestDescription,
      monetaryDonationAmount: inquiry.monetaryDonationAmount,
      notes: inquiry.notes,
      addedAt: now,
      addedBy: userId,
      addedByName: userName,
      totalContactAttempts: 0,
      history: [
        {
          id: `history_${Date.now()}`,
          type: "note_added",
          description: "Moved to volunteer database",
          details: "All intake tasks completed",
          createdBy: userId,
          createdByName: userName,
          createdAt: now,
        },
      ],
    };

    // Add to volunteer database
    const volunteerRef = ref(database, `volunteer_database/${volunteerId}`);
    await firebaseSet(volunteerRef, volunteerRecord);

    // Update inquiry
    const inquiryRef = ref(database, `volunteer_inquiries/${inquiryId}`);
    await firebaseUpdate(inquiryRef, {
      movedToDatabaseAt: now,
      status: "completed",
    });

    console.log(`✅ Inquiry ${inquiryId} moved to volunteer database as ${volunteerId}`);
  },

  addVolunteerRecord: async (volunteerData, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured.");
    }

    const volunteerId = `vol_${Date.now()}`;
    const now = new Date().toISOString();

    const newVolunteer: VolunteerRecord = {
      ...volunteerData,
      id: volunteerId,
      addedAt: now,
      addedBy: userId,
      addedByName: userName,
      totalContactAttempts: 0,
      history: [
        {
          id: `history_${Date.now()}`,
          type: "note_added",
          description: "Volunteer record created",
          createdBy: userId,
          createdByName: userName,
          createdAt: now,
        },
      ],
    };

    const volunteerRef = ref(database, `volunteer_database/${volunteerId}`);
    await firebaseSet(volunteerRef, newVolunteer);
    console.log("✅ Volunteer record added to Firebase:", volunteerId);
  },

  updateVolunteerRecord: async (volunteerId, updates) => {
    if (!database) {
      throw new Error("Firebase not configured.");
    }

    const volunteerRef = ref(database, `volunteer_database/${volunteerId}`);
    await firebaseUpdate(volunteerRef, updates);
    console.log(`✅ Volunteer ${volunteerId} updated`);
  },

  deleteVolunteerRecord: async (volunteerId) => {
    if (!database) {
      throw new Error("Firebase not configured.");
    }

    const volunteerRef = ref(database, `volunteer_database/${volunteerId}`);
    await firebaseSet(volunteerRef, null);
    console.log(`✅ Volunteer ${volunteerId} deleted`);
  },

  addVolunteerHistoryEntry: async (volunteerId, entry) => {
    if (!database) {
      throw new Error("Firebase not configured.");
    }

    const volunteer = get().getVolunteerById(volunteerId);
    if (!volunteer) {
      throw new Error("Volunteer not found");
    }

    const historyEntry: HistoryEntry = {
      ...entry,
      id: `history_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedHistory = [...volunteer.history, historyEntry];
    const volunteerRef = ref(database, `volunteer_database/${volunteerId}`);
    await firebaseUpdate(volunteerRef, { history: updatedHistory });
  },

  updateRoutingRule: async (interestArea, userId, userName, updatedBy, updatedByName) => {
    if (!database) {
      throw new Error("Firebase not configured.");
    }

    const rule: VolunteerRoutingRule = {
      interestArea,
      assignedToUserId: userId,
      assignedToUserName: userName,
      updatedAt: new Date().toISOString(),
      updatedBy,
      updatedByName,
    };

    const ruleRef = ref(database, `volunteer_routing_rules/${interestArea}`);
    await firebaseSet(ruleRef, rule);
    console.log(`✅ Routing rule updated for ${interestArea}`);
  },

  getRoutingRuleForInterest: (interestArea) => {
    return get().routingRules.find((rule) => rule.interestArea === interestArea);
  },

  updateDonationSettings: async (settings, updatedBy, updatedByName) => {
    if (!database) {
      throw new Error("Firebase not configured.");
    }

    const currentSettings = get().donationSettings;
    const updatedSettings: MonetaryDonationSettings = {
      ...currentSettings,
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy,
      updatedByName,
    };

    const settingsRef = ref(database, "volunteer_donation_settings");
    await firebaseSet(settingsRef, updatedSettings);
    console.log("✅ Donation settings updated");
  },

  getInquiryById: (id) => {
    return get().inquiries.find((inquiry) => inquiry.id === id);
  },

  getVolunteerById: (id) => {
    return get().volunteers.find((volunteer) => volunteer.id === id);
  },

  getInquiriesForDebs: () => {
    return get().inquiries.filter((inquiry) => inquiry.assignedToDebs && inquiry.status !== "completed");
  },

  getPendingInquiries: () => {
    return get().inquiries.filter((inquiry) => inquiry.status === "pending");
  },
}));
