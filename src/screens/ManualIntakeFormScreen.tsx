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
} from "react-native";
import { useParticipantStore } from "../state/participantStore";
import { ParticipantStatus } from "../types";
import { Ionicons } from "@expo/vector-icons";

const LEGAL_STATUS_OPTIONS = [
  "I am currently on parole",
  "I am currently on probation",
  "I have an ankle monitor",
  "I was convicted of sexual assault",
  "I was convicted of sexual assault involving a minor",
];

const RELEASE_LOCATION_OPTIONS = [
  "Pam Lychner",
  "Huntsville",
  "Plane",
  "Hawaii",
  "Other",
];

export default function ManualIntakeFormScreen({ navigation, route }: any) {
  const intakeType = route?.params?.intakeType || "full_form_entry"; // Default to full form entry
  const [participantNumber, setParticipantNumber] = useState("");
  const [tdcjNotAvailable, setTdcjNotAvailable] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [releasedFrom, setReleasedFrom] = useState("");
  const [otherReleaseLocation, setOtherReleaseLocation] = useState("");
  const [legalStatus, setLegalStatus] = useState<string[]>([]);
  const [showLegalStatusModal, setShowLegalStatusModal] = useState(false);
  const [showReleaseLocationModal, setShowReleaseLocationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDuplicatePhoneWarning, setShowDuplicatePhoneWarning] = useState(false);
  const [showDuplicateEmailWarning, setShowDuplicateEmailWarning] = useState(false);

  const addParticipant = useParticipantStore((s) => s.addParticipant);
  const findDuplicatesByPhone = useParticipantStore((s) => s.findDuplicatesByPhone);
  const findDuplicatesByEmail = useParticipantStore((s) => s.findDuplicatesByEmail);

  const parseDate = (dateStr: string): Date | null => {
    // Try to parse MM/DD/YYYY format
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;

    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    if (year < 1900 || year > new Date().getFullYear()) return null;

    return new Date(year, month - 1, day);
  };

  const calculateAge = (dob: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const calculateTimeOut = (release: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - release.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleLegalStatus = (option: string) => {
    if (legalStatus.includes(option)) {
      setLegalStatus(legalStatus.filter((item) => item !== option));
    } else {
      setLegalStatus([...legalStatus, option]);
    }
  };

  const handlePhoneBlur = () => {
    if (phoneNumber && phoneNumber.trim()) {
      const duplicates = findDuplicatesByPhone(phoneNumber);
      if (duplicates.length > 0) {
        setShowDuplicatePhoneWarning(true);
        setErrorMessage(`This phone number is already registered to: ${duplicates.map(p => `${p.firstName} ${p.lastName}`).join(", ")}`);
        setShowErrorModal(true);
      }
    }
  };

  const handleEmailBlur = () => {
    if (email && email.trim()) {
      const duplicates = findDuplicatesByEmail(email);
      if (duplicates.length > 0) {
        setShowDuplicateEmailWarning(true);
        setErrorMessage(`This email is already registered to: ${duplicates.map(p => `${p.firstName} ${p.lastName}`).join(", ")}`);
        setShowErrorModal(true);
      }
    }
  };

  const handleSubmit = async () => {
    // Determine final release location value
    const finalReleaseLocation = releasedFrom === "Other" ? otherReleaseLocation : releasedFrom;

    // Use "Not Available" if TDCJ toggle is enabled
    const finalParticipantNumber = tdcjNotAvailable ? "Not Available" : participantNumber;

    // Validation
    if ((!tdcjNotAvailable && !participantNumber) || !firstName || !lastName || !gender || !releasedFrom || !dateOfBirth || !releaseDate) {
      setErrorMessage("Please fill in all required fields.");
      setShowErrorModal(true);
      return;
    }

    // Validate that at least one contact method is provided
    if (!phoneNumber?.trim() && !email?.trim()) {
      setErrorMessage("Please provide at least one contact method (email or phone number).");
      setShowErrorModal(true);
      return;
    }

    // If "Other" is selected, validate that they entered a custom location
    if (releasedFrom === "Other" && !otherReleaseLocation.trim()) {
      setErrorMessage("Please specify the release location.");
      setShowErrorModal(true);
      return;
    }

    // Validate date formats
    const dobDate = parseDate(dateOfBirth);
    const relDate = parseDate(releaseDate);

    if (!dobDate) {
      setErrorMessage("Please enter a valid date of birth in MM/DD/YYYY format.");
      setShowErrorModal(true);
      return;
    }

    if (!relDate) {
      setErrorMessage("Please enter a valid release date in MM/DD/YYYY format.");
      setShowErrorModal(true);
      return;
    }

    const age = calculateAge(dobDate);
    const timeOut = calculateTimeOut(relDate);

    console.log("📝 Manual intake form submitting:", {
      participantNumber: finalParticipantNumber,
      firstName,
      lastName,
      age,
      gender,
      intakeType
    });

    try {
      const newParticipantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await addParticipant({
        participantNumber: finalParticipantNumber,
        firstName,
        lastName,
        dateOfBirth: dobDate.toISOString(),
        age,
        gender,
        ...(phoneNumber ? { phoneNumber } : {}),
        ...(email ? { email } : {}),
        releaseDate: relDate.toISOString(),
        timeOut,
        releasedFrom: finalReleaseLocation,
        status: "pending_bridge" as ParticipantStatus,
        completedGraduationSteps: [],
        intakeType: intakeType as any,
      });

      console.log("✅ Participant added successfully via form");

      // If this is a Live Call Intake, immediately navigate to the Follow-Up Form
      if (intakeType === "live_call_intake") {
        // Need to get the participant ID - we'll navigate after a brief delay to ensure Firebase sync
        setTimeout(() => {
          const participants = useParticipantStore.getState().participants;
          const justAdded = participants.find(
            p => p.participantNumber === participantNumber &&
            p.firstName === firstName &&
            p.lastName === lastName
          );

          if (justAdded) {
            navigation.replace("BridgeTeamFollowUpForm", {
              participantId: justAdded.id,
              fromLiveCallIntake: true
            });
          } else {
            // Fallback - show success and go back
            setShowSuccessModal(true);
          }
        }, 500);
      } else {
        // For full form entry, just show success
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("❌ Error adding participant:", error);
      setErrorMessage(`Failed to add participant: ${error}`);
      setShowErrorModal(true);
    }
  };

  const handleDateInput = (text: string, setter: (val: string) => void) => {
    // Auto-format as user types
    let cleaned = text.replace(/[^\d]/g, "");

    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    if (cleaned.length >= 5) {
      cleaned = cleaned.slice(0, 5) + "/" + cleaned.slice(5);
    }
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }

    setter(cleaned);
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
        <View className="bg-gray-600 pt-16 pb-8 px-6">
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-3xl font-bold text-white mb-2">Add Participant</Text>
          <Text className="text-yellow-100 text-base">Manually add a new participant</Text>
        </View>

        <View className="px-6 pt-6">
          {/* First Name */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              First Name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last Name */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Last Name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Last name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* TDCJ Number */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              TDCJ Number <Text className="text-red-500">*</Text>
            </Text>
            {!tdcjNotAvailable ? (
              <>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                  placeholder="Enter TDCJ number"
                  value={participantNumber}
                  onChangeText={setParticipantNumber}
                />
                <Pressable
                  onPress={() => {
                    setTdcjNotAvailable(true);
                    setParticipantNumber("");
                  }}
                  className="mt-2 bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 active:opacity-70"
                >
                  <Text className="text-gray-700 text-sm font-medium text-center">
                    Not Available at This Time
                  </Text>
                </Pressable>
              </>
            ) : (
              <View className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-amber-800 text-sm font-medium">
                    TDCJ Number: Not Available
                  </Text>
                  <Pressable
                    onPress={() => setTdcjNotAvailable(false)}
                    className="active:opacity-70"
                  >
                    <Ionicons name="close-circle" size={24} color="#92400e" />
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Phone Number */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Phone Number <Text className="text-yellow-600 text-xs">(Email or Phone required)</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                setShowDuplicatePhoneWarning(false);
              }}
              onBlur={handlePhoneBlur}
              keyboardType="phone-pad"
            />
          </View>

          {/* Email Address */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Email Address <Text className="text-yellow-600 text-xs">(Email or Phone required)</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="email@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setShowDuplicateEmailWarning(false);
              }}
              onBlur={handleEmailBlur}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Date of Birth */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Date of Birth <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="MM/DD/YYYY"
              value={dateOfBirth}
              onChangeText={(text) => handleDateInput(text, setDateOfBirth)}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* Gender */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Gender <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row gap-3">
              {["Male", "Female"].map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setGender(option)}
                  className={`flex-1 border-2 rounded-xl py-3 items-center ${
                    gender === option
                      ? "bg-yellow-50 border-yellow-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      gender === option ? "text-yellow-600" : "text-gray-700"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Release Date */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Release Date <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="MM/DD/YYYY"
              value={releaseDate}
              onChangeText={(text) => handleDateInput(text, setReleaseDate)}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* Released From */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Facility Released From <Text className="text-red-500">*</Text>
            </Text>
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setShowReleaseLocationModal(true);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 flex-row items-center justify-between"
            >
              <Text className={`text-base ${releasedFrom ? "text-gray-900" : "text-gray-400"}`}>
                {releasedFrom || "Select release location"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Other Release Location - Conditional */}
          {releasedFrom === "Other" && (
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Specify Release Location <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                placeholder="Enter location name"
                value={otherReleaseLocation}
                onChangeText={setOtherReleaseLocation}
              />
            </View>
          )}

          {/* Legal Status */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Legal Status
            </Text>
            <Text className="text-xs text-gray-500 mb-3">
              We are not here to judge. We simply want to be able to get the best resources to you and we do not want to waste your time if you would not qualify for one of our resources.
            </Text>
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setShowLegalStatusModal(true);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 flex-row items-center justify-between"
            >
              <Text className={`text-base ${legalStatus.length > 0 ? "text-gray-900" : "text-gray-400"}`}>
                {legalStatus.length > 0
                  ? `${legalStatus.length} selected`
                  : "Select applicable options"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            className="bg-gray-600 rounded-xl py-4 items-center mb-4 active:opacity-80"
          >
            <Text className="text-white text-base font-bold">Add Participant</Text>
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-gray-100 rounded-xl py-3 items-center active:opacity-80"
          >
            <Text className="text-gray-700 text-sm font-semibold">Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Legal Status Modal */}
      <Modal
        visible={showLegalStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLegalStatusModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Legal Status</Text>
              <Pressable
                onPress={() => setShowLegalStatusModal(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <Text className="text-xs text-gray-500 mb-4">
              We are not here to judge. We simply want to be able to get the best resources to you and we do not want to waste your time if you would not qualify for one of our resources.
            </Text>

            <ScrollView className="mb-4">
              {LEGAL_STATUS_OPTIONS.map((option) => {
                const isSelected = legalStatus.includes(option);
                return (
                  <Pressable
                    key={option}
                    onPress={() => toggleLegalStatus(option)}
                    className={`border-2 rounded-xl p-4 mb-3 flex-row items-center justify-between ${
                      isSelected
                        ? "bg-yellow-50 border-yellow-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm flex-1 ${
                        isSelected ? "text-yellow-900 font-semibold" : "text-gray-700"
                      }`}
                    >
                      {option}
                    </Text>
                    {isSelected && (
                      <View className="w-6 h-6 bg-yellow-600 rounded-full items-center justify-center ml-3">
                        <Ionicons name="checkmark" size={16} color="white" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={() => setShowLegalStatusModal(false)}
              className="bg-gray-600 rounded-xl py-4 items-center active:opacity-80"
            >
              <Text className="text-white text-base font-bold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Release Location Modal */}
      <Modal
        visible={showReleaseLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReleaseLocationModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Release Location</Text>
              <Pressable
                onPress={() => setShowReleaseLocationModal(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <Text className="text-xs text-gray-500 mb-4">
              Select the facility the participant was released from
            </Text>

            <ScrollView className="mb-4">
              {RELEASE_LOCATION_OPTIONS.map((option) => {
                const isSelected = releasedFrom === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setReleasedFrom(option);
                      if (option !== "Other") {
                        setOtherReleaseLocation(""); // Clear other field if not selecting "Other"
                      }
                    }}
                    className={`border-2 rounded-xl p-4 mb-3 flex-row items-center justify-between ${
                      isSelected
                        ? "bg-yellow-50 border-yellow-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-base flex-1 ${
                        isSelected ? "text-yellow-900 font-semibold" : "text-gray-700"
                      }`}
                    >
                      {option}
                    </Text>
                    {isSelected && (
                      <View className="w-6 h-6 bg-yellow-600 rounded-full items-center justify-center ml-3">
                        <Ionicons name="checkmark" size={16} color="white" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={() => setShowReleaseLocationModal(false)}
              className="bg-gray-600 rounded-xl py-4 items-center active:opacity-80"
            >
              <Text className="text-white text-base font-bold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
              <Text className="text-xl font-bold text-gray-900 mb-2">Participant Added</Text>
              <Text className="text-center text-gray-600">
                {firstName} {lastName} has been added to the Bridge Team queue.
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
