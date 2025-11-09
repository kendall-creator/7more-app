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

  // Upcoming shifts
  const upcomingShifts = useMemo(() => {
    const now = new Date();
    return shifts
      .filter((shift) => new Date(shift.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [shifts]);

  // User stats
  const userStats = useMemo(() => {
    const mentors = invitedUsers.filter((u) => u.role === "mentor").length;
    const mentorLeaders = invitedUsers.filter((u) => u.role === "mentorship_leader").length;
    const bridgeTeam = invitedUsers.filter((u) => u.role === "bridge_team").length;
    const volunteers = invitedUsers.filter((u) => u.role === "volunteer" || u.role === "volunteer_support").length;

    return { mentors, mentorLeaders, bridgeTeam, volunteers, total: invitedUsers.length };
  }, [invitedUsers]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

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

        {/* Upcoming Shifts */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={20} color="#99896c" />
              <Text className="text-base font-bold text-[#3c3832] ml-2">Upcoming Shifts</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("Scheduler")}>
              <Text className="text-[#405b69] text-sm font-semibold">View All</Text>
            </Pressable>
          </View>
          {upcomingShifts.length === 0 ? (
            <View className="items-center py-4">
              <Text className="text-[#99896c] text-sm">No upcoming shifts</Text>
            </View>
          ) : (
            upcomingShifts.map((shift) => (
              <View key={shift.id} className="bg-[#405b69]/10 border border-[#405b69]/20 rounded-xl p-3 mb-2">
                <Text className="text-base font-semibold text-[#3c3832]">{shift.title}</Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="calendar-outline" size={14} color="#99896c" />
                  <Text className="text-xs text-[#99896c] ml-1">
                    {formatDate(shift.date)} at {shift.startTime}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
