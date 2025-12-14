import { useMemo, useState } from "react";
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
  BarChart3,
  FileText,
  UserCircle,
  PlusCircle,
} from "lucide-react";

// NavButton component
function NavButton({
  icon,
  label,
  active = false,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? "bg-primary text-white"
          : "text-text hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

export default function MainDashboard() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const participants = useDataStore((s) => s.participants);
  const tasks = useDataStore((s) => s.tasks);
  const shifts = useDataStore((s) => s.shifts);

  // Active view state
  const [activeView, setActiveView] = useState("dashboard");

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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">7+</span>
            </div>
            <span className="text-xl font-bold text-text">7more</span>
          </div>
        </div>

        {/* Navigation based on role */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Admin & Bridge Team Leader Navigation */}
          {(currentUser?.role === "admin" || currentUser?.role === "bridge_team_leader") && (
            <>
              <NavButton
                icon={<Users className="w-5 h-5" />}
                label="All Participants"
                active={activeView === "participants"}
                onClick={() => setActiveView("participants")}
              />
              <NavButton
                icon={<UserPlus className="w-5 h-5" />}
                label="Add Participant"
                active={activeView === "add-participant"}
                onClick={() => setActiveView("add-participant")}
              />
              <NavButton
                icon={<Users className="w-5 h-5" />}
                label="Manage Users"
                active={activeView === "users"}
                onClick={() => setActiveView("users")}
              />
              <NavButton
                icon={<CheckSquare className="w-5 h-5" />}
                label="Task Management"
                active={activeView === "tasks"}
                onClick={() => setActiveView("tasks")}
              />
              <NavButton
                icon={<UserCircle className="w-5 h-5" />}
                label="Volunteers"
                active={activeView === "volunteers"}
                onClick={() => setActiveView("volunteers")}
              />
              <NavButton
                icon={<Calendar className="w-5 h-5" />}
                label="Scheduler"
                active={activeView === "scheduler"}
                onClick={() => setActiveView("scheduler")}
              />
              <NavButton
                icon={<BarChart3 className="w-5 h-5" />}
                label="Monthly Reporting"
                active={activeView === "reporting"}
                onClick={() => setActiveView("reporting")}
              />
              <NavButton
                icon={<FileText className="w-5 h-5" />}
                label="Resources"
                active={activeView === "resources"}
                onClick={() => setActiveView("resources")}
              />
            </>
          )}

          {/* Bridge Team Navigation */}
          {currentUser?.role === "bridge_team" && (
            <>
              <NavButton
                icon={<Users className="w-5 h-5" />}
                label="My Queue"
                active={activeView === "dashboard"}
                onClick={() => setActiveView("dashboard")}
              />
              <NavButton
                icon={<Calendar className="w-5 h-5" />}
                label="Scheduler"
                active={activeView === "scheduler"}
                onClick={() => setActiveView("scheduler")}
              />
              <NavButton
                icon={<CheckSquare className="w-5 h-5" />}
                label="My Tasks"
                active={activeView === "my-tasks"}
                onClick={() => setActiveView("my-tasks")}
              />
              <NavButton
                icon={<FileText className="w-5 h-5" />}
                label="Resources"
                active={activeView === "resources"}
                onClick={() => setActiveView("resources")}
              />
            </>
          )}

          {/* Mentor Navigation */}
          {currentUser?.role === "mentor" && (
            <>
              <NavButton
                icon={<Users className="w-5 h-5" />}
                label="My Mentees"
                active={activeView === "my-mentees"}
                onClick={() => setActiveView("my-mentees")}
              />
              <NavButton
                icon={<CheckSquare className="w-5 h-5" />}
                label="My Tasks"
                active={activeView === "my-tasks"}
                onClick={() => setActiveView("my-tasks")}
              />
              <NavButton
                icon={<UserCircle className="w-5 h-5" />}
                label="Volunteers"
                active={activeView === "volunteers"}
                onClick={() => setActiveView("volunteers")}
              />
              <NavButton
                icon={<FileText className="w-5 h-5" />}
                label="Resources"
                active={activeView === "resources"}
                onClick={() => setActiveView("resources")}
              />
            </>
          )}

          {/* Mentorship Leader Navigation */}
          {currentUser?.role === "mentorship_leader" && (
            <>
              <NavButton
                icon={<Users className="w-5 h-5" />}
                label="My Mentees"
                active={activeView === "my-mentees"}
                onClick={() => setActiveView("my-mentees")}
              />
              <NavButton
                icon={<UserCircle className="w-5 h-5" />}
                label="Volunteers"
                active={activeView === "volunteers"}
                onClick={() => setActiveView("volunteers")}
              />
              <NavButton
                icon={<CheckSquare className="w-5 h-5" />}
                label="My Tasks"
                active={activeView === "my-tasks"}
                onClick={() => setActiveView("my-tasks")}
              />
              <NavButton
                icon={<PlusCircle className="w-5 h-5" />}
                label="Assign Tasks"
                active={activeView === "assign-tasks"}
                onClick={() => setActiveView("assign-tasks")}
              />
              <NavButton
                icon={<BarChart3 className="w-5 h-5" />}
                label="Reporting"
                active={activeView === "reporting"}
                onClick={() => setActiveView("reporting")}
              />
              <NavButton
                icon={<FileText className="w-5 h-5" />}
                label="Resources"
                active={activeView === "resources"}
                onClick={() => setActiveView("resources")}
              />
            </>
          )}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-border">
          <div className="mb-3 px-4">
            <p className="text-sm font-semibold text-text truncate">
              {currentUser?.name}
            </p>
            <p className="text-xs text-secondary truncate">{currentUser?.email}</p>
            <p className="text-xs text-accent mt-1 font-medium">
              {currentUser?.role?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* All Participants View */}
          {activeView === "participants" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">All Participants</h1>
                <p className="text-secondary">View and manage all participants in the system</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <div className="space-y-4">
                  {participants.length === 0 ? (
                    <p className="text-secondary text-center py-8">No participants found</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {participants.map((p) => (
                        <div
                          key={p.id}
                          className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-text">
                                {p.firstName} {p.lastName}
                              </h3>
                              <p className="text-sm text-secondary mt-1">
                                #{p.participantNumber} • Status: {p.status?.replace(/_/g, " ")}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-secondary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Dashboard/Overview View (default) */}
          {(activeView === "dashboard" || !activeView) && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">
                  Welcome back, {currentUser?.name?.split(" ")[0]}!
                </h1>
                <p className="text-secondary">Here is your overview for today</p>
              </div>

          {/* Content Grid */}
          <div className="space-y-6">
          {/* Quick Actions - For users with volunteer management access */}
          {(currentUser?.role === "mentorship_leader" ||
            currentUser?.role === "bridge_team") && (
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold text-text mb-4">
                Quick Actions
              </h2>
              <button className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-3 flex items-center justify-center gap-3 transition-colors">
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Add New Volunteer</span>
              </button>
            </div>
          )}

          {/* Mentees Needing Assignment - Mentor Leaders Only */}
          {isMentorshipLeader && menteesNeedingAssignment.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 cursor-pointer hover:bg-red-100 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold text-red-900">
                    Action Required
                  </h3>
                </div>
                <ChevronRight className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-700 mb-2">
                {menteesNeedingAssignment.length} mentee
                {menteesNeedingAssignment.length !== 1 ? "s" : ""} waiting for
                mentor assignment
              </p>
              <p className="text-red-600 text-sm font-semibold">
                Click to assign mentors
              </p>
            </div>
          )}

          {/* Two Column Layout for Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recently Assigned Mentees */}
            {isMentor && recentlyAssigned.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-text">
                      Recently Assigned ({recentlyAssigned.length})
                    </h3>
                  </div>
                  <button className="text-primary text-sm font-medium hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {recentlyAssigned.slice(0, 3).map((participant) => (
                    <div
                      key={participant.id}
                      className="bg-primary/5 rounded-lg p-4 cursor-pointer hover:bg-primary/10 transition-colors"
                    >
                      <p className="font-semibold text-text">
                        {participant.firstName} {participant.lastName}
                      </p>
                      <p className="text-sm text-secondary mt-1">
                        #{participant.participantNumber}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentees Needing Follow-Up */}
            {isMentor && needsFollowUp.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-semibold text-text">
                      Needs Follow-Up ({needsFollowUp.length})
                    </h3>
                  </div>
                  <button className="text-primary text-sm font-medium hover:underline">
                    View All
                  </button>
                </div>
                <p className="text-sm text-secondary mb-4">
                  These mentees need to be contacted or followed up with
                </p>
                <div className="space-y-3">
                  {needsFollowUp.slice(0, 3).map((participant) => (
                    <div
                      key={participant.id}
                      className="bg-accent/20 border border-accent/40 rounded-lg p-4 cursor-pointer hover:bg-accent/30 transition-colors"
                    >
                      <p className="font-semibold text-text">
                        {participant.firstName} {participant.lastName}
                      </p>
                      <p className="text-sm text-text/70 mt-1">
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
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-secondary" />
                  <h3 className="text-lg font-semibold text-text">
                    Tasks Assigned ({myTasks.length})
                  </h3>
                </div>
                {myTasks.length > 0 && (
                  <button className="text-primary text-sm font-medium hover:underline">
                    View All
                  </button>
                )}
              </div>
              {myTasks.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <CheckCircle className="w-16 h-16 text-border" />
                  <p className="text-secondary text-sm mt-3">No active tasks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`rounded-lg p-4 border cursor-pointer hover:opacity-80 transition-opacity ${
                        task.status === "overdue"
                          ? "bg-red-50 border-red-200"
                          : "bg-background border-border"
                      }`}
                    >
                      <p className="font-semibold text-text">{task.title}</p>
                      <p className="text-sm text-secondary mt-1">
                        From: {task.assignedByUserName} • Priority: {task.priority}
                      </p>
                      {task.status === "overdue" && (
                        <p className="text-sm text-red-600 mt-1 font-semibold">
                          OVERDUE
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-secondary" />
                  <h3 className="text-lg font-semibold text-text">My Schedule</h3>
                </div>
                {myUpcomingShifts.length > 0 && (
                  <button className="text-primary text-sm font-medium hover:underline">
                    View All
                  </button>
                )}
              </div>
              {myUpcomingShifts.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <Clock className="w-16 h-16 text-border" />
                  <p className="text-secondary text-sm mt-3">
                    Nothing scheduled at this time
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myUpcomingShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-primary/5 border border-primary/20 rounded-lg p-4"
                    >
                      <p className="font-semibold text-text">{shift.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-secondary" />
                        <p className="text-sm text-secondary">
                          {formatDate(shift.date)} at {shift.startTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pam Lychner Schedule - Bridge Team Only */}
          {isBridgeTeam && (
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-secondary" />
                  <h3 className="text-lg font-semibold text-text">
                    Pam Lychner Schedule
                  </h3>
                </div>
                <button className="text-primary text-sm font-medium hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-6">
                {pamLychnerSchedule.map((day) => (
                  <div key={day.date}>
                    <p className="font-bold text-text mb-3">
                      {day.dayName} - {day.dayLabel}
                    </p>
                    {day.shifts.length === 0 ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-secondary">
                          No shifts scheduled
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {day.shifts.map((shift) => {
                          if (shift.holiday) {
                            return (
                              <div
                                key={shift.id}
                                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                              >
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-5 h-5 text-blue-500" />
                                  <p className="font-semibold text-blue-900">
                                    {shift.holiday}
                                  </p>
                                </div>
                                {shift.description && (
                                  <p className="text-sm text-blue-700 mt-2">
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
                              className={`border rounded-lg p-4 ${
                                isCovered
                                  ? "bg-green-50 border-green-200"
                                  : "bg-red-50 border-red-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-text">
                                    {shift.startTime} - {shift.endTime}
                                  </p>
                                  {shift.assignedUserId ? (
                                    <div className="flex items-center gap-2 mt-2">
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      <p className="text-sm text-green-700 font-medium">
                                        Covered by {shift.assignedUserName}
                                      </p>
                                    </div>
                                  ) : shift.assignedToSupportNetwork ? (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Users className="w-4 h-4 text-green-500" />
                                      <p className="text-sm text-green-700 font-medium">
                                        Support Network:{" "}
                                        {shift.assignedToSupportNetwork}
                                      </p>
                                    </div>
                                  ) : shift.assignedUsers &&
                                    shift.assignedUsers.length > 0 ? (
                                    <div className="mt-2">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <p className="text-sm text-green-700 font-medium">
                                          Covered by {shift.assignedUsers.length}{" "}
                                          volunteer
                                          {shift.assignedUsers.length > 1
                                            ? "s"
                                            : ""}
                                        </p>
                                      </div>
                                      <p className="text-sm text-green-600 ml-6 mt-1">
                                        {shift.assignedUsers
                                          .map((u) => u.userName)
                                          .join(", ")}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 mt-2">
                                      <AlertCircle className="w-4 h-4 text-red-500" />
                                      <p className="text-sm text-red-700 font-medium">
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
        </>
          )}
        </div>
      </main>
    </div>
  );
}
