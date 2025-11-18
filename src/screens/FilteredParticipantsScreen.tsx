import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { useUsersStore } from "../state/usersStore";
import { useCurrentUser } from "../state/authStore";
import { Participant, ParticipantStatus } from "../types";
import { Ionicons } from "@expo/vector-icons";

export default function FilteredParticipantsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const currentUser = useCurrentUser();
  const { status, statuses, title } = route.params as {
    status?: ParticipantStatus;
    statuses?: ParticipantStatus[];
    title: string;
  };

  const allParticipants = useParticipantStore((s) => s.participants);
  const bulkMoveToMentorship = useParticipantStore((s) => s.bulkMoveToMentorship);
  const bulkAssignToMentor = useParticipantStore((s) => s.bulkAssignToMentor);

  // Get all users for mentor selection
  const allUsers = useUsersStore((s) => s.invitedUsers);
  const mentors = useMemo(() => {
    return allUsers.filter((user) => user.role === "mentor" || user.roles?.includes("mentor"));
  }, [allUsers]);

  // Selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMentorPicker, setShowMentorPicker] = useState(false);

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

  const toggleSelection = (participantId: string) => {
    setSelectedParticipants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(participantId)) {
        newSet.delete(participantId);
      } else {
        newSet.add(participantId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedParticipants.size === filteredParticipants.length) {
      setSelectedParticipants(new Set());
    } else {
      setSelectedParticipants(new Set(filteredParticipants.map((p) => p.id)));
    }
  };

  const handleBulkMoveToMentorship = async () => {
    if (!currentUser || selectedParticipants.size === 0) return;

    setIsProcessing(true);
    try {
      await bulkMoveToMentorship(Array.from(selectedParticipants), currentUser.id, currentUser.name);
      setSelectedParticipants(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error("Failed to bulk move participants:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAssignToMentor = async (mentorId: string, mentorName: string) => {
    if (!currentUser || selectedParticipants.size === 0) return;

    setIsProcessing(true);
    try {
      await bulkAssignToMentor(
        Array.from(selectedParticipants),
        mentorId,
        currentUser.id,
        currentUser.name
      );
      setSelectedParticipants(new Set());
      setSelectionMode(false);
      setShowMentorPicker(false);
    } catch (error) {
      console.error("Failed to bulk assign participants:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedParticipants(new Set());
    setShowMentorPicker(false);
  };

  // Determine if we can show bulk actions based on filtered statuses
  const canMoveToBridge = filteredParticipants.some((p) =>
    ["pending_bridge", "bridge_attempted", "bridge_contacted", "bridge_unable"].includes(p.status)
  );

  const canMoveToMentorship = canMoveToBridge;

  const canAssignToMentor = filteredParticipants.some((p) => p.status === "pending_mentor");

  const renderParticipantCard = (participant: Participant) => {
    const statusColor = getStatusColor(participant.status);
    const lastContactInfo = getLastContactInfo(participant);
    const isSelected = selectedParticipants.has(participant.id);

    return (
      <Pressable
        key={participant.id}
        onPress={() => {
          if (selectionMode) {
            toggleSelection(participant.id);
          } else {
            navigation.navigate("ParticipantProfile", { participantId: participant.id });
          }
        }}
        className={`bg-white rounded-2xl p-4 mb-3 border ${
          isSelected ? "border-yellow-500 border-2" : "border-gray-100"
        } active:opacity-70`}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 flex-row items-center">
            {selectionMode && (
              <View className="mr-3">
                <View
                  className={`w-6 h-6 rounded-full border-2 ${
                    isSelected ? "bg-yellow-500 border-yellow-500" : "border-gray-300"
                  } items-center justify-center`}
                >
                  {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-1">
                {participant.firstName} {participant.lastName}
              </Text>
              <Text className="text-sm text-gray-500">#{participant.participantNumber}</Text>
            </View>
          </View>
          {!selectionMode && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
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
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="flex-row items-center active:opacity-70"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text className="text-white text-base ml-2 font-semibold">Back</Text>
          </Pressable>
          {!selectionMode && filteredParticipants.length > 0 && (
            <Pressable
              onPress={() => setSelectionMode(true)}
              className="w-10 h-10 bg-gray-500 rounded-full items-center justify-center active:opacity-70"
            >
              <Ionicons name="checkmark-done" size={20} color="white" />
            </Pressable>
          )}
          {selectionMode && (
            <Pressable
              onPress={cancelSelection}
              className="px-3 py-2 bg-gray-500 rounded-full active:opacity-70"
            >
              <Text className="text-white text-sm font-semibold">Cancel</Text>
            </Pressable>
          )}
        </View>
        <Text className="text-2xl font-bold text-white mb-1">{title}</Text>
        <Text className="text-yellow-100 text-sm">
          {filteredParticipants.length} {filteredParticipants.length === 1 ? "participant" : "participants"}
        </Text>
      </View>

      {/* Selection Bar */}
      {selectionMode && (
        <View className="bg-yellow-500 px-6 py-3">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={toggleSelectAll} className="flex-row items-center">
              <View
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedParticipants.size === filteredParticipants.length
                    ? "bg-white border-white"
                    : "border-white"
                } items-center justify-center mr-2`}
              >
                {selectedParticipants.size === filteredParticipants.length && (
                  <Ionicons name="checkmark" size={16} color="#EAB308" />
                )}
              </View>
              <Text className="text-white font-semibold">
                {selectedParticipants.size === filteredParticipants.length ? "Deselect All" : "Select All"} (
                {selectedParticipants.size})
              </Text>
            </Pressable>
            {selectedParticipants.size > 0 && (
              <View className="flex-row gap-2">
                {canMoveToMentorship && (
                  <Pressable
                    onPress={handleBulkMoveToMentorship}
                    disabled={isProcessing}
                    className={`px-3 py-2 bg-white rounded-lg active:opacity-70 ${
                      isProcessing ? "opacity-50" : ""
                    }`}
                  >
                    <Text className="text-yellow-700 font-bold text-xs">To Mentorship</Text>
                  </Pressable>
                )}
                {canAssignToMentor && (
                  <Pressable
                    onPress={() => setShowMentorPicker(true)}
                    disabled={isProcessing}
                    className={`px-3 py-2 bg-white rounded-lg active:opacity-70 ${
                      isProcessing ? "opacity-50" : ""
                    }`}
                  >
                    <Text className="text-yellow-700 font-bold text-xs">Assign Mentor</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      )}

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

      {/* Mentor Picker Modal */}
      {showMentorPicker && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[70%]">
            {/* Modal Header */}
            <View className="px-6 py-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-900">
                  Select Mentor ({selectedParticipants.size} selected)
                </Text>
                <Pressable onPress={() => setShowMentorPicker(false)} className="active:opacity-70">
                  <Ionicons name="close" size={28} color="#6B7280" />
                </Pressable>
              </View>
            </View>

            {/* Mentors List */}
            <ScrollView className="px-6 py-4">
              {mentors.length === 0 ? (
                <View className="py-12 items-center">
                  <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                  <Text className="text-gray-500 text-base mt-4">No mentors available</Text>
                </View>
              ) : (
                mentors.map((mentor) => (
                  <Pressable
                    key={mentor.id}
                    onPress={() => handleBulkAssignToMentor(mentor.id, mentor.name)}
                    disabled={isProcessing}
                    className={`bg-white border border-gray-200 rounded-xl p-4 mb-3 active:opacity-70 ${
                      isProcessing ? "opacity-50" : ""
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900">{mentor.name}</Text>
                        {mentor.nickname && (
                          <Text className="text-sm text-gray-500 mt-1">{mentor.nickname}</Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#6B7280" />
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}
