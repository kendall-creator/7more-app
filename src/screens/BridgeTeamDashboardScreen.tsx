import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser, useIsImpersonating, useOriginalAdmin, useAuthStore } from "../state/authStore";
import { Participant } from "../types";
import { Ionicons } from "@expo/vector-icons";

export default function BridgeTeamDashboardScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const isImpersonating = useIsImpersonating();
  const originalAdmin = useOriginalAdmin();
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation);
  const allParticipants = useParticipantStore((s) => s.participants);

  // Filter outside of the selector to avoid infinite loops
  const participants = React.useMemo(
    () =>
      allParticipants.filter((p) =>
        ["pending_bridge", "bridge_attempted", "bridge_contacted", "bridge_unable"].includes(p.status)
      ),
    [allParticipants]
  );

  const getTimeSinceSubmission = (submittedAt: string) => {
    const now = new Date();
    const submitted = new Date(submittedAt);
    const diffMs = now.getTime() - submitted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return "Just now";
  };

  // Get the most recent contact date from history (for Bridge Team)
  const getLastContactInfo = (participant: Participant) => {
    // Find all contact-related history entries
    const contactEntries = participant.history.filter(
      (entry) => entry.type === "contact_attempt" || entry.type === "status_change"
    );

    if (contactEntries.length === 0) return null;

    // Get the most recent contact entry
    const lastContact = contactEntries.reduce((latest, current) => {
      return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
    });

    const now = new Date();
    const contactDate = new Date(lastContact.createdAt);
    const diffMs = now.getTime() - contactDate.getTime();
    const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return { daysSince, lastContactDate: lastContact.createdAt };
  };

  const getStatusBadge = (participant: Participant) => {
    switch (participant.status) {
      case "pending_bridge":
        return { text: "New", color: "bg-gray-200 text-gray-900" };
      case "bridge_attempted":
        return { text: "Attempted", color: "bg-amber-100 text-amber-700" };
      case "bridge_contacted":
        return { text: "Contacted", color: "bg-yellow-100 text-gray-900" };
      case "bridge_unable":
        return { text: "Unable", color: "bg-gray-100 text-gray-700" };
      default:
        return { text: "Unknown", color: "bg-gray-100 text-gray-700" };
    }
  };

  const renderParticipantCard = (participant: Participant) => {
    const badge = getStatusBadge(participant);
    const lastContactInfo = getLastContactInfo(participant);

    return (
      <Pressable
        key={participant.id}
        onPress={() => navigation.navigate("ParticipantProfile", { participantId: participant.id })}
        className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 active:opacity-70"
      >
        {/* Header Row */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 flex-row items-center">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {participant.firstName} {participant.lastName}
            </Text>
            {/* Show voicemail/missed call icon */}
            {(participant.intakeType === "missed_call_no_voicemail" ||
              participant.intakeType === "missed_call_voicemail") && (
              <View className="ml-2">
                <Ionicons
                  name={participant.intakeType === "missed_call_voicemail" ? "chatbox-ellipses" : "call"}
                  size={18}
                  color="#F59E0B"
                />
              </View>
            )}
          </View>
          <View className={`px-3 py-1 rounded-full ${badge.color}`}>
            <Text className={`text-xs font-semibold ${badge.color}`}>{badge.text}</Text>
          </View>
        </View>

        {/* Participant Number and Comments if present */}
        <Text className="text-sm text-gray-500 mb-1">#{participant.participantNumber}</Text>
        {participant.missedCallComments && (
          <View className="bg-amber-50 rounded-lg px-2 py-1 mb-2">
            <Text className="text-xs text-gray-700 italic">{participant.missedCallComments}</Text>
          </View>
        )}

        {/* Info Row */}
        <View className="flex-row items-center mb-4">
          <View className="flex-row items-center mr-4">
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {getTimeSinceSubmission(participant.submittedAt)}
            </Text>
          </View>
          {lastContactInfo && (
            <View className="flex-row items-center mr-4">
              <Ionicons name="call-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1">
                Contacted {lastContactInfo.daysSince}d ago
              </Text>
            </View>
          )}
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">{participant.releasedFrom}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("BridgeTeamFollowUpForm", {
                participantId: participant.id,
              });
            }}
            className="flex-1 bg-green-50 border border-green-200 rounded-xl py-2 items-center active:opacity-70"
          >
            <Text className="text-gray-900 text-xs font-semibold">Contacted</Text>
          </Pressable>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("MoveToMentorship", { participantId: participant.id });
            }}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2 items-center active:opacity-70"
          >
            <Text className="text-yellow-700 text-xs font-semibold">To Mentorship</Text>
          </Pressable>
        </View>

        <View className="flex-row gap-2 mt-2">
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("ContactForm", {
                participantId: participant.id,
                outcomeType: "attempted",
              });
            }}
            className="flex-1 bg-amber-50 border border-amber-200 rounded-xl py-2 items-center active:opacity-70"
          >
            <Text className="text-amber-700 text-xs font-semibold">Attempted</Text>
          </Pressable>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("ContactForm", {
                participantId: participant.id,
                outcomeType: "unable",
              });
            }}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2 items-center active:opacity-70"
          >
            <Text className="text-gray-700 text-xs font-semibold">Unable</Text>
          </Pressable>
        </View>
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
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white mb-1">Bridge Team</Text>
            <Text className="text-yellow-100 text-sm">
              {participants.length} participant{participants.length !== 1 ? "s" : ""} waiting
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("IntakeTypeSelection")}
            className="w-12 h-12 bg-yellow-500 rounded-full items-center justify-center active:opacity-70"
          >
            <Ionicons name="add" size={28} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="px-6 py-4 flex-row gap-3">
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">
            {participants.filter((p) => p.status === "pending_bridge").length}
          </Text>
          <Text className="text-xs text-gray-600 mt-1">New</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">
            {participants.filter((p) => p.status === "bridge_attempted").length}
          </Text>
          <Text className="text-xs text-gray-600 mt-1">Attempted</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">
            {participants.filter((p) => p.status === "bridge_contacted").length}
          </Text>
          <Text className="text-xs text-gray-600 mt-1">Contacted</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">
            {participants.filter((p) => p.status === "bridge_unable").length}
          </Text>
          <Text className="text-xs text-gray-600 mt-1">Unable</Text>
        </View>
      </View>

      {/* Participant List */}
      <ScrollView className="flex-1 px-6" contentContainerStyle={contentContainerStyle}>
        {participants.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="checkmark-circle-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-base mt-4">No participants waiting</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">
              New participants will appear here
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
