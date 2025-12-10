import { create } from "zustand";
import { ref, set as firebaseSet, onValue, update as firebaseUpdate, remove } from "firebase/database";
import { database } from "../config/firebase";
import { MonthlyReport, ReleaseFacilityCount, CallMetrics, MentorshipMetrics, DonorData, FinancialData, SocialMediaMetrics, WinConcernEntry, BridgeTeamMetrics } from "../types";
import { useParticipantStore } from "./participantStore";

interface ReportingState {
  monthlyReports: MonthlyReport[];
  isLoading: boolean;
}

interface ReportingActions {
  initializeFirebaseListener: () => void;
  createMonthlyReport: (month: number, year: number, createdBy: string, createdByName: string) => Promise<MonthlyReport>;
  updateMonthlyReport: (reportId: string, updates: Partial<MonthlyReport>) => Promise<void>;
  postReport: (reportId: string, postedBy: string, postedByName: string) => Promise<void>;
  getReportForMonth: (month: number, year: number) => MonthlyReport | undefined;
  getPostedReports: () => MonthlyReport[];
  getMostRecentPostedReport: () => MonthlyReport | undefined;
  calculateMentorshipMetrics: (month: number, year: number) => MentorshipMetrics;
  calculateBridgeTeamMetrics: (month: number, year: number) => BridgeTeamMetrics;
  updateReleaseFacilityCounts: (reportId: string, counts: ReleaseFacilityCount) => Promise<void>;
  updateCallMetrics: (reportId: string, callMetrics: CallMetrics) => Promise<void>;
  updateBridgeTeamMetrics: (reportId: string, bridgeTeamMetrics: BridgeTeamMetrics) => Promise<void>;
  updateDonorData: (reportId: string, donorData: DonorData) => Promise<void>;
  updateFinancialData: (reportId: string, beginningBalance: number | null, endingBalance: number | null) => Promise<void>;
  updateSocialMediaMetrics: (reportId: string, socialMediaMetrics: SocialMediaMetrics) => Promise<void>;
  updateWinsAndConcerns: (reportId: string, wins: WinConcernEntry[], concerns: WinConcernEntry[]) => Promise<void>;
}

type ReportingStore = ReportingState & ReportingActions;

let isListenerInitialized = false;

