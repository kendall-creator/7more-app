import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useCurrentUser } from "../state/authStore";
import { useReportingStore } from "../state/reportingStore";
import { useParticipantStore } from "../state/participantStore";
import { useSchedulerStore } from "../state/schedulerStore";
import { useTaskStore } from "../state/taskStore";
import { Ionicons } from "@expo/vector-icons";
import { formatNumber } from "../utils/formatNumber";
import { Meeting } from "../types";

export default function BoardHomeScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const { getMostRecentPostedReport } = useReportingStore();
  const { participants } = useParticipantStore();
  const { meetings } = useSchedulerStore();
  const { tasks } = useTaskStore();

  // Get most recent posted report
  const mostRecentReport = getMostRecentPostedReport();

  // Get tasks assigned to current user
  const myTasks = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter(
      (task) =>
        task.assignedToUserId === currentUser.id &&
        task.status !== "completed"
    );
  }, [tasks, currentUser]);

  // Get upcoming meetings
  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return meetings
      .filter((meeting: Meeting) => {
        const meetingDate = new Date(`${meeting.date}T${meeting.startTime}`);
        return meetingDate >= now;
      })
      .sort((a: Meeting, b: Meeting) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3);
  }, [meetings]);

  // Calculate current Bridge Team metrics
  const bridgeTeamMetrics = useMemo(() => {
    const bridgeParticipants = participants.filter(
      (p) => p.status === "pending_bridge" ||
             p.status === "bridge_attempted" ||
             p.status === "bridge_contacted" ||
             p.status === "bridge_unable"
    );

    return {
      total: bridgeParticipants.length,
      pendingBridge: participants.filter((p) => p.status === "pending_bridge").length,
      attemptedToContact: participants.filter((p) => p.status === "bridge_attempted").length,
      contacted: participants.filter((p) => p.status === "bridge_contacted").length,
      unableToContact: participants.filter((p) => p.status === "bridge_unable").length,
    };
  }, [participants]);

  // Calculate current Mentor metrics
  const mentorMetrics = useMemo(() => {
    const mentorAssigned = participants.filter((p) => p.assignedMentor).length;
    const activeParticipants = participants.filter(
      (p) => p.status === "active_mentorship" || p.status === "bridge_contacted"
    ).length;

    return {
      participantsAssignedToMentorship: mentorAssigned,
      activeParticipants,
    };
  }, [participants]);

  // Check if there's a new report notification
  const hasNewReport = mostRecentReport && mostRecentReport.isPosted;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView>
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900">Home</Text>
          <Text className="text-gray-600 text-sm mt-1">
            Welcome back, {currentUser?.name}
          </Text>
        </View>

        {/* Notifications Section */}
        <View className="px-4 py-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Notifications</Text>

          {hasNewReport ? (
            <Pressable
              className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-3 active:opacity-70"
              onPress={() => navigation.navigate("MonthlyReporting")}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center">
                  <Ionicons name="document-text" size={20} color="#4F46E5" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-indigo-900 font-semibold">New Report Available</Text>
                  <Text className="text-indigo-700 text-sm mt-1">
                    {mostRecentReport.month}/{mostRecentReport.year} monthly report is ready to view
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
              </View>
            </Pressable>
          ) : (
            <View className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-3">
              <Text className="text-gray-600 text-center">No new notifications</Text>
            </View>
          )}
        </View>

        {/* Schedule & Tasks Section */}
        <View className="px-4 py-2">
          <Text className="text-lg font-bold text-gray-900 mb-3">Schedule & Tasks</Text>

          {/* Upcoming Meetings */}
          {upcomingMeetings.length > 0 && (
            <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-md font-semibold text-gray-900">Upcoming Meetings</Text>
                <Pressable onPress={() => navigation.navigate("Scheduler")}>
                  <Text className="text-indigo-600 text-sm">View All</Text>
                </Pressable>
              </View>
              {upcomingMeetings.map((meeting) => {
                const meetingDate = new Date(`${meeting.date}T${meeting.startTime}`);
                return (
                  <View key={meeting.id} className="flex-row items-center py-2 border-b border-gray-100 last:border-b-0">
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <View className="flex-1 ml-3">
                      <Text className="text-gray-900 font-medium">{meeting.title}</Text>
                      <Text className="text-gray-600 text-xs mt-1">
                        {meetingDate.toLocaleDateString()} at {meetingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* My Tasks */}
          {myTasks.length > 0 ? (
            <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-md font-semibold text-gray-900">My Tasks ({myTasks.length})</Text>
                <Pressable onPress={() => navigation.navigate("TaskList")}>
                  <Text className="text-indigo-600 text-sm">View All</Text>
                </Pressable>
              </View>
              {myTasks.slice(0, 3).map((task) => (
                <View key={task.id} className="flex-row items-center py-2 border-b border-gray-100 last:border-b-0">
                  <Ionicons
                    name={task.priority === "high" ? "alert-circle" : "checkbox-outline"}
                    size={16}
                    color={task.priority === "high" ? "#EF4444" : "#6B7280"}
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900">{task.title}</Text>
                    {task.dueDate && (
                      <Text className="text-gray-600 text-xs mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
              <Text className="text-gray-600 text-center">No pending tasks</Text>
            </View>
          )}
        </View>

        {/* Current Numbers Section */}
        <View className="px-4 py-2 pb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Current Numbers</Text>

          {/* Bridge Team Dashboard */}
          <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="people" size={20} color="#3B82F6" />
              </View>
              <Text className="text-md font-semibold text-gray-900 ml-3">Bridge Team</Text>
            </View>

            <View className="space-y-2">
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-700">Total Participants</Text>
                <Text className="text-gray-900 font-semibold">{formatNumber(bridgeTeamMetrics.total)}</Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600 pl-3">Pending Bridge</Text>
                <Text className="text-gray-900">{formatNumber(bridgeTeamMetrics.pendingBridge)}</Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600 pl-3">Attempted to Contact</Text>
                <Text className="text-gray-900">{formatNumber(bridgeTeamMetrics.attemptedToContact)}</Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600 pl-3">Contacted</Text>
                <Text className="text-gray-900">{formatNumber(bridgeTeamMetrics.contacted)}</Text>
              </View>

              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600 pl-3">Unable to Contact</Text>
                <Text className="text-gray-900">{formatNumber(bridgeTeamMetrics.unableToContact)}</Text>
              </View>
            </View>
          </View>

          {/* Mentorship Dashboard */}
          <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                <Ionicons name="heart" size={20} color="#10B981" />
              </View>
              <Text className="text-md font-semibold text-gray-900 ml-3">Mentorship</Text>
            </View>

            <View className="space-y-2">
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-700">Participants Assigned</Text>
                <Text className="text-gray-900 font-semibold">{formatNumber(mentorMetrics.participantsAssignedToMentorship)}</Text>
              </View>

              <View className="flex-row justify-between py-2">
                <Text className="text-gray-700">Active Participants</Text>
                <Text className="text-gray-900 font-semibold">{formatNumber(mentorMetrics.activeParticipants)}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
