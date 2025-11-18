import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { useUsersStore } from "../state/usersStore";
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
    if (selectedParticipants.size === participants.length) {
      setSelectedParticipants(new Set());
    } else {
      setSelectedParticipants(new Set(participants.map((p) => p.id)));
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

  const renderParticipantCard = (participant: Participant) => {
    const daysSince = getDaysSinceMovedToMentorship(participant.movedToMentorshipAt);
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

        {!selectionMode && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("AssignMentor", { participantId: participant.id });
            }}
            className="bg-gray-600 rounded-xl py-3 items-center active:opacity-80"
          >
            <Text className="text-white text-sm font-bold">Assign to Mentor</Text>
          </Pressable>
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
  const contentContainerStyle = useMemo(
    () => ({ paddingBottom: isImpersonating ? 100 : 20 }),
    [isImpersonating]
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-yellow-600 pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white mb-1">Mentorship Leader</Text>
            <Text className="text-gray-100 text-sm">
              {participants.length} participant{participants.length !== 1 ? "s" : ""} awaiting assignment
            </Text>
          </View>
          {!selectionMode ? (
            <Pressable
              onPress={() => setSelectionMode(true)}
              className="w-12 h-12 bg-yellow-500 rounded-full items-center justify-center active:opacity-70"
            >
              <Ionicons name="checkmark-done" size={24} color="white" />
            </Pressable>
          ) : (
            <Pressable
              onPress={cancelSelection}
              className="px-4 py-2 bg-yellow-500 rounded-full active:opacity-70"
            >
              <Text className="text-white text-sm font-semibold">Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Selection Bar */}
      {selectionMode && (
        <View className="bg-yellow-500 px-6 py-3">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={toggleSelectAll} className="flex-row items-center">
              <View
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedParticipants.size === participants.length
                    ? "bg-white border-white"
                    : "border-white"
                } items-center justify-center mr-2`}
              >
                {selectedParticipants.size === participants.length && (
                  <Ionicons name="checkmark" size={16} color="#EAB308" />
                )}
              </View>
              <Text className="text-white font-semibold">
                {selectedParticipants.size === participants.length ? "Deselect All" : "Select All"} (
                {selectedParticipants.size})
              </Text>
            </Pressable>
            {selectedParticipants.size > 0 && (
              <Pressable
                onPress={() => setShowMentorPicker(true)}
                disabled={isProcessing}
                className={`px-4 py-2 bg-white rounded-lg active:opacity-70 ${
                  isProcessing ? "opacity-50" : ""
                }`}
              >
                <Text className="text-yellow-700 font-bold text-sm">Assign to Mentor</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

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
