import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";
import { MonthlyReportFormData } from "../types";

export default function MonthlyReportFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { participantId } = route.params;

  const currentUser = useCurrentUser();
  const participant = useParticipantStore((s) =>
    s.participants.find((p) => p.id === participantId)
  );
  const submitMonthlyReport = useParticipantStore((s) => s.submitMonthlyReport);

  const [updates, setUpdates] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!participant || !currentUser) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Participant not found</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!updates.trim()) {
      setErrorMessage("Please provide updates before submitting.");
      setShowErrorModal(true);
      return;
    }

    const formData: MonthlyReportFormData = {
      participantId,
      reportDate: new Date().toISOString().split("T")[0],
      updates,
    };

    try {
      await submitMonthlyReport(formData, currentUser.id, currentUser.name);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage("Failed to submit monthly report. Please try again.");
      setShowErrorModal(true);
    }
  };

  // Calculate days since mentor assignment
  const daysSinceAssignment = participant.assignedToMentorAt
    ? Math.floor(
        (new Date().getTime() - new Date(participant.assignedToMentorAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  // Calculate days until next report is due
  const daysUntilDue = participant.nextMonthlyReportDue
    ? Math.ceil(
        (new Date(participant.nextMonthlyReportDue).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="bg-gray-600 pt-16 pb-6 px-6">
          <Pressable
            onPress={() => navigation.goBack()}
            className="flex-row items-center mb-4 active:opacity-70"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text className="text-white text-base ml-2 font-semibold">Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-white mb-1">Monthly Report</Text>
          <Text className="text-yellow-100 text-sm">
            {participant.firstName} {participant.lastName}
          </Text>
        </View>

        {/* Info Cards */}
        <View className="px-6 py-4">
          <View className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-gray-500 mb-1">Time with Mentor</Text>
                <Text className="text-2xl font-bold text-gray-900">{daysSinceAssignment} days</Text>
              </View>
              {daysUntilDue !== null && (
                <View>
                  <Text className="text-xs text-gray-500 mb-1">
                    {isOverdue ? "Overdue by" : "Due in"}
                  </Text>
                  <Text
                    className={`text-2xl font-bold ${
                      isOverdue ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {Math.abs(daysUntilDue)} days
                  </Text>
                </View>
              )}
            </View>
          </View>

          {isOverdue && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-center">
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text className="text-red-800 text-sm font-semibold ml-2">
                  This monthly report is overdue
                </Text>
              </View>
            </View>
          )}

          {/* Updates Section */}
          <View className="bg-white rounded-xl p-4 border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">Monthly Updates</Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Updates <Text className="text-red-500">*</Text>
              </Text>
              <Text className="text-xs text-gray-500 mb-2">
                Provide updates on progress, activities, challenges, and any notable changes this
                month
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base min-h-[150px]"
                placeholder="Enter your monthly updates here..."
                value={updates}
                onChangeText={setUpdates}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>

            <Pressable
              onPress={handleSubmit}
              className="bg-gray-600 rounded-xl py-4 items-center active:opacity-80"
            >
              <Text className="text-white text-base font-bold">Submit Monthly Report</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="checkmark-circle" size={40} color="#16A34A" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Report Submitted</Text>
              <Text className="text-center text-gray-600">
                Your monthly report has been submitted successfully. Next report will be due in 30
                days.
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}
              className="bg-gray-600 rounded-xl py-3 items-center active:opacity-80"
            >
              <Text className="text-white font-semibold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="alert-circle" size={40} color="#DC2626" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Error</Text>
              <Text className="text-center text-gray-600">{errorMessage}</Text>
            </View>
            <Pressable
              onPress={() => setShowErrorModal(false)}
              className="bg-gray-600 rounded-xl py-3 items-center active:opacity-80"
            >
              <Text className="text-white font-semibold">OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
