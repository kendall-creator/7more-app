// User roles in the system
// volunteer = Lead Volunteer (can see all shifts)
// volunteer_support = Support Volunteer (can only see support-specific shifts)
// board_member = Board Member (can view scheduler, assign/receive tasks, view monthly reporting)
// bridge_team_leader = Bridge Team Leader (admin capabilities but only for Bridge Team items)
export type UserRole = "admin" | "bridge_team" | "bridge_team_leader" | "mentorship_leader" | "mentor" | "volunteer" | "volunteer_support" | "board_member";

// Volunteer categories for shift access
export type VolunteerCategory = "lead" | "support";

// User type for authentication
export interface User {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  role: UserRole; // Primary role (for backward compatibility)
  roles?: UserRole[]; // Optional: multiple roles
  requiresPasswordChange?: boolean;
  hasReportingAccess?: boolean; // Optional: grant specific users access to reporting (admin assigns)
}

// Helper to get all roles for a user
export const getUserRoles = (user: User | undefined): UserRole[] => {
  if (!user) return [];
  if (user.roles && user.roles.length > 0) return user.roles;
  return [user.role];
};

// Helper to check if user has a specific role
export const userHasRole = (user: User | undefined, role: UserRole): boolean => {
  if (!user) return false;
  if (user.roles && user.roles.length > 0) return user.roles.includes(role);
  return user.role === role;
};

// Helper to check if user has any of the specified roles
export const userHasAnyRole = (user: User | undefined, roles: UserRole[]): boolean => {
  if (!user) return false;
  const userRoles = getUserRoles(user);
  return roles.some(role => userRoles.includes(role));
};

// Helper to check if user has admin or bridge_team_leader role
export const isAdminOrBridgeTeamLeader = (user: User | undefined): boolean => {
  if (!user) return false;
  return userHasAnyRole(user, ["admin", "bridge_team_leader"]);
};

// Helper to check if user has permissions for bridge team operations
export const canManageBridgeTeam = (user: User | undefined): boolean => {
  if (!user) return false;
  return userHasAnyRole(user, ["admin", "bridge_team_leader", "bridge_team"]);
};

// Participant status in the system
export type ParticipantStatus =
  | "pending_bridge"        // Waiting for Bridge Team
  | "bridge_contacted"      // Bridge Team made contact
  | "bridge_attempted"      // Bridge Team attempted contact
  | "bridge_unable"         // Bridge Team unable to contact
  | "pending_mentor"        // Waiting for mentor assignment
  | "assigned_mentor"       // Has assigned mentor
  | "initial_contact_pending" // Mentor needs to do initial contact
  | "mentor_attempted"      // Mentor attempted contact (after assignment)
  | "mentor_unable"         // Mentor unable to contact (after assignment)
  | "active_mentorship"     // Active in mentorship program
  | "unable_to_contact"     // Unable to contact (from Bridge Team or Mentorship)
  | "graduated"             // Completed program
  | "ceased_contact";       // No longer participating

// Contact attempt type
export type ContactAttemptType = "left_voicemail" | "unable_to_leave_voicemail" | "no_answer";

// Participant data structure
export interface Participant {
  id: string;
  // Basic info from intake form
  participantNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  age: number; // Calculated from DOB
  gender: string;
  phoneNumber?: string; // Optional phone number for SMS communication
  email?: string; // Optional email for email communication
  releaseDate: string; // ISO date string
  timeOut: number; // Days calculated from release date
  releasedFrom: string; // Facility name

  // Status tracking
  status: ParticipantStatus;
  submittedAt: string; // ISO timestamp

  // Assignment tracking
  assignedBridgeTeamMember?: string; // User ID
  assignedMentorLeader?: string; // User ID
  assignedMentor?: string; // User ID

  // Timestamps for transitions
  movedToBridgeAt?: string;
  movedToMentorshipAt?: string;
  assignedToMentorAt?: string;
  initialContactCompletedAt?: string;
  graduatedAt?: string;
  movedToUnableToContactAt?: string; // Track when moved to unable to contact status

