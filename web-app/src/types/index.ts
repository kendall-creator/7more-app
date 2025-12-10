// User roles in the system
export type UserRole =
  | "admin"
  | "bridge_team"
  | "bridge_team_leader"
  | "mentorship_leader"
  | "mentor"
  | "volunteer"
  | "volunteer_support"
  | "board_member"
  | "supporter";

// User type for authentication
export interface User {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  requiresPasswordChange?: boolean;
}

// Participant status
export type ParticipantStatus =
  | "pending_bridge"
  | "bridge_contacted"
  | "bridge_attempted"
  | "bridge_unable"
  | "pending_mentor"
  | "assigned_mentor"
  | "initial_contact_pending"
  | "mentor_attempted"
  | "mentor_unable"
  | "active_mentorship"
  | "unable_to_contact"
  | "graduated"
  | "ceased_contact";

// Participant data
export interface Participant {
  id: string;
  participantNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  phoneNumber?: string;
  email?: string;
  releaseDate: string;
  timeOut: number;
  releasedFrom: string;
  status: ParticipantStatus;
  submittedAt: string;
  assignedMentor?: string;
  assignedToMentorAt?: string;
  notes: Note[];
  history: HistoryEntry[];
}

// Note structure
export interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

// History entry
export interface HistoryEntry {
  id: string;
  type: string;
  description: string;
  details?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
}

// Task types
export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToUserId: string;
  assignedToUserName: string;
  assignedToUserRole: UserRole;
  assignedByUserId: string;
  assignedByUserName: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

// Shift types
export type ShiftLocation = "pam_lychner" | "huntsville" | "plane" | "hawaii";

export interface ShiftAssignment {
  userId: string;
  userName: string;
  userNickname?: string;
  userRole: UserRole;
  signedUpAt: string;
}

export interface Shift {
  id: string;
  title: string;
  description?: string;
  location?: ShiftLocation;
  holiday?: string;
  date: string;
  startTime: string;
  endTime: string;
  allowedRoles: UserRole[];
  assignedUserId?: string;
  assignedUserName?: string;
  assignedToSupportNetwork?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  maxVolunteers?: number;
  assignedUsers?: ShiftAssignment[];
}

// Invited user from database
export interface InvitedUser {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phone?: string;
  role: UserRole;
  roles?: UserRole[];
  password: string;
  invitedAt: string;
  invitedBy: string;
  requiresPasswordChange?: boolean;
}
