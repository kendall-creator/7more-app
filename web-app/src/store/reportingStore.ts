import { create } from "zustand";
import { ref, onValue, set as firebaseSet, update as firebaseUpdate } from "firebase/database";
import { database } from "../config/firebase";

interface MonthlyReport {
  id: string;
  month: number;
  year: number;
  releaseFacilityCounts: {
    pamLychner: number | null;
    huntsville: number | null;
    planeStateJail: number | null;
    havinsUnit: number | null;
    clemensUnit: number | null;
    other: number | null;
  };
  callMetrics: {
    inbound: number | null;
    outbound: number | null;
    missedCallsPercent: number | null;
    hungUpPriorToWelcome: number | null;
    hungUpWithin10Seconds: number | null;
    missedDueToNoAnswer: number | null;
  };
  mentorshipMetrics: {
    participantsAssignedToMentorship: number;
  };
  bridgeTeamMetrics: {
    participantsReceived: {
      autoCalculated: number;
      manualOverride: number | null;
    };
    statusCounts: {
      pendingBridge: {
        autoCalculated: number;
        manualOverride: number | null;
      };
      attemptedToContact: {
        autoCalculated: number;
        manualOverride: number | null;
      };
      contacted: {
        autoCalculated: number;
        manualOverride: number | null;
      };
      unableToContact: {
        autoCalculated: number;
        manualOverride: number | null;
      };
    };
    averageDaysToFirstOutreach: {
      autoCalculated: number;
      manualOverride: number | null;
    };
    formsByDayOfWeek: {
      monday: number;
      tuesday: number;
      wednesday: number;
      thursday: number;
      friday: number;
      saturday: number;
      sunday: number;
      topDay: string;
    };
  };
  donorData: {
    newDonors: number | null;
    amountFromNewDonors: number | null;
    checks: number | null;
    totalFromChecks: number | null;
  };
  financialData: {
    beginningBalance: number | null;
    endingBalance: number | null;
    difference: number;
  };
  socialMediaMetrics: {
    reelsPostViews: number | null;
    viewsFromNonFollowers: number | null;
    followers: number | null;
    followersGained: number | null;
  };
  wins?: Array<{ title: string; body: string }>;
  concerns?: Array<{ title: string; body: string }>;
  isPosted: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  postedBy?: string;
  postedByName?: string;
  postedAt?: string;
}

interface ReportingState {
  monthlyReports: MonthlyReport[];
  isLoading: boolean;
  initializeFirebaseListener: () => void;
  createMonthlyReport: (month: number, year: number, createdBy: string, createdByName: string) => Promise<MonthlyReport>;
  updateReleaseFacilityCounts: (reportId: string, counts: any) => Promise<void>;
  updateCallMetrics: (reportId: string, callMetrics: any) => Promise<void>;
  updateDonorData: (reportId: string, donorData: any) => Promise<void>;
  updateFinancialData: (reportId: string, beginningBalance: number | null, endingBalance: number | null) => Promise<void>;
  updateSocialMediaMetrics: (reportId: string, socialMediaMetrics: any) => Promise<void>;
  getReportForMonth: (month: number, year: number) => MonthlyReport | undefined;
  getPostedReports: () => MonthlyReport[];
  getMostRecentPostedReport: () => MonthlyReport | undefined;
}

let isListenerInitialized = false;

