import React, { useState, useMemo } from "react";
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
import { GraduationApproval } from "../types";
import {
  GRADUATION_STEPS,
  calculateGraduationProgress,
  isReadyForGraduation,
} from "../constants/graduationSteps";

type RouteParams = {
  GraduationApproval: {
    participantId: string;
  };
};

export default function GraduationApprovalScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "GraduationApproval">>();
  const { participantId } = route.params;

  const currentUser = useAuthStore((s) => s.currentUser);
  const participant = useParticipantStore((s) => s.getParticipantById(participantId));
  const approveGraduation = useParticipantStore((s) => s.approveGraduation);

  const [approvalNotes, setApprovalNotes] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Get monthly check-in history
  const checkInHistory = useMemo(() => {
    if (!participant) return [];
    return participant.history
      .filter((h) => h.description === "Monthly check-in form completed")
      .reverse()
      .slice(0, 5);
  }, [participant]);

  if (!participant || !currentUser) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-600 text-center">Participant not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Only admins can access this screen
  if (currentUser.role !== "admin") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="lock-closed" size={64} color="#9CA3AF" />
          <Text className="text-gray-600 text-center mt-4 text-lg">
            Admin access required
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentProgress = calculateGraduationProgress(participant.completedGraduationSteps || []);
  const readyForGraduation = isReadyForGraduation(participant.completedGraduationSteps || []);

  const handleApproveGraduation = () => {
    const approval: GraduationApproval = {
      participantId,
      approvedBy: currentUser.id,
      approvedByName: currentUser.name,
      approvalDate: new Date().toISOString(),
      notes: approvalNotes.trim() || undefined,
    };

    approveGraduation(participantId, approval);
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-gray-600 px-4 py-4">
          <Text className="text-white text-2xl font-bold">Graduation Approval</Text>
          <Text className="text-gray-200 text-sm mt-1">
            {participant.firstName} {participant.lastName}
          </Text>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Readiness Status */}
          {readyForGraduation ? (
            <View className="bg-green-50 border border-green-600 rounded-lg p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                <Text className="text-green-600 font-bold text-lg ml-2">
                  Ready for Graduation
                </Text>
              </View>
              <Text className="text-gray-700">
                This mentee has completed all 10 graduation steps and is ready to graduate from
                the program.
              </Text>
            </View>
          ) : (
            <View className="bg-yellow-50 border border-yellow-600 rounded-lg p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons name="alert-circle" size={24} color="#CA8A04" />
                <Text className="text-yellow-600 font-bold text-lg ml-2">
                  Not Yet Ready
                </Text>
              </View>
              <Text className="text-gray-700">
                This mentee has not completed all graduation steps yet. Review progress below.
              </Text>
            </View>
          )}

          {/* Progress Card */}
          <View className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
            <Text className="text-gray-800 font-bold text-lg mb-3">Graduation Progress</Text>
            <View className="flex-row items-center mb-3">
              <View className="flex-1 bg-gray-200 rounded-full h-4 mr-3">
                <View
                  className="bg-yellow-600 h-4 rounded-full"
                  style={{ width: `${currentProgress}%` }}
                />
              </View>
              <Text className="text-gray-700 font-bold text-lg">{currentProgress}%</Text>
            </View>
            <Text className="text-gray-600">
              {(participant.completedGraduationSteps || []).length} of {GRADUATION_STEPS.length} steps
              completed
            </Text>
          </View>

          {/* Graduation Steps */}
          <View className="mb-6">
            <Text className="text-gray-800 font-bold text-lg mb-3">Graduation Steps</Text>
            {GRADUATION_STEPS.map((step) => {
              const isCompleted = (participant.completedGraduationSteps || []).includes(step.id);
              return (
                <View
                  key={step.id}
                  className={`mb-3 p-4 rounded-lg border flex-row items-start ${
                    isCompleted
                      ? "bg-green-50 border-green-600"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <View className="mr-3 mt-1">
                    <Ionicons
                      name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={isCompleted ? "#16A34A" : "#9CA3AF"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold mb-1 ${
                        isCompleted ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      {step.order}. {step.title}
                    </Text>
                    <Text className="text-gray-600 text-sm">{step.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Recent Check-Ins */}
          {checkInHistory.length > 0 && (
            <View className="mb-6">
              <Text className="text-gray-800 font-bold text-lg mb-3">
                Recent Monthly Check-Ins
              </Text>
              {checkInHistory.map((entry) => (
                <View
                  key={entry.id}
                  className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
                >
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="calendar" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className="text-gray-600 text-sm">
                    Submitted by: {entry.createdByName}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Approval Notes */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">
              Approval Notes (Optional)
            </Text>
            <Text className="text-gray-500 text-sm mb-2">
              Add any notes or comments about this graduation
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3 text-gray-800 min-h-[100px]"
              placeholder="e.g., Congratulations on completing the program, note any special achievements..."
              value={approvalNotes}
              onChangeText={setApprovalNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          {readyForGraduation ? (
            <Pressable
              onPress={() => setShowConfirmModal(true)}
              className="bg-green-600 rounded-lg p-4 mb-4"
            >
              <Text className="text-white text-center font-bold text-lg">
                Approve Graduation
              </Text>
            </Pressable>
          ) : (
            <View className="bg-gray-100 rounded-lg p-4 mb-4">
              <Text className="text-gray-500 text-center font-semibold">
                Cannot approve graduation until all steps are completed
              </Text>
            </View>
          )}

          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-gray-300 rounded-lg p-4 mb-8"
          >
            <Text className="text-gray-700 text-center font-bold">Cancel</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-lg p-6 w-full max-w-md">
            <Text className="text-2xl font-bold text-gray-800 mb-3">
              Confirm Graduation
            </Text>
            <Text className="text-gray-600 mb-6">
              Are you sure you want to approve {participant.firstName} {participant.lastName} for
              graduation? This will mark them as graduated from the mentorship program.
            </Text>
            <Pressable
              onPress={handleApproveGraduation}
              className="bg-green-600 rounded-lg p-3 mb-3"
            >
              <Text className="text-white text-center font-bold">
                Yes, Approve Graduation
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowConfirmModal(false)}
              className="bg-gray-300 rounded-lg p-3"
            >
              <Text className="text-gray-700 text-center font-bold">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-lg p-6 w-full max-w-md items-center">
            <View className="bg-green-100 rounded-full p-4 mb-4">
              <Ionicons name="trophy" size={48} color="#16A34A" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
              Graduation Approved!
            </Text>
            <Text className="text-gray-600 mb-6 text-center">
              {participant.firstName} {participant.lastName} has been approved for graduation from
              the mentorship program. Congratulations!
            </Text>
            <Pressable
              onPress={handleSuccessClose}
              className="bg-green-600 rounded-lg p-3 w-full"
            >
              <Text className="text-white text-center font-bold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
