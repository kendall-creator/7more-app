import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { useIsImpersonating, useOriginalAdmin, useAuthStore, useCurrentUser } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";
import { DashboardMetrics } from "../types";
import { formatNumber } from "../utils/formatNumber";

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const isImpersonating = useIsImpersonating();
  const originalAdmin = useOriginalAdmin();
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation);
  const participants = useParticipantStore((s) => s.participants);

  // Calculate metrics
  const metrics: DashboardMetrics = {
    totalParticipants: participants.length,
    pendingBridge: participants.filter((p) => p.status === "pending_bridge").length,
    bridgeContacted: participants.filter((p) => p.status === "bridge_contacted").length,
    bridgeAttempted: participants.filter((p) => p.status === "bridge_attempted").length,
    bridgeUnable: participants.filter((p) => p.status === "bridge_unable").length,
    mentorAttempted: participants.filter((p) => p.status === "mentor_attempted").length,
    mentorUnable: participants.filter((p) => p.status === "mentor_unable").length,
    unableToContact: participants.filter((p) => p.status === "bridge_unable" || p.status === "mentor_unable").length,
    pendingMentorAssignment: participants.filter((p) => p.status === "pending_mentor").length,
    assignedToMentor: participants.filter((p) => p.status === "assigned_mentor" || p.status === "initial_contact_pending").length,
    activeInMentorship: participants.filter((p) => p.status === "active_mentorship").length,
    graduated: participants.filter((p) => p.status === "graduated").length,
    ceasedContact: participants.filter((p) => p.status === "ceased_contact").length,

    // Calculate monthly metrics (last 30 days)
    monthlySubmissions: participants.filter((p) => {
      const submitted = new Date(p.submittedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return submitted >= thirtyDaysAgo;
    }).length,

    monthlyMovedToMentorship: participants.filter((p) => {
      if (!p.movedToMentorshipAt) return false;
      const moved = new Date(p.movedToMentorshipAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return moved >= thirtyDaysAgo;
    }).length,

    monthlyGraduated: participants.filter((p) => {
      if (!p.graduatedAt) return false;
      const graduated = new Date(p.graduatedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return graduated >= thirtyDaysAgo;
    }).length,
  };

  const StatCard = ({
    title,
    value,
    color,
    icon,
    status,
    statuses,
    allParticipants,
  }: {
    title: string;
    value: number;
    color: string;
    icon: string;
    status?: string;
    statuses?: string[];
    allParticipants?: boolean;
  }) => (
    <Pressable
      onPress={() => {
        if (allParticipants) {
          navigation.navigate("AllParticipants");
        } else if (statuses && statuses.length > 0) {
          navigation.navigate("FilteredParticipants", { statuses, title });
        } else if (status) {
          navigation.navigate("FilteredParticipants", { status, title });
        }
      }}
      disabled={(!status && !statuses && !allParticipants) || value === 0}
      className="bg-white rounded-2xl p-5 border border-gray-100 mb-3 active:opacity-70"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-gray-600 text-sm mb-1">{title}</Text>
          <Text className="text-3xl font-bold text-gray-900">{formatNumber(value)}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className={`w-12 h-12 rounded-full ${color} items-center justify-center`}>
            <Ionicons name={icon as any} size={24} color="#fff" />
          </View>
          {((status || (statuses && statuses.length > 0) || allParticipants) && value > 0) && (
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          )}
        </View>
      </View>
    </Pressable>
  );

  const handleReturnToAdmin = () => {
    stopImpersonation();
    // Reset navigation to Admin Dashboard
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      })
    );
  };

  // Memoize contentContainerStyle to prevent new object creation on every render
  const contentContainerStyle = React.useMemo(
    () => ({ paddingBottom: isImpersonating ? 100 : 20 }),
    [isImpersonating]
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-2xl font-bold text-white">Admin Dashboard</Text>
          <Pressable
            onPress={() => navigation.navigate("IntakeTypeSelection")}
            className="w-12 h-12 bg-yellow-500 rounded-full items-center justify-center active:opacity-70"
          >
            <Ionicons name="add" size={28} color="white" />
          </Pressable>
        </View>
        <Text className="text-yellow-100 text-sm">Complete program overview</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={contentContainerStyle}>
        {/* Overview Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Overview</Text>
          <StatCard
            title="Total Participants"
            value={metrics.totalParticipants}
            color="bg-gray-600"
            icon="people"
            allParticipants={true}
          />
        </View>

        {/* Bridge Team Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Bridge Team Queue</Text>
          <StatCard
            title="Pending Bridge Contact"
            value={metrics.pendingBridge}
            color="bg-gray-700"
            icon="call-outline"
            status="pending_bridge"
          />
          <StatCard
            title="Contacted"
            value={metrics.bridgeContacted}
            color="bg-yellow-500"
            icon="checkmark-circle"
            status="bridge_contacted"
          />
          <StatCard
            title="Attempted Contact"
            value={metrics.bridgeAttempted}
            color="bg-amber-500"
            icon="time"
            status="bridge_attempted"
          />
          <StatCard
            title="Unable to Contact (Bridge)"
            value={metrics.bridgeUnable}
            color="bg-gray-500"
            icon="close-circle"
            status="bridge_unable"
          />
        </View>

        {/* Mentorship Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Mentorship Program</Text>
          <StatCard
            title="Awaiting Mentor Assignment"
            value={metrics.pendingMentorAssignment}
            color="bg-yellow-500"
            icon="hourglass-outline"
            status="pending_mentor"
          />
          <StatCard
            title="Assigned to Mentor"
            value={metrics.assignedToMentor}
            color="bg-yellow-500"
            icon="person-add"
            statuses={["assigned_mentor", "initial_contact_pending"]}
          />
          <StatCard
            title="Mentor Attempted Contact"
            value={metrics.mentorAttempted}
            color="bg-amber-500"
            icon="time"
            status="mentor_attempted"
          />
          <StatCard
            title="Unable to Contact (Mentor)"
            value={metrics.mentorUnable}
            color="bg-gray-500"
            icon="close-circle"
            status="mentor_unable"
          />
          <StatCard
            title="Active in Mentorship"
            value={metrics.activeInMentorship}
            color="bg-yellow-500"
            icon="trending-up"
            status="active_mentorship"
          />
        </View>

        {/* Combined Unable to Contact Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Unable to Contact (All)</Text>
          <StatCard
            title="All Unable to Contact"
            value={metrics.unableToContact}
            color="bg-red-500"
            icon="alert-circle"
            statuses={["bridge_unable", "mentor_unable"]}
          />
        </View>

        {/* Outcomes Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Program Outcomes</Text>
          <StatCard
            title="Graduated"
            value={metrics.graduated}
            color="bg-yellow-600"
            icon="school"
            status="graduated"
          />
          <StatCard
            title="Ceased Contact"
            value={metrics.ceasedContact}
            color="bg-gray-700"
            icon="remove-circle"
            status="ceased_contact"
          />
        </View>

        {/* Monthly Metrics */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Monthly Activity (Last 30 Days)</Text>
          <View className="bg-white rounded-2xl p-5 border border-gray-100">
            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <Text className="text-gray-600 text-sm">New Submissions</Text>
              <Text className="text-xl font-bold text-yellow-600">{formatNumber(metrics.monthlySubmissions)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <Text className="text-gray-600 text-sm">Moved to Mentorship</Text>
              <Text className="text-xl font-bold text-gray-600">
                {formatNumber(metrics.monthlyMovedToMentorship)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 text-sm">Graduated</Text>
              <Text className="text-xl font-bold text-gray-600">{formatNumber(metrics.monthlyGraduated)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Quick Actions</Text>

          {/* Mentorship Assignment Queue */}
          {metrics.pendingMentorAssignment > 0 && (
            <Pressable
              onPress={() => navigation.navigate("AdminMentorshipAssignment")}
              className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-3 active:opacity-70"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-yellow-600 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person-add" size={20} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold mb-0.5">
                    Assign Mentors
                  </Text>
                  <Text className="text-gray-700 text-xs font-semibold">
                    {formatNumber(metrics.pendingMentorAssignment)} participant{metrics.pendingMentorAssignment !== 1 ? "s" : ""} waiting
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FFC107" />
              </View>
            </Pressable>
          )}

          <Pressable
            onPress={() => navigation.navigate("AllParticipants")}
            className="bg-white rounded-xl p-4 border border-gray-100 mb-3 active:opacity-70"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="list" size={20} color="#374151" />
              </View>
              <Text className="flex-1 text-gray-900 font-semibold">View All Participants</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("ManageUsers")}
            className="bg-white rounded-xl p-4 border border-gray-100 mb-3 active:opacity-70"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-yellow-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="people" size={20} color="#FFC107" />
              </View>
              <Text className="flex-1 text-gray-900 font-semibold">Manage Users</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </Pressable>
        </View>

      </ScrollView>

      {/* Impersonation Banner - Bottom */}
      {isImpersonating && originalAdmin && (
        <View className="absolute bottom-0 left-0 right-0 bg-amber-500 px-6 py-4 border-t-2 border-amber-600">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-white text-sm font-semibold">
                Viewing as {currentUser?.role?.replace("_", " ")}
              </Text>
              <Text className="text-amber-100 text-xs">
                Admin: {originalAdmin.name}
              </Text>
            </View>
            <Pressable
              onPress={handleReturnToAdmin}
              className="bg-white rounded-lg px-4 py-3 active:opacity-80"
            >
              <Text className="text-amber-700 text-sm font-bold">Return to Admin</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
