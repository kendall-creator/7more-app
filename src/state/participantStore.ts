import { create } from "zustand";
import { ref, set as firebaseSet, onValue, update as firebaseUpdate, remove } from "firebase/database";
import { database } from "../config/firebase";
import {
  Participant,
  ParticipantStatus,
  Note,
  HistoryEntry,
  ContactFormData,
  InitialContactFormData,
  MonthlyUpdateFormData,
  WeeklyUpdateFormData,
  MonthlyCheckInFormData,
  MonthlyReportFormData,
  GraduationApproval,
  ContactAttemptType,
  BridgeTeamFollowUpFormData,
} from "../types";

interface ParticipantState {
  participants: Participant[];
  isLoading: boolean;
}

interface ParticipantActions {
  addParticipant: (participant: Omit<Participant, "id" | "notes" | "history" | "submittedAt">) => Promise<void>;
  updateParticipantStatus: (participantId: string, newStatus: ParticipantStatus, userId: string, userName: string, details?: string) => Promise<void>;
  addNote: (participantId: string, content: string, userId: string, userName: string) => Promise<void>;
  addHistoryEntry: (participantId: string, entry: Omit<HistoryEntry, "id" | "createdAt">) => Promise<void>;
  assignToBridgeTeam: (participantId: string, userId: string) => Promise<void>;
  assignToMentorLeader: (participantId: string, userId: string) => Promise<void>;
  assignToMentor: (participantId: string, mentorId: string, leaderId: string, leaderName: string) => Promise<void>;
  recordContact: (formData: ContactFormData, userId: string, userName: string) => Promise<void>;
  recordBridgeFollowUp: (formData: BridgeTeamFollowUpFormData, userId: string, userName: string) => Promise<void>;
  recordInitialContact: (formData: InitialContactFormData, userId: string, userName: string) => Promise<void>;
  recordMonthlyUpdate: (formData: MonthlyUpdateFormData, userId: string, userName: string) => Promise<void>;
  recordWeeklyUpdate: (formData: WeeklyUpdateFormData, userId: string, userName: string) => Promise<void>;
  recordMonthlyCheckIn: (formData: MonthlyCheckInFormData, userId: string, userName: string) => Promise<void>;
  submitMonthlyReport: (formData: MonthlyReportFormData, userId: string, userName: string) => Promise<void>;
  updateDueDates: (participantId: string, nextWeeklyUpdateDue?: string, nextMonthlyCheckInDue?: string) => Promise<void>;
  updateContactInfo: (participantId: string, phoneNumber?: string, email?: string) => Promise<void>;
  addCompletedGraduationStep: (participantId: string, stepId: string) => Promise<void>;
  approveGraduation: (participantId: string, approval: GraduationApproval) => Promise<void>;
  getParticipantById: (id: string) => Participant | undefined;
  getParticipantsByStatus: (status: ParticipantStatus) => Participant[];
  getParticipantsForBridgeTeam: () => Participant[];
  getParticipantsForMentorLeader: () => Participant[];
  getParticipantsForMentor: (mentorId: string) => Participant[];
  getParticipantsWithOverdueUpdates: (mentorId?: string) => Participant[];
  deleteParticipant: (participantId: string) => Promise<void>;
  mergeParticipants: (sourceId: string, targetId: string, userId: string, userName: string) => Promise<void>;
  initializeFirebaseListener: () => void;
}

type ParticipantStore = ParticipantState & ParticipantActions;