  // Due dates and check-ins
  nextWeeklyUpdateDue?: string; // ISO timestamp for next weekly update
  nextMonthlyCheckInDue?: string; // ISO timestamp for next monthly check-in (30 days after initial contact)
  nextMonthlyReportDue?: string; // ISO timestamp for next monthly report (30 days after mentor assignment)
  lastWeeklyUpdateAt?: string;
  lastMonthlyCheckInAt?: string;
  lastMonthlyReportAt?: string;

  // Graduation tracking
  completedGraduationSteps: string[]; // Array of completed step IDs
  graduationApproval?: GraduationApproval;

  // Bridge Team Follow-Up Form Data
  participantInfoConfirmed?: boolean;
  participantInfoConfirmedAt?: string;
  participantInfoConfirmedBy?: string;

  // Mandated Restrictions
  onParole?: boolean;
  onProbation?: boolean;
  onSexOffenderRegistry?: boolean;
  onChildOffenderRegistry?: boolean;
  otherLegalRestrictions?: string;

  // Critical Needs
  needsPhoneCall?: boolean;
  needsEmployment?: boolean;
  needsHousing?: boolean;
  needsClothing?: boolean;
  needsFood?: boolean;
  currentHousingSituation?: string;
  currentHousingOther?: string;
  transitionalHomeName?: string;
  transitionalHomeNameOther?: string;
  highPriorityHousingBenReid?: boolean;

  // Communication Confirmation
  weeklyCallExplained?: boolean;

  // Resources Sent
  resourcesSent?: boolean;
  resourcesSentList?: string[];
  resourcesOtherDescription?: string;
  resourceNotes?: string;
  resourcesEmailSent?: boolean;
  resourcesEmailSentAt?: string;

  // Notes and history
  notes: Note[];
  history: HistoryEntry[];
}

// Note structure
export interface Note {
  id: string;
  content: string;
  createdBy: string; // User ID
  createdByName: string;
  createdAt: string; // ISO timestamp
}

// History entry for tracking all actions
export interface HistoryEntry {
  id: string;
  type: "status_change" | "contact_attempt" | "note_added" | "form_submitted" | "assignment_change";
  description: string;
  details?: string;
  createdBy?: string; // User ID
  createdByName?: string;
  createdAt: string; // ISO timestamp
  metadata?: Record<string, unknown>;
}

// Contact form data
export interface ContactFormData {
  participantId: string;
  contactDate: string; // ISO date
  contactMethod: string; // phone, email, text, in-person
  contactNotes: string;
  outcomeType: "successful" | "attempted" | "unable";
  attemptType?: ContactAttemptType;
  unableReason?: string;
}

// Initial contact form (for mentors)
export interface InitialContactFormData {
  participantId: string;
  contactDate: string;
  contactOutcome: "successful" | "attempted" | "unable";
  attemptType?: ContactAttemptType;
  attemptNotes?: string;
  unableReason?: string;
  mentorshipOffered: string;
  livingSituation: string;
  livingSituationDetail: string;
  employmentStatus: string;
  clothingNeeds: string;
  openInvitationToCall: boolean;
  prayerOffered: boolean;
  additionalNotes: string;
  guidanceNeeded: boolean;
  guidanceNotes: string;
}

// Monthly report form (for mentors - simple 30-day report)
export interface MonthlyReportFormData {
  participantId: string;
  reportDate: string;
  updates: string; // Text section for updates
}

// Monthly update form (for mentors)
export interface MonthlyUpdateFormData {
  participantId: string;
  updateDate: string;
  contactFrequency: string;
  progressNotes: string;
  challengesFaced: string;
  goalsProgress: string;
  nextMonthGoals: string;
}

// Weekly update form (for mentors after initial contact)
export interface WeeklyUpdateFormData {
  participantId: string;
  updateDate: string;
  contactThisWeek: boolean;
  contactMethod?: string;
  progressUpdate: string;
  challengesThisWeek: string;
  supportNeeded?: string;
}

// Monthly mentor check-in form (for graduation tracking)
export interface MonthlyCheckInFormData {
  participantId: string;
  checkInDate: string;
  accomplishmentsSinceLastCheckIn: string;
  challengesFaced: string;
  completedSteps: string[]; // Array of step IDs completed
  notableChanges: string;
  additionalNotes?: string;
}

// Graduation steps
export interface GraduationStep {
  id: string;
  title: string;
  description: string;
  order: number;
}

