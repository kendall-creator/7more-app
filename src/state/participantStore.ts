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
  bulkMoveToMentorship: (participantIds: string[], userId: string, userName: string) => Promise<void>;
  bulkAssignToMentor: (participantIds: string[], mentorId: string, leaderId: string, leaderName: string) => Promise<void>;
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
  findDuplicatesByPhone: (phoneNumber: string) => Participant[];
  findDuplicatesByEmail: (email: string) => Participant[];
  deleteParticipant: (participantId: string) => Promise<void>;
  mergeParticipants: (sourceId: string, targetId: string, userId: string, userName: string) => Promise<void>;
  initializeFirebaseListener: () => void;
}

type ParticipantStore = ParticipantState & ParticipantActions;

let isListenerInitialized = false;

export const useParticipantStore = create<ParticipantStore>()((set, get) => ({
  participants: [],
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: () => {
    // Prevent multiple listener initializations
    if (isListenerInitialized) {
      console.log("⚠️ Participant listener already initialized, skipping...");
      return;
    }

    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    console.log("🔥 Initializing participant Firebase listener...");
    isListenerInitialized = true;

    const participantsRef = ref(database, "participants");

    onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const participantsArray = Object.values(data) as Participant[];
        console.log(`✅ Loaded ${participantsArray.length} participants from Firebase`);
        set({ participants: participantsArray, isLoading: false });
      } else {
        console.log("✅ No participants in Firebase, setting empty array");
        set({ participants: [], isLoading: false });
      }
    }, (error) => {
      console.error("❌ Error in participant listener:", error);
      set({ isLoading: false });
    });
  },

  addParticipant: async (participantData) => {
    console.log("🔵 addParticipant called with:", participantData);

    if (!database) {
      const error = "Firebase not configured. Please add Firebase credentials in ENV tab.";
      console.error("❌ addParticipant failed:", error);
      throw new Error(error);
    }

    // Clean participantData to remove undefined values (Firebase doesn't accept undefined)
    const cleanedData = Object.entries(participantData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    const newParticipant: Participant = {
      ...cleanedData,
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

    console.log("🔵 Writing participant to Firebase:", {
      id: newParticipant.id,
      name: `${newParticipant.firstName} ${newParticipant.lastName}`,
      number: newParticipant.participantNumber
    });

    try {
      const participantRef = ref(database, `participants/${newParticipant.id}`);
      await firebaseSet(participantRef, newParticipant);
      console.log("✅ Participant written to Firebase successfully:", newParticipant.id);
    } catch (error) {
      console.error("❌ Firebase write failed:", error);
      throw error;
    }
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
    if (!participant) {
      throw new Error("Participant not found");
    }

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

    // Clean the participant object to remove any undefined values before spreading
    const cleanParticipant = Object.entries(participant).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    const updatedParticipant = {
      ...cleanParticipant,
      notes: [...(participant.notes || []), newNote],
      history: [...(participant.history || []), newHistoryEntry],
    };

    try {
      const participantRef = ref(database, `participants/${participantId}`);
      await firebaseSet(participantRef, updatedParticipant);
      console.log("✅ Note added successfully to participant:", participantId);
    } catch (error) {
      console.error("❌ Failed to add note:", error);
      const errorMessage = error instanceof Error ? error.message : "Firebase write failed";
      throw new Error(`Failed to save note: ${errorMessage}`);
    }
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
    const initialContactDue = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days for initial contact

    const updatedParticipant = {
      ...participant,
      assignedMentor: mentorId,
      assignedToMentorAt: now.toISOString(),
      nextMonthlyReportDue: firstMonthlyReportDue,
      status: "initial_contact_pending" as ParticipantStatus,
      // Set mentee tracking fields
      menteeStatus: "needs_initial_contact" as Participant["menteeStatus"],
      initialContactDueDate: initialContactDue,
      numberOfContactAttempts: 0,
      history: [
        ...participant.history,
        {
          id: `history_${Date.now()}`,
          type: "assignment_change",
          description: `Assigned to mentor - initial contact due in 10 days`,
          createdBy: leaderId,
          createdByName: leaderName,
          createdAt: now.toISOString(),
        },
      ],
    };

    const participantRef = ref(database, `participants/${participantId}`);
    await firebaseSet(participantRef, updatedParticipant);
  },

  bulkMoveToMentorship: async (participantIds, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    console.log(`🔄 Bulk moving ${participantIds.length} participants to mentorship...`);

    const now = new Date().toISOString();

    // Process each participant
    for (const participantId of participantIds) {
      const participant = get().participants.find((p) => p.id === participantId);
      if (!participant) {
        console.warn(`⚠️ Participant ${participantId} not found, skipping...`);
        continue;
      }

      // Only move if in bridge team statuses
      if (!["pending_bridge", "bridge_attempted", "bridge_contacted", "bridge_unable"].includes(participant.status)) {
        console.warn(`⚠️ Participant ${participant.firstName} ${participant.lastName} is not in bridge team status, skipping...`);
        continue;
      }

      const updatedParticipant = {
        ...participant,
        status: "pending_mentor" as ParticipantStatus,
        movedToMentorshipAt: now,
        assignedBridgeTeamMember: userId,
        history: [
          ...participant.history,
          {
            id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: "status_change" as const,
            description: "Bulk moved to mentorship assignment queue",
            createdBy: userId,
            createdByName: userName,
            createdAt: now,
          },
        ],
      };

      const participantRef = ref(database, `participants/${participantId}`);
      await firebaseSet(participantRef, updatedParticipant);
      console.log(`✅ Moved ${participant.firstName} ${participant.lastName} to mentorship`);
    }

    console.log(`✅ Bulk move complete: ${participantIds.length} participants processed`);
  },

  bulkAssignToMentor: async (participantIds, mentorId, leaderId, leaderName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    console.log(`🔄 Bulk assigning ${participantIds.length} participants to mentor...`);

    const now = new Date();
    const firstMonthlyReportDue = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Process each participant
    for (const participantId of participantIds) {
      const participant = get().participants.find((p) => p.id === participantId);
      if (!participant) {
        console.warn(`⚠️ Participant ${participantId} not found, skipping...`);
        continue;
      }

      // Only assign if in pending_mentor status
      if (participant.status !== "pending_mentor") {
        console.warn(`⚠️ Participant ${participant.firstName} ${participant.lastName} is not pending mentor assignment, skipping...`);
        continue;
      }

      const updatedParticipant = {
        ...participant,
        assignedMentor: mentorId,
        assignedToMentorAt: now.toISOString(),
        nextMonthlyReportDue: firstMonthlyReportDue,
        status: "initial_contact_pending" as ParticipantStatus,
        history: [
          ...participant.history,
          {
            id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: "assignment_change" as const,
            description: "Bulk assigned to mentor",
            createdBy: leaderId,
            createdByName: leaderName,
            createdAt: now.toISOString(),
          },
        ],
      };

      const participantRef = ref(database, `participants/${participantId}`);
      await firebaseSet(participantRef, updatedParticipant);
      console.log(`✅ Assigned ${participant.firstName} ${participant.lastName} to mentor`);
    }

    console.log(`✅ Bulk assignment complete: ${participantIds.length} participants processed`);
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

    // Build metadata object without undefined values
    const metadata: any = {
      contactDate: formData.contactDate,
      contactMethod: formData.contactMethod,
      outcomeType: formData.outcomeType,
    };

    // Only add optional fields if they have values
    if (formData.attemptType) {
      metadata.attemptType = formData.attemptType;
    }
    if (formData.unableReason) {
      metadata.unableReason = formData.unableReason;
    }

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
          metadata,
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

    // Determine if this is a mentor or bridge team context based on current status
    const isMentorContext = ["initial_contact_pending", "mentor_attempted", "mentor_unable", "active_mentorship"].includes(participant.status);

    // Handle different contact outcomes
    if (formData.contactOutcome === "attempted") {
      console.log("📝 Recording attempted contact for participant:", participant.firstName, participant.lastName);
      console.log("Current status:", participant.status);
      console.log("Context:", isMentorContext ? "Mentor" : "Bridge Team");

      // Determine new status based on context
      const newStatus: ParticipantStatus = isMentorContext ? "mentor_attempted" : "bridge_attempted";

      // Increment contact attempts and update mentee tracking
      const currentAttempts = participant.numberOfContactAttempts || 0;
      const newAttempts = currentAttempts + 1;

      // Check if this should move to unable_to_contact (3 attempts + 30 days)
      let finalStatus: ParticipantStatus = newStatus;
      let menteeStatus: Participant["menteeStatus"] = "attempt_made";

      if (newAttempts >= 3 && participant.lastAttemptDate) {
        const firstAttemptDate = new Date(participant.lastAttemptDate);
        const daysSinceFirstAttempt = Math.floor((now.getTime() - firstAttemptDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceFirstAttempt >= 30) {
          finalStatus = "unable_to_contact";
          menteeStatus = "unable_to_contact";
        }
      }

      // Contact was attempted but not successful
      const updatedParticipant = {
        ...participant,
        status: finalStatus,
        numberOfContactAttempts: newAttempts,
        lastAttemptDate: formData.contactDate,
        menteeStatus,
        history: [
          ...participant.history,
          {
            id: `history_${Date.now()}`,
            type: "contact_attempt" as const,
            description: isMentorContext ? "Mentor contact attempt recorded" : "Bridge Team contact attempt recorded",
            details: formData.attemptNotes,
            createdBy: userId,
            createdByName: userName,
            createdAt: now.toISOString(),
            metadata: {
              contactDate: formData.contactDate,
              attemptType: formData.attemptType,
              attemptNotes: formData.attemptNotes,
              attemptNumber: newAttempts,
            },
          },
        ],
      };

      console.log("✅ Updating participant status to:", updatedParticipant.status);
      console.log("Notes:", formData.attemptNotes);
      console.log("Attempt number:", newAttempts);

      const participantRef = ref(database, `participants/${formData.participantId}`);
      await firebaseSet(participantRef, updatedParticipant);

      console.log("✅ Firebase update complete for participant:", formData.participantId);
      return;
    }

    if (formData.contactOutcome === "unable") {
      console.log("📝 Recording unable to contact for participant:", participant.firstName, participant.lastName);
      console.log("Current status:", participant.status);
      console.log("Context:", isMentorContext ? "Mentor" : "Bridge Team");

      // Determine new status based on context
      const newStatus: ParticipantStatus = isMentorContext ? "mentor_unable" : "bridge_unable";

      // Unable to contact participant
      const updatedParticipant = {
        ...participant,
        status: newStatus,
        menteeStatus: "unable_to_contact" as Participant["menteeStatus"],
        unableToContactDate: formData.contactDate,
        numberOfContactAttempts: (participant.numberOfContactAttempts || 0) + 1,
        lastAttemptDate: formData.contactDate,
        history: [
          ...participant.history,
          {
            id: `history_${Date.now()}`,
            type: "contact_attempt" as const,
            description: isMentorContext ? "Mentor unable to contact participant" : "Bridge Team unable to contact participant",
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

      console.log("✅ Updating participant status to:", updatedParticipant.status);

      const participantRef = ref(database, `participants/${formData.participantId}`);
      await firebaseSet(participantRef, updatedParticipant);

      console.log("✅ Firebase update complete for participant:", formData.participantId);
      return;
    }

    // Successful contact - proceed with full initial contact setup
    const nextWeeklyDue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const nextMonthlyDue = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const mentorshipFollowupDue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days for follow-up
    const mentorshipStart = new Date(now.getTime() + 37 * 24 * 60 * 60 * 1000).toISOString(); // 7 days follow-up + 30 days = 37 days

    const updatedParticipant = {
      ...participant,
      status: "active_mentorship" as ParticipantStatus,
      initialContactCompletedAt: now.toISOString(),
      nextWeeklyUpdateDue: nextWeeklyDue,
      nextMonthlyCheckInDue: nextMonthlyDue,
      // Mentee status tracking
      menteeStatus: "contacted_initial" as Participant["menteeStatus"],
      initialContactCompletedDate: formData.contactDate,
      mentorshipFollowupDueDate: mentorshipFollowupDue,
      mentorshipStartDate: mentorshipStart,
      lastMentorshipContactDate: formData.contactDate,
      numberOfContactAttempts: (participant.numberOfContactAttempts || 0) + 1,
      lastAttemptDate: formData.contactDate,
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

  findDuplicatesByPhone: (phoneNumber) => {
    if (!phoneNumber || !phoneNumber.trim()) return [];
    const normalized = phoneNumber.trim().toLowerCase();
    return get().participants.filter(
      (p) => p.phoneNumber && p.phoneNumber.trim().toLowerCase() === normalized
    );
  },

  findDuplicatesByEmail: (email) => {
    if (!email || !email.trim()) return [];
    const normalized = email.trim().toLowerCase();
    return get().participants.filter(
      (p) => p.email && p.email.trim().toLowerCase() === normalized
    );
  },

  deleteParticipant: async (participantId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    // Get participant data before deletion for logging
    const participant = get().participants.find((p) => p.id === participantId);
    if (participant) {
      console.log("⚠️  DELETING PARTICIPANT:");
      console.log("   ID:", participantId);
      console.log("   Name:", participant.firstName, participant.lastName);
      console.log("   Number:", participant.participantNumber);
      console.log("   Status:", participant.status);
      console.warn("   ⚠️  This participant will be permanently deleted!");
    }

    const participantRef = ref(database, `participants/${participantId}`);
    await remove(participantRef);

    if (participant) {
      console.log("❌ PARTICIPANT DELETED:", participant.firstName, participant.lastName);
    }
  },

  mergeParticipants: async (sourceId, targetId, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const source = get().participants.find((p) => p.id === sourceId);
    const target = get().participants.find((p) => p.id === targetId);

    if (!source || !target) return;

    console.log("🔀 MERGING PARTICIPANTS:");
    console.log("   FROM:", source.firstName, source.lastName, `(#${source.participantNumber})`);
    console.log("   INTO:", target.firstName, target.lastName, `(#${target.participantNumber})`);
    console.log("   By user:", userName, `(${userId})`);
    console.warn("   ⚠️  Source participant will be deleted after merge!");

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

    console.log("✅ MERGE COMPLETE:", source.firstName, source.lastName, "→", target.firstName, target.lastName);
  },
}));

// Selectors
export const useAllParticipants = () => useParticipantStore((s) => s.participants);
export const useParticipantCount = () => useParticipantStore((s) => s.participants.length);
