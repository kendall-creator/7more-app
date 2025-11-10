import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { Participant, ParticipantStatus } from "../types";
import { Ionicons } from "@expo/vector-icons";

export default function FilteredParticipantsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { status, statuses, title } = route.params as {
    status?: ParticipantStatus;
    statuses?: ParticipantStatus[];
    title: string;
  };

  const allParticipants = useParticipantStore((s) => s.participants);

  const filteredParticipants = useMemo(() => {
    if (statuses && statuses.length > 0) {
      return allParticipants.filter((p) => statuses.includes(p.status));
    }
    if (status) {
      return allParticipants.filter((p) => p.status === status);
    }
    return [];
  }, [allParticipants, status, statuses]);

  const getStatusColor = (status: ParticipantStatus): string => {
    switch (status) {
      case "pending_bridge": return "bg-gray-200 text-gray-900";
      case "bridge_contacted": return "bg-yellow-100 text-gray-900";
      case "bridge_attempted": return "bg-amber-100 text-amber-700";
      case "bridge_unable": return "bg-gray-100 text-gray-700";
      case "pending_mentor": return "bg-yellow-100 text-gray-700";
      case "assigned_mentor": return "bg-yellow-100 text-gray-700";
      case "initial_contact_pending": return "bg-orange-100 text-orange-700";
      case "mentor_attempted": return "bg-amber-100 text-amber-700";
      case "mentor_unable": return "bg-gray-100 text-gray-700";
      case "active_mentorship": return "bg-yellow-100 text-gray-900";
      case "graduated": return "bg-yellow-100 text-gray-700";
      case "ceased_contact": return "bg-gray-200 text-gray-900";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Recently";
  };

  // Get the most recent contact date from history
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

  const renderParticipantCard = (participant: Participant) => {
    const statusColor = getStatusColor(participant.status);
    const lastContactInfo = getLastContactInfo(participant);

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
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>

        <View className="flex-row items-center gap-3 mb-3">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {getTimeSince(participant.submittedAt)}
            </Text>
          </View>
          {lastContactInfo && (participant.status === "ceased_contact" || participant.status.includes("bridge")) && (
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1">
                Last contact {lastContactInfo.daysSince}d ago
              </Text>
            </View>
          )}
          {participant.releasedFrom && (
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1">{participant.releasedFrom}</Text>
            </View>
          )}
        </View>

        {participant.assignedMentor && (
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">
              Mentor: {participant.assignedMentor}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-6 px-6">
        <Pressable
          onPress={() => navigation.goBack()}
          className="flex-row items-center mb-4 active:opacity-70"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text className="text-white text-base ml-2 font-semibold">Back</Text>
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-1">{title}</Text>
        <Text className="text-yellow-100 text-sm">
          {filteredParticipants.length} {filteredParticipants.length === 1 ? "participant" : "participants"}
        </Text>
      </View>

      {/* Participant List */}
      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {filteredParticipants.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-600 text-center mt-4 text-base">
              No participants found with this status
            </Text>
          </View>
        ) : (
          filteredParticipants.map(renderParticipantCard)
        )}
      </ScrollView>
    </View>
  );
}
