import { create } from "zustand";
import { ref, set as firebaseSet, onValue, update as firebaseUpdate, remove } from "firebase/database";
import { database } from "../config/firebase";
import { Shift, ShiftAssignment, ShiftTemplate, UserRole, Meeting, MeetingInvitee, MeetingType, RSVPStatus, ShiftLocation } from "../types";

interface SchedulerState {
  shifts: Shift[];
  meetings: Meeting[];
  templates: ShiftTemplate[];
  isLoading: boolean;
}

interface SchedulerActions {
  // Create new shift (admin only)
  createShift: (
    title: string,
    description: string,
    date: string,
    startTime: string,
    endTime: string,
    allowedRoles: UserRole[],
    createdBy: string,
    createdByName: string,
    maxVolunteers?: number,
    isRecurring?: boolean,
    weeksToCreate?: number,
    location?: ShiftLocation
  ) => Promise<void>;

  // Update shift
  updateShift: (shiftId: string, updates: Partial<Shift>) => Promise<void>;

  // Delete shift
  deleteShift: (shiftId: string) => Promise<void>;

  // Delete all shifts in a recurring group
  deleteRecurringGroup: (recurringGroupId: string) => Promise<void>;

  // Sign up for shift
  signUpForShift: (shiftId: string, userId: string, userName: string, userRole: UserRole, userNickname?: string) => Promise<boolean>;

  // Cancel shift signup
  cancelShiftSignup: (shiftId: string, userId: string) => Promise<void>;

  // Admin assign user to shift
  adminAssignUserToShift: (shiftId: string, userId: string, userName: string, userRole: UserRole, userNickname?: string) => Promise<boolean>;

  // Get shifts for a specific date range
  getShiftsByDateRange: (startDate: string, endDate: string) => Shift[];

  // Get shifts user can sign up for
  getAvailableShiftsForUser: (userRole: UserRole) => Shift[];

  // Get shifts user is signed up for
  getUserShifts: (userId: string) => Shift[];

  // Get upcoming shifts
  getUpcomingShifts: () => Shift[];

  // Copy week of shifts to another week
  copyWeek: (sourceWeekStart: string, targetWeekStart: string, userId: string, userName: string) => Promise<void>;

  // Save week as template
  saveWeekAsTemplate: (weekStart: string, templateName: string, userId: string, userName: string) => Promise<void>;

  // Create shifts from template
  createShiftsFromTemplate: (templateId: string, weekStart: string) => Promise<void>;

  // Delete template
  deleteTemplate: (templateId: string) => Promise<void>;

  // Get all templates
  getTemplates: () => ShiftTemplate[];

  // Meeting functions
  createMeeting: (
    title: string,
    description: string,
    type: MeetingType,
    date: string,
    startTime: string,
    endTime: string,
    inviteeUserIds: string[],
    createdBy: string,
    createdByName: string,
    createdByNickname?: string,
    videoCallLink?: string
  ) => Promise<void>;

  updateMeetingRSVP: (meetingId: string, userId: string, rsvpStatus: RSVPStatus) => Promise<void>;

  getMeetingsForUser: (userId: string) => Meeting[];

  deleteMeeting: (meetingId: string) => Promise<void>;

  // Initialize Firebase listener
  initializeFirebaseListener: () => void;
}

type SchedulerStore = SchedulerState & SchedulerActions;

let isListenerInitialized = false;

