import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";

export default function MoveToMentorshipScreen({ route, navigation }: any) {
  const { participantId } = route.params;
  const currentUser = useCurrentUser();
  const participant = useParticipantStore((s) => s.getParticipantById(participantId));
  const updateParticipantStatus = useParticipantStore((s) => s.updateParticipantStatus);

  if (!participant || !currentUser) {
    return null;
  }

  const handleConfirm = () => {
    updateParticipantStatus(
      participantId,
      "pending_mentor",
      currentUser.id,
      currentUser.name,
      "Moved from Bridge Team to await mentor assignment"
    );

    // Update the movedToMentorshipAt timestamp
    const participants = useParticipantStore.getState().participants;
    const updatedParticipants = participants.map((p) =>
      p.id === participantId
        ? { ...p, movedToMentorshipAt: new Date().toISOString() }
        : p
    );
    useParticipantStore.setState({ participants: updatedParticipants });

    Alert.alert("Success", "Participant moved to mentorship queue successfully.", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-gray-600 pt-16 pb-6 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-2">Move to Mentorship</Text>
        <Text className="text-yellow-100 text-sm">Confirm participant transfer</Text>
      </View>

      <View className="px-6 pt-8">
        <View className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="arrow-forward" size={32} color="#374151" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {participant.firstName} {participant.lastName}
            </Text>
            <Text className="text-sm text-gray-500">#{participant.participantNumber}</Text>
          </View>

          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <Text className="text-sm text-blue-900 leading-5">
              This participant will be moved to the mentorship queue where a Mentorship Leader can
              assign them to a mentor.
            </Text>
          </View>

          <Text className="text-xs text-gray-500 text-center">
            This action will be recorded in the participant history.
          </Text>
        </View>

        <Pressable
          onPress={handleConfirm}
          className="bg-gray-600 rounded-xl py-4 items-center mb-3 active:opacity-80"
        >
          <Text className="text-white text-base font-bold">Confirm Move to Mentorship</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          className="bg-gray-100 rounded-xl py-3 items-center active:opacity-80"
        >
          <Text className="text-gray-700 text-sm font-semibold">Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
