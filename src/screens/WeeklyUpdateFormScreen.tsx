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
import { useParticipantStore } from "../state/participantStore";
import { useAuthStore } from "../state/authStore";
import { WeeklyUpdateFormData } from "../types";

type RouteParams = {
  WeeklyUpdateForm: {
    participantId: string;
  };
};

export default function WeeklyUpdateFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "WeeklyUpdateForm">>();
  const { participantId } = route.params;

  const currentUser = useAuthStore((s) => s.currentUser);
  const participant = useParticipantStore((s) => s.getParticipantById(participantId));
  const recordWeeklyUpdate = useParticipantStore((s) => s.recordWeeklyUpdate);

  const [contactThisWeek, setContactThisWeek] = useState<boolean>(false);
  const [contactMethod, setContactMethod] = useState<string>("");
  const [progressUpdate, setProgressUpdate] = useState<string>("");
  const [challengesThisWeek, setChallengesThisWeek] = useState<string>("");
  const [supportNeeded, setSupportNeeded] = useState<string>("");

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

  const handleSubmit = () => {
    if (!progressUpdate.trim() || !challengesThisWeek.trim()) {
      alert("Please complete all required fields");
      return;
    }

    const formData: WeeklyUpdateFormData = {
      participantId,
      updateDate: new Date().toISOString(),
      contactThisWeek,
      contactMethod: contactThisWeek ? contactMethod : undefined,
      progressUpdate: progressUpdate.trim(),
      challengesThisWeek: challengesThisWeek.trim(),
      supportNeeded: supportNeeded.trim() || undefined,
    };

    recordWeeklyUpdate(formData, currentUser.id, currentUser.name);
    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const getDueDateStatus = () => {
    if (!participant.nextWeeklyUpdateDue) return null;

    const dueDate = new Date(participant.nextWeeklyUpdateDue);
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-gray-600 px-4 py-4">
          <Text className="text-white text-2xl font-bold">Weekly Update</Text>
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
          {/* Contact This Week */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">
              Did you have contact with the mentee this week? *
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setContactThisWeek(true)}
                className={`flex-1 p-4 rounded-lg border-2 ${
                  contactThisWeek ? "bg-yellow-50 border-yellow-600" : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    contactThisWeek ? "text-yellow-600" : "text-gray-600"
                  }`}
                >
                  Yes
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setContactThisWeek(false);
                  setContactMethod("");
                }}
                className={`flex-1 p-4 rounded-lg border-2 ${
                  !contactThisWeek ? "bg-yellow-50 border-yellow-600" : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    !contactThisWeek ? "text-yellow-600" : "text-gray-600"
                  }`}
                >
                  No
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Contact Method (if contacted) */}
          {contactThisWeek && (
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">Contact Method</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg p-3 text-gray-800"
                placeholder="e.g., Phone call, In-person meeting, Text"
                value={contactMethod}
                onChangeText={setContactMethod}
              />
            </View>
          )}

          {/* Progress Update */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">
              Progress Update *
            </Text>
            <Text className="text-gray-500 text-sm mb-2">
              What progress has the mentee made this week?
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3 text-gray-800 min-h-[100px]"
              placeholder="Describe any progress, achievements, or steps taken..."
              value={progressUpdate}
              onChangeText={setProgressUpdate}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Challenges This Week */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">
              Challenges This Week *
            </Text>
            <Text className="text-gray-500 text-sm mb-2">
              What challenges or obstacles did the mentee face?
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3 text-gray-800 min-h-[100px]"
              placeholder="Describe any challenges, setbacks, or concerns..."
              value={challengesThisWeek}
              onChangeText={setChallengesThisWeek}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Support Needed */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">
              Support Needed (Optional)
            </Text>
            <Text className="text-gray-500 text-sm mb-2">
              What additional support or resources would help?
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg p-3 text-gray-800 min-h-[80px]"
              placeholder="e.g., Job leads, housing resources, transportation assistance..."
              value={supportNeeded}
              onChangeText={setSupportNeeded}
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
              Submit Weekly Update
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
              Weekly Update Submitted
            </Text>
            <Text className="text-gray-600 mb-6">
              Your weekly update has been recorded successfully. The next weekly update will be
              due in 7 days.
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
