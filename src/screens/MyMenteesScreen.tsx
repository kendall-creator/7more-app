import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser, useIsImpersonating, useOriginalAdmin, useAuthStore } from "../state/authStore";
import { Participant } from "../types";
import { Ionicons } from "@expo/vector-icons";

export default function MyMenteesScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const isImpersonating = useIsImpersonating();
  const originalAdmin = useOriginalAdmin();
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation);
  const allParticipants = useParticipantStore((s) => s.participants);

  // Filter participants assigned to current user
  const assignedParticipants = useMemo(
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

  const needsInitialContact = assignedParticipants.filter((p) => p.status === "initial_contact_pending" || p.status === "mentor_attempted" || p.status === "mentor_unable");
  const activeParticipants = assignedParticipants.filter((p) => p.status === "active_mentorship");
  const otherStatuses = assignedParticipants.filter(
    (p) => p.status !== "initial_contact_pending" && p.status !== "mentor_attempted" && p.status !== "mentor_unable" && p.status !== "active_mentorship"
  );

  const renderParticipantCard = (participant: Participant, needsAction: boolean) => {
    const daysSince = getDaysSinceAssignment(participant.assignedToMentorAt);

    // Check if monthly report is due
    const isReportDue =
      participant.nextMonthlyReportDue && new Date(participant.nextMonthlyReportDue) <= new Date();

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
            <Text className="text-[#291403] text-xs font-semibold">⚠️ Initial Contact Required</Text>
          </View>
        )}

        {!needsAction && isReportDue && (
          <View className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            <Text className="text-red-800 text-xs font-semibold">📋 Monthly Report Due</Text>
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

        <View className="flex-row items-center mb-3">
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

        {needsAction && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("InitialContactForm", { participantId: participant.id });
            }}
            className="bg-[#405b69] rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
          >
            <Ionicons name="call" size={16} color="white" />
            <Text className="text-white text-sm font-semibold ml-2">Complete Initial Contact</Text>
          </Pressable>
        )}

        {isReportDue && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("MonthlyReportForm", { participantId: participant.id });
            }}
            className="bg-red-600 rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
          >
            <Ionicons name="document-text" size={16} color="white" />
            <Text className="text-white text-sm font-semibold ml-2">Submit Monthly Report</Text>
          </Pressable>
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

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      {/* Header */}
      <View className="bg-[#405b69] pt-16 pb-6 px-6">
        <Text className="text-3xl font-bold text-white mb-1">My Mentees</Text>
        <Text className="text-white/90 text-sm">
          {assignedParticipants.length} mentee{assignedParticipants.length !== 1 ? "s" : ""} assigned to you
        </Text>
      </View>

      {/* Stats Cards */}
      <View className="px-6 py-4 flex-row gap-3">
        <View className="flex-1 bg-white rounded-xl p-4 border border-[#d7d7d6]">
          <Text className="text-2xl font-bold text-[#fcc85c]">{needsInitialContact.length}</Text>
          <Text className="text-xs text-[#99896c] mt-1">Need Contact</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-[#d7d7d6]">
          <Text className="text-2xl font-bold text-green-600">{activeParticipants.length}</Text>
          <Text className="text-xs text-[#99896c] mt-1">Active</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-[#d7d7d6]">
          <Text className="text-2xl font-bold text-[#3c3832]">{assignedParticipants.length}</Text>
          <Text className="text-xs text-[#99896c] mt-1">Total</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={contentContainerStyle}>
        {/* Needs Initial Contact */}
        {needsInitialContact.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="alert-circle" size={20} color="#fcc85c" />
              <Text className="text-base font-bold text-[#fcc85c] ml-2 uppercase">
                Needs Initial Contact
              </Text>
            </View>
            {needsInitialContact.map((p) => renderParticipantCard(p, true))}
          </View>
        )}

        {/* Active Mentorship */}
        {activeParticipants.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-bold text-[#3c3832] mb-3 uppercase">Active Mentorship</Text>
            {activeParticipants.map((p) => renderParticipantCard(p, false))}
          </View>
        )}

        {/* Other Statuses */}
        {otherStatuses.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-bold text-[#3c3832] mb-3 uppercase">Other</Text>
            {otherStatuses.map((p) => renderParticipantCard(p, false))}
          </View>
        )}

        {/* Empty State */}
        {assignedParticipants.length === 0 && (
          <View className="items-center justify-center py-12">
            <Ionicons name="people-outline" size={64} color="#d7d7d6" />
            <Text className="text-[#99896c] text-base mt-4">No mentees assigned</Text>
            <Text className="text-[#99896c] text-sm mt-1 text-center">
              Mentees assigned to you will appear here
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
