import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { Participant } from "../types";
import { Ionicons } from "@expo/vector-icons";

export default function AdminMentorshipAssignmentScreen() {
  const navigation = useNavigation<any>();
  const allParticipants = useParticipantStore((s) => s.participants);
  const [searchQuery, setSearchQuery] = useState("");

  const pendingParticipants = useMemo(
    () => allParticipants.filter((p) => p.status === "pending_mentor"),
    [allParticipants]
  );

  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return pendingParticipants;

    const query = searchQuery.toLowerCase();
    return pendingParticipants.filter(
      (p) =>
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.participantNumber.toLowerCase().includes(query)
    );
  }, [pendingParticipants, searchQuery]);

  const getTimeSinceContact = (movedToMentorshipAt?: string) => {
    if (!movedToMentorshipAt) return "Recently";

    const now = new Date();
    const moved = new Date(movedToMentorshipAt);
    const diffMs = now.getTime() - moved.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Recently";
  };

  const renderParticipantCard = (participant: Participant) => {
    return (
      <Pressable
        key={participant.id}
        onPress={() => navigation.navigate("AssignMentor", { participantId: participant.id })}
        className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 active:opacity-70"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {participant.firstName} {participant.lastName}
            </Text>
            <Text className="text-sm text-gray-500">#{participant.participantNumber}</Text>
          </View>
          <View className="bg-yellow-100 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-gray-700">Needs Assignment</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3 mb-3">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {getTimeSinceContact(participant.movedToMentorshipAt)}
            </Text>
          </View>
          {participant.releasedFrom && (
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1">{participant.releasedFrom}</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={16} color="#FFC107" />
            <Text className="text-sm text-gray-700 font-semibold ml-2">
              Click to Review & Assign
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-yellow-600 pt-16 pb-6 px-6">
        <Pressable
          onPress={() => navigation.goBack()}
          className="flex-row items-center mb-4 active:opacity-70"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text className="text-white text-base ml-2 font-semibold">Back</Text>
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-1">Mentorship Assignment Queue</Text>
        <Text className="text-gray-100 text-sm">
          {filteredParticipants.length} {filteredParticipants.length === 1 ? "participant" : "participants"} awaiting assignment
        </Text>
      </View>

      {/* Search Bar */}
      {pendingParticipants.length > 0 && (
        <View className="px-6 pt-4">
          <View className="bg-white rounded-xl border border-gray-200 flex-row items-center px-4 py-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search participants..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Participant List */}
      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {filteredParticipants.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
            <Ionicons name="checkmark-circle-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-600 text-center mt-4 text-base font-semibold">
              {searchQuery ? "No participants found" : "All caught up!"}
            </Text>
            <Text className="text-gray-400 text-center mt-2 text-sm">
              {searchQuery
                ? "Try a different search term"
                : "No participants currently awaiting mentor assignment"}
            </Text>
          </View>
        ) : (
          filteredParticipants.map(renderParticipantCard)
        )}
      </ScrollView>
    </View>
  );
}