export const useReportingStore = create<ReportingState>()((set, get) => ({
  monthlyReports: [],
  isLoading: false,

  initializeFirebaseListener: () => {
    // Prevent multiple listener initializations
    if (isListenerInitialized) {
      console.log("⚠️ [Reporting] listener already initialized, skipping...");
      return;
    }

    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    console.log("🔥 Initializing reporting Firebase listener...");
    isListenerInitialized = true;

    const reportsRef = ref(database, "monthlyReports");

    onValue(
      reportsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const reportsArray = Object.values(data) as MonthlyReport[];
          console.log(`✅ Loaded ${reportsArray.length} monthly reports from Firebase`);
          set({ monthlyReports: reportsArray, isLoading: false });
        } else {
          console.log("📊 No monthly reports found in Firebase");
          set({ monthlyReports: [], isLoading: false });
        }
      },
      (error) => {
        console.warn("Reporting listener unavailable:", error);
        set({ isLoading: false });
      }
    );
  },

  getReportForMonth: (month, year) => {
    return get().monthlyReports.find((r) => r.month === month && r.year === year);
  },

  getPostedReports: () => {
    return get().monthlyReports.filter((r) => r.isPosted);
  },

  getMostRecentPostedReport: () => {
    const postedReports = get().getPostedReports();
    if (postedReports.length === 0) return undefined;

    return postedReports.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    })[0];
  },

  createMonthlyReport: async (month, year, createdBy, createdByName) => {
    if (!database) {
      throw new Error("Firebase not configured");
    }

    const existingReport = get().getReportForMonth(month, year);
    if (existingReport) {
      return existingReport;
    }

    const newReport: MonthlyReport = {
      id: `report_${year}_${month}_${Date.now()}`,
      month,
      year,
      releaseFacilityCounts: {
        pamLychner: null,
        huntsville: null,
        planeStateJail: null,
        havinsUnit: null,
        clemensUnit: null,
        other: null,
      },
      callMetrics: {
        inbound: null,
        outbound: null,
        missedCallsPercent: null,
        hungUpPriorToWelcome: null,
        hungUpWithin10Seconds: null,
        missedDueToNoAnswer: null,
      },
      mentorshipMetrics: {
        participantsAssignedToMentorship: 0,
      },
      bridgeTeamMetrics: {
        participantsReceived: { autoCalculated: 0, manualOverride: null },
        statusCounts: {
          pendingBridge: { autoCalculated: 0, manualOverride: null },
          attemptedToContact: { autoCalculated: 0, manualOverride: null },
          contacted: { autoCalculated: 0, manualOverride: null },
          unableToContact: { autoCalculated: 0, manualOverride: null },
        },
        averageDaysToFirstOutreach: { autoCalculated: 0, manualOverride: null },
        formsByDayOfWeek: {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0,
          topDay: "N/A",
        },
      },
      donorData: {
        newDonors: null,
        amountFromNewDonors: null,
        checks: null,
        totalFromChecks: null,
      },
      financialData: {
        beginningBalance: null,
        endingBalance: null,
        difference: 0,
      },
      socialMediaMetrics: {
        reelsPostViews: null,
        viewsFromNonFollowers: null,
        followers: null,
        followersGained: null,
      },
      wins: [],
      concerns: [],
      isPosted: false,
      createdBy,
      createdByName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const reportRef = ref(database, `monthlyReports/${newReport.id}`);
    await firebaseSet(reportRef, newReport);

    return newReport;
  },

  updateReleaseFacilityCounts: async (reportId, counts) => {
    if (!database) throw new Error("Firebase not configured");

    const reportRef = ref(database, `monthlyReports/${reportId}`);
    await firebaseUpdate(reportRef, {
      releaseFacilityCounts: counts,
      updatedAt: new Date().toISOString(),
    });
  },

  updateCallMetrics: async (reportId, callMetrics) => {
    if (!database) throw new Error("Firebase not configured");

    const reportRef = ref(database, `monthlyReports/${reportId}`);
    await firebaseUpdate(reportRef, {
      callMetrics,
      updatedAt: new Date().toISOString(),
    });
  },

  updateDonorData: async (reportId, donorData) => {
    if (!database) throw new Error("Firebase not configured");

    const reportRef = ref(database, `monthlyReports/${reportId}`);
    await firebaseUpdate(reportRef, {
      donorData,
      updatedAt: new Date().toISOString(),
    });
  },

  updateFinancialData: async (reportId, beginningBalance, endingBalance) => {
    if (!database) throw new Error("Firebase not configured");

    const difference = (endingBalance || 0) - (beginningBalance || 0);
    const reportRef = ref(database, `monthlyReports/${reportId}`);
    await firebaseUpdate(reportRef, {
      financialData: {
        beginningBalance,
        endingBalance,
        difference,
      },
      updatedAt: new Date().toISOString(),
    });
  },

  updateSocialMediaMetrics: async (reportId, socialMediaMetrics) => {
    if (!database) throw new Error("Firebase not configured");

    const reportRef = ref(database, `monthlyReports/${reportId}`);
    await firebaseUpdate(reportRef, {
      socialMediaMetrics,
      updatedAt: new Date().toISOString(),
    });
  },
}));
