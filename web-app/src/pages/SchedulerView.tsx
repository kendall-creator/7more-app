import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  X,
  MapPin,
  Video,
  Phone,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Edit,
} from "lucide-react";
import { useDataStore } from "../store/dataStore";
import { useAuthStore } from "../store/authStore";

interface SchedulerViewProps {
  onNavigate: (view: string) => void;
}

export default function SchedulerView({ onNavigate }: SchedulerViewProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const shifts = useDataStore((s) => s.shifts);
  const meetings = useDataStore((s) => s.meetings || []);

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  const userRole = currentUser?.role || "volunteer";
  const isAdmin = userRole === "admin" || userRole === "mentorship_leader";
  const isSupportVolunteer = userRole === "volunteer_support";
  const isSupporter = userRole === "supporter";

  // Default to "My Schedule" for non-admins, "Manage Schedule" for admins
  const [activeTab, setActiveTab] = useState<"my" | "manage">(isAdmin ? "manage" : "my");

  // Debug logging
  console.log("SchedulerView - Shifts:", shifts.length, "Meetings:", meetings.length, "User Role:", userRole, "Active Tab:", activeTab);

  // Get week start (Monday)
  const getWeekStart = (offset: number = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday + offset * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  // Generate week days (Monday-Sunday)
  const getCurrentWeekDays = () => {
    const weekStart = getWeekStart(currentWeekOffset);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      days.push({
        date: date,
        dateString: dateString,
        dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i],
        dayShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        dayNumber: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        isToday: date.toDateString() === new Date().toDateString(),
      });
    }

    return days;
  };

  const weekDays = useMemo(() => getCurrentWeekDays(), [currentWeekOffset]);

  // Filter shifts based on active tab
  const visibleShifts = useMemo(() => {
    let filtered = shifts;

    if (activeTab === "my") {
      if (!currentUser) return [];
      filtered = shifts.filter((shift) =>
        shift.assignedUsers?.some((assignment: any) => assignment.userId === currentUser.id)
      );
    } else {
      if (isSupportVolunteer) {
        filtered = shifts.filter((shift) => shift.allowedRoles?.includes("volunteer_support"));
      } else if (isSupporter) {
        filtered = shifts;
      } else {
        filtered = shifts.filter((shift) => shift.allowedRoles?.includes(userRole));
      }
    }

    console.log("Visible shifts after filtering:", filtered.length, "from total:", shifts.length);
    return filtered;
  }, [shifts, userRole, isSupportVolunteer, isSupporter, activeTab, currentUser]);

  // Get user's meetings
  const myMeetings = useMemo(() => {
    if (!currentUser) return [];
    return meetings.filter((m: any) =>
      m.invitees?.some((inv: any) => inv.userId === currentUser.id) || m.createdBy === currentUser.id
    );
  }, [meetings, currentUser]);

  // Group shifts by date
  const shiftsByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    visibleShifts.forEach((shift) => {
      if (!grouped[shift.date]) {
        grouped[shift.date] = [];
      }
      grouped[shift.date].push(shift);
    });
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [visibleShifts]);

  // Group meetings by date
  const meetingsByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    if (activeTab === "my") {
      myMeetings.forEach((meeting: any) => {
        if (!grouped[meeting.date]) {
          grouped[meeting.date] = [];
        }
        grouped[meeting.date].push(meeting);
      });
      Object.keys(grouped).forEach((date) => {
        grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
      });
    }
    return grouped;
  }, [myMeetings, activeTab]);

  const canSignUp = (shift: any) => {
    if (!currentUser) return false;
    if (!isSupporter && !shift.allowedRoles?.includes(userRole)) return false;
    const assignedUsers = shift.assignedUsers || [];
    if (shift.maxVolunteers && assignedUsers.length >= shift.maxVolunteers) return false;
    if (assignedUsers.some((assignment: any) => assignment.userId === currentUser.id)) return false;
    return true;
  };

  const isSignedUp = (shift: any) => {
    if (!currentUser) return false;
    return (shift.assignedUsers || []).some((assignment: any) => assignment.userId === currentUser.id);
  };

  const getWeekLabel = () => {
    if (currentWeekOffset === 0) return "This Week";
    if (currentWeekOffset === 1) return "Next Week";
    if (currentWeekOffset === -1) return "Last Week";
    const weekStart = getWeekStart(currentWeekOffset);
    return `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  const formatUserDisplayName = (userName: string, userNickname?: string) => {
    if (!userNickname) return userName;
    return `${userName} (${userNickname})`;
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">Scheduler</h1>
        <p className="text-secondary">
          {activeTab === "my" ? "Your Scheduled Shifts" : isSupportVolunteer ? "Support Volunteer Shifts" : "All Available Shifts"}
        </p>
      </div>

      {/* Tab Selector */}
      <div className="bg-gray-100 rounded-xl p-1 mb-6 inline-flex">
        <button
          onClick={() => setActiveTab("my")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "my" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Schedule
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "manage" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Manage Schedule
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        {activeTab === "manage" && isAdmin && (
          <button
            onClick={() => onNavigate("manage-shifts")}
            className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 font-medium flex items-center gap-2 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Create Shift
          </button>
        )}
        {activeTab === "my" && isAdmin && (
          <button
            onClick={() => onNavigate("create-meeting")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg px-4 py-2 font-medium flex items-center gap-2 transition-colors"
          >
            <Users className="w-5 h-5" />
            Create Meeting
          </button>
        )}
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold text-text">{getWeekLabel()}</h2>
            {currentWeekOffset !== 0 && (
              <button
                onClick={() => setCurrentWeekOffset(0)}
                className="text-sm text-primary hover:underline mt-1"
              >
                Back to This Week
              </button>
            )}
          </div>

          <button
            onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Week Calendar View */}
      <div className="space-y-6">
        {weekDays.map((day, index) => {
          const dayShifts = shiftsByDate[day.dateString] || [];
          const dayMeetings = meetingsByDate[day.dateString] || [];
          const hasContent = dayShifts.length > 0 || dayMeetings.length > 0;

          return (
            <div key={day.dateString}>
              {/* Day Header */}
              <div
                className={`rounded-xl p-4 mb-3 ${
                  day.isToday ? "bg-yellow-100 border-2 border-yellow-300" : "bg-gray-100 border-2 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className={`text-xs font-semibold ${day.isToday ? "text-yellow-700" : "text-gray-500"}`}>
                        {day.dayShort.toUpperCase()}
                      </p>
                      <p className={`text-3xl font-bold ${day.isToday ? "text-yellow-900" : "text-gray-900"}`}>
                        {day.dayNumber}
                      </p>
                      <p className={`text-xs ${day.isToday ? "text-yellow-700" : "text-gray-500"}`}>{day.month}</p>
                    </div>
                    <p className={`text-lg font-semibold ${day.isToday ? "text-yellow-900" : "text-gray-700"}`}>
                      {day.dayName}
                    </p>
                  </div>
                  {hasContent && (
                    <div className="bg-gray-700 text-white rounded-full px-4 py-1.5 font-bold text-sm">
                      {dayShifts.length + dayMeetings.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Shifts and Meetings */}
              {hasContent ? (
                <div className="pl-4 space-y-3">
                  {dayShifts.map((shift) => {
                    const signedUp = isSignedUp(shift);
                    const canSign = canSignUp(shift);
                    const assignedUsers = shift.assignedUsers || [];
                    const isFull = shift.maxVolunteers && assignedUsers.length >= shift.maxVolunteers;

                    return (
                      <div
                        key={shift.id}
                        className={`border-2 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow ${
                          signedUp
                            ? "bg-yellow-50 border-yellow-600"
                            : isFull
                            ? "bg-gray-50 border-gray-300"
                            : "bg-white border-gray-200"
                        }`}
                        onClick={() => {
                          setSelectedShift(shift);
                          setShowShiftModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3
                              className={`font-semibold ${
                                signedUp ? "text-yellow-900" : isFull ? "text-gray-400" : "text-gray-900"
                              }`}
                            >
                              {shift.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className={signedUp ? "text-yellow-600" : isFull ? "text-gray-400" : "text-gray-600"}>
                                {shift.startTime} - {shift.endTime}
                              </span>
                            </div>
                            {shift.maxVolunteers && (
                              <div className="flex items-center gap-2 mt-1 text-sm">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className={isFull ? "text-red-600" : "text-gray-600"}>
                                  {assignedUsers.length}/{shift.maxVolunteers} spots filled
                                </span>
                              </div>
                            )}
                            {assignedUsers.length > 0 && (isAdmin || userRole === "volunteer") && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Scheduled:</p>
                                <div className="flex flex-wrap gap-2">
                                  {assignedUsers.map((user: any, idx: number) => (
                                    <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                      {formatUserDisplayName(user.userName, user.userNickname)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            {signedUp ? (
                              <span className="bg-yellow-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                                Signed Up
                              </span>
                            ) : isFull ? (
                              <span className="bg-gray-300 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg">Full</span>
                            ) : canSign ? (
                              <span className="bg-gray-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Open</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {dayMeetings.map((meeting: any) => {
                    if (!currentUser) return null;
                    const myInvite = meeting.invitees?.find((inv: any) => inv.userId === currentUser.id);
                    const myRSVP = myInvite?.rsvpStatus || "pending";
                    const isCreator = meeting.createdBy === currentUser.id;

                    return (
                      <div
                        key={meeting.id}
                        className={`border-2 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow ${
                          myRSVP === "yes"
                            ? "bg-green-50 border-green-500"
                            : myRSVP === "no"
                            ? "bg-red-50 border-red-300"
                            : myRSVP === "maybe"
                            ? "bg-blue-50 border-blue-300"
                            : "bg-purple-50 border-purple-300"
                        }`}
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setShowMeetingModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {meeting.type === "virtual" ? (
                                <Video className="w-4 h-4 text-purple-600" />
                              ) : (
                                <Users className="w-4 h-4 text-purple-600" />
                              )}
                              <span className="text-xs font-semibold text-gray-500 uppercase">Meeting</span>
                            </div>
                            <h3 className={`font-semibold ${myRSVP === "no" ? "text-gray-400" : "text-gray-900"}`}>
                              {meeting.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className={myRSVP === "no" ? "text-gray-400" : "text-gray-600"}>
                                {meeting.startTime} - {meeting.endTime}
                              </span>
                            </div>
                            {isCreator && (
                              <p className="text-xs text-gray-500 italic mt-1">You created this</p>
                            )}
                          </div>
                          <div className="ml-4">
                            {myRSVP === "yes" ? (
                              <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Going</span>
                            ) : myRSVP === "no" ? (
                              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                                Not Going
                              </span>
                            ) : myRSVP === "maybe" ? (
                              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Maybe</span>
                            ) : (
                              <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="pl-4">
                  <p className="text-gray-400 italic">
                    {activeTab === "my" ? "Nothing scheduled" : "No shifts scheduled"}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Shift Details Modal */}
      {showShiftModal && selectedShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text">Shift Details</h2>
              <button
                onClick={() => setShowShiftModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-text mb-4">{selectedShift.title}</h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">
                    {(() => {
                      const [year, month, day] = selectedShift.date.split("-").map(Number);
                      const shiftDate = new Date(year, month - 1, day);
                      return shiftDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      });
                    })()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">
                    {selectedShift.startTime} - {selectedShift.endTime}
                  </span>
                </div>

                {selectedShift.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700">{selectedShift.description}</p>
                  </div>
                )}

                {selectedShift.maxVolunteers && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Volunteers: {(selectedShift.assignedUsers || []).length}/{selectedShift.maxVolunteers}
                    </p>
                  </div>
                )}

                {(selectedShift.assignedUsers || []).length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Signed Up</p>
                    {selectedShift.assignedUsers.map((assignment: any) => (
                      <div key={assignment.userId} className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {formatUserDisplayName(assignment.userName, assignment.userNickname)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {isSignedUp(selectedShift) ? (
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-semibold transition-colors">
                    Cancel Signup
                  </button>
                ) : canSignUp(selectedShift) ? (
                  <button className="flex-1 bg-gray-700 hover:bg-gray-800 text-white rounded-xl py-3 font-semibold transition-colors">
                    Sign Up
                  </button>
                ) : (
                  <div className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-3 text-center font-semibold">
                    {(selectedShift.assignedUsers || []).length >= selectedShift.maxVolunteers
                      ? "Shift is Full"
                      : "Not available for your role"}
                  </div>
                )}
                {isAdmin && (
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl px-6 py-3 font-semibold transition-colors flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {showMeetingModal && selectedMeeting && currentUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text">Meeting Details</h2>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-text mb-4">{selectedMeeting.title}</h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  {selectedMeeting.type === "virtual" ? (
                    <>
                      <Video className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">Virtual Meeting</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">In-Person Meeting</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">
                    {(() => {
                      const [year, month, day] = selectedMeeting.date.split("-").map(Number);
                      const meetingDate = new Date(year, month - 1, day);
                      return meetingDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      });
                    })()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">
                    {selectedMeeting.startTime} - {selectedMeeting.endTime}
                  </span>
                </div>

                {selectedMeeting.type === "virtual" && selectedMeeting.videoCallLink && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                    <a
                      href={selectedMeeting.videoCallLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {selectedMeeting.videoCallLink}
                    </a>
                  </div>
                )}

                {selectedMeeting.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700">{selectedMeeting.description}</p>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Organized by</p>
                  <p className="text-gray-700">
                    {formatUserDisplayName(selectedMeeting.createdByName, selectedMeeting.createdByNickname)}
                  </p>
                </div>

                {selectedMeeting.invitees && selectedMeeting.invitees.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Invitees ({selectedMeeting.invitees.length})
                    </p>
                    <div className="space-y-2">
                      {selectedMeeting.invitees.map((invitee: any) => (
                        <div key={invitee.userId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {formatUserDisplayName(invitee.userName, invitee.userNickname)}
                              {invitee.userId === currentUser.id && " (You)"}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              invitee.rsvpStatus === "yes"
                                ? "bg-green-100 text-green-700"
                                : invitee.rsvpStatus === "no"
                                ? "bg-red-100 text-red-700"
                                : invitee.rsvpStatus === "maybe"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {invitee.rsvpStatus === "yes"
                              ? "Going"
                              : invitee.rsvpStatus === "no"
                              ? "Not Going"
                              : invitee.rsvpStatus === "maybe"
                              ? "Maybe"
                              : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RSVP Buttons */}
              {selectedMeeting.invitees?.some((inv: any) => inv.userId === currentUser.id) && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Your Response</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold transition-colors flex flex-col items-center gap-1">
                      <CheckCircle className="w-5 h-5" />
                      <span>Yes</span>
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold transition-colors flex flex-col items-center gap-1">
                      <AlertCircle className="w-5 h-5" />
                      <span>Maybe</span>
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-semibold transition-colors flex flex-col items-center gap-1">
                      <X className="w-5 h-5" />
                      <span>No</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
