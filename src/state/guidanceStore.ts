import { create } from "zustand";
import { ref, set as firebaseSet, onValue, remove } from "firebase/database";
import { database } from "../config/firebase";

export interface GuidanceTask {
  id: string;
  participantId: string;
  participantName: string;
  mentorId: string;
  mentorName: string;
  guidanceNotes: string;
  status: "pending" | "completed";
  createdAt: string;
  completedAt?: string;
  completedBy?: string;
  completedByName?: string;
  response?: string;
  followUpNotes?: string;
}

interface GuidanceState {
  guidanceTasks: GuidanceTask[];
  isLoading: boolean;
}

interface GuidanceActions {
  // Create new guidance task
  createGuidanceTask: (
    participantId: string,
    participantName: string,
    mentorId: string,
    mentorName: string,
    guidanceNotes: string
  ) => Promise<void>;

  // Complete guidance task (mentorship leader/admin)
  completeGuidanceTask: (
    taskId: string,
    completedBy: string,
    completedByName: string,
    response: string,
    followUpNotes?: string
  ) => Promise<void>;

  // Get pending tasks for mentorship leaders
  getPendingTasks: () => GuidanceTask[];

  // Get tasks for a specific mentor
  getTasksForMentor: (mentorId: string) => GuidanceTask[];

  // Initialize Firebase listener
  initializeFirebaseListener: () => void;
}

type GuidanceStore = GuidanceState & GuidanceActions;

export const useGuidanceStore = create<GuidanceStore>()((set, get) => ({
  guidanceTasks: [],
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: () => {
    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    const guidanceRef = ref(database, "guidanceTasks");

    onValue(guidanceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksArray = Object.values(data) as GuidanceTask[];
        set({ guidanceTasks: tasksArray, isLoading: false });
      } else {
        set({ guidanceTasks: [], isLoading: false });
      }
    });
  },

  createGuidanceTask: async (participantId, participantName, mentorId, mentorName, guidanceNotes) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const newTask: GuidanceTask = {
      id: `guidance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participantId,
      participantName,
      mentorId,
      mentorName,
      guidanceNotes,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const taskRef = ref(database, `guidanceTasks/${newTask.id}`);
    await firebaseSet(taskRef, newTask);
  },

  completeGuidanceTask: async (taskId, completedBy, completedByName, response, followUpNotes) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const task = get().guidanceTasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask: GuidanceTask = {
      ...task,
      status: "completed",
      completedAt: new Date().toISOString(),
      completedBy,
      completedByName,
      response,
      followUpNotes,
    };

    const taskRef = ref(database, `guidanceTasks/${taskId}`);
    await firebaseSet(taskRef, updatedTask);
  },

  getPendingTasks: () => {
    return get().guidanceTasks.filter((task) => task.status === "pending");
  },

  getTasksForMentor: (mentorId) => {
    return get().guidanceTasks.filter((task) => task.mentorId === mentorId);
  },
}));
