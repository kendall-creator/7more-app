import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDataStore } from "../store/dataStore";
import {
  LogOut,
  UserPlus,
  AlertCircle,
  Users,
  Phone,
  CheckSquare,
  Calendar,
  ChevronRight,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function MainDashboard() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const participants = useDataStore((s) => s.participants);
  const tasks = useDataStore((s) => s.tasks);
  const shifts = useDataStore((s) => s.shifts);

  const isMentor =
    currentUser?.role === "mentor" || currentUser?.role === "mentorship_leader";
  const isMentorshipLeader = currentUser?.role === "mentorship_leader";
  const isBridgeTeam = currentUser?.role === "bridge_team";

  // Get assigned participants
  const assignedParticipants = useMemo(
    () =>
      currentUser
        ? participants.filter((p) => p.assignedMentor === currentUser.id)
        : [],
    [participants, currentUser]
  );

  // Recently assigned (last 7 days)
  const recentlyAssigned = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return assignedParticipants.filter((p) => {
      if (!p.assignedToMentorAt) return false;
      return new Date(p.assignedToMentorAt) >= sevenDaysAgo;
    });
  }, [assignedParticipants]);

  // Needs follow-up (attempted contact)
  const needsFollowUp = useMemo(() => {
    return assignedParticipants.filter(
      (p) =>
        p.status === "bridge_attempted" || p.status === "initial_contact_pending"
    );
  }, [assignedParticipants]);

  // My tasks (pending and in progress)
  const myTasks = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.assignedToUserId === currentUser?.id &&
        (t.status === "pending" ||
          t.status === "in_progress" ||
          t.status === "overdue")
    );
  }, [tasks, currentUser]);

  // My upcoming shifts
  const myUpcomingShifts = useMemo(() => {
    if (!currentUser) return [];
    const now = new Date();

    return shifts
      .filter((shift) => {
        const isAssigned =
          shift.assignedUsers?.some(
            (assignment) => assignment.userId === currentUser.id
          ) || shift.assignedUserId === currentUser.id;
        if (!isAssigned) return false;

        const shiftDate = new Date(shift.date);
        return shiftDate >= now;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [currentUser, shifts]);

  // Mentees needing assignment (mentor leaders only)
  const menteesNeedingAssignment = useMemo(() => {
    if (!isMentorshipLeader) return [];
    return participants.filter((p) => p.status === "pending_mentor");
  }, [isMentorshipLeader, participants]);

  // Pam Lychner Schedule (Monday-Friday current week) - For Bridge Team
  const pamLychnerSchedule = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay();

    const startOfWeek = new Date(now);
    const daysToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    startOfWeek.setDate(now.getDate() + daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDays = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);

      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, "0");
      const dayNum = String(day.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${dayNum}`;

      const dayShifts = shifts.filter(
        (shift) => shift.date === dateString && shift.location === "pam_lychner"
      );

      weekDays.push({
        date: dateString,
        dayName: day.toLocaleDateString("en-US", { weekday: "long" }),
        dayLabel: day.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        shifts: dayShifts,
      });
    }

    return weekDays;
  }, [shifts]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="bg-[#405b69] pt-8 pb-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-1">
              Welcome back, {currentUser?.name?.split(" ")[0]}!
            </h1>
            <p className="text-white/90 text-sm">
              Here is your overview for today
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">7+</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {/* Quick Actions - For users with volunteer management access */}
        {(currentUser?.role === "mentorship_leader" ||
          currentUser?.role === "bridge_team") && (
          <div>
            <h2 className="text-base font-bold text-[#3c3832] mb-3">
              Quick Actions
            </h2>
            <button className="w-full bg-purple-600 rounded-2xl p-4 hover:bg-purple-700 transition-colors flex items-center gap-3 text-white">
              <UserPlus className="w-6 h-6" />
              <span className="text-sm font-semibold">Add New Volunteer</span>
            </button>
          </div>
        )}

        {/* Mentees Needing Assignment - Mentor Leaders Only */}
        {isMentorshipLeader && menteesNeedingAssignment.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 cursor-pointer hover:bg-red-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text-red-900">
                  Action Required
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-red-700 text-sm mb-2">
              {menteesNeedingAssignment.length} mentee
              {menteesNeedingAssignment.length !== 1 ? "s" : ""} waiting for
              mentor assignment
            </p>
            <p className="text-red-600 text-xs font-semibold">
              Tap to assign mentors
            </p>
          </div>
        )}

        {/* Recently Assigned Mentees */}
        {isMentor && recentlyAssigned.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-[#d7d7d6]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#405b69]" />
                <h3 className="text-base font-bold text-[#3c3832]">
                  Recently Assigned ({recentlyAssigned.length})
                </h3>
              </div>
              <button className="text-[#405b69] text-sm font-semibold hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recentlyAssigned.slice(0, 3).map((participant) => (
                <div
                  key={participant.id}
                  className="bg-[#405b69]/10 rounded-xl p-3 cursor-pointer hover:bg-[#405b69]/20 transition-colors"
                >
                  <p className="text-base font-semibold text-[#3c3832]">
                    {participant.firstName} {participant.lastName}
                  </p>
                  <p className="text-xs text-[#99896c] mt-1">
                    #{participant.participantNumber}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentees Needing Follow-Up */}
        {isMentor && needsFollowUp.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-[#d7d7d6]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#fcc85c]" />
                <h3 className="text-base font-bold text-[#3c3832]">
                  Needs Follow-Up ({needsFollowUp.length})
                </h3>
              </div>
              <button className="text-[#405b69] text-sm font-semibold hover:underline">
                View All
              </button>
            </div>
            <p className="text-sm text-[#99896c] mb-3">
              These mentees need to be contacted or followed up with
            </p>
            <div className="space-y-2">
              {needsFollowUp.slice(0, 3).map((participant) => (
                <div
                  key={participant.id}
                  className="bg-[#fcc85c]/20 border border-[#fcc85c]/40 rounded-xl p-3 cursor-pointer hover:bg-[#fcc85c]/30 transition-colors"
                >
                  <p className="text-base font-semibold text-[#3c3832]">
                    {participant.firstName} {participant.lastName}
                  </p>
                  <p className="text-xs text-[#291403] mt-1">
                    {participant.status === "initial_contact_pending"
                      ? "Initial contact required"
                      : "Attempted contact - follow up needed"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Assigned to Me */}
        <div className="bg-white rounded-2xl p-5 border border-[#d7d7d6]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#99896c]" />
              <h3 className="text-base font-bold text-[#3c3832]">
                Tasks Assigned ({myTasks.length})
              </h3>
            </div>
            {myTasks.length > 0 && (
              <button className="text-[#405b69] text-sm font-semibold hover:underline">
                View All
              </button>
            )}
          </div>
          {myTasks.length === 0 ? (
            <div className="flex flex-col items-center py-6">
              <CheckCircle className="w-12 h-12 text-[#d7d7d6]" />
              <p className="text-[#99896c] text-sm mt-2">No active tasks</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className={`rounded-xl p-3 border cursor-pointer hover:opacity-80 transition-opacity ${
                    task.status === "overdue"
                      ? "bg-red-50 border-red-200"
                      : "bg-[#f8f8f8] border-[#d7d7d6]"
                  }`}
                >
                  <p className="text-base font-semibold text-[#3c3832]">
                    {task.title}
                  </p>
                  <p className="text-xs text-[#99896c] mt-1">
                    From: {task.assignedByUserName} • Priority: {task.priority}
                  </p>
                  {task.status === "overdue" && (
                    <p className="text-xs text-red-600 mt-1 font-semibold">
                      OVERDUE
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Schedule */}
        <div className="bg-white rounded-2xl p-5 border border-[#d7d7d6]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#99896c]" />
              <h3 className="text-base font-bold text-[#3c3832]">My Schedule</h3>
            </div>
            {myUpcomingShifts.length > 0 && (
              <button className="text-[#405b69] text-sm font-semibold hover:underline">
                View All
              </button>
            )}
          </div>
          {myUpcomingShifts.length === 0 ? (
            <div className="flex flex-col items-center py-6">
              <Clock className="w-12 h-12 text-[#d7d7d6]" />
              <p className="text-[#99896c] text-sm mt-2">
                Nothing scheduled at this time
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {myUpcomingShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-[#405b69]/10 border border-[#405b69]/20 rounded-xl p-3"
                >
                  <p className="text-base font-semibold text-[#3c3832]">
                    {shift.title}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Calendar className="w-3.5 h-3.5 text-[#99896c]" />
                    <p className="text-xs text-[#99896c]">
                      {formatDate(shift.date)} at {shift.startTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pam Lychner Schedule - Bridge Team Only */}
        {isBridgeTeam && (
          <div className="bg-white rounded-2xl p-5 border border-[#d7d7d6]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#99896c]" />
                <h3 className="text-base font-bold text-[#3c3832]">
                  Pam Lychner Schedule
                </h3>
              </div>
              <button className="text-[#405b69] text-sm font-semibold hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {pamLychnerSchedule.map((day) => (
                <div key={day.date}>
                  <p className="text-sm font-bold text-[#3c3832] mb-1">
                    {day.dayName} - {day.dayLabel}
                  </p>
                  {day.shifts.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <p className="text-xs text-[#99896c]">
                        No shifts scheduled
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {day.shifts.map((shift) => {
                        if (shift.holiday) {
                          return (
                            <div
                              key={shift.id}
                              className="bg-blue-50 border border-blue-200 rounded-xl p-3"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <p className="text-sm font-semibold text-blue-900">
                                  {shift.holiday}
                                </p>
                              </div>
                              {shift.description && (
                                <p className="text-xs text-blue-700 mt-1">
                                  {shift.description}
                                </p>
                              )}
                            </div>
                          );
                        }

                        const isCovered =
                          shift.assignedUserId ||
                          (shift.assignedUsers &&
                            shift.assignedUsers.length > 0) ||
                          shift.assignedToSupportNetwork;

                        return (
                          <div
                            key={shift.id}
                            className={`border rounded-xl p-3 ${
                              isCovered
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-[#3c3832]">
                                  {shift.startTime} - {shift.endTime}
                                </p>
                                {shift.assignedUserId ? (
                                  <div className="flex items-center gap-1 mt-1">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    <p className="text-xs text-green-700 font-medium">
                                      Covered by {shift.assignedUserName}
                                    </p>
                                  </div>
                                ) : shift.assignedToSupportNetwork ? (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Users className="w-3.5 h-3.5 text-green-500" />
                                    <p className="text-xs text-green-700 font-medium">
                                      Support Network:{" "}
                                      {shift.assignedToSupportNetwork}
                                    </p>
                                  </div>
                                ) : shift.assignedUsers &&
                                  shift.assignedUsers.length > 0 ? (
                                  <div className="mt-1">
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                      <p className="text-xs text-green-700 font-medium">
                                        Covered by {shift.assignedUsers.length}{" "}
                                        volunteer
                                        {shift.assignedUsers.length > 1
                                          ? "s"
                                          : ""}
                                      </p>
                                    </div>
                                    <p className="text-xs text-green-600 ml-5 mt-0.5">
                                      {shift.assignedUsers
                                        .map((u) => u.userName)
                                        .join(", ")}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                    <p className="text-xs text-red-700 font-medium">
                                      Not covered
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
