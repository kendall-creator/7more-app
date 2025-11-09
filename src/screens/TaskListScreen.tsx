import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useTaskStore } from "../state/taskStore";
import { useCurrentUser, useIsImpersonating, useOriginalAdmin, useAuthStore } from "../state/authStore";
import { useParticipantStore } from "../state/participantStore";
import { Task, Participant } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { formatNumber } from "../utils/formatNumber";

export default function TaskListScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const isImpersonating = useIsImpersonating();
  const originalAdmin = useOriginalAdmin();
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation);
  const allTasks = useTaskStore((s) => s.tasks);
  const allParticipants = useParticipantStore((s) => s.participants);

  // Filter tasks for current user
  const userTasks = useMemo(
    () => allTasks.filter((t) => t.assignedToUserId === currentUser?.id),
    [allTasks, currentUser?.id]
  );

  // Filter participants assigned to current user (for mentors and mentorship leaders)
  const assignedParticipants = useMemo(
    () => (currentUser ? allParticipants.filter((p) => p.assignedMentor === currentUser.id) : []),
    [allParticipants, currentUser]
  );

  const isMentor = currentUser?.role === "mentor" || currentUser?.role === "mentorship_leader";

  // Group tasks by status
  const pendingTasks = useMemo(
    () => userTasks.filter((t) => t.status === "pending"),
    [userTasks]
  );

  const inProgressTasks = useMemo(
    () => userTasks.filter((t) => t.status === "in_progress"),
    [userTasks]
  );

  const overdueTasks = useMemo(
    () => userTasks.filter((t) => t.status === "overdue"),
    [userTasks]
  );

  const completedTasks = useMemo(
    () => userTasks.filter((t) => t.status === "completed"),
    [userTasks]
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-gray-300";
      case "in_progress":
        return "border-blue-300";
      case "overdue":
        return "border-red-300 bg-red-50";
      case "completed":
        return "border-green-300 bg-green-50";
      default:
        return "border-gray-300";
    }
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return "No due date";

    try {
      // Parse date string in YYYY-MM-DD format properly to avoid timezone issues
      const parts = dueDate.split("-");
      if (parts.length !== 3) return "Invalid date";

      const [year, month, day] = parts.map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return "Invalid date";

      const date = new Date(year, month - 1, day);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`;
      if (diffDays === 0) return "Due today";
      if (diffDays === 1) return "Due tomorrow";
      return `Due in ${diffDays} days`;
    } catch (error) {
      console.error("Error formatting due date:", error);
      return "Invalid date";
    }
  };

  const getDaysSinceAssignment = (assignedAt?: string) => {
    if (!assignedAt) return 0;
    const now = new Date();
    const assigned = new Date(assignedAt);
    const diffMs = now.getTime() - assigned.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const renderParticipantCard = (participant: Participant) => {
    const daysSince = getDaysSinceAssignment(participant.assignedToMentorAt);
    const needsAction = participant.status === "initial_contact_pending";
    const isReportDue = participant.nextMonthlyReportDue &&
      new Date(participant.nextMonthlyReportDue) <= new Date();

    return (
      <Pressable
        key={participant.id}
        onPress={() => navigation.navigate("ParticipantProfile", { participantId: participant.id })}
        className={`bg-white rounded-2xl p-4 mb-3 border-2 active:opacity-70 ${
          needsAction ? "border-[#fcc85c]" : isReportDue ? "border-red-300" : "border-[#d7d7d6]"
        }`}
      >
        {needsAction && (
          <View className="bg-[#fcc85c]/20 border border-[#fcc85c]/40 rounded-lg px-3 py-2 mb-3">
            <Text className="text-[#291403] text-xs font-semibold">
              ⚠️ Initial Contact Required
            </Text>
          </View>
        )}

        {!needsAction && isReportDue && (
          <View className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            <Text className="text-red-800 text-xs font-semibold">
              📋 Monthly Report Due
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-[#3c3832] mb-1">
              {participant.firstName} {participant.lastName}
            </Text>
            <Text className="text-sm text-[#99896c]">#{participant.participantNumber}</Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="flex-row items-center mr-4">
            <Ionicons name="calendar-outline" size={14} color="#99896c" />
            <Text className="text-xs text-[#99896c] ml-1">
              {daysSince} day{daysSince !== 1 ? "s" : ""} assigned
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#99896c" />
            <Text className="text-xs text-[#99896c] ml-1">{participant.releasedFrom}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderTaskCard = (task: Task) => {
    const priorityColor = getPriorityColor(task.priority);
    const statusColor = getStatusColor(task.status);

    // Dynamically look up participant info if task is related to a participant
    const relatedParticipant = task.relatedParticipantId
      ? allParticipants.find((p) => p.id === task.relatedParticipantId)
      : null;

    const participantDisplayName = relatedParticipant
      ? `${relatedParticipant.firstName} ${relatedParticipant.lastName}`
      : task.relatedParticipantName; // Fallback to stored name if participant not found

    return (
      <Pressable
        key={task.id}
        onPress={() => {
          console.log("Navigating to task:", task.id);
          navigation.navigate("TaskDetail", { taskId: task.id });
        }}
        className={`bg-white rounded-2xl p-4 mb-3 border-2 ${statusColor} active:opacity-70`}
      >
        {/* Header Row */}
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-lg font-bold text-[#3c3832] mb-1">{task.title}</Text>
            {participantDisplayName && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="person-outline" size={14} color="#99896c" />
                <Text className="text-xs text-[#99896c] ml-1">{participantDisplayName}</Text>
              </View>
            )}
          </View>
          <View className={`px-3 py-1 rounded-full ${priorityColor}`}>
            <Text className={`text-xs font-semibold ${priorityColor}`}>
              {task.priority.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text className="text-sm text-[#99896c] mb-3" numberOfLines={2}>
          {task.description}
        </Text>

        {/* Footer Row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#99896c" />
            <Text className="text-xs text-[#99896c] ml-1">{formatDueDate(task.dueDate)}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={14} color="#99896c" />
            <Text className="text-xs text-[#99896c] ml-1">From: {task.assignedByUserName}</Text>
          </View>
        </View>

        {/* Custom form indicator */}
        {task.customForm && task.customForm.length > 0 && (
          <View className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <View className="flex-row items-center">
              <Ionicons name="clipboard-outline" size={16} color="#2563EB" />
              <Text className="text-blue-800 text-xs font-semibold ml-2">
                Form required ({task.customForm.length} field{task.customForm.length !== 1 ? "s" : ""})
              </Text>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  const handleReturnToAdmin = () => {
    stopImpersonation();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      })
    );
  };

  const contentContainerStyle = useMemo(
    () => ({ paddingBottom: isImpersonating ? 100 : 20 }),
    [isImpersonating]
  );

  const isAdmin = currentUser?.role === "admin";

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      {/* Header */}
      <View className="bg-[#405b69] pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white mb-1">My Tasks</Text>
            <Text className="text-white/90 text-sm">
              {isMentor && assignedParticipants.length > 0
                ? `${formatNumber(assignedParticipants.length)} participant${assignedParticipants.length !== 1 ? "s" : ""} • ${formatNumber(userTasks.length)} additional task${userTasks.length !== 1 ? "s" : ""}`
                : `${formatNumber(userTasks.length)} task${userTasks.length !== 1 ? "s" : ""}`}
            </Text>
          </View>
          <View className="flex-row gap-2">
            {isAdmin && (
              <>
                <Pressable
                  onPress={() => navigation.navigate("CompletedTasks")}
                  className="bg-green-600 rounded-xl px-4 py-2"
                >
                  <Text className="text-white text-sm font-bold">Completed</Text>
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate("AdminTaskManagement")}
                  className="bg-[#fcc85c] rounded-xl px-4 py-2"
                >
                  <Text className="text-[#291403] text-sm font-bold">Manage</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="px-6 py-4 flex-row gap-3">
        <View className="flex-1 bg-white rounded-xl p-4 border border-[#d7d7d6]">
          <Text className="text-2xl font-bold text-[#3c3832]">{formatNumber(pendingTasks.length)}</Text>
          <Text className="text-xs text-[#99896c] mt-1">Pending</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-[#d7d7d6]">
          <Text className="text-2xl font-bold text-blue-600">{formatNumber(inProgressTasks.length)}</Text>
          <Text className="text-xs text-[#99896c] mt-1">In Progress</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-[#d7d7d6]">
          <Text className={`text-2xl font-bold ${overdueTasks.length > 0 ? "text-red-600" : "text-[#3c3832]"}`}>
            {formatNumber(overdueTasks.length)}
          </Text>
          <Text className="text-xs text-[#99896c] mt-1">Overdue</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={contentContainerStyle}>
        {/* My Participants Section - Primary section for mentors/mentorship leaders */}
        {isMentor && assignedParticipants.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="people" size={20} color="#405b69" />
              <Text className="text-base font-bold text-[#405b69] ml-2 uppercase">
                My Participants ({formatNumber(assignedParticipants.length)})
              </Text>
            </View>
            {assignedParticipants.map(renderParticipantCard)}
          </View>
        )}

        {/* Additional Tasks Section - Tasks assigned by admins/leaders */}
        {userTasks.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="clipboard" size={20} color="#99896c" />
              <Text className="text-base font-bold text-[#99896c] ml-2 uppercase">
                {isMentor ? "Additional Tasks" : "My Tasks"}
              </Text>
            </View>

            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text className="text-sm font-bold text-red-600 ml-2">OVERDUE</Text>
                </View>
                {overdueTasks.map(renderTaskCard)}
              </View>
            )}

            {/* In Progress Tasks */}
            {inProgressTasks.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-bold text-[#3c3832] mb-2">In Progress</Text>
                {inProgressTasks.map(renderTaskCard)}
              </View>
            )}

            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-bold text-[#3c3832] mb-2">Pending</Text>
                {pendingTasks.map(renderTaskCard)}
              </View>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-done-circle" size={18} color="#10B981" />
                  <Text className="text-sm font-bold text-green-600 ml-2">Completed</Text>
                </View>
                {completedTasks.map(renderTaskCard)}
              </View>
            )}
          </View>
        )}

        {/* Empty State */}
        {userTasks.length === 0 && (!isMentor || assignedParticipants.length === 0) && (
          <View className="items-center justify-center py-12">
            <Ionicons name="checkmark-done-circle-outline" size={64} color="#d7d7d6" />
            <Text className="text-[#99896c] text-base mt-4">
              {isMentor ? "No participants or tasks assigned" : "No tasks assigned"}
            </Text>
            <Text className="text-[#99896c] text-sm mt-1 text-center">
              {isMentor
                ? "Your participants and any additional tasks will appear here"
                : "Tasks assigned to you will appear here"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Impersonation Banner */}
      {isImpersonating && originalAdmin && (
        <View className="absolute bottom-0 left-0 right-0 bg-[#fcc85c] px-6 py-4 border-t-2 border-[#fcc85c]">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-[#291403] text-sm font-semibold">
                Viewing as {currentUser?.role?.replace("_", " ")}
              </Text>
              <Text className="text-[#291403]/70 text-xs">Admin: {originalAdmin.name}</Text>
            </View>
            <Pressable
              onPress={handleReturnToAdmin}
              className="bg-white rounded-lg px-4 py-3 active:opacity-80"
            >
              <Text className="text-[#291403] text-sm font-bold">Return to Admin</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
