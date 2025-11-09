import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";

export default function MonthlyUpdateFormScreen({ route, navigation }: any) {
  const { participantId } = route.params;
  const currentUser = useCurrentUser();
  const participant = useParticipantStore((s) => s.getParticipantById(participantId));
  const recordMonthlyUpdate = useParticipantStore((s) => s.recordMonthlyUpdate);

  const [updateDate, setUpdateDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [contactFrequency, setContactFrequency] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [challengesFaced, setChallengesFaced] = useState("");
  const [goalsProgress, setGoalsProgress] = useState("");
  const [nextMonthGoals, setNextMonthGoals] = useState("");

  if (!participant || !currentUser) {
    return null;
  }

  const frequencyOptions = ["Daily", "2-3 times/week", "Weekly", "Bi-weekly", "Monthly"];

  const handleSubmit = () => {
    if (!contactFrequency || !progressNotes.trim() || !goalsProgress.trim()) {
      Alert.alert("Missing Information", "Please complete all required fields.");
      return;
    }

    recordMonthlyUpdate(
      {
        participantId,
        updateDate: updateDate.toISOString(),
        contactFrequency,
        progressNotes,
        challengesFaced,
        goalsProgress,
        nextMonthGoals,
      },
      currentUser.id,
      currentUser.name
    );

    Alert.alert("Success", "Monthly update submitted successfully!", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-gray-600 pt-16 pb-6 px-6">
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-2xl font-bold text-white mb-2">Monthly Update</Text>
          <Text className="text-white opacity-90 text-base">
            {participant.firstName} {participant.lastName} • #{participant.participantNumber}
          </Text>
        </View>

        <View className="px-6 pt-6">
          {/* Update Date */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Update Date</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4"
            >
              <Text className="text-base text-gray-900">{formatDate(updateDate)}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={updateDate}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setUpdateDate(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Contact Frequency */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Contact Frequency <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {frequencyOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setContactFrequency(option)}
                  className={`px-4 py-3 rounded-xl border-2 ${
                    contactFrequency === option
                      ? "bg-gray-50 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      contactFrequency === option ? "text-yellow-600" : "text-gray-700"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Progress Notes */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Progress Notes <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Describe overall progress this month..."
              value={progressNotes}
              onChangeText={setProgressNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Challenges Faced */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Challenges Faced</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Any challenges or obstacles encountered..."
              value={challengesFaced}
              onChangeText={setChallengesFaced}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Goals Progress */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Goals Progress <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Progress toward established goals..."
              value={goalsProgress}
              onChangeText={setGoalsProgress}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Next Month Goals */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Next Month Goals</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Goals and focus areas for next month..."
              value={nextMonthGoals}
              onChangeText={setNextMonthGoals}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            className="bg-gray-600 rounded-xl py-4 items-center mb-3 active:opacity-80"
          >
            <Text className="text-white text-base font-bold">Submit Monthly Update</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-gray-100 rounded-xl py-3 items-center active:opacity-80"
          >
            <Text className="text-gray-700 text-sm font-semibold">Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
