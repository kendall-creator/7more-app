import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser, useIsImpersonating, useOriginalAdmin, useAuthStore } from "../state/authStore";
import { Participant } from "../types";
import { Ionicons } from "@expo/vector-icons";

export default function MentorshipLeaderDashboardScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const isImpersonating = useIsImpersonating();
  const originalAdmin = useOriginalAdmin();
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation);

  // Get all participants from store
  const allParticipants = useParticipantStore((s) => s.participants);

  // Use useMemo to memoize the filtered participants
  const participants = useMemo(() => {
    return allParticipants.filter((p) => p.status === "pending_mentor");
  }, [allParticipants]);

  const getDaysSinceMovedToMentorship = (movedAt?: string) => {
    if (!movedAt) return 0;
    const now = new Date();
    const moved = new Date(movedAt);
    const diffMs = now.getTime() - moved.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const renderParticipantCard = (participant: Participant) => {
    const daysSince = getDaysSinceMovedToMentorship(participant.movedToMentorshipAt);

    return (
      <Pressable
        key={participant.id}
        onPress={() => navigation.navigate("ParticipantProfile", { participantId: participant.id })}
        className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 active:opacity-70"
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {participant.firstName} {participant.lastName}
            </Text>
            <Text className="text-sm text-gray-500">#{participant.participantNumber}</Text>
          </View>
          <View className="bg-yellow-100 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-gray-700">Awaiting Assignment</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center mr-4">
            <Ionicons name="hourglass-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {daysSince} day{daysSince !== 1 ? "s" : ""} waiting
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">{participant.releasedFrom}</Text>
          </View>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            navigation.navigate("AssignMentor", { participantId: participant.id });
          }}
          className="bg-gray-600 rounded-xl py-3 items-center active:opacity-80"
        >
          <Text className="text-white text-sm font-bold">Assign to Mentor</Text>
        </Pressable>
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
  const contentContainerStyle = useMemo(
    () => ({ paddingBottom: isImpersonating ? 100 : 20 }),
    [isImpersonating]
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-yellow-600 pt-16 pb-6 px-6">
        <Text className="text-2xl font-bold text-white mb-1">Mentorship Leader</Text>
        <Text className="text-gray-100 text-sm">
          {participants.length} participant{participants.length !== 1 ? "s" : ""} awaiting assignment
        </Text>
      </View>

      {/* Stats */}
      <View className="px-6 py-4">
        <View className="bg-white rounded-xl p-5 border border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-gray-600 text-sm mb-1">Awaiting Mentor Assignment</Text>
              <Text className="text-3xl font-bold text-gray-900">{participants.length}</Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-yellow-500 items-center justify-center">
              <Ionicons name="people" size={24} color="#fff" />
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={contentContainerStyle}>
        {participants.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="checkmark-circle-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-base mt-4">All participants assigned</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">
              New participants will appear here when moved from Bridge Team
            </Text>
          </View>
        ) : (
          participants.map(renderParticipantCard)
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
