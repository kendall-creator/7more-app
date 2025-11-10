import { create } from "zustand";
import { ref, set as firebaseSet, onValue, update as firebaseUpdate, remove } from "firebase/database";
import { database } from "../config/firebase";
import { MonthlyReport, ReleaseFacilityCount, CallMetrics, MentorshipMetrics, DonorData, FinancialData, SocialMediaMetrics, WinConcernEntry } from "../types";
import { useParticipantStore } from "./participantStore";

interface ReportingState {
  monthlyReports: MonthlyReport[];
  isLoading: boolean;
}

interface ReportingActions {
  initializeFirebaseListener: () => void;
  createMonthlyReport: (month: number, year: number, createdBy: string, createdByName: string) => Promise<MonthlyReport>;
  updateMonthlyReport: (reportId: string, updates: Partial<MonthlyReport>) => Promise<void>;
  getReportForMonth: (month: number, year: number) => MonthlyReport | undefined;
  calculateMentorshipMetrics: (month: number, year: number) => MentorshipMetrics;
  updateReleaseFacilityCounts: (reportId: string, counts: ReleaseFacilityCount) => Promise<void>;
  updateCallMetrics: (reportId: string, callMetrics: CallMetrics) => Promise<void>;
  updateDonorData: (reportId: string, donorData: DonorData) => Promise<void>;
  updateFinancialData: (reportId: string, beginningBalance: number | null, endingBalance: number | null) => Promise<void>;
  updateSocialMediaMetrics: (reportId: string, socialMediaMetrics: SocialMediaMetrics) => Promise<void>;
  updateWinsAndConcerns: (reportId: string, wins: WinConcernEntry[], concerns: WinConcernEntry[]) => Promise<void>;
}

type ReportingStore = ReportingState & ReportingActions;

export const useReportingStore = create<ReportingStore>()((set, get) => ({
  monthlyReports: [],
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: () => {
    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    const reportsRef = ref(database, "monthlyReports");

    onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportsArray = Object.values(data) as MonthlyReport[];
        set({ monthlyReports: reportsArray, isLoading: false });
      } else {
        set({ monthlyReports: [], isLoading: false });
      }
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
}));

// Selectors
export const useMonthlyReports = () => useReportingStore((s) => s.monthlyReports);
export const useReportForMonth = (month: number, year: number) =>
  useReportingStore((s) => s.getReportForMonth(month, year));
