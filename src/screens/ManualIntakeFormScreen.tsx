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
  "The participant is on parole",
  "The participant is on probation",
  "The participant is on an ankle monitor",
  "The participant has an SA conviction",
  "The participant has an SA–Minor conviction",
  "The participant has barriers that prevent them from working right now",
  "None of these apply",
];

const RELEASE_LOCATION_OPTIONS = [
  "Pam Lychner",
  "Huntsville",
  "Plane",
  "Hawaii",
  "Other",
];

const REFERRAL_SOURCE_OPTIONS = [
  "I met them in person",
  "Family/friend",
  "Online",
  "Other",
];

const CRITICAL_NEEDS_OPTIONS = [
  "Needs help getting a phone",
  "Employment needed",
  "Housing needed",
  "Clothing needed",
  "Food needed",
  "Building",
  "Healthy relationships",
  "Managing finances",
];

export default function ManualIntakeFormScreen({ navigation, route }: any) {
  const intakeType = route?.params?.intakeType || "full_form_entry"; // Default to full form entry
  const [participantNumber, setParticipantNumber] = useState("");
  const [tdcjNotAvailable, setTdcjNotAvailable] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobNotAvailable, setDobNotAvailable] = useState(false);
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [releasedFrom, setReleasedFrom] = useState("");
  const [otherReleaseLocation, setOtherReleaseLocation] = useState("");
  const [legalStatus, setLegalStatus] = useState<string[]>([]);
  const [referralSource, setReferralSource] = useState("");
  const [otherReferralSource, setOtherReferralSource] = useState("");
  const [criticalNeeds, setCriticalNeeds] = useState<string[]>([]);
  const [showLegalStatusModal, setShowLegalStatusModal] = useState(false);
  const [showReleaseLocationModal, setShowReleaseLocationModal] = useState(false);
  const [showReferralSourceModal, setShowReferralSourceModal] = useState(false);
  const [showCriticalNeedsModal, setShowCriticalNeedsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateParticipants, setDuplicateParticipants] = useState<any[]>([]);
  const [duplicateType, setDuplicateType] = useState<"phone" | "email" | null>(null);

  const addParticipant = useParticipantStore((s) => s.addParticipant);
  const findDuplicatesByPhone = useParticipantStore((s) => s.findDuplicatesByPhone);
  const findDuplicatesByEmail = useParticipantStore((s) => s.findDuplicatesByEmail);
  const addNote = useParticipantStore((s) => s.addNote);

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

  const validateBirthDate = (dobDate: Date): boolean => {
    const year = dobDate.getFullYear();
    return year <= 2007;
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

  const toggleCriticalNeed = (option: string) => {
    if (criticalNeeds.includes(option)) {
      setCriticalNeeds(criticalNeeds.filter((item) => item !== option));
    } else {
      setCriticalNeeds([...criticalNeeds, option]);
    }
  };

  const handlePhoneBlur = () => {
    if (phoneNumber && phoneNumber.trim()) {
      const duplicates = findDuplicatesByPhone(phoneNumber);
      if (duplicates.length > 0) {
        setDuplicateParticipants(duplicates);
        setDuplicateType("phone");
        setShowDuplicateModal(true);
      }
    }
  };

  const handleEmailBlur = () => {
    if (email && email.trim()) {
      const duplicates = findDuplicatesByEmail(email);
      if (duplicates.length > 0) {
        setDuplicateParticipants(duplicates);
        setDuplicateType("email");
        setShowDuplicateModal(true);
      }
    }
  };

  const handleConnectToExisting = async () => {
    if (duplicateParticipants.length === 0) return;

    const existingParticipant = duplicateParticipants[0];

    setShowDuplicateModal(false);

    try {
      // Create note content with the new information provided
      let noteContent = "📝 Additional Contact Information Submitted\n\n";
      if (firstName || lastName) {
        noteContent += `Name provided: ${firstName} ${lastName}\n`;
      }
      if (nickname) {
        noteContent += `Nickname: ${nickname}\n`;
      }
      if (participantNumber && !tdcjNotAvailable) {
        noteContent += `TDCJ Number: ${participantNumber}\n`;
      }
      if (phoneNumber) noteContent += `Phone: ${phoneNumber}\n`;
      if (email) noteContent += `Email: ${email}\n`;
      if (address) noteContent += `Address: ${address}\n`;
      if (dateOfBirth && !dobNotAvailable) noteContent += `DOB: ${dateOfBirth}\n`;
      if (gender) noteContent += `Gender: ${gender}\n`;
      if (releaseDate) noteContent += `Release Date: ${releaseDate}\n`;
      if (releasedFrom) {
        const finalLocation = releasedFrom === "Other" ? otherReleaseLocation : releasedFrom;
        noteContent += `Released From: ${finalLocation}\n`;
      }
      if (legalStatus.length > 0) {
        noteContent += `\nLegal Status:\n${legalStatus.map(s => `- ${s}`).join("\n")}`;
      }
      if (referralSource) {
        const finalReferral = referralSource === "Other" ? otherReferralSource : referralSource;
        noteContent += `\nHow they heard about 7more: ${finalReferral}`;
      }
      if (criticalNeeds.length > 0) {
        noteContent += `\n\nCritical Needs:\n${criticalNeeds.map(n => `- ${n}`).join("\n")}`;
      }

      // Add note to existing participant
      await addNote(
        existingParticipant.id,
        noteContent,
        "system",
        "Manual Entry"
      );

      // Navigate directly back after successful connection
      // Don't show success modal as it conflicts with the duplicate modal
      navigation.goBack();
    } catch (err) {
      // Use 'err' instead of 'error' to avoid serialization issues
      const errorMsg = err instanceof Error ? err.message : "Failed to connect entry. Please try again.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    }
  };

  const handleSubmit = async () => {
    // Determine final release location value
    const finalReleaseLocation = releasedFrom === "Other" ? otherReleaseLocation : releasedFrom;

    // Use "Not Available" if TDCJ toggle is enabled
    const finalParticipantNumber = tdcjNotAvailable ? "Not Available" : participantNumber;

    // Use "Not Available" if DOB toggle is enabled
    const finalDateOfBirth = dobNotAvailable ? "Not Available" : dateOfBirth;

    // Validation
    if ((!tdcjNotAvailable && !participantNumber) || !firstName || !lastName || !gender || !releasedFrom || (!dobNotAvailable && !dateOfBirth) || !releaseDate) {
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

    // If "Other" is selected for referral, validate that they entered a custom source
    if (referralSource === "Other" && !otherReferralSource.trim()) {
      setErrorMessage("Please specify how the participant heard about 7more.");
      setShowErrorModal(true);
      return;
    }

    // Validate date formats only if DOB is not marked as "Not Available"
    let dobDate: Date | null = null;
    if (!dobNotAvailable) {
      dobDate = parseDate(dateOfBirth);
      if (!dobDate) {
        setErrorMessage("Please enter a valid date of birth in MM/DD/YYYY format.");
        setShowErrorModal(true);
        return;
      }

      // Validate birthdate is 2007 or earlier
      if (!validateBirthDate(dobDate)) {
        setErrorMessage("Participant must be born in 2007 or earlier. If the birthdate is not available, please use the 'Birthdate not currently available' option.");
        setShowErrorModal(true);
        return;
      }
    }

    const relDate = parseDate(releaseDate);

    if (!relDate) {
      setErrorMessage("Please enter a valid release date in MM/DD/YYYY format.");
      setShowErrorModal(true);
      return;
    }

    const age = dobDate ? calculateAge(dobDate) : 0;
    const timeOut = calculateTimeOut(relDate);

    console.log("📝 Manual intake form submitting:", {
      participantNumber: finalParticipantNumber,
      firstName,
      lastName,
      nickname,
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
        dateOfBirth: dobDate ? dobDate.toISOString() : "Not Available",
        age,
        gender,
        ...(phoneNumber ? { phoneNumber } : {}),
        ...(email ? { email } : {}),
        releaseDate: relDate.toISOString(),
        timeOut,
        releasedFrom: finalReleaseLocation,
        ...(nickname ? { nickname } : {}),
        ...(address ? { address } : {}),
        ...(referralSource ? { referralSource } : {}),
        ...(otherReferralSource ? { otherReferralSource } : {}),
        ...(criticalNeeds.length > 0 ? { criticalNeeds } : {}),
        ...(legalStatus.length > 0 ? { legalStatus } : {}),
        status: "pending_bridge" as ParticipantStatus,
        completedGraduationSteps: [],
        intakeType: intakeType as any,
      });

      console.log("✅ Participant added successfully via form");

      // Show success modal for all intake types (no automatic navigation)
      setShowSuccessModal(true);
    } catch (error) {
      console.error("❌ Error adding participant:", error);
      setErrorMessage(`Failed to add participant: ${error}`);
      setShowErrorModal(true);
    }
  };

  // Handler for Live Call Intake - Complete Contact Form Now
  const handleCompleteContactFormNow = async () => {
    await handleSubmit();
    // After submission, wait for Firebase sync and navigate
    setTimeout(() => {
      const participants = useParticipantStore.getState().participants;
      const justAdded = participants.find(
        p => p.participantNumber === (tdcjNotAvailable ? "Not Available" : participantNumber) &&
        p.firstName === firstName &&
        p.lastName === lastName
      );

      if (justAdded) {
        navigation.replace("BridgeTeamFollowUpForm", {
          participantId: justAdded.id,
          fromLiveCallIntake: true
        });
      }
    }, 1000);
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

          {/* Nickname */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Nickname <Text className="text-gray-400 text-xs">(Optional)</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Enter nickname"
              value={nickname}
              onChangeText={setNickname}
            />
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
              onChangeText={setPhoneNumber}
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
              onChangeText={setEmail}
              onBlur={handleEmailBlur}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Full Address */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Full Address <Text className="text-gray-400 text-xs">(Optional)</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Street address, City, State, ZIP"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
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

          {/* Date of Birth */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Date of Birth <Text className="text-red-500">*</Text>
            </Text>
            {!dobNotAvailable ? (
              <>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                  placeholder="MM/DD/YYYY"
                  value={dateOfBirth}
                  onChangeText={(text) => handleDateInput(text, setDateOfBirth)}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <Text className="text-xs text-gray-500 mt-1 mb-2">
                  Must be born in 2007 or earlier
                </Text>
                <Pressable
                  onPress={() => {
                    setDobNotAvailable(true);
                    setDateOfBirth("");
                  }}
                  className="mt-1 bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 active:opacity-70"
                >
                  <Text className="text-gray-700 text-sm font-medium text-center">
                    Birthdate Not Currently Available
                  </Text>
                </Pressable>
              </>
            ) : (
              <View className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-amber-800 text-sm font-medium">
                    Date of Birth: Not Available
                  </Text>
                  <Pressable
                    onPress={() => setDobNotAvailable(false)}
                    className="active:opacity-70"
                  >
                    <Ionicons name="close-circle" size={24} color="#92400e" />
                  </Pressable>
                </View>
              </View>
            )}
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
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Which of the following apply to this participant?
            </Text>
            <Text className="text-xs text-gray-500 mb-3">
              (Select all that apply)
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

          {/* How did they hear about 7more */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              How did the participant hear about 7more?
            </Text>
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setShowReferralSourceModal(true);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 flex-row items-center justify-between"
            >
              <Text className={`text-base ${referralSource ? "text-gray-900" : "text-gray-400"}`}>
                {referralSource || "Select referral source"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Other Referral Source - Conditional */}
          {referralSource === "Other" && (
            <View className="mb-8">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Please Specify <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                placeholder="Enter how they heard about 7more"
                value={otherReferralSource}
                onChangeText={setOtherReferralSource}
              />
            </View>
          )}

          {/* Critical Needs */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              What are the critical needs?
            </Text>
            <Text className="text-xs text-gray-500 mb-3">
              (Select all that apply)
            </Text>
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setShowCriticalNeedsModal(true);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 flex-row items-center justify-between"
            >
              <Text className={`text-base ${criticalNeeds.length > 0 ? "text-gray-900" : "text-gray-400"}`}>
                {criticalNeeds.length > 0
                  ? `${criticalNeeds.length} selected`
                  : "Select critical needs"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Submit Buttons - Conditional based on intake type */}
          {intakeType === "live_call_intake" ? (
            <>
              {/* Live Call Intake: Two button choices */}
              <Pressable
                onPress={handleCompleteContactFormNow}
                className="bg-green-600 rounded-xl py-4 px-4 items-center mb-3 active:opacity-80"
              >
                <View className="flex-row items-center">
                  <Ionicons name="document-text" size={20} color="white" />
                  <Text className="text-white text-base font-bold ml-2">
                    Complete Contact Form Now
                  </Text>
                </View>
                <Text className="text-white text-xs mt-1 opacity-90">
                  Continue with follow-up and move to mentorship
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit}
                className="bg-gray-600 rounded-xl py-4 px-4 items-center mb-4 active:opacity-80"
              >
                <View className="flex-row items-center">
                  <Ionicons name="time" size={20} color="white" />
                  <Text className="text-white text-base font-bold ml-2">
                    Add to Pending Bridge Team
                  </Text>
                </View>
                <Text className="text-white text-xs mt-1 opacity-90">
                  Complete follow-up later
                </Text>
              </Pressable>
            </>
          ) : (
            /* Regular intake: Single submit button */
            <Pressable
              onPress={handleSubmit}
              className="bg-gray-600 rounded-xl py-4 items-center mb-4 active:opacity-80"
            >
              <Text className="text-white text-base font-bold">Add Participant</Text>
            </Pressable>
          )}

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
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">
                  Which of the following apply to this participant?
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  (Select all that apply)
                </Text>
              </View>
              <Pressable
                onPress={() => setShowLegalStatusModal(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

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

      {/* Referral Source Modal */}
      <Modal
        visible={showReferralSourceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReferralSourceModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">How did they hear about 7more?</Text>
              <Pressable
                onPress={() => setShowReferralSourceModal(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <ScrollView className="mb-4">
              {REFERRAL_SOURCE_OPTIONS.map((option) => {
                const isSelected = referralSource === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setReferralSource(option);
                      if (option !== "Other") {
                        setOtherReferralSource(""); // Clear other field if not selecting "Other"
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
              onPress={() => setShowReferralSourceModal(false)}
              className="bg-gray-600 rounded-xl py-4 items-center active:opacity-80"
            >
              <Text className="text-white text-base font-bold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Critical Needs Modal */}
      <Modal
        visible={showCriticalNeedsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCriticalNeedsModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">
                  What are the critical needs?
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  (Select all that apply)
                </Text>
              </View>
              <Pressable
                onPress={() => setShowCriticalNeedsModal(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <ScrollView className="mb-4">
              {CRITICAL_NEEDS_OPTIONS.map((option) => {
                const isSelected = criticalNeeds.includes(option);
                return (
                  <Pressable
                    key={option}
                    onPress={() => toggleCriticalNeed(option)}
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
              onPress={() => setShowCriticalNeedsModal(false)}
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
              <View className="w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="warning" size={40} color="#D97706" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Duplicate {duplicateType === "phone" ? "Phone Number" : "Email"}</Text>
              <Text className="text-center text-gray-600 mb-3">
                This {duplicateType === "phone" ? "phone number" : "email"} is already registered to:
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
                Do you want to tag this entry to the existing participant?
              </Text>
            </View>
            <View className="gap-3">
              <Pressable
                onPress={handleConnectToExisting}
                className="bg-amber-600 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white font-semibold">Connect to Existing Participant</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowDuplicateModal(false)}
                className="bg-gray-200 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-gray-700 font-semibold">Create New Entry</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
