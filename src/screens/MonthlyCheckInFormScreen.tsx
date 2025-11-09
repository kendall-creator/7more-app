import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useParticipantStore } from "../state/participantStore";
import { useAuthStore } from "../state/authStore";
import { MonthlyCheckInFormData } from "../types";
import {
  GRADUATION_STEPS,
  calculateGraduationProgress,
  isReadyForGraduation,
} from "../constants/graduationSteps";

type RouteParams = {
  MonthlyCheckInForm: {
    participantId: string;
  };
};

export default function MonthlyCheckInFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "MonthlyCheckInForm">>();
  const { participantId } = route.params;

  const currentUser = useAuthStore((s) => s.currentUser);
  const participant = useParticipantStore((s) => s.getParticipantById(participantId));
  const recordMonthlyCheckIn = useParticipantStore((s) => s.recordMonthlyCheckIn);

  const [accomplishments, setAccomplishments] = useState<string>("");
  const [challenges, setChallenges] = useState<string>("");
  const [notableChanges, setNotableChanges] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [selectedSteps, setSelectedSteps] = useState<string[]>(
    participant?.completedGraduationSteps || []
  );

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!participant || !currentUser) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-600 text-center">Participant not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleStepToggle = (stepId: string) => {
    if (selectedSteps.includes(stepId)) {
      setSelectedSteps(selectedSteps.filter((id) => id !== stepId));
    } else {
      setSelectedSteps([...selectedSteps, stepId]);
    }
  };

  const handleSubmit = () => {
    if (!accomplishments.trim() || !challenges.trim() || !notableChanges.trim()) {
      alert("Please complete all required fields");
      return;
    }

    const formData: MonthlyCheckInFormData = {
      participantId,
      checkInDate: new Date().toISOString(),
      accomplishmentsSinceLastCheckIn: accomplishments.trim(),
      challengesFaced: challenges.trim(),
      completedSteps: selectedSteps,
      notableChanges: notableChanges.trim(),
      additionalNotes: additionalNotes.trim() || undefined,
    };

    recordMonthlyCheckIn(formData, currentUser.id, currentUser.name);
    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const getDueDateStatus = () => {
    if (!participant.nextMonthlyCheckInDue) return null;

    const dueDate = new Date(participant.nextMonthlyCheckInDue);
    const now = new Date();
    const isOverdue = dueDate < now;
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (isOverdue) {
      return {
        text: `Overdue by ${Math.abs(daysUntilDue)} day(s)`,
        color: "text-red-600",
      };
    } else if (daysUntilDue === 0) {
      return {
        text: "Due today",
        color: "text-yellow-600",
      };
    } else {
      return {
        text: `Due in ${daysUntilDue} day(s)`,
        color: "text-gray-600",
      };
    }
  };

  const dueDateStatus = getDueDateStatus();
  const currentProgress = calculateGraduationProgress(selectedSteps);
  const readyForGraduation = isReadyForGraduation(selectedSteps);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-gray-600 px-4 py-4">
          <Text className="text-white text-2xl font-bold">Monthly Check-In</Text>
          <Text className="text-gray-200 text-sm mt-1">
            {participant.firstName} {participant.lastName}
          </Text>
          {dueDateStatus && (
            <Text className={`${dueDateStatus.color} text-sm mt-1 font-semibold`}>
              {dueDateStatus.text}
            </Text>
          )}
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Progress Card */}
          <View className="bg-yellow-50 border border-yellow-600 rounded-lg p-4 mb-6">
            <Text className="text-gray-800 font-bold text-lg mb-2">Graduation Progress</Text>
            <View className="flex-row items-center mb-2">
              <View className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                <View
                  className="bg-yellow-600 h-3 rounded-full"
                  style={{ width: `${currentProgress}%` }}
                />
              </View>
              <Text className="text-gray-700 font-bold">{currentProgress}%</Text>
            </View>
            <Text className="text-gray-600 text-sm">
              {selectedSteps.length} of {GRADUATION_STEPS.length} steps completed
            </Text>
            {readyForGraduation && (
              <Text className="text-yellow-600 font-bold mt-2">
                Ready for admin graduation approval!
              </Text>
            )}
          </View>

          {/* Accomplishments */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">
              Accomplishments Since Last Check-In *
            </Text>
            <Text className="text-gray-500 text-sm mb-2">
              What has the mentee accomplished this month?
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3 text-gray-800 min-h-[100px]"
              placeholder="Describe major accomplishments, milestones reached, goals achieved..."
              value={accomplishments}
              onChangeText={setAccomplishments}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Graduation Steps Checklist */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">
              Graduation Steps Completed *
            </Text>
            <Text className="text-gray-500 text-sm mb-3">
              Check off any steps completed since last check-in
            </Text>
            {GRADUATION_STEPS.map((step) => {
              const isCompleted = selectedSteps.includes(step.id);
              return (
                <Pressable
                  key={step.id}
                  onPress={() => handleStepToggle(step.id)}
                  className={`mb-3 p-4 rounded-lg border-2 flex-row items-start ${
                    isCompleted ? "bg-yellow-50 border-yellow-600" : "bg-white border-gray-300"
                  }`}
                >
                  <View className="mr-3 mt-1">
                    <Ionicons
                      name={isCompleted ? "checkbox" : "square-outline"}
                      size={24}
                      color={isCompleted ? "#CA8A04" : "#9CA3AF"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold mb-1 ${
                        isCompleted ? "text-yellow-600" : "text-gray-700"
                      }`}
                    >
                      {step.order}. {step.title}
                    </Text>
                    <Text className="text-gray-600 text-sm">{step.description}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Challenges */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">
              Challenges Faced *
            </Text>
            <Text className="text-gray-500 text-sm mb-2">
              What challenges or obstacles has the mentee encountered?
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3 text-gray-800 min-h-[100px]"
              placeholder="Describe any setbacks, difficulties, or areas needing improvement..."
              value={challenges}
              onChangeText={setChallenges}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Notable Changes */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">
              Notable Changes *
            </Text>
            <Text className="text-gray-500 text-sm mb-2">
              Any significant changes in circumstances, behavior, or situation?
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3 text-gray-800 min-h-[80px]"
              placeholder="e.g., New job, housing change, family situation, attitude shifts..."
              value={notableChanges}
              onChangeText={setNotableChanges}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Additional Notes */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">
              Additional Notes (Optional)
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3 text-gray-800 min-h-[80px]"
              placeholder="Any other observations or information to share..."
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            className="bg-yellow-600 rounded-lg p-4 mb-8"
          >
            <Text className="text-white text-center font-bold text-lg">
              Submit Monthly Check-In
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-lg p-6 w-full max-w-md">
            <Text className="text-2xl font-bold text-gray-800 mb-3">
              Monthly Check-In Submitted
            </Text>
            <Text className="text-gray-600 mb-4">
              Your monthly check-in has been recorded successfully.
            </Text>
            {readyForGraduation && (
              <View className="bg-yellow-50 border border-yellow-600 rounded-lg p-4 mb-4">
                <Text className="text-yellow-600 font-bold mb-2">
                  All Steps Completed!
                </Text>
                <Text className="text-gray-700 text-sm">
                  This mentee has completed all 10 graduation steps and is ready for admin
                  approval to graduate from the program.
                </Text>
              </View>
            )}
            <Text className="text-gray-500 text-sm mb-6">
              Next monthly check-in due in 30 days.
            </Text>
            <Pressable
              onPress={handleModalClose}
              className="bg-yellow-600 rounded-lg p-3"
            >
              <Text className="text-white text-center font-bold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
