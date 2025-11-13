import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCurrentUser, useUserRole } from "../state/authStore";
import { useParticipantStore } from "../state/participantStore";
import { useTaskStore } from "../state/taskStore";
import { useSchedulerStore } from "../state/schedulerStore";
import { useInvitedUsers } from "../state/usersStore";
import { Ionicons } from "@expo/vector-icons";
import { formatNumber } from "../utils/formatNumber";

export default function AdminHomepageScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const userRole = useUserRole();
  const allParticipants = useParticipantStore((s) => s.participants);
  const allTasks = useTaskStore((s) => s.tasks);
  const shifts = useSchedulerStore((s) => s.shifts);
  const invitedUsers = useInvitedUsers();

  // Filter participants based on role - Bridge Team Leaders only see Bridge Team participants
  const visibleParticipants = useMemo(() => {
    if (userRole === "bridge_team_leader") {
      return allParticipants.filter((p) =>
        ["pending_bridge", "bridge_contacted", "bridge_attempted", "bridge_unable"].includes(p.status)
      );
    }
    return allParticipants;
  }, [allParticipants, userRole]);

  // Participant stats
  const stats = useMemo(() => {
    const total = visibleParticipants.length;
    const pendingBridge = visibleParticipants.filter((p) => p.status === "pending_bridge").length;
    const contacted = visibleParticipants.filter((p) => p.status === "bridge_contacted").length;
    const pendingMentor = visibleParticipants.filter((p) => p.status === "pending_mentor").length;
    const activeMentorship = visibleParticipants.filter((p) => p.status === "active_mentorship").length;
    const graduated = visibleParticipants.filter((p) => p.status === "graduated").length;

    return { total, pendingBridge, contacted, pendingMentor, activeMentorship, graduated };
  }, [visibleParticipants]);

  // Task stats - Bridge Team Leaders only see tasks assigned to Bridge Team members
  const taskStats = useMemo(() => {
    let relevantTasks = allTasks;

    if (userRole === "bridge_team_leader") {
      const bridgeTeamUserIds = invitedUsers
        .filter((u) => u.role === "bridge_team" || u.role === "bridge_team_leader")
        .map((u) => u.id);
      relevantTasks = allTasks.filter((t) => bridgeTeamUserIds.includes(t.assignedToUserId));
    }

    const totalTasks = relevantTasks.length;
    const overdue = relevantTasks.filter((t) => t.status === "overdue").length;
    const inProgress = relevantTasks.filter((t) => t.status === "in_progress").length;
    const pending = relevantTasks.filter((t) => t.status === "pending").length;
    const completed = relevantTasks.filter((t) => t.status === "completed").length;

    return { totalTasks, overdue, inProgress, pending, completed };
  }, [allTasks, userRole, invitedUsers]);

  // Pam Lychner Schedule (Monday-Friday current week)
  const pamLychnerSchedule = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate start of current week (Monday)
    const startOfWeek = new Date(now);
    const daysToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek; // If Sunday, go back 6 days
    startOfWeek.setDate(now.getDate() + daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Create array for Monday through Friday
    const weekDays = [];
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);

      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, "0");
      const dayNum = String(day.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${dayNum}`;

      // Find Pam Lychner shifts for this day (using location field)
      const dayShifts = shifts.filter(
        (shift) =>
          shift.date === dateString &&
          shift.location === "pam_lychner"
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

  // User stats - Bridge Team Leaders only see Bridge Team members
  const userStats = useMemo(() => {
    let relevantUsers = invitedUsers;

    if (userRole === "bridge_team_leader") {
      relevantUsers = invitedUsers.filter((u) => u.role === "bridge_team" || u.role === "bridge_team_leader");
    }

    const mentors = relevantUsers.filter((u) => u.role === "mentor").length;
    const mentorLeaders = relevantUsers.filter((u) => u.role === "mentorship_leader").length;
    const bridgeTeam = relevantUsers.filter((u) => u.role === "bridge_team").length;
    const bridgeTeamLeaders = relevantUsers.filter((u) => u.role === "bridge_team_leader").length;
    const volunteers = relevantUsers.filter((u) => u.role === "volunteer" || u.role === "volunteer_support").length;

    return { mentors, mentorLeaders, bridgeTeam, bridgeTeamLeaders, volunteers, total: relevantUsers.length };
  }, [invitedUsers, userRole]);

  // Bridge Team stats
  const bridgeTeamStats = useMemo(() => {
    const users = invitedUsers.filter((u) => u.role === "bridge_team" || u.role === "bridge_team_leader").length;
    const totalParticipants = visibleParticipants.filter(
      (p) => p.status === "pending_bridge" || p.status === "bridge_contacted" ||
             p.status === "bridge_attempted" || p.status === "bridge_unable"
    ).length;
    const pendingBridge = visibleParticipants.filter((p) => p.status === "pending_bridge").length;
    const contacted = visibleParticipants.filter((p) => p.status === "bridge_contacted").length;
    const attempted = visibleParticipants.filter((p) => p.status === "bridge_attempted").length;
    const unable = visibleParticipants.filter((p) => p.status === "bridge_unable").length;

    return { users, totalParticipants, pendingBridge, contacted, attempted, unable };
  }, [invitedUsers, visibleParticipants]);

  // Mentor stats - Bridge Team Leaders won't see this section
  const mentorStats = useMemo(() => {
    const users = invitedUsers.filter((u) => u.role === "mentor" || u.role === "mentorship_leader").length;
    const totalParticipants = visibleParticipants.filter(
      (p) => p.status === "pending_mentor" || p.status === "active_mentorship" || p.status === "graduated"
    ).length;
    const pendingMentor = visibleParticipants.filter((p) => p.status === "pending_mentor").length;
    const activeMentorship = visibleParticipants.filter((p) => p.status === "active_mentorship").length;
    const graduated = visibleParticipants.filter((p) => p.status === "graduated").length;

    return { users, totalParticipants, pendingMentor, activeMentorship, graduated };
  }, [invitedUsers, visibleParticipants]);

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      {/* Header */}
      <View className="bg-[#405b69] pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white mb-1">
              Welcome back, {currentUser?.name?.split(" ")[0]}!
            </Text>
            <Text className="text-white/90 text-sm">Here is your program overview</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => navigation.navigate("IntakeTypeSelection")}
              className="w-12 h-12 bg-yellow-500 rounded-full items-center justify-center active:opacity-70"
            >
              <Ionicons name="add" size={28} color="white" />
            </Pressable>
            <Image
              source={require("../../assets/7more-logo.jpeg")}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-base font-bold text-[#3c3832] mb-3">Quick Actions</Text>
          <View className="flex-row gap-3 mb-3">
            <Pressable
              onPress={() => navigation.navigate("IntakeTypeSelection")}
              className="flex-1 bg-[#405b69] rounded-2xl p-4 active:opacity-80"
            >
              <Ionicons name="person-add" size={24} color="white" />
              <Text className="text-white text-sm font-semibold mt-2">Add Participant</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("AdminTaskManagement")}
              className="flex-1 bg-[#fcc85c] rounded-2xl p-4 active:opacity-80"
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white text-sm font-semibold mt-2">Create Task</Text>
            </Pressable>
          </View>
          {userRole !== "bridge_team_leader" && (
            <>
              <View className="flex-row gap-3 mb-3">
                <Pressable
                  onPress={() => navigation.navigate("EmbeddableForm")}
                  className="flex-1 bg-indigo-600 rounded-2xl p-4 active:opacity-80"
                >
                  <Ionicons name="code-slash" size={24} color="white" />
                  <Text className="text-white text-sm font-semibold mt-2">Web Form Code</Text>
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate("TestEmail")}
                  className="flex-1 bg-blue-500 rounded-2xl p-4 active:opacity-80"
                >
                  <Ionicons name="mail" size={24} color="white" />
                  <Text className="text-white text-sm font-semibold mt-2">Test Email</Text>
                </Pressable>
              </View>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => navigation.navigate("FileManagement")}
                  className="flex-1 bg-emerald-600 rounded-2xl p-4 active:opacity-80"
                >
                  <Ionicons name="folder-open" size={24} color="white" />
                  <Text className="text-white text-sm font-semibold mt-2">File Management</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        {/* Participants Overview */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="people" size={20} color="#405b69" />
              <Text className="text-base font-bold text-[#3c3832] ml-2">Participants</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("AllParticipants")}>
              <Text className="text-[#405b69] text-sm font-semibold">View All</Text>
            </Pressable>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => navigation.navigate("AllParticipants")}
              className="flex-1 min-w-[45%] bg-[#f8f8f8] rounded-xl p-3"
            >
              <Text className="text-2xl font-bold text-[#3c3832]">{formatNumber(stats.total)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Total</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("FilteredParticipants", { status: "pending_mentor" })}
              className="flex-1 min-w-[45%] bg-red-50 rounded-xl p-3"
            >
              <Text className="text-2xl font-bold text-red-600">{formatNumber(stats.pendingMentor)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Need Assignment</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("FilteredParticipants", { status: "active_mentorship" })}
              className="flex-1 min-w-[45%] bg-green-50 rounded-xl p-3"
            >
              <Text className="text-2xl font-bold text-green-600">{formatNumber(stats.activeMentorship)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Active</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("FilteredParticipants", { status: "graduated" })}
              className="flex-1 min-w-[45%] bg-blue-50 rounded-xl p-3"
            >
              <Text className="text-2xl font-bold text-blue-600">{formatNumber(stats.graduated)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Graduated</Text>
            </Pressable>
          </View>
        </View>

        {/* Tasks Overview */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="checkbox" size={20} color="#99896c" />
              <Text className="text-base font-bold text-[#3c3832] ml-2">Tasks</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("AdminTaskManagement")}>
              <Text className="text-[#405b69] text-sm font-semibold">Manage</Text>
            </Pressable>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1 bg-[#f8f8f8] rounded-xl p-3">
              <Text className="text-2xl font-bold text-[#3c3832]">{formatNumber(taskStats.totalTasks)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Total</Text>
            </View>
            <View className="flex-1 bg-red-50 rounded-xl p-3">
              <Text className="text-2xl font-bold text-red-600">{formatNumber(taskStats.overdue)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Overdue</Text>
            </View>
            <View className="flex-1 bg-blue-50 rounded-xl p-3">
              <Text className="text-2xl font-bold text-blue-600">{formatNumber(taskStats.inProgress)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">In Progress</Text>
            </View>
            <View className="flex-1 bg-green-50 rounded-xl p-3">
              <Text className="text-2xl font-bold text-green-600">{formatNumber(taskStats.completed)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Completed</Text>
            </View>
          </View>
        </View>

        {/* Bridge Team Overview */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="people-circle" size={20} color="#0891b2" />
              <Text className="text-base font-bold text-[#3c3832] ml-2">Bridge Team</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("Users")}>
              <Text className="text-[#405b69] text-sm font-semibold">Manage</Text>
            </Pressable>
          </View>

          {/* Summary Stats */}
          <View className="flex-row gap-2 mb-4">
            <View className="flex-1 bg-teal-50 rounded-xl p-3 border border-teal-200">
              <Text className="text-2xl font-bold text-teal-600">{formatNumber(bridgeTeamStats.users)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Team Members</Text>
            </View>
            <View className="flex-1 bg-teal-50 rounded-xl p-3 border border-teal-200">
              <Text className="text-2xl font-bold text-teal-600">{formatNumber(bridgeTeamStats.totalParticipants)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Total Participants</Text>
            </View>
          </View>

          {/* Participant Categories */}
          <Text className="text-xs font-semibold text-[#99896c] mb-2 uppercase">Participant Status</Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => navigation.navigate("FilteredParticipants", { status: "pending_bridge" })}
              className="flex-1 min-w-[45%] bg-orange-50 rounded-xl p-3 border border-orange-200"
            >
              <Text className="text-xl font-bold text-orange-600">{formatNumber(bridgeTeamStats.pendingBridge)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Pending Bridge</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("FilteredParticipants", { status: "bridge_contacted" })}
              className="flex-1 min-w-[45%] bg-green-50 rounded-xl p-3 border border-green-200"
            >
              <Text className="text-xl font-bold text-green-600">{formatNumber(bridgeTeamStats.contacted)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Contacted</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("FilteredParticipants", { status: "bridge_attempted" })}
              className="flex-1 min-w-[45%] bg-yellow-50 rounded-xl p-3 border border-yellow-200"
            >
              <Text className="text-xl font-bold text-yellow-600">{formatNumber(bridgeTeamStats.attempted)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Attempted</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("FilteredParticipants", { status: "bridge_unable" })}
              className="flex-1 min-w-[45%] bg-red-50 rounded-xl p-3 border border-red-200"
            >
              <Text className="text-xl font-bold text-red-600">{formatNumber(bridgeTeamStats.unable)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Unable to Contact</Text>
            </Pressable>
          </View>
        </View>

        {/* Mentors Overview */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="school" size={20} color="#fcc85c" />
              <Text className="text-base font-bold text-[#3c3832] ml-2">Mentors</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("Users")}>
              <Text className="text-[#405b69] text-sm font-semibold">Manage</Text>
            </Pressable>
          </View>

          {/* Summary Stats */}
          <View className="flex-row gap-2 mb-4">
            <View className="flex-1 bg-[#fcc85c]/20 rounded-xl p-3 border border-[#fcc85c]/30">
              <Text className="text-2xl font-bold text-[#fcc85c]">{formatNumber(mentorStats.users)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Mentors & Leaders</Text>
            </View>
            <View className="flex-1 bg-[#fcc85c]/20 rounded-xl p-3 border border-[#fcc85c]/30">
              <Text className="text-2xl font-bold text-[#fcc85c]">{formatNumber(mentorStats.totalParticipants)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Total Participants</Text>
            </View>
          </View>

          {/* Participant Categories */}
          <Text className="text-xs font-semibold text-[#99896c] mb-2 uppercase">Participant Status</Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => navigation.navigate("FilteredParticipants", { status: "pending_mentor" })}
              className="flex-1 min-w-[45%] bg-red-50 rounded-xl p-3 border border-red-200"
            >
              <Text className="text-xl font-bold text-red-600">{formatNumber(mentorStats.pendingMentor)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Need Assignment</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("FilteredParticipants", { status: "active_mentorship" })}
              className="flex-1 min-w-[45%] bg-green-50 rounded-xl p-3 border border-green-200"
            >
              <Text className="text-xl font-bold text-green-600">{formatNumber(mentorStats.activeMentorship)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Active Mentorship</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("FilteredParticipants", { status: "graduated" })}
              className="flex-1 min-w-[45%] bg-blue-50 rounded-xl p-3 border border-blue-200"
            >
              <Text className="text-xl font-bold text-blue-600">{formatNumber(mentorStats.graduated)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Graduated</Text>
            </Pressable>
          </View>
        </View>

        {/* Pam Lychner Schedule */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={20} color="#99896c" />
              <Text className="text-base font-bold text-[#3c3832] ml-2">Pam Lychner Schedule</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("Scheduler")}>
              <Text className="text-[#405b69] text-sm font-semibold">View All</Text>
            </Pressable>
          </View>
          {pamLychnerSchedule.map((day) => (
            <View key={day.date} className="mb-3">
              <Text className="text-sm font-bold text-[#3c3832] mb-1">
                {day.dayName} - {day.dayLabel}
              </Text>
              {day.shifts.length === 0 ? (
                <View className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <Text className="text-xs text-[#99896c]">No shifts scheduled</Text>
                </View>
              ) : (
                day.shifts.map((shift) => {
                  // If this is a holiday/placeholder, show special styling
                  if (shift.holiday) {
                    return (
                      <View
                        key={shift.id}
                        className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2"
                      >
                        <View className="flex-row items-center">
                          <Ionicons name="calendar" size={16} color="#3b82f6" />
                          <Text className="text-sm font-semibold text-blue-900 ml-2">
                            {shift.holiday}
                          </Text>
                        </View>
                        {shift.description && (
                          <Text className="text-xs text-blue-700 mt-1">
                            {shift.description}
                          </Text>
                        )}
                      </View>
                    );
                  }

                  // Regular shift display
                  return (
                    <View
                      key={shift.id}
                      className={`${
                        shift.assignedUserId || (shift.assignedUsers && shift.assignedUsers.length > 0) || shift.assignedToSupportNetwork
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      } border rounded-xl p-3 mb-2`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-[#3c3832]">
                            {shift.startTime} - {shift.endTime}
                          </Text>
                          {shift.assignedUserId ? (
                            <View className="flex-row items-center mt-1">
                              <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color="#22c55e"
                              />
                              <Text className="text-xs text-green-700 ml-1 font-medium">
                                Covered by {shift.assignedUserName}
                              </Text>
                            </View>
                          ) : shift.assignedToSupportNetwork ? (
                            <View className="flex-row items-center mt-1">
                              <Ionicons
                                name="people"
                                size={14}
                                color="#22c55e"
                              />
                              <Text className="text-xs text-green-700 ml-1 font-medium">
                                Support Network: {shift.assignedToSupportNetwork}
                              </Text>
                            </View>
                          ) : shift.assignedUsers && shift.assignedUsers.length > 0 ? (
                            <View className="mt-1">
                              <View className="flex-row items-center">
                                <Ionicons
                                  name="checkmark-circle"
                                  size={14}
                                  color="#22c55e"
                                />
                                <Text className="text-xs text-green-700 ml-1 font-medium">
                                  Covered by {shift.assignedUsers.length} volunteer{shift.assignedUsers.length > 1 ? "s" : ""}
                                </Text>
                              </View>
                              <Text className="text-xs text-green-600 ml-5 mt-0.5">
                                {shift.assignedUsers.map((u) => u.userName).join(", ")}
                              </Text>
                            </View>
                          ) : (
                            <View className="flex-row items-center mt-1">
                              <Ionicons name="alert-circle" size={14} color="#ef4444" />
                              <Text className="text-xs text-red-700 ml-1 font-medium">
                                Not covered
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