export const useSchedulerStore = create<SchedulerStore>()((set, get) => ({
  shifts: [],
  meetings: [],
  templates: [],
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: () => {
    // Prevent multiple listener initializations
    if (isListenerInitialized) {
      console.log("⚠️ [Scheduler] listener already initialized, skipping...");
      return;
    }

    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    console.log("🔥 Initializing scheduler Firebase listener...");
    isListenerInitialized = true;

    const shiftsRef = ref(database, "shifts");
    const meetingsRef = ref(database, "meetings");
    const templatesRef = ref(database, "shiftTemplates");

    onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shiftsArray = Object.values(data) as Shift[];
        console.log(`✅ Loaded ${shiftsArray.length} shifts from Firebase`);
        set({ shifts: shiftsArray, isLoading: false });
      } else {
        set({ shifts: [], isLoading: false });
      }
    }, (error) => {
      console.error("❌ Error in scheduler shifts listener:", error);
      set({ isLoading: false });
    });

    onValue(meetingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const meetingsArray = Object.values(data) as Meeting[];
        console.log(`✅ Loaded ${meetingsArray.length} meetings from Firebase`);
        set({ meetings: meetingsArray });
      } else {
        set({ meetings: [] });
      }
    }, (error) => {
      console.error("❌ Error in scheduler meetings listener:", error);
    });

    onValue(templatesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const templatesArray = Object.values(data) as ShiftTemplate[];
        console.log(`✅ Loaded ${templatesArray.length} shift templates from Firebase`);
        set({ templates: templatesArray });
      } else {
        set({ templates: [] });
      }
    }, (error) => {
      console.error("❌ Error in scheduler templates listener:", error);
    });
  },

  createShift: async (title, description, date, startTime, endTime, allowedRoles, createdBy, createdByName, maxVolunteers, isRecurring, weeksToCreate = 12, location) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const baseShift: Omit<Shift, 'id' | 'date'> = {
      title,
      description,
      location,
      startTime,
      endTime,
      allowedRoles,
      createdBy,
      createdByName,
      createdAt: new Date().toISOString(),
      maxVolunteers,
      assignedUsers: [],
      isRecurring,
    };

    const newShifts: Shift[] = [];

    if (isRecurring) {
      // Create a recurring group ID
      const recurringGroupId = `recurring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create shifts for the next X weeks
      for (let week = 0; week < weeksToCreate; week++) {
        const shiftDate = new Date(date);
        shiftDate.setDate(shiftDate.getDate() + (week * 7));

        newShifts.push({
          ...baseShift,
          id: `shift_${Date.now()}_${week}_${Math.random().toString(36).substr(2, 9)}`,
          date: shiftDate.toISOString().split('T')[0],
          recurringGroupId,
          parentShiftId: week === 0 ? undefined : newShifts[0].id,
        });
      }
    } else {
      // Create a single shift
      newShifts.push({
        ...baseShift,
        id: `shift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date,
      });
    }

    // Save all shifts to Firebase
    for (const shift of newShifts) {
      const shiftRef = ref(database, `shifts/${shift.id}`);
      await firebaseSet(shiftRef, shift);
    }
  },

  updateShift: async (shiftId, updates) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const shiftRef = ref(database, `shifts/${shiftId}`);
    await firebaseUpdate(shiftRef, updates);
  },

  deleteShift: async (shiftId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const shiftRef = ref(database, `shifts/${shiftId}`);
    await remove(shiftRef);
  },

  deleteRecurringGroup: async (recurringGroupId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const shiftsToDelete = get().shifts.filter((shift) => shift.recurringGroupId === recurringGroupId);

    for (const shift of shiftsToDelete) {
      const shiftRef = ref(database, `shifts/${shift.id}`);
      await remove(shiftRef);
    }
  },

  signUpForShift: async (shiftId, userId, userName, userRole, userNickname) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const shift = get().shifts.find((s) => s.id === shiftId);
    if (!shift) return false;

    // Check if user can sign up for this shift
    if (!shift.allowedRoles.includes(userRole)) return false;

    // Check if shift is already full
    const assignedUsers = shift.assignedUsers || [];
    if (shift.maxVolunteers && assignedUsers.length >= shift.maxVolunteers) return false;

    // Check if user is already signed up
    if (assignedUsers.some((assignment) => assignment.userId === userId)) return false;

    const newAssignment: ShiftAssignment = {
      userId,
      userName,
      userNickname,
      userRole,
      signedUpAt: new Date().toISOString(),
    };

    const updatedShift = {
      ...shift,
      assignedUsers: [...(shift.assignedUsers || []), newAssignment],
      assignedUserId: shift.assignedUsers?.length === 0 ? userId : shift.assignedUserId,
      assignedUserName: shift.assignedUsers?.length === 0 ? userName : shift.assignedUserName,
    };

    const shiftRef = ref(database, `shifts/${shiftId}`);
    await firebaseSet(shiftRef, updatedShift);

    return true;
  },

  cancelShiftSignup: async (shiftId, userId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const shift = get().shifts.find((s) => s.id === shiftId);
    if (!shift) return;

    const updatedAssignedUsers = (shift.assignedUsers || []).filter(
      (assignment) => assignment.userId !== userId
    );

    const updatedShift = {
      ...shift,
      assignedUsers: updatedAssignedUsers,
      assignedUserId: updatedAssignedUsers.length > 0 ? updatedAssignedUsers[0].userId : undefined,
      assignedUserName: updatedAssignedUsers.length > 0 ? updatedAssignedUsers[0].userName : undefined,
    };

    const shiftRef = ref(database, `shifts/${shiftId}`);
    await firebaseSet(shiftRef, updatedShift);
  },

  adminAssignUserToShift: async (shiftId, userId, userName, userRole, userNickname) => {
    console.log("adminAssignUserToShift called:", { shiftId, userId, userName, userRole, userNickname });

    if (!database) {
      console.error("Firebase not configured");
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const shift = get().shifts.find((s) => s.id === shiftId);
    if (!shift) {
      console.error("Shift not found:", shiftId);
      return false;
    }

    console.log("Found shift:", shift.title);

    // Check if shift is already full
    const assignedUsers = shift.assignedUsers || [];
    if (shift.maxVolunteers && assignedUsers.length >= shift.maxVolunteers) {
      console.log("Shift is full");
      return false;
    }

    // Check if user is already signed up
    if (assignedUsers.some((assignment) => assignment.userId === userId)) {
      console.log("User already assigned");
      return false;
    }

    const newAssignment: ShiftAssignment = {
      userId,
      userName,
      userNickname,
      userRole,
      signedUpAt: new Date().toISOString(),
    };

    const updatedAssignedUsers = [...assignedUsers, newAssignment];

    const updatedShift = {
      ...shift,
      assignedUsers: updatedAssignedUsers,
      // Only set assignedUserId/Name if this is the first assignment, otherwise keep existing
      assignedUserId: shift.assignedUserId || userId,
      assignedUserName: shift.assignedUserName || userName,
    };

    console.log("Updating shift with new assignment");
    const shiftRef = ref(database, `shifts/${shiftId}`);
    await firebaseSet(shiftRef, updatedShift);
    console.log("Shift updated successfully");

    return true;
  },

  getShiftsByDateRange: (startDate, endDate) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return get().shifts.filter((shift) => {
      const shiftDate = new Date(shift.date).getTime();
      return shiftDate >= start && shiftDate <= end;
    });
  },

  getAvailableShiftsForUser: (userRole) => {
    const now = new Date().toISOString();
    return get().shifts.filter((shift) => {
      // Must be in the future
      if (shift.date < now) return false;

      // Must be allowed for this role
      if (!shift.allowedRoles.includes(userRole)) return false;

      // Must not be full
      const assignedUsers = shift.assignedUsers || [];
      if (shift.maxVolunteers && assignedUsers.length >= shift.maxVolunteers) return false;

      return true;
    });
  },

  getUserShifts: (userId) => {
    return get().shifts.filter((shift) =>
      (shift.assignedUsers || []).some((assignment) => assignment.userId === userId)
    );
  },

  getUpcomingShifts: () => {
    const now = new Date().toISOString();
    return get()
      .shifts.filter((shift) => shift.date >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  copyWeek: async (sourceWeekStart, targetWeekStart, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const sourceDate = new Date(sourceWeekStart);
    const targetDate = new Date(targetWeekStart);
    const daysDiff = Math.floor((targetDate.getTime() - sourceDate.getTime()) / (1000 * 60 * 60 * 24));

    // Get all shifts in the source week
    const sourceWeekEnd = new Date(sourceDate);
    sourceWeekEnd.setDate(sourceDate.getDate() + 6);

    const sourceShifts = get().getShiftsByDateRange(
      sourceWeekStart,
      sourceWeekEnd.toISOString().split('T')[0]
    );

    // Create new shifts for target week
    const newShifts = sourceShifts.map((shift) => {
      const newDate = new Date(shift.date);
      newDate.setDate(newDate.getDate() + daysDiff);

      return {
        ...shift,
        id: `shift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: newDate.toISOString().split('T')[0],
        assignedUsers: [], // Don't copy assignments
        assignedUserId: undefined,
        assignedUserName: undefined,
        createdAt: new Date().toISOString(),
        createdBy: userId,
        createdByName: userName,
        parentShiftId: shift.id,
        recurringGroupId: undefined, // New shifts are not part of original recurring group
      };
    });

    // Save all new shifts to Firebase
    for (const shift of newShifts) {
      const shiftRef = ref(database, `shifts/${shift.id}`);
      await firebaseSet(shiftRef, shift);
    }
  },

  saveWeekAsTemplate: async (weekStart, templateName, userId, userName) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const weekStartDate = new Date(weekStart);
    const weekEnd = new Date(weekStartDate);
    weekEnd.setDate(weekStartDate.getDate() + 6);

    const weekShifts = get().getShiftsByDateRange(
      weekStart,
      weekEnd.toISOString().split('T')[0]
    );

    const templateShifts = weekShifts.map((shift) => ({
      title: shift.title,
      description: shift.description,
      startTime: shift.startTime,
      endTime: shift.endTime,
      allowedRoles: shift.allowedRoles,
      createdBy: userId,
      createdByName: userName,
      maxVolunteers: shift.maxVolunteers,
      isRecurring: false,
    }));

    const newTemplate: ShiftTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: templateName,
      shifts: templateShifts,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
    };

    const templateRef = ref(database, `shiftTemplates/${newTemplate.id}`);
    await firebaseSet(templateRef, newTemplate);
  },

  createShiftsFromTemplate: async (templateId, weekStart) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return;

    const weekStartDate = new Date(weekStart);

    const newShifts = template.shifts.map((templateShift, index) => {
      // Assume shifts are in order from Monday to Sunday
      const shiftDate = new Date(weekStartDate);
      shiftDate.setDate(weekStartDate.getDate() + Math.floor(index / (template.shifts.length / 7)));

      return {
        ...templateShift,
        id: `shift_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        date: shiftDate.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        assignedUsers: [],
      };
    });

    // Save all new shifts to Firebase
    for (const shift of newShifts) {
      const shiftRef = ref(database, `shifts/${shift.id}`);
      await firebaseSet(shiftRef, shift);
    }
  },

  deleteTemplate: async (templateId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const templateRef = ref(database, `shiftTemplates/${templateId}`);
    await remove(templateRef);
  },

  getTemplates: () => {
    return get().templates;
  },

  // Meeting functions
  createMeeting: async (title, description, type, date, startTime, endTime, inviteeUserIds, createdBy, createdByName, createdByNickname, videoCallLink) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const meetingId = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get invitedUsers to map user IDs to names
    const { invitedUsers } = await import("./usersStore").then(m => m.useUsersStore.getState());

    const invitees: MeetingInvitee[] = inviteeUserIds.map(userId => {
      const user = invitedUsers.find(u => u.id === userId);
      return {
        userId,
        userName: user?.name || "Unknown User",
        userNickname: user?.nickname,
        rsvpStatus: "pending" as RSVPStatus,
      };
    });

    const newMeeting: Meeting = {
      id: meetingId,
      title,
      description,
      type,
      videoCallLink: type === "virtual" ? videoCallLink : undefined,
      date,
      startTime,
      endTime,
      createdBy,
      createdByName,
      createdByNickname,
      createdAt: new Date().toISOString(),
      invitees,
    };

    const meetingRef = ref(database, `meetings/${meetingId}`);
    await firebaseSet(meetingRef, newMeeting);
  },

  updateMeetingRSVP: async (meetingId, userId, rsvpStatus) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const meeting = get().meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    const updatedInvitees = meeting.invitees.map(invitee => {
      if (invitee.userId === userId) {
        return {
          ...invitee,
          rsvpStatus,
          rsvpAt: new Date().toISOString(),
        };
      }
      return invitee;
    });

    const meetingRef = ref(database, `meetings/${meetingId}`);
    await firebaseUpdate(meetingRef, { invitees: updatedInvitees });
  },

  getMeetingsForUser: (userId) => {
    return get().meetings.filter(meeting =>
      meeting.createdBy === userId || meeting.invitees.some(invitee => invitee.userId === userId)
    );
  },

  deleteMeeting: async (meetingId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const meetingRef = ref(database, `meetings/${meetingId}`);
    await remove(meetingRef);
  },
}));
