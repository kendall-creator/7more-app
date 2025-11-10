import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCurrentUser } from "../state/authStore";
import { useParticipantStore } from "../state/participantStore";
import { useTaskStore } from "../state/taskStore";
import { useSchedulerStore } from "../state/schedulerStore";
import { useInvitedUsers } from "../state/usersStore";
import { Ionicons } from "@expo/vector-icons";
import { formatNumber } from "../utils/formatNumber";

export default function AdminHomepageScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const allParticipants = useParticipantStore((s) => s.participants);
  const allTasks = useTaskStore((s) => s.tasks);
  const shifts = useSchedulerStore((s) => s.shifts);
  const invitedUsers = useInvitedUsers();

  // Participant stats
  const stats = useMemo(() => {
    const total = allParticipants.length;
    const pendingBridge = allParticipants.filter((p) => p.status === "pending_bridge").length;
    const contacted = allParticipants.filter((p) => p.status === "bridge_contacted").length;
    const pendingMentor = allParticipants.filter((p) => p.status === "pending_mentor").length;
    const activeMentorship = allParticipants.filter((p) => p.status === "active_mentorship").length;
    const graduated = allParticipants.filter((p) => p.status === "graduated").length;

    return { total, pendingBridge, contacted, pendingMentor, activeMentorship, graduated };
  }, [allParticipants]);

  // Task stats
  const taskStats = useMemo(() => {
    const totalTasks = allTasks.length;
    const overdue = allTasks.filter((t) => t.status === "overdue").length;
    const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
    const pending = allTasks.filter((t) => t.status === "pending").length;

    return { totalTasks, overdue, inProgress, pending };
  }, [allTasks]);

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

      // Find Pam Lychner shifts for this day
      const dayShifts = shifts.filter(
        (shift) =>
          shift.date === dateString &&
          (shift.title.toLowerCase().includes("pam lychner") ||
           shift.title.toLowerCase().includes("pam") ||
           shift.title.toLowerCase().includes("lychner"))
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

  // User stats
  const userStats = useMemo(() => {
    const mentors = invitedUsers.filter((u) => u.role === "mentor").length;
    const mentorLeaders = invitedUsers.filter((u) => u.role === "mentorship_leader").length;
    const bridgeTeam = invitedUsers.filter((u) => u.role === "bridge_team").length;
    const volunteers = invitedUsers.filter((u) => u.role === "volunteer" || u.role === "volunteer_support").length;

    return { mentors, mentorLeaders, bridgeTeam, volunteers, total: invitedUsers.length };
  }, [invitedUsers]);

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      {/* Header */}
      <View className="bg-[#405b69] pt-16 pb-6 px-6">
        <Text className="text-3xl font-bold text-white mb-1">
          Welcome back, {currentUser?.name?.split(" ")[0]}!
        </Text>
        <Text className="text-white/90 text-sm">Here is your program overview</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-base font-bold text-[#3c3832] mb-3">Quick Actions</Text>
          <View className="flex-row gap-3 mb-3">
            <Pressable
              onPress={() => navigation.navigate("ManualIntakeForm")}
              className="flex-1 bg-[#405b69] rounded-2xl p-4 active:opacity-80"
            >
              <Ionicons name="person-add" size={24} color="white" />
              <Text className="text-white text-sm font-semibold mt-2">Add Participant</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("AdminTaskManagement")}
              className="flex-1 bg-purple-600 rounded-2xl p-4 active:opacity-80"
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white text-sm font-semibold mt-2">Create Task</Text>
            </Pressable>
          </View>
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
          </View>
        </View>

        {/* Users Overview */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="person-circle" size={20} color="#99896c" />
              <Text className="text-base font-bold text-[#3c3832] ml-2">Team</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("Users")}>
              <Text className="text-[#405b69] text-sm font-semibold">View All</Text>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <View className="flex-1 min-w-[45%] bg-[#405b69]/10 rounded-xl p-3">
              <Text className="text-2xl font-bold text-[#405b69]">{formatNumber(userStats.mentors)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Mentors</Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-purple-50 rounded-xl p-3">
              <Text className="text-2xl font-bold text-purple-600">{formatNumber(userStats.mentorLeaders)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Leaders</Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-teal-50 rounded-xl p-3">
              <Text className="text-2xl font-bold text-teal-600">{formatNumber(userStats.bridgeTeam)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Bridge Team</Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-[#fcc85c]/20 rounded-xl p-3">
              <Text className="text-2xl font-bold text-[#fcc85c]">{formatNumber(userStats.volunteers)}</Text>
              <Text className="text-xs text-[#99896c] mt-1">Volunteers</Text>
            </View>
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
                day.shifts.map((shift) => (
                  <View
                    key={shift.id}
                    className={`${
                      shift.assignedUserId || (shift.assignedUsers && shift.assignedUsers.length > 0)
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
                ))
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
