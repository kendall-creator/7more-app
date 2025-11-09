import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAllParticipants, useParticipantStore } from "../state/participantStore";
import { useCurrentUser } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";
import { Participant } from "../types";

export default function MergeParticipantsScreen({ route }: any) {
  const { sourceParticipantId } = route.params;
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const allParticipants = useAllParticipants();
  const mergeParticipants = useParticipantStore((s) => s.mergeParticipants);
  const sourceParticipant = useParticipantStore((s) => s.getParticipantById(sourceParticipantId));

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<Participant | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!sourceParticipant || !currentUser) {
    return null;
  }

  // Filter out source participant and apply search
  const availableTargets = allParticipants.filter((p) => {
    if (p.id === sourceParticipantId) return false;
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(query) ||
      p.lastName.toLowerCase().includes(query) ||
      p.participantNumber.toLowerCase().includes(query)
    );
  });

  const handleMerge = () => {
    if (!selectedTarget) return;

    mergeParticipants(sourceParticipantId, selectedTarget.id, currentUser.id, currentUser.name);
    setShowConfirmModal(false);
    navigation.navigate("ParticipantProfile", { participantId: selectedTarget.id });
  };

  const renderParticipantCard = (participant: Participant) => {
    const isSelected = selectedTarget?.id === participant.id;

    return (
      <Pressable
        key={participant.id}
        onPress={() => setSelectedTarget(participant)}
        className={`rounded-2xl p-4 mb-3 border-2 ${
          isSelected
            ? "bg-yellow-50 border-yellow-600"
            : "bg-white border-gray-200"
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900 mb-1">
              {participant.firstName} {participant.lastName}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">ID: {participant.participantNumber}</Text>
            <Text className="text-xs text-gray-500">
              {participant.notes.length} notes • {participant.history.length} history entries
            </Text>
          </View>
          {isSelected && (
            <View className="w-8 h-8 bg-yellow-600 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={20} color="white" />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-yellow-600 pt-16 pb-6 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <View className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white text-base ml-2 font-semibold">Back</Text>
          </View>
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-1">Merge Participants</Text>
        <Text className="text-gray-900 text-sm">Select which profile to keep</Text>
      </View>

      {/* Source Participant */}
      <View className="px-6 pt-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">MERGING FROM:</Text>
        <View className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text className="text-base font-bold text-gray-900 ml-2">
              {sourceParticipant.firstName} {sourceParticipant.lastName}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 mb-1">ID: {sourceParticipant.participantNumber}</Text>
          <Text className="text-xs text-red-700 font-semibold">
            This profile will be deleted after merge
          </Text>
        </View>
      </View>

      {/* Search */}
      <View className="px-6 pb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">MERGE INTO:</Text>
        <View className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center mb-3">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-sm"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Target Participants List */}
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {availableTargets.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-base mt-4">No participants found</Text>
          </View>
        ) : (
          availableTargets.map(renderParticipantCard)
        )}
      </ScrollView>

      {/* Merge Button */}
      {selectedTarget && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
          <Pressable
            onPress={() => setShowConfirmModal(true)}
            className="bg-yellow-600 rounded-xl py-4 flex-row items-center justify-center active:opacity-80"
          >
            <Ionicons name="git-merge" size={20} color="white" />
            <Text className="text-white text-base font-bold ml-2">Merge Participants</Text>
          </Pressable>
        </View>
      )}

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-yellow-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="git-merge" size={32} color="#CA8A04" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Confirm Merge</Text>
              <Text className="text-center text-gray-600 mb-4">
                Are you sure you want to merge these participants?
              </Text>
              <View className="w-full bg-gray-50 rounded-xl p-4 mb-2">
                <Text className="text-sm text-gray-600 mb-2">
                  <Text className="font-semibold">From:</Text> {sourceParticipant.firstName}{" "}
                  {sourceParticipant.lastName} ({sourceParticipant.participantNumber})
                </Text>
                <Text className="text-sm text-gray-600">
                  <Text className="font-semibold">Into:</Text> {selectedTarget?.firstName}{" "}
                  {selectedTarget?.lastName} ({selectedTarget?.participantNumber})
                </Text>
              </View>
              <Text className="text-xs text-red-600 text-center">
                The source profile will be permanently deleted. All notes and history will be
                merged into the target profile.
              </Text>
            </View>
            <View className="gap-2">
              <Pressable
                onPress={handleMerge}
                className="bg-yellow-600 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white font-semibold">Confirm Merge</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowConfirmModal(false)}
                className="bg-gray-100 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