// Due date tracking
export type DueDateType = "weekly_update" | "monthly_checkin" | "monthly_report";

export interface DueDate {
  id: string;
  participantId: string;
  type: DueDateType;
  dueDate: string; // ISO timestamp
  completedAt?: string; // ISO timestamp when completed
  isOverdue: boolean;
  createdAt: string;
}

// Admin approval for graduation
export interface GraduationApproval {
  participantId: string;
  approvedBy: string; // Admin user ID
  approvedByName: string;
  approvalDate: string;
  notes?: string;
}

// Dashboard metrics
export interface DashboardMetrics {
  totalParticipants: number;
  pendingBridge: number;
  bridgeContacted: number;
  bridgeAttempted: number;
  bridgeUnable: number;
  mentorAttempted: number;
  mentorUnable: number;
  unableToContact: number;
  pendingMentorAssignment: number;
  assignedToMentor: number;
  activeInMentorship: number;
  graduated: number;
  ceasedContact: number;

  // Monthly metrics
  monthlySubmissions: number;
  monthlyMovedToMentorship: number;
  monthlyGraduated: number;
}

// Resource for volunteers to share
export interface Resource {
  id: string;
  title: string;
  category: string;
  content: string; // The actual text to copy/paste
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Shift for volunteer scheduling
export type ShiftLocation = "pam_lychner" | "huntsville" | "plane" | "hawaii";

export interface Shift {
  id: string;
  title: string;
  description?: string;
  location?: ShiftLocation; // Facility location
  holiday?: string; // Holiday/placeholder reason (e.g., "Christmas Day", "Facility Closed")
  date: string; // ISO date string
  startTime: string; // Time string like "09:00"
  endTime: string; // Time string like "17:00"
  allowedRoles: UserRole[]; // Who can sign up for this shift
  assignedUserId?: string; // User ID of who signed up
  assignedUserName?: string; // Name of who signed up
  assignedToSupportNetwork?: string; // Name of support network member (non-user)
  createdBy: string; // Admin user ID
  createdByName: string;
  createdAt: string; // ISO timestamp
  maxVolunteers?: number; // Optional limit on volunteers
  assignedUsers?: ShiftAssignment[]; // For shifts that can have multiple volunteers
  isRecurring?: boolean; // Whether this shift repeats weekly
  recurringGroupId?: string; // Groups recurring shifts together
  parentShiftId?: string; // ID of the original shift this was created from
}

// Shift template for copying
export interface ShiftTemplate {
  id: string;
  name: string;
  shifts: Omit<Shift, 'id' | 'date' | 'createdAt' | 'assignedUsers' | 'assignedUserId' | 'assignedUserName'>[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

// Shift assignment for tracking who signed up
export interface ShiftAssignment {
  userId: string;
  userName: string;
  userNickname?: string; // Optional nickname
  userRole: UserRole;
  signedUpAt: string; // ISO timestamp
}

// Mentorship assignment
export interface MentorshipAssignment {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorNickname?: string; // Optional nickname
  menteeId: string; // Participant ID
  menteeName: string;
  assignedBy: string; // Mentor leader or admin user ID
  assignedByName: string;
  assignedByNickname?: string; // Optional nickname
  assignedAt: string; // ISO timestamp
  status: "active" | "completed" | "inactive";
  notes?: string;
}

// Bridge Team Follow-Up Form
export interface BridgeTeamFollowUpFormData {
  participantId: string;

  // Section 1 - Participant Information Confirmation
  participantInfoConfirmed: boolean;

  // Section 2 - Mandated Restrictions
  onParole: boolean;
  onProbation: boolean;
  onSexOffenderRegistry: boolean;
  onChildOffenderRegistry: boolean;
  otherLegalRestrictions: string;

  // Section 3 - Critical Needs
  needsPhoneCall: boolean;
  needsEmployment: boolean;
  needsHousing: boolean;
  needsClothing: boolean;
  needsFood: boolean;
  currentHousingSituation?: string;
  currentHousingOther?: string;
  transitionalHomeName?: string;
  transitionalHomeNameOther?: string;

  // Section 4 - Communication Confirmation
  weeklyCallExplained: boolean;

  // Section 5 - Resources Sent
  resourcesSent: boolean;
  resourcesSentList?: string[];
  resourcesOtherDescription?: string;
  resourceNotes?: string;
  sendResourcesEmail: boolean;
}

// Transitional Home data structure
export interface TransitionalHome {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  totalBeds?: number;
  availableBeds?: number;
  servicesOffered?: string[];
  acceptanceCriteria?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
}

// Task Management System
export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

// Custom field types for task forms
export type TaskFieldType = "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "file";

export interface TaskFormField {
  id: string;
  label: string;
  type: TaskFieldType;
  required: boolean;
  options?: string[]; // For select fields
  placeholder?: string;
}

export interface TaskFormResponse {
  fieldId: string;
  value: string | number | boolean;
}

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
  dueDate?: string; // ISO date string
  createdAt: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
  completionComment?: string; // Optional comment when completing task

  // Custom form for this task
  customForm?: TaskFormField[];
  formResponse?: TaskFormResponse[];

  // Optional linking to participants
  relatedParticipantId?: string;
  relatedParticipantName?: string;

  notes?: string;

  // Recurring task fields
  isRecurring?: boolean;
  recurringFrequency?: "daily" | "weekly" | "monthly";
  recurringParentId?: string; // ID of the original task if this is a recurrence
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  customForm: TaskFormField[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

// Monthly Reporting System
export interface ReleaseFacilityCount {
  pamLychner: number | null;
  huntsville: number | null;
  planeStateJail: number | null;
  havinsUnit: number | null;
  clemensUnit: number | null;
  other: number | null;
}

export interface CallMetrics {
  inbound: number | null;
  outbound: number | null;
  missedCallsPercent: number | null;
  hungUpPriorToWelcome: number | null; // percentage
  hungUpWithin10Seconds: number | null; // percentage
  missedDueToNoAnswer: number | null; // percentage
}

export interface MentorshipMetrics {
  participantsAssignedToMentorship: number;
}

export interface DonorData {
  newDonors: number | null;
  amountFromNewDonors: number | null;
  checks: number | null;
  totalFromChecks: number | null;
}

export interface FinancialData {
  beginningBalance: number | null;
  endingBalance: number | null;
  difference: number; // auto-calculated
}

// Social Media Metrics
export interface SocialMediaMetrics {
  reelsPostViews: number | null; // Combined reels and post views
  viewsFromNonFollowers: number | null;
  followers: number | null;
  followersGained: number | null; // Can be positive or negative
}

// Win or Concern entry with title and body
export interface WinConcernEntry {
  title: string;
  body: string;
}

export interface MonthlyReport {
  id: string;
  month: number; // 1-12
  year: number;

  // 1. Releasees Met (manual input by facility)
  releaseFacilityCounts: ReleaseFacilityCount;

  // 2. Calls (manual input)
  callMetrics: CallMetrics;

  // 3. Mentorship (auto-pulled from previous month)
  mentorshipMetrics: MentorshipMetrics;

  // 4. Donors
  donorData: DonorData;

  // 5. Financials
  financialData: FinancialData;

  // 6. Social Media
  socialMediaMetrics: SocialMediaMetrics;

  // 7. Wins & Concerns (Admin Notes) - up to 5 each
  wins: WinConcernEntry[]; // Max 5 entries
  concerns: WinConcernEntry[]; // Max 5 entries

  // Admin posting control
  isPosted: boolean; // True when admin publishes for board viewing
  postedAt?: string; // ISO timestamp when posted
  postedBy?: string; // User ID who posted
  postedByName?: string; // Name of user who posted

  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// Meeting System
export type MeetingType = "virtual" | "in-person";
export type RSVPStatus = "yes" | "no" | "maybe" | "pending";

export interface MeetingInvitee {
  userId: string;
  userName: string;
  userNickname?: string;
  rsvpStatus: RSVPStatus;
  rsvpAt?: string; // ISO timestamp when they responded
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  type: MeetingType;
  videoCallLink?: string; // Only for virtual meetings
  date: string; // ISO date string
  startTime: string; // Time string like "09:00"
  endTime: string; // Time string like "17:00"
  createdBy: string;
  createdByName: string;
  createdByNickname?: string;
  createdAt: string; // ISO timestamp
  invitees: MeetingInvitee[]; // List of invited users with RSVP status
}