export const useReportingStore = create<ReportingStore>()((set, get) => ({
  monthlyReports: [],
  isLoading: false,

  // Initialize Firebase real-time listener
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

    onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportsArray = Object.values(data) as MonthlyReport[];
        console.log(`✅ Loaded ${reportsArray.length} monthly reports from Firebase`);
        set({ monthlyReports: reportsArray, isLoading: false });
      } else {
        set({ monthlyReports: [], isLoading: false });
      }
    }, (error) => {
      console.warn("Reporting listener unavailable");
      set({ isLoading: false });
    });
  },

  createMonthlyReport: async (month, year, createdBy, createdByName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    // Check if report already exists for this month
    const existingReport = get().getReportForMonth(month, year);
    if (existingReport) {
      return existingReport;
    }

    // Calculate metrics
    const mentorshipMetrics = get().calculateMentorshipMetrics(month, year);
    const bridgeTeamMetrics = get().calculateBridgeTeamMetrics(month, year);

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
      mentorshipMetrics,
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
      bridgeTeamMetrics,
      isPosted: false, // New reports default to unpublished
      createdBy,
      createdByName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const reportRef = ref(database, `monthlyReports/${newReport.id}`);
    await firebaseSet(reportRef, newReport);

    return newReport;
  },

  updateMonthlyReport: async (reportId, updates) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const reportRef = ref(database, `monthlyReports/${reportId}`);
    await firebaseUpdate(reportRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  getReportForMonth: (month, year) => {
    return get().monthlyReports.find((r) => r.month === month && r.year === year);
  },

  calculateMentorshipMetrics: (month, year) => {
    const participantStore = useParticipantStore.getState();
    const participants = participantStore.participants;

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    let participantsAssignedToMentorship = 0;

    participants.forEach((p) => {
      // Check if participant was assigned to mentorship during this month
      if (p.assignedToMentorAt) {
        const assignedDate = new Date(p.assignedToMentorAt);
        if (assignedDate >= startDate && assignedDate <= endDate) {
          participantsAssignedToMentorship++;
        }
      }
    });

    return {
      participantsAssignedToMentorship,
    };
  },

  calculateBridgeTeamMetrics: (month, year) => {
    const participantStore = useParticipantStore.getState();
    const participants = participantStore.participants;

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Initialize counters
    let participantsReceived = 0;
    let pendingBridge = 0;
    let attemptedToContact = 0;
    let contacted = 0;
    let unableToContact = 0;
    let totalDaysToFirstOutreach = 0;
    let outreachCount = 0;

    const formsByDayOfWeek = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };

    participants.forEach((p) => {
      // Count participants received by Bridge Team during this month
      if (p.submittedAt) {
        const submittedDate = new Date(p.submittedAt);
        if (submittedDate >= startDate && submittedDate <= endDate) {
          participantsReceived++;

          // Track day of week for form submissions
          const dayOfWeek = submittedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
          const dayKey = dayNames[dayOfWeek] as keyof typeof formsByDayOfWeek;
          formsByDayOfWeek[dayKey]++;
        }
      }

      // Check history entries for status changes during this month
      p.history?.forEach((entry) => {
        const entryDate = new Date(entry.createdAt);
        if (entryDate >= startDate && entryDate <= endDate) {
          // Count status changes based on type and metadata
          if (entry.type === "status_change") {
            const newStatus = entry.metadata?.newStatus as string;

            // Count pending bridge status
            if (newStatus === "pending_bridge") {
              pendingBridge++;
            }

            // Count attempted to contact
            if (newStatus === "bridge_attempted") {
              attemptedToContact++;
            }

            // Count contacted
            if (newStatus === "bridge_contacted") {
              contacted++;

              // Calculate days to first outreach
              if (p.submittedAt) {
                const submittedDate = new Date(p.submittedAt);
                const contactedDate = new Date(entry.createdAt);
                const daysToOutreach = Math.floor((contactedDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
                totalDaysToFirstOutreach += daysToOutreach;
                outreachCount++;
              }
            }

            // Count unable to contact
            if (newStatus === "bridge_unable") {
              unableToContact++;
            }
          }
        }
      });
    });

    // Calculate average days to first outreach
    const averageDaysToFirstOutreach = outreachCount > 0 ? Math.round(totalDaysToFirstOutreach / outreachCount) : 0;

    // Find top day
    const days = Object.entries(formsByDayOfWeek);
    const topDayEntry = days.reduce((max, day) => day[1] > max[1] ? day : max);
    const topDay = topDayEntry[0].charAt(0).toUpperCase() + topDayEntry[0].slice(1);

    return {
      participantsReceived: {
        autoCalculated: participantsReceived,
        manualOverride: null,
      },
      statusCounts: {
        pendingBridge: {
          autoCalculated: pendingBridge,
          manualOverride: null,
        },
        attemptedToContact: {
          autoCalculated: attemptedToContact,
          manualOverride: null,
        },
        contacted: {
          autoCalculated: contacted,
          manualOverride: null,
        },
        unableToContact: {
          autoCalculated: unableToContact,
          manualOverride: null,
        },
      },
      averageDaysToFirstOutreach: {
        autoCalculated: averageDaysToFirstOutreach,
        manualOverride: null,
      },
      formsByDayOfWeek: {
        ...formsByDayOfWeek,
        topDay,
      },
    };
  },

  updateReleaseFacilityCounts: async (reportId, counts) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    await get().updateMonthlyReport(reportId, {
      releaseFacilityCounts: counts,
    });
  },

  updateCallMetrics: async (reportId, callMetrics) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    await get().updateMonthlyReport(reportId, {
      callMetrics,
    });
  },

  updateBridgeTeamMetrics: async (reportId, bridgeTeamMetrics) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    await get().updateMonthlyReport(reportId, {
      bridgeTeamMetrics,
    });
  },

  updateDonorData: async (reportId, donorData) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    await get().updateMonthlyReport(reportId, {
      donorData,
    });
  },

  updateFinancialData: async (reportId, beginningBalance, endingBalance) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const difference = (endingBalance ?? 0) - (beginningBalance ?? 0);

    await get().updateMonthlyReport(reportId, {
      financialData: {
        beginningBalance,
        endingBalance,
        difference,
      },
    });
  },

  updateSocialMediaMetrics: async (reportId, socialMediaMetrics) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    await get().updateMonthlyReport(reportId, {
      socialMediaMetrics,
    });
  },

  updateWinsAndConcerns: async (reportId, wins, concerns) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    await get().updateMonthlyReport(reportId, {
      wins,
      concerns,
    });
  },

  postReport: async (reportId, postedBy, postedByName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    await get().updateMonthlyReport(reportId, {
      isPosted: true,
      postedAt: new Date().toISOString(),
      postedBy,
      postedByName,
    });
  },

  getPostedReports: () => {
    return get().monthlyReports.filter((r) => r.isPosted);
  },

  getMostRecentPostedReport: () => {
    const postedReports = get().getPostedReports();
    if (postedReports.length === 0) return undefined;

    // Sort by year and month descending
    const sorted = [...postedReports].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });

    return sorted[0];
  },
}));

// Selectors
export const useMonthlyReports = () => useReportingStore((s) => s.monthlyReports);
export const useReportForMonth = (month: number, year: number) =>
  useReportingStore((s) => s.getReportForMonth(month, year));
