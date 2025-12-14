import { useMemo } from "react";
import {
  UserPlus,
  PlusCircle,
  Users,
  CheckSquare,
  Calendar,
  Phone,
} from "lucide-react";
import { useDataStore } from "../store/dataStore";
import { useAuthStore } from "../store/authStore";

interface AdminHomepageViewProps {
  onNavigate: (view: string) => void;
}

export default function AdminHomepageView({ onNavigate }: AdminHomepageViewProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const participants = useDataStore((s) => s.participants);
  const tasks = useDataStore((s) => s.tasks);
  const shifts = useDataStore((s) => s.shifts);
  const allUsers = useAuthStore((s) => s.users || []);

  const userRole = currentUser?.role;
  const isBridgeTeamLeader = userRole === "bridge_team_leader";

  // Filter participants based on role
  const visibleParticipants = useMemo(() => {
    if (isBridgeTeamLeader) {
      return participants.filter((p) =>
        ["pending_bridge", "bridge_contacted", "bridge_attempted", "bridge_unable"].includes(p.status)
      );
    }
    return participants;
  }, [participants, isBridgeTeamLeader]);

  // Participant stats
  const stats = useMemo(() => {
    const total = visibleParticipants.length;
    const pendingMentor = visibleParticipants.filter((p) => p.status === "pending_mentor").length;
    const activeMentorship = visibleParticipants.filter((p) => p.status === "active_mentorship").length;
    const graduated = visibleParticipants.filter((p) => p.status === "graduated").length;

    return { total, pendingMentor, activeMentorship, graduated };
  }, [visibleParticipants]);

  // Task stats
  const taskStats = useMemo(() => {
    let relevantTasks = tasks;

    if (isBridgeTeamLeader) {
      const bridgeTeamUserIds = allUsers
        .filter((u) => u.role === "bridge_team" || u.role === "bridge_team_leader")
        .map((u) => u.id);
      relevantTasks = tasks.filter((t) => bridgeTeamUserIds.includes(t.assignedToUserId));
    }

    const totalTasks = relevantTasks.length;
    const overdue = relevantTasks.filter((t) => t.status === "overdue").length;
    const inProgress = relevantTasks.filter((t) => t.status === "in_progress").length;
    const completed = relevantTasks.filter((t) => t.status === "completed").length;

    return { totalTasks, overdue, inProgress, completed };
  }, [tasks, isBridgeTeamLeader, allUsers]);

  // Bridge Team stats
  const bridgeTeamStats = useMemo(() => {
    const users = allUsers.filter((u) => u.role === "bridge_team" || u.role === "bridge_team_leader").length;
    const totalParticipants = visibleParticipants.filter(
      (p) => ["pending_bridge", "bridge_contacted", "bridge_attempted", "bridge_unable"].includes(p.status)
    ).length;
    const pendingBridge = visibleParticipants.filter((p) => p.status === "pending_bridge").length;
    const contacted = visibleParticipants.filter((p) => p.status === "bridge_contacted").length;
    const attempted = visibleParticipants.filter((p) => p.status === "bridge_attempted").length;
    const unable = visibleParticipants.filter((p) => p.status === "bridge_unable").length;

    return { users, totalParticipants, pendingBridge, contacted, attempted, unable };
  }, [allUsers, visibleParticipants]);

  // Mentor stats
  const mentorStats = useMemo(() => {
    const users = allUsers.filter((u) => u.role === "mentor" || u.role === "mentorship_leader").length;
    const totalParticipants = visibleParticipants.filter(
      (p) => ["pending_mentor", "initial_contact_pending", "assigned_mentor", "mentor_attempted", "mentor_unable", "active_mentorship", "graduated"].includes(p.status)
    ).length;

    const pending = visibleParticipants.filter(
      (p) => ["pending_mentor", "initial_contact_pending", "assigned_mentor", "mentor_attempted", "mentor_unable"].includes(p.status)
    ).length;

    const contacted = visibleParticipants.filter((p) => p.status === "active_mentorship").length;
    const graduated = visibleParticipants.filter((p) => p.status === "graduated").length;

    return { users, totalParticipants, pending, contacted, graduated };
  }, [allUsers, visibleParticipants]);

  // Pam Lychner Schedule
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
        dayLabel: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        shifts: dayShifts,
      });
    }

    return weekDays;
  }, [shifts]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">
          Welcome back, {currentUser?.name?.split(" ")[0]}!
        </h1>
        <p className="text-secondary">Here is your program overview</p>
      </div>

      <div className="space-y-4">
        {/* Quick Actions */}
        <div>
          <h2 className="text-base font-bold text-text mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => onNavigate("add-participant")}
              className="bg-gray-700 hover:bg-gray-800 text-white rounded-xl p-4 text-left transition-colors"
            >
              <UserPlus className="w-6 h-6 mb-2" />
              <p className="text-sm font-semibold">New Participant Intake</p>
            </button>
            <button
              onClick={() => onNavigate("assign-tasks")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl p-4 text-left transition-colors"
            >
              <PlusCircle className="w-6 h-6 mb-2" />
              <p className="text-sm font-semibold">Create Task</p>
            </button>
          </div>
          {!isBridgeTeamLeader && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate("volunteers")}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-4 text-left transition-colors"
              >
                <Users className="w-6 h-6 mb-2" />
                <p className="text-sm font-semibold">Volunteer Mgmt</p>
              </button>
              <button
                onClick={() => onNavigate("volunteers")}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-4 text-left transition-colors"
              >
                <UserPlus className="w-6 h-6 mb-2" />
                <p className="text-sm font-semibold">Add Volunteer</p>
              </button>
            </div>
          )}
        </div>

        {/* Participants Overview */}
        <div className="bg-white rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-700" />
              <h3 className="text-base font-bold text-text">Participants</h3>
            </div>
            <button onClick={() => onNavigate("participants")} className="text-gray-700 text-sm font-semibold hover:underline">View All</button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigate("participants")}
              className="bg-gray-50 rounded-xl p-3 text-left hover:bg-gray-100 transition-colors"
            >
              <p className="text-2xl font-bold text-text">{stats.total}</p>
              <p className="text-xs text-secondary mt-1">Total</p>
            </button>
            <button
              onClick={() => onNavigate("participants")}
              className="bg-red-50 rounded-xl p-3 text-left hover:bg-red-100 transition-colors"
            >
              <p className="text-2xl font-bold text-red-600">{stats.pendingMentor}</p>
              <p className="text-xs text-secondary mt-1">Need Assignment</p>
            </button>
            <button
              onClick={() => onNavigate("participants")}
              className="bg-green-50 rounded-xl p-3 text-left hover:bg-green-100 transition-colors"
            >
              <p className="text-2xl font-bold text-green-600">{stats.activeMentorship}</p>
              <p className="text-xs text-secondary mt-1">Active</p>
            </button>
            <button
              onClick={() => onNavigate("participants")}
              className="bg-blue-50 rounded-xl p-3 text-left hover:bg-blue-100 transition-colors"
            >
              <p className="text-2xl font-bold text-blue-600">{stats.graduated}</p>
              <p className="text-xs text-secondary mt-1">Graduated</p>
            </button>
          </div>
        </div>

        {/* Tasks Overview */}
        <div className="bg-white rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-gray-500" />
              <h3 className="text-base font-bold text-text">Tasks</h3>
            </div>
            <button onClick={() => onNavigate("tasks")} className="text-gray-700 text-sm font-semibold hover:underline">Manage</button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => onNavigate("tasks")}
              className="bg-gray-50 rounded-xl p-3 text-left hover:bg-gray-100 transition-colors"
            >
              <p className="text-2xl font-bold text-text">{taskStats.totalTasks}</p>
              <p className="text-xs text-secondary mt-1">Total</p>
            </button>
            <button
              onClick={() => onNavigate("tasks")}
              className="bg-red-50 rounded-xl p-3 text-left hover:bg-red-100 transition-colors"
            >
              <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
              <p className="text-xs text-secondary mt-1">Overdue</p>
            </button>
            <button
              onClick={() => onNavigate("tasks")}
              className="bg-blue-50 rounded-xl p-3 text-left hover:bg-blue-100 transition-colors"
            >
              <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
              <p className="text-xs text-secondary mt-1">In Progress</p>
            </button>
            <button
              onClick={() => onNavigate("tasks")}
              className="bg-green-50 rounded-xl p-3 text-left hover:bg-green-100 transition-colors"
            >
              <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
              <p className="text-xs text-secondary mt-1">Completed</p>
            </button>
          </div>
        </div>

        {/* Bridge Team Overview */}
        <div className="bg-white rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-600" />
              <h3 className="text-base font-bold text-text">Bridge Team</h3>
            </div>
            <button onClick={() => onNavigate("users")} className="text-gray-700 text-sm font-semibold hover:underline">Manage</button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-teal-50 rounded-xl p-3 border border-teal-200">
              <p className="text-2xl font-bold text-teal-600">{bridgeTeamStats.users}</p>
              <p className="text-xs text-secondary mt-1">Team Members</p>
            </div>
            <div className="bg-teal-50 rounded-xl p-3 border border-teal-200">
              <p className="text-2xl font-bold text-teal-600">{bridgeTeamStats.totalParticipants}</p>
              <p className="text-xs text-secondary mt-1">Total Participants</p>
            </div>
          </div>

          <p className="text-xs font-semibold text-secondary mb-2 uppercase">Participant Status</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
              <p className="text-xl font-bold text-orange-600">{bridgeTeamStats.pendingBridge}</p>
              <p className="text-xs text-secondary mt-1">Pending Bridge</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-200">
              <p className="text-xl font-bold text-green-600">{bridgeTeamStats.contacted}</p>
              <p className="text-xs text-secondary mt-1">Contacted</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
              <p className="text-xl font-bold text-yellow-600">{bridgeTeamStats.attempted}</p>
              <p className="text-xs text-secondary mt-1">Attempted</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 border border-red-200">
              <p className="text-xl font-bold text-red-600">{bridgeTeamStats.unable}</p>
              <p className="text-xs text-secondary mt-1">Unable to Contact</p>
            </div>
          </div>
        </div>

        {/* Mentors Overview */}
        {!isBridgeTeamLeader && (
          <div className="bg-white rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-500" />
                <h3 className="text-base font-bold text-text">Mentors</h3>
              </div>
              <button onClick={() => onNavigate("users")} className="text-gray-700 text-sm font-semibold hover:underline">Manage</button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-300">
                <p className="text-2xl font-bold text-yellow-600">{mentorStats.users}</p>
                <p className="text-xs text-secondary mt-1">Mentors & Leaders</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-300">
                <p className="text-2xl font-bold text-yellow-600">{mentorStats.totalParticipants}</p>
                <p className="text-xs text-secondary mt-1">Total Participants</p>
              </div>
            </div>

            <p className="text-xs font-semibold text-secondary mb-2 uppercase">Participant Status</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-xl font-bold text-gray-600">{mentorStats.pending}</p>
                <p className="text-xs text-secondary mt-1">Pending</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                <p className="text-xl font-bold text-green-600">{mentorStats.contacted}</p>
                <p className="text-xs text-secondary mt-1">Contacted</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 col-span-2">
                <p className="text-xl font-bold text-blue-600">{mentorStats.graduated}</p>
                <p className="text-xs text-secondary mt-1">Graduated</p>
              </div>
            </div>
          </div>
        )}

        {/* Pam Lychner Schedule */}
        <div className="bg-white rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <h3 className="text-base font-bold text-text">Pam Lychner Schedule</h3>
            </div>
            <button onClick={() => onNavigate("scheduler")} className="text-gray-700 text-sm font-semibold hover:underline">View All</button>
          </div>

          {pamLychnerSchedule.map((day) => (
            <div key={day.date} className="mb-3">
              <p className="text-sm font-bold text-text mb-1">
                {day.dayName} - {day.dayLabel}
              </p>
              {day.shifts.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs text-secondary">No shifts scheduled</p>
                </div>
              ) : (
                day.shifts.map((shift: any) => {
                  if (shift.holiday) {
                    return (
                      <div key={shift.id} className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <p className="text-sm font-semibold text-blue-900">{shift.holiday}</p>
                        </div>
                        {shift.description && (
                          <p className="text-xs text-blue-700 mt-1">{shift.description}</p>
                        )}
                      </div>
                    );
                  }

                  const isCovered =
                    shift.assignedUserId ||
                    (shift.assignedUsers && shift.assignedUsers.length > 0) ||
                    shift.assignedToSupportNetwork;

                  return (
                    <div
                      key={shift.id}
                      className={`rounded-xl p-3 mb-2 border ${
                        isCovered ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-text">
                            {shift.startTime} - {shift.endTime}
                          </p>
                          {shift.assignedUsers && shift.assignedUsers.length > 0 && (
                            <p className="text-xs text-secondary mt-1">
                              Assigned to {shift.assignedUsers.length} volunteer
                              {shift.assignedUsers.length !== 1 ? "s" : ""}
                            </p>
                          )}
                          {shift.assignedToSupportNetwork && (
                            <p className="text-xs text-secondary mt-1">Support Network</p>
                          )}
                          {!isCovered && <p className="text-xs text-red-700 mt-1">Needs coverage</p>}
                        </div>
                        {isCovered ? (
                          <CheckSquare className="w-5 h-5 text-green-600" />
                        ) : (
                          <Phone className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
