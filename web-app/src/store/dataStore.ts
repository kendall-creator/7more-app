// ============================================
// DATA STORE - REQUIRED FOR BUILD
// ============================================
// This file MUST be on GitHub for Vercel builds to succeed
// File: src/store/dataStore.ts
// ============================================
import { create } from "zustand";
import { ref, onValue, get as firebaseGet, set as firebaseSet } from "firebase/database";
import { database } from "../config/firebase";
import { Participant, Task, Shift } from "../types";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "virtual" | "in_person";
  videoCallLink?: string;
  createdBy: string;
  createdByName: string;
  createdByNickname?: string;
  invitees: Array<{
    userId: string;
    userName: string;
    userNickname?: string;
    rsvpStatus: "pending" | "yes" | "no" | "maybe";
  }>;
}

interface DataState {
  participants: Participant[];
  tasks: Task[];
  shifts: Shift[];
  meetings: Meeting[];
  isLoading: boolean;
}

interface DataActions {
  initializeListeners: () => void;
  addParticipant: (participant: Partial<Participant>) => Promise<void>;
}

type DataStore = DataState & DataActions;

export const useDataStore = create<DataStore>()((set) => ({
  participants: [],
  tasks: [],
  shifts: [],
  meetings: [],
  isLoading: true,

  initializeListeners: () => {
    if (!database) {
      console.warn("Firebase not configured");
      set({ isLoading: false });
      return;
    }

    // Participants listener
    const participantsRef = ref(database, "participants");
    firebaseGet(participantsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const participantsArray = Object.values(data) as Participant[];
          set({ participants: participantsArray });
        }
      })
      .catch(console.error);

    onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const participantsArray = Object.values(data) as Participant[];
        set({ participants: participantsArray });
      }
    });

    // Tasks listener
    const tasksRef = ref(database, "tasks");
    firebaseGet(tasksRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const tasksArray = Object.values(data) as Task[];
          set({ tasks: tasksArray });
        }
      })
      .catch(console.error);

    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksArray = Object.values(data) as Task[];
        set({ tasks: tasksArray });
      }
    });

    // Shifts listener
    const shiftsRef = ref(database, "shifts");
    firebaseGet(shiftsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const shiftsArray = Object.values(data) as Shift[];
          set({ shifts: shiftsArray, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      })
      .catch((error) => {
        console.error(error);
        set({ isLoading: false });
      });

    onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shiftsArray = Object.values(data) as Shift[];
        set({ shifts: shiftsArray });
      }
    });

    // Meetings listener
    const meetingsRef = ref(database, "meetings");
    firebaseGet(meetingsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const meetingsArray = Object.values(data) as Meeting[];
          set({ meetings: meetingsArray });
        }
      })
      .catch(console.error);

    onValue(meetingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const meetingsArray = Object.values(data) as Meeting[];
        set({ meetings: meetingsArray });
      }
    });
  },

  addParticipant: async (participantData: Partial<Participant>) => {
    if (!database) {
      throw new Error("Firebase not configured");
    }

    // Generate a unique ID for the participant
    const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create the full participant object with required fields
    const newParticipant: Participant = {
      id: participantId,
      firstName: participantData.firstName || "Unknown",
      lastName: participantData.lastName || "",
      participantNumber: participantData.participantNumber || `TEMP-${Date.now()}`,
      dateOfBirth: participantData.dateOfBirth || "Not Available",
      age: participantData.age || 0,
      gender: participantData.gender || "Unknown",
      phoneNumber: participantData.phoneNumber,
      email: participantData.email,
      address: participantData.address,
      releaseDate: participantData.releaseDate || new Date().toISOString(),
      timeOut: participantData.timeOut || 0,
      releasedFrom: participantData.releasedFrom || "Unknown",
      status: participantData.status || "pending_bridge",
      completedGraduationSteps: participantData.completedGraduationSteps || [],
      intakeType: participantData.intakeType,
      nickname: participantData.nickname,
      referralSource: participantData.referralSource,
      otherReferralSource: participantData.otherReferralSource,
      legalStatus: participantData.legalStatus,
      criticalNeeds: participantData.criticalNeeds,
      createdAt: new Date().toISOString(),
    };

    // Save to Firebase
    const participantRef = ref(database, `participants/${participantId}`);
    await firebaseSet(participantRef, newParticipant);

    return;
  },
}));


