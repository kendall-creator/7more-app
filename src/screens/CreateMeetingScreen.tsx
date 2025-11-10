import React, { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSchedulerStore } from "../state/schedulerStore";
import { useUsersStore } from "../state/usersStore";
import { useAuthStore } from "../state/authStore";
import { MeetingType } from "../types";
import { formatUserDisplayName } from "../utils/displayName";

export default function CreateMeetingScreen({ navigation }: any) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const invitedUsers = useUsersStore((s) => s.invitedUsers);
  const createMeeting = useSchedulerStore((s) => s.createMeeting);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("in-person");
  const [videoCallLink, setVideoCallLink] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedInvitees, setSelectedInvitees] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out current user from invitee list
  const availableUsers = useMemo(() => {
    return invitedUsers.filter(user => user.id !== currentUser?.id);
  }, [invitedUsers, currentUser]);

  const toggleInvitee = (userId: string) => {
    const newSelected = new Set(selectedInvitees);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedInvitees(newSelected);
  };

  const formatTime = (timeDate: Date) => {
    const hours = timeDate.getHours().toString().padStart(2, "0");
    const minutes = timeDate.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDateDisplay = (dateObj: Date) => {
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a meeting title.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Missing Description", "Please enter a meeting description.");
      return;
    }

    if (meetingType === "virtual" && !videoCallLink.trim()) {
      Alert.alert("Missing Link", "Please enter a video call link for virtual meetings.");
      return;
    }

    if (selectedInvitees.size === 0) {
      Alert.alert("No Invitees", "Please select at least one person to invite.");
      return;
    }

    if (!currentUser) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const dateString = date.toISOString().split("T")[0];
      const startTimeString = formatTime(startTime);
      const endTimeString = formatTime(endTime);

      await createMeeting(
        title.trim(),
        description.trim(),
        meetingType,
        dateString,
        startTimeString,
        endTimeString,
        Array.from(selectedInvitees),
        currentUser.id,
        currentUser.name,
        currentUser.nickname,
        meetingType === "virtual" ? videoCallLink.trim() : undefined
      );

      Alert.alert("Success", "Meeting created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error creating meeting:", error);
      Alert.alert("Error", "Failed to create meeting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-8 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-3xl font-bold text-white">Create Meeting</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Title */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Title *</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
            placeholder="Team Meeting"
            value={title}
            onChangeText={setTitle}
            editable={!isSubmitting}
          />
        </View>

        {/* Description */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Description *</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
            placeholder="Discuss upcoming events and assignments..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        {/* Meeting Type */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Meeting Type *</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setMeetingType("in-person")}
              disabled={isSubmitting}
              className={`flex-1 border-2 rounded-xl px-4 py-4 ${
                meetingType === "in-person"
                  ? "bg-yellow-50 border-yellow-500"
                  : "bg-white border-gray-200"
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="people"
                  size={20}
                  color={meetingType === "in-person" ? "#EAB308" : "#6B7280"}
                />
                <Text
                  className={`ml-2 font-semibold ${
                    meetingType === "in-person" ? "text-yellow-700" : "text-gray-600"
                  }`}
                >
                  In-Person
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setMeetingType("virtual")}
              disabled={isSubmitting}
              className={`flex-1 border-2 rounded-xl px-4 py-4 ${
                meetingType === "virtual"
                  ? "bg-yellow-50 border-yellow-500"
                  : "bg-white border-gray-200"
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="videocam"
                  size={20}
                  color={meetingType === "virtual" ? "#EAB308" : "#6B7280"}
                />
                <Text
                  className={`ml-2 font-semibold ${
                    meetingType === "virtual" ? "text-yellow-700" : "text-gray-600"
                  }`}
                >
                  Virtual
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Video Call Link (only for virtual) */}
        {meetingType === "virtual" && (
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Video Call Link *</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="https://zoom.us/j/..."
              value={videoCallLink}
              onChangeText={setVideoCallLink}
              autoCapitalize="none"
              keyboardType="url"
              editable={!isSubmitting}
            />
          </View>
        )}

        {/* Date */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Date *</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            disabled={isSubmitting}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 flex-row items-center justify-between"
          >
            <Text className="text-base text-gray-900">{formatDateDisplay(date)}</Text>
            <Ionicons name="calendar" size={20} color="#6B7280" />
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </View>

        {/* Start Time */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Start Time *</Text>
          <Pressable
            onPress={() => setShowStartTimePicker(true)}
            disabled={isSubmitting}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 flex-row items-center justify-between"
          >
            <Text className="text-base text-gray-900">{formatTime(startTime)}</Text>
            <Ionicons name="time" size={20} color="#6B7280" />
          </Pressable>
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedTime) => {
                setShowStartTimePicker(Platform.OS === "ios");
                if (selectedTime) setStartTime(selectedTime);
              }}
            />
          )}
        </View>

        {/* End Time */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">End Time *</Text>
          <Pressable
            onPress={() => setShowEndTimePicker(true)}
            disabled={isSubmitting}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 flex-row items-center justify-between"
          >
            <Text className="text-base text-gray-900">{formatTime(endTime)}</Text>
            <Ionicons name="time" size={20} color="#6B7280" />
          </Pressable>
          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedTime) => {
                setShowEndTimePicker(Platform.OS === "ios");
                if (selectedTime) setEndTime(selectedTime);
              }}
            />
          )}
        </View>

        {/* Invitees */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Invite People * ({selectedInvitees.size} selected)
          </Text>
          <View className="gap-2">
            {availableUsers.map((user) => {
              const isSelected = selectedInvitees.has(user.id);
              return (
                <Pressable
                  key={user.id}
                  onPress={() => toggleInvitee(user.id)}
                  disabled={isSubmitting}
                  className={`border-2 rounded-xl p-4 ${
                    isSelected
                      ? "bg-yellow-50 border-yellow-500"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className={`text-base font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                        {formatUserDisplayName(user.name, user.nickname)}
                      </Text>
                      <Text className="text-sm text-gray-500">{user.email}</Text>
                      <View className="mt-1">
                        <View className={`px-2 py-1 rounded self-start ${isSelected ? "bg-yellow-200" : "bg-gray-100"}`}>
                          <Text className={`text-xs font-semibold ${isSelected ? "text-yellow-800" : "text-gray-600"}`}>
                            {user.role.replace("_", " ").toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className={`w-6 h-6 rounded border-2 items-center justify-center ${
                      isSelected ? "bg-yellow-500 border-yellow-500" : "border-gray-300"
                    }`}>
                      {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`rounded-xl px-6 py-4 mb-8 ${
            isSubmitting ? "bg-gray-400" : "bg-yellow-500"
          }`}
        >
          <Text className="text-center text-gray-900 font-bold text-lg">
            {isSubmitting ? "Creating Meeting..." : "Create Meeting"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
