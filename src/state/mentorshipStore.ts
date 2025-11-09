import { create } from "zustand";
import { ref, set as firebaseSet, onValue, update as firebaseUpdate, remove } from "firebase/database";
import { database } from "../config/firebase";
import { MentorshipAssignment } from "../types";

interface MentorshipState {
  assignments: MentorshipAssignment[];
  isLoading: boolean;
}

interface MentorshipActions {
  // Create new assignment
  assignMentee: (
    mentorId: string,
    mentorName: string,
    menteeId: string,
    menteeName: string,
    assignedBy: string,
    assignedByName: string,
    notes?: string
  ) => Promise<void>;

  // Get assignments by mentor
  getAssignmentsByMentor: (mentorId: string) => MentorshipAssignment[];

  // Get assignment by mentee
  getAssignmentByMentee: (menteeId: string) => MentorshipAssignment | undefined;

  // Get all active assignments
  getActiveAssignments: () => MentorshipAssignment[];

  // Update assignment status
  updateAssignmentStatus: (assignmentId: string, status: "active" | "completed" | "inactive") => Promise<void>;

  // Remove assignment
  removeAssignment: (assignmentId: string) => Promise<void>;

  // Reassign mentee to different mentor
  reassignMentee: (
    assignmentId: string,
    newMentorId: string,
    newMentorName: string,
    reassignedBy: string,
    reassignedByName: string
  ) => Promise<void>;

  // Initialize Firebase listener
  initializeFirebaseListener: () => void;
}

type MentorshipStore = MentorshipState & MentorshipActions;

export const useMentorshipStore = create<MentorshipStore>()((set, get) => ({
  assignments: [],
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: () => {
    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    const assignmentsRef = ref(database, "mentorshipAssignments");

    onValue(assignmentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const assignmentsArray = Object.values(data) as MentorshipAssignment[];
        set({ assignments: assignmentsArray, isLoading: false });
      } else {
        set({ assignments: [], isLoading: false });
      }
    });
  },

  assignMentee: async (mentorId, mentorName, menteeId, menteeName, assignedBy, assignedByName, notes) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const newAssignment: MentorshipAssignment = {
      id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mentorId,
      mentorName,
      menteeId,
      menteeName,
      assignedBy,
      assignedByName,
      assignedAt: new Date().toISOString(),
      status: "active",
      notes,
    };

    const assignmentRef = ref(database, `mentorshipAssignments/${newAssignment.id}`);
    await firebaseSet(assignmentRef, newAssignment);
  },

  getAssignmentsByMentor: (mentorId) => {
    return get().assignments.filter(
      (assignment) => assignment.mentorId === mentorId && assignment.status === "active"
    );
  },

  getAssignmentByMentee: (menteeId) => {
    return get().assignments.find(
      (assignment) => assignment.menteeId === menteeId && assignment.status === "active"
    );
  },

  getActiveAssignments: () => {
    return get().assignments.filter((assignment) => assignment.status === "active");
  },

  updateAssignmentStatus: async (assignmentId, status) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }
    const assignmentRef = ref(database, `mentorshipAssignments/${assignmentId}`);
    await firebaseUpdate(assignmentRef, { status });
  },

  removeAssignment: async (assignmentId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }
    const assignmentRef = ref(database, `mentorshipAssignments/${assignmentId}`);
    await remove(assignmentRef);
  },

  reassignMentee: async (assignmentId, newMentorId, newMentorName, reassignedBy, reassignedByName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const assignment = get().assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    const updatedAssignment = {
      ...assignment,
      mentorId: newMentorId,
      mentorName: newMentorName,
      assignedBy: reassignedBy,
      assignedByName: reassignedByName,
      assignedAt: new Date().toISOString(),
    };

    const assignmentRef = ref(database, `mentorshipAssignments/${assignmentId}`);
    await firebaseSet(assignmentRef, updatedAssignment);
  },
}));
