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
import { ContactAttemptType } from "../types";
import { Ionicons } from "@expo/vector-icons";

export default function ContactFormScreen({ route, navigation }: any) {
  const { participantId, outcomeType } = route.params;
  const currentUser = useCurrentUser();
  const participant = useParticipantStore((s) => s.getParticipantById(participantId));
  const recordContact = useParticipantStore((s) => s.recordContact);

  const [contactDate, setContactDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [contactMethod, setContactMethod] = useState("phone");
  const [contactNotes, setContactNotes] = useState("");
  const [attemptType, setAttemptType] = useState<ContactAttemptType>("left_voicemail");
  const [unableReason, setUnableReason] = useState("");

  if (!participant || !currentUser) {
    return null;
  }

  const handleSubmit = async () => {
    if (!contactNotes.trim()) {
      Alert.alert("Missing Information", "Please add contact notes before submitting.");
      return;
    }

    if (outcomeType === "unable" && !unableReason.trim()) {
      Alert.alert("Missing Information", "Please explain why you were unable to contact them.");
      return;
    }

    try {
      console.log("📝 Submitting contact form...");
      console.log("Participant ID:", participantId);
      console.log("Outcome type:", outcomeType);
      console.log("Contact notes:", contactNotes);

      await recordContact(
        {
          participantId,
          contactDate: contactDate.toISOString(),
          contactMethod,
          contactNotes,
          outcomeType,
          attemptType: outcomeType === "attempted" ? attemptType : undefined,
          unableReason: outcomeType === "unable" ? unableReason : undefined,
        },
        currentUser.id,
        currentUser.name
      );

      console.log("✅ Contact recorded successfully");

      Alert.alert("Success", "Contact information recorded successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("❌ Error recording contact:", error);
      Alert.alert("Error", "Failed to record contact. Please try again.");
    }
  };

  const getHeaderTitle = () => {
    switch (outcomeType) {
      case "successful":
        return "Contact Made";
      case "attempted":
        return "Contact Attempted";
      case "unable":
        return "Unable to Contact";
      default:
        return "Contact Form";
    }
  };

  const getHeaderColor = () => {
    switch (outcomeType) {
      case "successful":
        return "bg-yellow-600";
      case "attempted":
        return "bg-amber-600";
      case "unable":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
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
        {/* Header */}
        <View className={`${getHeaderColor()} pt-16 pb-6 px-6`}>
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-2xl font-bold text-white mb-2">{getHeaderTitle()}</Text>
          <Text className="text-white opacity-90 text-base">
            {participant.firstName} {participant.lastName} • #{participant.participantNumber}
          </Text>
        </View>

        <View className="px-6 pt-6">
          {/* Contact Date */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Contact Date</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4"
            >
              <Text className="text-base text-gray-900">{formatDate(contactDate)}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={contactDate}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setContactDate(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Contact Method */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Contact Method</Text>
            <View className="flex-row flex-wrap gap-2">
              {["phone", "email", "text", "in-person"].map((method) => (
                <Pressable
                  key={method}
                  onPress={() => setContactMethod(method)}
                  className={`px-4 py-3 rounded-xl border-2 ${
                    contactMethod === method
                      ? "bg-gray-50 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium capitalize ${
                      contactMethod === method ? "text-yellow-600" : "text-gray-700"
                    }`}
                  >
                    {method}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Attempt Type (only for attempted) */}
          {outcomeType === "attempted" && (
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Attempt Type</Text>
              <View className="gap-2">
                <Pressable
                  onPress={() => setAttemptType("left_voicemail")}
                  className={`border-2 rounded-xl px-4 py-4 ${
                    attemptType === "left_voicemail"
                      ? "bg-amber-50 border-amber-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      attemptType === "left_voicemail" ? "text-amber-700" : "text-gray-700"
                    }`}
                  >
                    Left Voicemail
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAttemptType("unable_to_leave_voicemail")}
                  className={`border-2 rounded-xl px-4 py-4 ${
                    attemptType === "unable_to_leave_voicemail"
                      ? "bg-amber-50 border-amber-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      attemptType === "unable_to_leave_voicemail" ? "text-amber-700" : "text-gray-700"
                    }`}
                  >
                    Unable to Leave Voicemail
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Unable Reason (only for unable) */}
          {outcomeType === "unable" && (
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Reason Unable to Contact <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                placeholder="Explain why you were unable to make contact..."
                value={unableReason}
                onChangeText={setUnableReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Contact Notes */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Contact Notes <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Add notes about this contact attempt..."
              value={contactNotes}
              onChangeText={setContactNotes}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            className="bg-gray-600 rounded-xl py-4 items-center mb-3 active:opacity-80"
          >
            <Text className="text-white text-base font-bold">Submit Contact Form</Text>
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