export const useParticipantStore = create<ParticipantStore>()((set, get) => ({
  participants: [],
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: () => {
    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    const participantsRef = ref(database, "participants");

    onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const participantsArray = Object.values(data) as Participant[];
        set({ participants: participantsArray, isLoading: false });
      } else {
        set({ participants: [], isLoading: false });
      }
    });
  },

  addParticipant: async (participantData) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const newParticipant: Participant = {
      ...participantData,
      id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notes: [],
      history: [
        {
          id: `history_${Date.now()}`,
          type: "form_submitted",
          description: "Participant submitted intake form",
          createdAt: new Date().toISOString(),
        },
      ],
      submittedAt: new Date().toISOString(),
      movedToBridgeAt: new Date().toISOString(),
      completedGraduationSteps: [],
    };

    const participantRef = ref(database, `participants/${newParticipant.id}`);
    await firebaseSet(participantRef, newParticipant);
  },

  updateParticipantStatus: async (participantId, newStatus, userId, userName, details) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === participantId);
    if (!participant) return;

    const updatedParticipant = {
      ...participant,
      status: newStatus,
      history: [
        ...participant.history,
        {
          id: `history_${Date.now()}`,
          type: "status_change",
          description: `Status changed to ${newStatus}`,
          details,
          createdBy: userId,
          createdByName: userName,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const participantRef = ref(database, `participants/${participantId}`);
    await firebaseSet(participantRef, updatedParticipant);
  },

  addNote: async (participantId, content, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === participantId);
    if (!participant) return;

    const newNote: Note = {
      id: `note_${Date.now()}`,
      content,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
    };

    const newHistoryEntry: HistoryEntry = {
      id: `history_${Date.now()}`,
      type: "note_added",
      description: "Note added",
      details: content,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
    };

    const updatedParticipant = {
      ...participant,
      notes: [...participant.notes, newNote],
      history: [...participant.history, newHistoryEntry],
    };

    const participantRef = ref(database, `participants/${participantId}`);
    await firebaseSet(participantRef, updatedParticipant);
  },

  addHistoryEntry: async (participantId, entry) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === participantId);
    if (!participant) return;

    const newHistoryEntry: HistoryEntry = {
      ...entry,
      id: `history_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedParticipant = {
      ...participant,
      history: [...participant.history, newHistoryEntry],
    };

    const participantRef = ref(database, `participants/${participantId}`);
    await firebaseSet(participantRef, updatedParticipant);
  },

  assignToBridgeTeam: async (participantId, userId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participantRef = ref(database, `participants/${participantId}`);
    await firebaseUpdate(participantRef, {
      assignedBridgeTeamMember: userId,
    });
  },

  assignToMentorLeader: async (participantId, userId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participantRef = ref(database, `participants/${participantId}`);
    await firebaseUpdate(participantRef, {
      assignedMentorLeader: userId,
    });
  },

  assignToMentor: async (participantId, mentorId, leaderId, leaderName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === participantId);
    if (!participant) return;

    const now = new Date();
    const firstMonthlyReportDue = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updatedParticipant = {
      ...participant,
      assignedMentor: mentorId,
      assignedToMentorAt: now.toISOString(),
      nextMonthlyReportDue: firstMonthlyReportDue,
      status: "initial_contact_pending" as ParticipantStatus,
      history: [
        ...participant.history,
        {
          id: `history_${Date.now()}`,
          type: "assignment_change",
          description: "Assigned to mentor",
          createdBy: leaderId,
          createdByName: leaderName,
          createdAt: now.toISOString(),
        },
      ],
    };

    const participantRef = ref(database, `participants/${participantId}`);
    await firebaseSet(participantRef, updatedParticipant);
  },

  recordContact: async (formData, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === formData.participantId);
    if (!participant) {
      console.log("❌ Participant not found:", formData.participantId);
      return;
    }

    console.log("📝 Recording contact for participant:", participant.firstName, participant.lastName);
    console.log("Current status:", participant.status);
    console.log("Outcome type:", formData.outcomeType);

    let newStatus: ParticipantStatus = participant.status;
    let additionalFields: Partial<Participant> = {};

    if (formData.outcomeType === "successful") {
      newStatus = "pending_mentor";
      additionalFields.movedToMentorshipAt = new Date().toISOString();
    } else if (formData.outcomeType === "attempted") {
      newStatus = "bridge_attempted";
    } else if (formData.outcomeType === "unable") {
      newStatus = "bridge_unable";
    }

    console.log("New status will be:", newStatus);

    const updatedParticipant = {
      ...participant,
      ...additionalFields,
      status: newStatus,
      assignedBridgeTeamMember: userId,
      history: [
        ...participant.history,
        {
          id: `history_${Date.now()}`,
          type: formData.outcomeType === "successful" ? "status_change" : "contact_attempt",
          description: formData.outcomeType === "successful"
            ? "Bridge Team successfully contacted - moved to mentorship assignment queue"
            : `Contact ${formData.outcomeType}: ${formData.contactMethod}`,
          details: formData.contactNotes,
          createdBy: userId,
          createdByName: userName,
          createdAt: new Date().toISOString(),
          metadata: {
            contactDate: formData.contactDate,
            contactMethod: formData.contactMethod,
            outcomeType: formData.outcomeType,
            attemptType: formData.attemptType,
            unableReason: formData.unableReason,
          },
        },
      ],
    };

    console.log("✅ Saving to Firebase...");
    const participantRef = ref(database, `participants/${formData.participantId}`);
    await firebaseSet(participantRef, updatedParticipant);
    console.log("✅ Firebase save complete");
  },

  recordBridgeFollowUp: async (formData, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === formData.participantId);
    if (!participant) return;

    const now = new Date().toISOString();

    // Check if Ben Reid transitional home is selected
    const isBenReid = formData.transitionalHomeName === "Ben Reid / Southeast Texas Transitional Center";

    const updatedParticipant = {
      ...participant,
      // Section 1
      participantInfoConfirmed: formData.participantInfoConfirmed,
      participantInfoConfirmedAt: formData.participantInfoConfirmed ? now : participant.participantInfoConfirmedAt,
      participantInfoConfirmedBy: formData.participantInfoConfirmed ? userId : participant.participantInfoConfirmedBy,

      // Section 2
      onParole: formData.onParole,
      onProbation: formData.onProbation,
      onSexOffenderRegistry: formData.onSexOffenderRegistry,
      onChildOffenderRegistry: formData.onChildOffenderRegistry,
      otherLegalRestrictions: formData.otherLegalRestrictions,

      // Section 3
      needsPhoneCall: formData.needsPhoneCall,
      needsEmployment: formData.needsEmployment,
      needsHousing: formData.needsHousing,
      needsClothing: formData.needsClothing,
      needsFood: formData.needsFood,
      currentHousingSituation: formData.currentHousingSituation,
      currentHousingOther: formData.currentHousingOther,
      transitionalHomeName: formData.transitionalHomeName,
      transitionalHomeNameOther: formData.transitionalHomeNameOther,
      highPriorityHousingBenReid: isBenReid,

      // Section 4
      weeklyCallExplained: formData.weeklyCallExplained,

      // Section 5
      resourcesSent: formData.resourcesSent,
      resourcesSentList: formData.resourcesSentList,
      resourcesOtherDescription: formData.resourcesOtherDescription,
      resourceNotes: formData.resourceNotes,

      history: [
        ...participant.history,
        {
          id: `history_${Date.now()}`,
          type: "form_submitted" as const,
          description: "Bridge Team Follow-Up Form completed",
          createdBy: userId,
          createdByName: userName,
          createdAt: now,
          metadata: {
            participantInfoConfirmed: formData.participantInfoConfirmed,
            onParole: formData.onParole,
            onProbation: formData.onProbation,
            onSexOffenderRegistry: formData.onSexOffenderRegistry,
            onChildOffenderRegistry: formData.onChildOffenderRegistry,
            otherLegalRestrictions: formData.otherLegalRestrictions,
            needsPhoneCall: formData.needsPhoneCall,
            needsEmployment: formData.needsEmployment,
            needsHousing: formData.needsHousing,
            needsClothing: formData.needsClothing,
            needsFood: formData.needsFood,
            currentHousingSituation: formData.currentHousingSituation,
            transitionalHomeName: formData.transitionalHomeName,
            highPriorityHousingBenReid: isBenReid,
            weeklyCallExplained: formData.weeklyCallExplained,
            resourcesSent: formData.resourcesSent,
            resourcesSentList: formData.resourcesSentList,
            resourceNotes: formData.resourceNotes,
          },
        },
      ],
    };

    const participantRef = ref(database, `participants/${formData.participantId}`);
    await firebaseSet(participantRef, updatedParticipant);
  },

  recordInitialContact: async (formData, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === formData.participantId);
    if (!participant) {
      console.log("❌ Participant not found:", formData.participantId);
      return;
    }

    const now = new Date();

    // Handle different contact outcomes
    if (formData.contactOutcome === "attempted") {
      console.log("📝 Recording attempted contact for participant:", participant.firstName, participant.lastName);
      console.log("Current status:", participant.status);

      // Contact was attempted but not successful - update status to bridge_attempted
      const updatedParticipant = {
        ...participant,
        status: "bridge_attempted" as ParticipantStatus,
        history: [
          ...participant.history,
          {
            id: `history_${Date.now()}`,
            type: "contact_attempt" as const,
            description: "Contact attempt recorded",
            details: formData.attemptNotes,
            createdBy: userId,
            createdByName: userName,
            createdAt: now.toISOString(),
            metadata: {
              contactDate: formData.contactDate,
              attemptType: formData.attemptType,
              attemptNotes: formData.attemptNotes,
            },
          },
        ],
      };

      console.log("✅ Updating participant status to:", updatedParticipant.status);
      console.log("Notes:", formData.attemptNotes);

      const participantRef = ref(database, `participants/${formData.participantId}`);
      await firebaseSet(participantRef, updatedParticipant);

      console.log("✅ Firebase update complete for participant:", formData.participantId);
      return;
    }

    if (formData.contactOutcome === "unable") {
      // Unable to contact participant - update status to bridge_unable
      const updatedParticipant = {
        ...participant,
        status: "bridge_unable" as ParticipantStatus,
        history: [
          ...participant.history,
          {
            id: `history_${Date.now()}`,
            type: "contact_attempt" as const,
            description: "Unable to contact participant",
            details: formData.unableReason,
            createdBy: userId,
            createdByName: userName,
            createdAt: now.toISOString(),
            metadata: {
              contactDate: formData.contactDate,
              unableReason: formData.unableReason,
            },
          },
        ],
      };

      const participantRef = ref(database, `participants/${formData.participantId}`);
      await firebaseSet(participantRef, updatedParticipant);
      return;
    }

    // Successful contact - proceed with full initial contact setup
    const nextWeeklyDue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const nextMonthlyDue = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updatedParticipant = {
      ...participant,
      status: "active_mentorship" as ParticipantStatus,
      initialContactCompletedAt: now.toISOString(),
      nextWeeklyUpdateDue: nextWeeklyDue,
      nextMonthlyCheckInDue: nextMonthlyDue,
      history: [
        ...participant.history,
        {
          id: `history_${Date.now()}`,
          type: "form_submitted",
          description: "Initial contact form completed - weekly updates and monthly check-ins scheduled",
          details: formData.additionalNotes,
          createdBy: userId,
          createdByName: userName,
          createdAt: now.toISOString(),
          metadata: {
            contactDate: formData.contactDate,
            contactOutcome: formData.contactOutcome,
            mentorshipOffered: formData.mentorshipOffered,
            livingSituation: formData.livingSituation,
            livingSituationDetail: formData.livingSituationDetail,
            employmentStatus: formData.employmentStatus,
            clothingNeeds: formData.clothingNeeds,
            openInvitationToCall: formData.openInvitationToCall,
            prayerOffered: formData.prayerOffered,
            additionalNotes: formData.additionalNotes,
            guidanceNeeded: formData.guidanceNeeded,
            guidanceNotes: formData.guidanceNotes,
            nextWeeklyUpdateDue: nextWeeklyDue,
            nextMonthlyCheckInDue: nextMonthlyDue,
          },
        },
      ],
    };

    const participantRef = ref(database, `participants/${formData.participantId}`);
    await firebaseSet(participantRef, updatedParticipant);

    // If guidance is needed, create a guidance task
    if (formData.guidanceNeeded && formData.guidanceNotes && formData.guidanceNotes.trim()) {
      const { useGuidanceStore } = await import("./guidanceStore");
      const createGuidanceTask = useGuidanceStore.getState().createGuidanceTask;
      await createGuidanceTask(
        formData.participantId,
        `${participant.firstName} ${participant.lastName}`,
        userId,
        userName,
        formData.guidanceNotes
      );
    }
  },

  recordMonthlyUpdate: async (formData, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === formData.participantId);
    if (!participant) return;

    const updatedParticipant = {
      ...participant,
      history: [
        ...participant.history,
        {
          id: `history_${Date.now()}`,
          type: "form_submitted",
          description: "Monthly update form completed",
          createdBy: userId,
          createdByName: userName,
          createdAt: new Date().toISOString(),
          metadata: {
            updateDate: formData.updateDate,
            contactFrequency: formData.contactFrequency,
            progressNotes: formData.progressNotes,
            challengesFaced: formData.challengesFaced,
            goalsProgress: formData.goalsProgress,
            nextMonthGoals: formData.nextMonthGoals,
          },
        },
      ],
    };

    const participantRef = ref(database, `participants/${formData.participantId}`);
    await firebaseSet(participantRef, updatedParticipant);
  },

  recordWeeklyUpdate: async (formData, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === formData.participantId);
    if (!participant) return;

    const now = new Date();
    const nextWeeklyDue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const updatedParticipant = {
      ...participant,
      lastWeeklyUpdateAt: now.toISOString(),
      nextWeeklyUpdateDue: nextWeeklyDue,
      history: [
        ...participant.history,
        {
          id: `history_${Date.now()}`,
          type: "form_submitted",
          description: "Weekly update form completed",
          createdBy: userId,
          createdByName: userName,
          createdAt: now.toISOString(),
          metadata: {
            updateDate: formData.updateDate,
            contactThisWeek: formData.contactThisWeek,
            contactMethod: formData.contactMethod,
            progressUpdate: formData.progressUpdate,
            challengesThisWeek: formData.challengesThisWeek,
            supportNeeded: formData.supportNeeded,
          },
        },
      ],
    };

    const participantRef = ref(database, `participants/${formData.participantId}`);
    await firebaseSet(participantRef, updatedParticipant);
  },

  recordMonthlyCheckIn: async (formData, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === formData.participantId);
    if (!participant) return;

    const now = new Date();
    const nextMonthlyDue = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updatedParticipant = {
      ...participant,
      lastMonthlyCheckInAt: now.toISOString(),
      nextMonthlyCheckInDue: nextMonthlyDue,
      completedGraduationSteps: [
        ...new Set([...(participant.completedGraduationSteps || []), ...formData.completedSteps]),
      ],
      history: [
        ...participant.history,
        {
          id: `history_${Date.now()}`,
          type: "form_submitted",
          description: "Monthly check-in form completed",
          createdBy: userId,
          createdByName: userName,
          createdAt: now.toISOString(),
          metadata: {
            checkInDate: formData.checkInDate,
            accomplishmentsSinceLastCheckIn: formData.accomplishmentsSinceLastCheckIn,
            challengesFaced: formData.challengesFaced,
            completedSteps: formData.completedSteps,
            notableChanges: formData.notableChanges,
            additionalNotes: formData.additionalNotes,
          },
        },
      ],
    };

    const participantRef = ref(database, `participants/${formData.participantId}`);
    await firebaseSet(participantRef, updatedParticipant);
  },

  submitMonthlyReport: async (formData, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === formData.participantId);
    if (!participant) return;

    const now = new Date();
    const nextReportDue = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updatedParticipant = {
      ...participant,
      lastMonthlyReportAt: now.toISOString(),
      nextMonthlyReportDue: nextReportDue,
      history: [
        ...participant.history,
        {
          id: `history_${Date.now()}`,
          type: "form_submitted",
          description: "Monthly report submitted",
          createdBy: userId,
          createdByName: userName,
          createdAt: now.toISOString(),
          metadata: {
            reportDate: formData.reportDate,
            updates: formData.updates,
          },
        },
      ],
    };

    const participantRef = ref(database, `participants/${formData.participantId}`);
    await firebaseSet(participantRef, updatedParticipant);
  },

  updateDueDates: async (participantId, nextWeeklyUpdateDue, nextMonthlyCheckInDue) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const updates: Record<string, any> = {};
    if (nextWeeklyUpdateDue !== undefined) updates.nextWeeklyUpdateDue = nextWeeklyUpdateDue;
    if (nextMonthlyCheckInDue !== undefined) updates.nextMonthlyCheckInDue = nextMonthlyCheckInDue;

    const participantRef = ref(database, `participants/${participantId}`);
    await firebaseUpdate(participantRef, updates);
  },

  updateContactInfo: async (participantId, phoneNumber, email) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const updates: Record<string, any> = {};
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (email !== undefined) updates.email = email;

    const participantRef = ref(database, `participants/${participantId}`);
    await firebaseUpdate(participantRef, updates);
  },

  addCompletedGraduationStep: async (participantId, stepId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === participantId);
    if (!participant) return;

    const updatedSteps = [...new Set([...(participant.completedGraduationSteps || []), stepId])];

    const participantRef = ref(database, `participants/${participantId}`);
    await firebaseUpdate(participantRef, {
      completedGraduationSteps: updatedSteps,
    });
  },

  approveGraduation: async (participantId, approval) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participant = get().participants.find((p) => p.id === participantId);
    if (!participant) return;

    const updatedParticipant = {
      ...participant,
      status: "graduated" as ParticipantStatus,
      graduatedAt: new Date().toISOString(),
      graduationApproval: approval,
      history: [
        ...participant.history,
        {
          id: `history_${Date.now()}`,
          type: "status_change",
          description: "Graduated from mentorship program",
          details: approval.notes,
          createdBy: approval.approvedBy,
          createdByName: approval.approvedByName,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const participantRef = ref(database, `participants/${participantId}`);
    await firebaseSet(participantRef, updatedParticipant);
  },

  getParticipantById: (id) => {
    return get().participants.find((p) => p.id === id);
  },

  getParticipantsByStatus: (status) => {
    return get().participants.filter((p) => p.status === status);
  },

  getParticipantsForBridgeTeam: () => {
    return get().participants.filter((p) =>
      ["pending_bridge", "bridge_attempted", "bridge_contacted"].includes(p.status)
    );
  },

  getParticipantsForMentorLeader: () => {
    return get().participants.filter((p) => p.status === "pending_mentor");
  },

  getParticipantsForMentor: (mentorId) => {
    return get().participants.filter((p) => p.assignedMentor === mentorId);
  },

  getParticipantsWithOverdueUpdates: (mentorId) => {
    const now = new Date().toISOString();
    const allParticipants = get().participants.filter((p) => {
      if (p.status !== "active_mentorship") return false;
      if (mentorId && p.assignedMentor !== mentorId) return false;

      const weeklyOverdue = p.nextWeeklyUpdateDue && p.nextWeeklyUpdateDue < now;
      const monthlyOverdue = p.nextMonthlyCheckInDue && p.nextMonthlyCheckInDue < now;

      return weeklyOverdue || monthlyOverdue;
    });

    return allParticipants;
  },

  deleteParticipant: async (participantId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const participantRef = ref(database, `participants/${participantId}`);
    await remove(participantRef);
  },

  mergeParticipants: async (sourceId, targetId, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const source = get().participants.find((p) => p.id === sourceId);
    const target = get().participants.find((p) => p.id === targetId);

    if (!source || !target) return;

    const mergedNotes = [...target.notes, ...source.notes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const mergedHistory = [...target.history, ...source.history].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const mergeHistoryEntry: HistoryEntry = {
      id: `history_${Date.now()}`,
      type: "note_added",
      description: `Merged participant ${source.firstName} ${source.lastName} (${source.participantNumber}) into this profile`,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
    };

    const updatedTarget = {
      ...target,
      notes: mergedNotes,
      history: [...mergedHistory, mergeHistoryEntry],
    };

    const targetRef = ref(database, `participants/${targetId}`);
    await firebaseSet(targetRef, updatedTarget);

    await get().deleteParticipant(sourceId);
  },
}));

// Selectors
export const useAllParticipants = () => useParticipantStore((s) => s.participants);
export const useParticipantCount = () => useParticipantStore((s) => s.participants.length);
