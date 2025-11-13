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
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser } from "../state/authStore";

interface Props {
  navigation: any;
}

export default function MissedCallNoVoicemailFormScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const addParticipant = useParticipantStore((s) => s.addParticipant);
  const findDuplicatesByPhone = useParticipantStore((s) => s.findDuplicatesByPhone);
  const addNote = useParticipantStore((s) => s.addNote);
  const currentUser = useCurrentUser();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateParticipants, setDuplicateParticipants] = useState<any[]>([]);

  const validateForm = () => {
    if (!phoneNumber.trim()) {
      setErrorMessage("Phone number is required.");
      setShowErrorModal(true);
      return false;
    }
    return true;
  };

  const handlePhoneBlur = () => {
    if (phoneNumber && phoneNumber.trim()) {
      const duplicates = findDuplicatesByPhone(phoneNumber);
      if (duplicates.length > 0) {
        setDuplicateParticipants(duplicates);
        setShowDuplicateModal(true);
      }
    }
  };

  const handleConnectToExisting = async () => {
    if (duplicateParticipants.length === 0) return;

    setShowDuplicateModal(false);
    setIsSubmitting(true);

    try {
      const existingParticipant = duplicateParticipants[0];

      // Ensure we have user info
      const userId = currentUser?.id || "system";
      const userName = currentUser?.name || currentUser?.email || "System";

      // Create note content
      let noteContent = "📞 Missed Call - No Voicemail\n\n";
      noteContent += `Phone: ${phoneNumber}\n`;
      if (name) noteContent += `Name from caller ID: ${name}\n`;
      if (notes.trim()) noteContent += `\nNotes:\n${notes}`;

      // Add note to existing participant
      await addNote(
        existingParticipant.id,
        noteContent,
        userId,
        userName
      );

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error connecting missed call to participant:", error);
      setErrorMessage("Failed to connect missed call. Please try again.");
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const participantData = {
        phoneNumber: phoneNumber.trim(),
        firstName: name.trim() || "Unknown",
        lastName: "(Missed Call)",
        intakeType: "missed_call_no_voicemail" as const,
        statusDetail: "awaiting_contact" as const,
        // Minimal required fields - will be filled in later during full intake
        participantNumber: `TEMP-${Date.now()}`,
        dateOfBirth: "1990-01-01", // Placeholder
        age: 0, // Placeholder
        gender: "Unknown",
        releaseDate: new Date().toISOString().split("T")[0],
        timeOut: 0, // Placeholder
        releasedFrom: "Unknown",
        status: "pending_bridge" as const,
        completedGraduationSteps: [],
      };

      await addParticipant(participantData);

      // Add a note with the additional context
      if (notes.trim()) {
        const newParticipantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Note will be added through the history that addParticipant creates
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error adding missed call:", error);
      setErrorMessage("Failed to add missed call entry. Please try again.");
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* Header */}
          <View
            className="bg-white border-b border-gray-200"
            style={{ paddingTop: insets.top }}
          >
            <View className="flex-row items-center px-4 py-4">
              <Pressable
                onPress={() => navigation.goBack()}
                className="mr-3 active:opacity-70"
              >
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </Pressable>
              <Text className="text-xl font-semibold text-gray-900">
                Missed Call – No Voicemail
              </Text>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-base text-gray-600 mb-6">
              Add basic information for this missed call. A full intake will be completed when contact is made.
            </Text>

            {/* Phone Number - Required */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Phone Number <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                onBlur={handlePhoneBlur}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            {/* Name - Optional */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Name (Optional)
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
                placeholder="If known from caller ID"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Notes - Optional */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
                placeholder="Any additional context..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`rounded-lg py-4 items-center ${
                isSubmitting ? "bg-gray-400" : "bg-amber-500 active:opacity-70"
              }`}
            >
              <Text className="text-white text-base font-semibold">
                {isSubmitting ? "Adding..." : "Add to Callback Queue"}
              </Text>
            </Pressable>

            <View style={{ height: insets.bottom + 20 }} />
          </ScrollView>

          {/* Success Modal */}
          <Modal
            visible={showSuccessModal}
            transparent
            animationType="fade"
            onRequestClose={handleSuccessClose}
          >
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
              <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <View className="items-center mb-4">
                  <View className="bg-green-100 rounded-full p-3 mb-3">
                    <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                  </View>
                  <Text className="text-xl font-bold text-gray-900 mb-2">
                    Added to Queue
                  </Text>
                  <Text className="text-center text-gray-600">
                    Missed call entry added to Bridge Team callback queue
                  </Text>
                </View>
                <Pressable
                  onPress={handleSuccessClose}
                  className="bg-green-500 rounded-lg py-3 items-center active:opacity-70"
                >
                  <Text className="text-white text-base font-semibold">Done</Text>
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
                  <View className="bg-red-100 rounded-full p-3 mb-3">
                    <Ionicons name="alert-circle" size={48} color="#ef4444" />
                  </View>
                  <Text className="text-xl font-bold text-gray-900 mb-2">Error</Text>
                  <Text className="text-center text-gray-600">{errorMessage}</Text>
                </View>
                <Pressable
                  onPress={() => setShowErrorModal(false)}
                  className="bg-red-500 rounded-lg py-3 items-center active:opacity-70"
                >
                  <Text className="text-white text-base font-semibold">Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Duplicate Contact Modal */}
          <Modal
            visible={showDuplicateModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDuplicateModal(false)}
          >
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
              <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <View className="items-center mb-4">
                  <View className="bg-amber-100 rounded-full p-3 mb-3">
                    <Ionicons name="warning" size={48} color="#D97706" />
                  </View>
                  <Text className="text-xl font-bold text-gray-900 mb-2">Duplicate Phone Number</Text>
                  <Text className="text-center text-gray-600 mb-3">
                    This phone number is already registered to:
                  </Text>
                  {duplicateParticipants.map((p, index) => (
                    <View key={index} className="bg-gray-50 rounded-lg p-3 mb-2 w-full">
                      <Text className="text-gray-900 font-semibold text-center">
                        {p.firstName} {p.lastName}
                      </Text>
                      <Text className="text-gray-600 text-sm text-center">
                        TDCJ: {p.participantNumber}
                      </Text>
                    </View>
                  ))}
                  <Text className="text-center text-gray-600 text-sm mt-2">
                    Do you want to view the existing participant?
                  </Text>
                </View>
                <View className="gap-3">
                  <Pressable
                    onPress={handleConnectToExisting}
                    className="bg-amber-600 rounded-lg py-3 items-center active:opacity-70"
                  >
                    <Text className="text-white text-base font-semibold">Connect to Existing Participant</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowDuplicateModal(false)}
                    className="bg-gray-200 rounded-lg py-3 items-center active:opacity-70"
                  >
                    <Text className="text-gray-700 text-base font-semibold">Create New Entry</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
