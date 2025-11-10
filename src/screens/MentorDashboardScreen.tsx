import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser, useIsImpersonating, useOriginalAdmin, useAuthStore } from "../state/authStore";
import { Participant } from "../types";
import { Ionicons } from "@expo/vector-icons";

export default function MentorDashboardScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const isImpersonating = useIsImpersonating();
  const originalAdmin = useOriginalAdmin();
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation);
  const allParticipants = useParticipantStore((s) => s.participants);

  // Filter outside of the selector to avoid infinite loops
  const participants = React.useMemo(
    () => (currentUser ? allParticipants.filter((p) => p.assignedMentor === currentUser.id) : []),
    [allParticipants, currentUser]
  );

  const getDaysSinceAssignment = (assignedAt?: string) => {
    if (!assignedAt) return 0;
    const now = new Date();
    const assigned = new Date(assignedAt);
    const diffMs = now.getTime() - assigned.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  // Include all participants that need initial contact, regardless of their status
  // This handles edge cases where participants were assigned but status wasn't updated
  const needsInitialContact = participants.filter((p) =>
    p.status === "initial_contact_pending" ||
    p.status === "mentor_attempted" ||
    p.status === "mentor_unable" ||
    p.status === "bridge_attempted" ||  // Include bridge_attempted if assigned to mentor
    p.status === "bridge_unable" ||     // Include bridge_unable if assigned to mentor
    (p.status === "assigned_mentor" && !p.initialContactCompletedAt)  // Include assigned_mentor without initial contact
  );
  const activeParticipants = participants.filter((p) => p.status === "active_mentorship");

  // Check for participants with updates due or overdue
  const participantsWithUpdatesDue = participants.filter((p) => {
    const now = new Date();
    const weeklyDue = p.nextWeeklyUpdateDue && new Date(p.nextWeeklyUpdateDue) <= now;
    const monthlyCheckInDue = p.nextMonthlyCheckInDue && new Date(p.nextMonthlyCheckInDue) <= now;
    const reportDue = p.nextMonthlyReportDue && new Date(p.nextMonthlyReportDue) <= now;
    return weeklyDue || monthlyCheckInDue || reportDue;
  });

  const renderParticipantCard = (participant: Participant, needsAction: boolean) => {
    const daysSince = getDaysSinceAssignment(participant.assignedToMentorAt);

    // Check if weekly update is due
    const isWeeklyDue = participant.nextWeeklyUpdateDue &&
      new Date(participant.nextWeeklyUpdateDue) <= new Date();

    // Check if monthly check-in is due
    const isMonthlyCheckInDue = participant.nextMonthlyCheckInDue &&
      new Date(participant.nextMonthlyCheckInDue) <= new Date();

    // Check if monthly report is due
    const isReportDue = participant.nextMonthlyReportDue &&
      new Date(participant.nextMonthlyReportDue) <= new Date();

    const isActive = participant.status === "active_mentorship";
    const isAttempted = participant.status === "mentor_attempted" || participant.status === "bridge_attempted";
    const isUnable = participant.status === "mentor_unable" || participant.status === "bridge_unable";

    return (
      <Pressable
        key={participant.id}
        onPress={() => navigation.navigate("ParticipantProfile", { participantId: participant.id })}
        className={`bg-white rounded-2xl p-4 mb-3 border-2 active:opacity-70 ${
          needsAction ? "border-amber-300" : (isWeeklyDue || isMonthlyCheckInDue || isReportDue) ? "border-red-300" : "border-gray-100"
        }`}
      >
        {needsAction && (
          <View className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            <Text className="text-amber-800 text-xs font-semibold">
              ⚠️ Initial Contact Required
            </Text>
          </View>
        )}

        {!needsAction && (isWeeklyDue || isMonthlyCheckInDue) && (
          <View className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            <Text className="text-red-800 text-xs font-semibold">
              📋 {isWeeklyDue ? "Weekly Update" : "Monthly Check-In"} Due
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {participant.firstName} {participant.lastName}
            </Text>
            <Text className="text-sm text-gray-500">#{participant.participantNumber}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center mr-4">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {daysSince} day{daysSince !== 1 ? "s" : ""} assigned
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">{participant.releasedFrom}</Text>
          </View>
        </View>

        {/* Initial Contact Pending or Attempted/Unable Actions */}
        {needsAction && (
          <View>
            {/* First row: Contacted button */}
            <View className="flex-row gap-2 mb-2">
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate("InitialContactForm", { participantId: participant.id });
                }}
                className="flex-1 bg-green-50 border border-green-200 rounded-xl py-2 items-center active:opacity-70"
              >
                <Text className="text-gray-900 text-xs font-semibold">Contacted</Text>
              </Pressable>
            </View>

            {/* Second row: Attempted and Unable buttons */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate("InitialContactForm", { participantId: participant.id });
                }}
                className="flex-1 bg-amber-50 border border-amber-200 rounded-xl py-2 items-center active:opacity-70"
              >
                <Text className="text-amber-700 text-xs font-semibold">Attempted</Text>
              </Pressable>

              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate("InitialContactForm", { participantId: participant.id });
                }}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2 items-center active:opacity-70"
              >
                <Text className="text-gray-700 text-xs font-semibold">Unable</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Active Mentorship Actions */}
        {isActive && (
          <View className="gap-2">
            {/* Weekly Update Button */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate("WeeklyUpdateForm", { participantId: participant.id });
                }}
                className={`flex-1 rounded-xl py-3 items-center active:opacity-80 ${
                  isWeeklyDue ? "bg-red-600" : "bg-yellow-600"
                }`}
              >
                <Text className="text-white text-xs font-bold">Weekly Update</Text>
              </Pressable>

              {/* Monthly Check-In Button */}
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate("MonthlyCheckInForm", { participantId: participant.id });
                }}
                className={`flex-1 rounded-xl py-3 items-center active:opacity-80 ${
                  isMonthlyCheckInDue ? "bg-red-600" : "bg-gray-600"
                }`}
              >
                <Text className="text-white text-xs font-bold">Monthly Check-In</Text>
              </Pressable>
            </View>

            {/* Monthly Update (Legacy) and View Profile */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate("MonthlyUpdateForm", { participantId: participant.id });
                }}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2 items-center active:opacity-80"
              >
                <Text className="text-gray-700 text-xs font-semibold">Monthly Update</Text>
              </Pressable>

              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate("ParticipantProfile", { participantId: participant.id });
                }}
                className="flex-1 bg-blue-50 border border-blue-200 rounded-xl py-2 items-center active:opacity-80"
              >
                <Text className="text-blue-700 text-xs font-semibold">View Profile</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

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
        <Text className="text-2xl font-bold text-white mb-1">My Participants</Text>
        <Text className="text-yellow-100 text-sm">
          {participants.length} participant{participants.length !== 1 ? "s" : ""} assigned
        </Text>
      </View>

      {/* Stats */}
      <View className="px-6 py-4 flex-row gap-3">
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">{needsInitialContact.length}</Text>
          <Text className="text-xs text-gray-600 mt-1">Needs Initial Contact</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">{activeParticipants.length}</Text>
          <Text className="text-xs text-gray-600 mt-1">Active</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
          <Text className={`text-2xl font-bold ${participantsWithUpdatesDue.length > 0 ? "text-red-600" : "text-gray-900"}`}>
            {participantsWithUpdatesDue.length}
          </Text>
          <Text className="text-xs text-gray-600 mt-1">Updates Due</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={contentContainerStyle}>
        {/* Needs Action Section */}
        {needsInitialContact.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-900 mb-3 uppercase">Needs Action</Text>
            {needsInitialContact.map((p) => renderParticipantCard(p, true))}
          </View>
        )}

        {/* Active Section */}
        {activeParticipants.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm font-bold text-gray-900 mb-3 uppercase">Active</Text>
            {activeParticipants.map((p) => renderParticipantCard(p, false))}
          </View>
        )}

        {/* Empty State */}
        {participants.length === 0 && (
          <View className="items-center justify-center py-12">
            <Ionicons name="person-add-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-base mt-4">No participants assigned yet</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">
              Your mentorship leader will assign participants to you
            </Text>
          </View>
        )}
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
