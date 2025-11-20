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
  Linking,
  Alert,
} from "react-native";
import { useParticipantStore } from "../state/participantStore";
import { useAllResources } from "../state/resourceStore";
import { useTransitionalHomeStore } from "../state/transitionalHomeStore";
import { useCurrentUser } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";
import { BridgeTeamFollowUpFormData, TransitionalHome } from "../types";
import { sendResourcesEmail } from "../services/emailService";
import { sendAircallSMS } from "../api/aircall-sms";
import { sendBridgeTeamResourcesEmail } from "../api/resend-email";

// Constants from intake form
const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

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

const LEGAL_STATUS_OPTIONS = [
  "The participant is on parole",
  "The participant is on probation",
  "The participant is on an ankle monitor",
  "The participant has an SA conviction",
  "The participant has an SA–Minor conviction",
  "The participant has barriers that prevent them from working right now",
  "None of these apply",
];

export default function BridgeTeamFollowUpFormScreen({ route, navigation }: any) {
  const { participantId, fromLiveCallIntake } = route.params;
  const currentUser = useCurrentUser();
  const participant = useParticipantStore((s) => s.getParticipantById(participantId));
  const recordBridgeFollowUp = useParticipantStore((s) => s.recordBridgeFollowUp);
  const allResources = useAllResources();
  const allTransitionalHomes = useTransitionalHomeStore((s) => s.transitionalHomes);

  // Memoize filtered transitional homes to prevent re-renders
  const transitionalHomes = React.useMemo(
    () => allTransitionalHomes.filter((h: TransitionalHome) => h.isActive),
    [allTransitionalHomes]
  );

  // Section 1 - Participant Information Confirmation
  const [participantInfoConfirmed, setParticipantInfoConfirmed] = useState(false);
  const [firstName, setFirstName] = useState(participant?.firstName || "");
  const [lastName, setLastName] = useState(participant?.lastName || "");
  const [participantNumber, setParticipantNumber] = useState(participant?.participantNumber || "");

  // Format dates for display (convert from ISO to MM/DD/YYYY)
  const formatDateForDisplay = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const [dateOfBirth, setDateOfBirth] = useState(formatDateForDisplay(participant?.dateOfBirth || ""));
  const [gender, setGender] = useState(participant?.gender || "");
  const [phoneNumber, setPhoneNumber] = useState(participant?.phoneNumber || "");
  const [email, setEmail] = useState(participant?.email || "");
  const [releaseDate, setReleaseDate] = useState(formatDateForDisplay(participant?.releaseDate || ""));
  const [releasedFrom, setReleasedFrom] = useState(participant?.releasedFrom || "");
  const [otherReleaseLocation, setOtherReleaseLocation] = useState("");

  // Modals for Section 1
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showReleaseLocationModal, setShowReleaseLocationModal] = useState(false);

  // Section 2 - Confirm Previous Answers (from intake form)
  const [referralSource, setReferralSource] = useState(participant?.referralSource || "");
  const [otherReferralSource, setOtherReferralSource] = useState(participant?.otherReferralSource || "");
  const [criticalNeeds, setCriticalNeeds] = useState<string[]>(participant?.criticalNeeds || []);
  const [legalStatus, setLegalStatus] = useState<string[]>(participant?.legalStatus || []);

  // Modals for Section 2
  const [showReferralSourceModal, setShowReferralSourceModal] = useState(false);
  const [showCriticalNeedsModal, setShowCriticalNeedsModal] = useState(false);
  const [showLegalStatusModal, setShowLegalStatusModal] = useState(false);

  // Section 2 confirmation
  const [previousAnswersConfirmed, setPreviousAnswersConfirmed] = useState(false);

  // Section 3 - Communication Confirmation
  const [weeklyCallExplained, setWeeklyCallExplained] = useState(false);

  // Section 4 - Resources Sent
  const [resourcesSent, setResourcesSent] = useState(false);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [resourcesOtherDescription, setResourcesOtherDescription] = useState("");
  const [resourceNotes, setResourceNotes] = useState("");
  const [noResourcesReason, setNoResourcesReason] = useState("");
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showResourcePreviewModal, setShowResourcePreviewModal] = useState(false);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  if (!participant || !currentUser) {
    return null;
  }

  // Date input handler with auto-formatting (from intake form)
  const handleDateInput = (text: string, setter: (val: string) => void) => {
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

  // Parse MM/DD/YYYY to ISO date string
  const parseDate = (dateStr: string): string | null => {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;

    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    const date = new Date(year, month - 1, day);
    return date.toISOString();
  };

  const toggleResource = (resourceId: string) => {
    if (selectedResources.includes(resourceId)) {
      setSelectedResources(selectedResources.filter((id) => id !== resourceId));
    } else {
      setSelectedResources([...selectedResources, resourceId]);
    }
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

  // Generate resource text for email/SMS/copy
  const generateResourceText = () => {
    const resourcesToSend = allResources.filter((r) => selectedResources.includes(r.id));
    let text = `Hello ${participant.firstName},\n\nHere are some resources that may help you:\n\n`;

    resourcesToSend.forEach((resource, index) => {
      text += `${index + 1}. ${resource.title}\n`;
      text += `${resource.content}\n\n`;
    });

    if (resourcesOtherDescription) {
      text += `Additional Resource:\n${resourcesOtherDescription}\n\n`;
    }

    text += "If you have any questions, please reach out to us.\n\nBest regards,\n7more Team";
    return text;
  };

  const handleSubmit = async () => {
    // Validation
    if (!participantInfoConfirmed) {
      alert("Please confirm participant information is accurate before submitting.");
      return;
    }

    if (resourcesSent && selectedResources.length === 0 && !resourcesOtherDescription.trim()) {
      alert("Please select at least one resource or describe other resources sent.");
      return;
    }

    if (!resourcesSent && !noResourcesReason.trim()) {
      alert("Please explain why no resources were sent.");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, update participant profile with any edited information
      if (participant) {
        const participantRef = await import("../config/firebase").then((m) => m.database);
        const { ref: firebaseRef, update: firebaseUpdate } = await import("firebase/database");

        if (participantRef) {
          const updates: any = {};

          // Determine final release location
          const finalReleaseLocation = releasedFrom === "Other" ? otherReleaseLocation : releasedFrom;

          // Parse dates to ISO format
          const dobISO = parseDate(dateOfBirth);
          const relDateISO = parseDate(releaseDate);

          // Only update fields that have changed
          if (firstName !== participant.firstName) updates.firstName = firstName;
          if (lastName !== participant.lastName) updates.lastName = lastName;
          if (participantNumber !== participant.participantNumber) updates.participantNumber = participantNumber;
          if (dobISO && dobISO !== participant.dateOfBirth) updates.dateOfBirth = dobISO;
          if (gender !== participant.gender) updates.gender = gender;
          if (phoneNumber !== participant.phoneNumber) updates.phoneNumber = phoneNumber || null;
          if (email !== participant.email) updates.email = email || null;
          if (relDateISO && relDateISO !== participant.releaseDate) updates.releaseDate = relDateISO;
          if (finalReleaseLocation !== participant.releasedFrom) updates.releasedFrom = finalReleaseLocation;

          // If any fields changed, update them
          if (Object.keys(updates).length > 0) {
            const participantRefPath = firebaseRef(participantRef, `participants/${participant.id}`);
            await firebaseUpdate(participantRefPath, updates);
          }
        }
      }

      // Prepare form data
      const formData: BridgeTeamFollowUpFormData = {
        participantId: participant.id,
        participantInfoConfirmed,
        onParole: false,
        onProbation: false,
        onSexOffenderRegistry: false,
        onChildOffenderRegistry: false,
        otherLegalRestrictions: "",
        needsPhoneCall: false,
        needsEmployment: false,
        needsHousing: false,
        needsClothing: false,
        needsFood: false,
        currentHousingSituation: "",
        currentHousingOther: "",
        transitionalHomeName: "",
        transitionalHomeNameOther: "",
        weeklyCallExplained,
        resourcesSent,
        resourcesSentList: selectedResources,
        resourcesOtherDescription,
        resourceNotes,
        sendResourcesEmail: false, // No longer auto-sending, email is sent manually via button
      };

      // Save form data
      await recordBridgeFollowUp(formData, currentUser.id, currentUser.name);

      // For Live Call Intake, mark as contacted (not moved to mentorship automatically)
      // For regular flow, move to mentorship queue
      const updateParticipantStatus = useParticipantStore.getState().updateParticipantStatus;

      if (fromLiveCallIntake) {
        // Live Call Intake: Mark as contacted, leave "To Mentorship" button available
        await updateParticipantStatus(
          participant.id,
          "bridge_contacted",
          currentUser.id,
          currentUser.name,
          "Live Call Intake completed - participant contacted and follow-up documented"
        );
        alert("Live Call Intake completed successfully! Participant marked as contacted.");
      } else {
        // Regular flow: Move directly to mentorship queue
        await updateParticipantStatus(
          participant.id,
          "pending_mentor",
          currentUser.id,
          currentUser.name,
          "Bridge Team Follow-Up Form completed - moved to mentorship assignment queue"
        );
        alert("Bridge Team Follow-Up Form submitted successfully! Participant moved to mentorship queue.");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get resource categories for display
  const resourceCategories = [...new Set(allResources.map((r) => r.category))];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="bg-slate-700 pt-16 pb-6 px-6">
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-2xl font-bold text-white mb-2">Bridge Team Follow-Up Form</Text>
          <Text className="text-white opacity-90 text-base">
            {participant.firstName} {participant.lastName} • #{participant.participantNumber}
          </Text>
        </View>

        <View className="px-6 pt-6">
          {/* SECTION 1 - Participant Information Confirmation */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-1">Section 1: Participant Information</Text>
            <Text className="text-sm text-gray-600 mb-4">
              Review and edit participant information as needed
            </Text>

            {/* Editable participant info */}
            <View className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
              <View className="mb-3">
                <Text className="text-xs text-gray-500 mb-1">First Name</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                />
              </View>

              <View className="mb-3">
                <Text className="text-xs text-gray-500 mb-1">Last Name</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                />
              </View>

              <View className="mb-3">
                <Text className="text-xs text-gray-500 mb-1">Participant Number</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900"
                  value={participantNumber}
                  onChangeText={setParticipantNumber}
                  placeholder="Participant number"
                />
              </View>

              <View className="mb-3">
                <Text className="text-xs text-gray-500 mb-1">Date of Birth</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900"
                  value={dateOfBirth}
                  onChangeText={(text) => handleDateInput(text, setDateOfBirth)}
                  placeholder="MM/DD/YYYY"
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-3">
                <Text className="text-xs text-gray-500 mb-1">Gender</Text>
                <Pressable
                  onPress={() => setShowGenderModal(true)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-base ${gender ? "text-gray-900" : "text-gray-400"}`}>
                      {gender || "Select gender"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </Pressable>
              </View>

              <View className="mb-3">
                <Text className="text-xs text-gray-500 mb-1">Phone Number (Optional)</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View className="mb-3">
                <Text className="text-xs text-gray-500 mb-1">Email Address (Optional)</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-3">
                <Text className="text-xs text-gray-500 mb-1">Release Date</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900"
                  value={releaseDate}
                  onChangeText={(text) => handleDateInput(text, setReleaseDate)}
                  placeholder="MM/DD/YYYY"
                  keyboardType="numeric"
                />
              </View>

              <View className={releasedFrom === "Other" ? "mb-3" : ""}>
                <Text className="text-xs text-gray-500 mb-1">Released From</Text>
                <Pressable
                  onPress={() => setShowReleaseLocationModal(true)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-base ${releasedFrom ? "text-gray-900" : "text-gray-400"}`}>
                      {releasedFrom || "Select facility"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </Pressable>
              </View>

              {releasedFrom === "Other" && (
                <View>
                  <Text className="text-xs text-gray-500 mb-1">Specify Other Location</Text>
                  <TextInput
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900"
                    value={otherReleaseLocation}
                    onChangeText={setOtherReleaseLocation}
                    placeholder="Enter facility name"
                  />
                </View>
              )}
            </View>

            {/* Confirmation button */}
            <View className="gap-3">
              <Pressable
                onPress={() => setParticipantInfoConfirmed(true)}
                className={`border-2 rounded-xl py-4 px-4 ${
                  participantInfoConfirmed
                    ? "bg-green-50 border-green-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={participantInfoConfirmed ? "#16A34A" : "#9CA3AF"}
                  />
                  <Text
                    className={`text-base font-semibold ml-3 ${
                      participantInfoConfirmed ? "text-green-900" : "text-gray-900"
                    }`}
                  >
                    Confirm all information is accurate
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* SECTION 2 - Confirm Previous Answers (from intake form) */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-1">Section 2: Confirm Previous Answers</Text>
            <Text className="text-sm text-gray-600 mb-4">
              Review and edit answers from the intake form as needed
            </Text>

            <View className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
              {/* Which of the following apply to this participant */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Which of the following apply to this participant?
                </Text>
                <Text className="text-xs text-gray-500 mb-3">
                  (Select all that apply)
                </Text>
                <Pressable
                  onPress={() => setShowLegalStatusModal(true)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-base ${legalStatus.length > 0 ? "text-gray-900" : "text-gray-400"}`}>
                      {legalStatus.length > 0
                        ? `${legalStatus.length} selected`
                        : "None selected"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </Pressable>
                {legalStatus.length > 0 && (
                  <View className="mt-2 ml-4">
                    {legalStatus.map((status) => (
                      <Text key={status} className="text-sm text-gray-700 mb-1">• {status}</Text>
                    ))}
                  </View>
                )}
              </View>

              {/* How did they hear about 7more */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  How did the participant hear about 7more?
                </Text>
                <Pressable
                  onPress={() => setShowReferralSourceModal(true)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-base ${referralSource ? "text-gray-900" : "text-gray-400"}`}>
                      {referralSource || "Not specified"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </Pressable>

                {/* Other Referral Source - Conditional */}
                {referralSource === "Other" && (
                  <View className="mt-3">
                    <Text className="text-xs text-gray-500 mb-2">Please Specify</Text>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                      value={otherReferralSource}
                      onChangeText={setOtherReferralSource}
                      placeholder="Enter how they heard about 7more"
                    />
                  </View>
                )}
              </View>

              {/* Critical Needs */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  What are the critical needs?
                </Text>
                <Text className="text-xs text-gray-500 mb-3">
                  (Select all that apply)
                </Text>
                <Pressable
                  onPress={() => setShowCriticalNeedsModal(true)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-base ${criticalNeeds.length > 0 ? "text-gray-900" : "text-gray-400"}`}>
                      {criticalNeeds.length > 0
                        ? `${criticalNeeds.length} selected`
                        : "None selected"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </Pressable>
                {criticalNeeds.length > 0 && (
                  <View className="mt-2 ml-4">
                    {criticalNeeds.map((need) => (
                      <Text key={need} className="text-sm text-gray-700 mb-1">• {need}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Additional Confirmation for "Which of the following apply" */}
            <View className="gap-3">
              <Pressable
                onPress={() => setPreviousAnswersConfirmed(true)}
                className={`border-2 rounded-xl py-4 px-4 ${
                  previousAnswersConfirmed
                    ? "bg-green-50 border-green-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={previousAnswersConfirmed ? "#16A34A" : "#9CA3AF"}
                  />
                  <Text
                    className={`text-base font-semibold ml-3 ${
                      previousAnswersConfirmed ? "text-green-900" : "text-gray-900"
                    }`}
                  >
                    Confirm &ldquo;Which of the following apply to this participant&rdquo; is accurate
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* SECTION 3 - Communication Confirmation */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-1">Section 3: Communication Confirmation</Text>
            <Text className="text-sm text-gray-600 mb-4">
              Confirm participant expectations for follow-up
            </Text>

            <Pressable
              onPress={() => setWeeklyCallExplained(!weeklyCallExplained)}
              className="flex-row items-start"
            >
              <View
                className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                  weeklyCallExplained ? "bg-slate-700 border-slate-700" : "bg-white border-gray-300"
                }`}
              >
                {weeklyCallExplained && <Ionicons name="checkmark" size={18} color="white" />}
              </View>
              <View className="flex-1">
                <Text className="text-base text-gray-900 font-medium">
                  Did you inform the participant that someone will call them within the week?
                </Text>
              </View>
            </Pressable>
          </View>

          {/* SECTION 4 - Resources Sent */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-1">Section 4: Resources Sent</Text>
            <Text className="text-sm text-gray-600 mb-4">
              Track resources shared with the participant
            </Text>

            {/* Resources sent toggle */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-3">Did you send any resources today?</Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setResourcesSent(true)}
                  className={`flex-1 border-2 rounded-xl py-3 px-4 ${
                    resourcesSent ? "bg-green-50 border-green-600" : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-center text-base font-semibold ${
                      resourcesSent ? "text-green-900" : "text-gray-900"
                    }`}
                  >
                    Yes
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setResourcesSent(false);
                    setSelectedResources([]);
                    setResourcesOtherDescription("");
                    setResourceNotes("");
                  }}
                  className={`flex-1 border-2 rounded-xl py-3 px-4 ${
                    !resourcesSent ? "bg-gray-100 border-gray-300" : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-center text-base font-semibold ${
                      !resourcesSent ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    No
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* No resources reason - conditional */}
            {!resourcesSent && (
              <View className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mt-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Why were no resources sent? <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Explain why no resources were sent..."
                  value={noResourcesReason}
                  onChangeText={setNoResourcesReason}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            )}

            {/* Resources details - conditional */}
            {resourcesSent && (
              <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                {/* Resource selection */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Select Resources Sent</Text>
                  <Pressable
                    onPress={() => setShowResourcesModal(true)}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className={`text-base ${selectedResources.length > 0 ? "text-gray-900" : "text-gray-400"}`}>
                        {selectedResources.length > 0
                          ? `${selectedResources.length} resource${selectedResources.length !== 1 ? "s" : ""} selected`
                          : "Select resources..."}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6B7280" />
                    </View>
                  </Pressable>

                  {/* Show selected resources */}
                  {selectedResources.length > 0 && (
                    <View className="mt-3 gap-2">
                      {selectedResources.map((resourceId) => {
                        const resource = allResources.find((r) => r.id === resourceId);
                        if (!resource) return null;
                        return (
                          <View key={resourceId} className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                            <View className="flex-row items-center justify-between">
                              <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-900">{resource.title}</Text>
                                <Text className="text-xs text-gray-600">{resource.category}</Text>
                              </View>
                              <Pressable onPress={() => toggleResource(resourceId)}>
                                <Ionicons name="close-circle" size={20} color="#CA8A04" />
                              </Pressable>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Communication Options - Show when resources are selected */}
                {selectedResources.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-3">Send Resources to Participant</Text>
                    <View className="flex-row gap-3 flex-wrap">
                      <Pressable
                        onPress={async () => {
                          // Validate email exists
                          if (!email || email.trim() === "") {
                            Alert.alert(
                              "No Email Address",
                              "Please add an email address for this participant in Section 1 before sending resources via email.",
                              [{ text: "OK" }]
                            );
                            return;
                          }

                          // Validate at least one resource is selected
                          if (selectedResources.length === 0) {
                            Alert.alert(
                              "No Resources Selected",
                              "Please select at least one resource to send.",
                              [{ text: "OK" }]
                            );
                            return;
                          }

                          setIsSendingEmail(true);
                          try {
                            // Prepare resources to send
                            const resourcesToSend = allResources
                              .filter((r) => selectedResources.includes(r.id))
                              .map((r) => ({
                                title: r.title,
                                description: r.content,
                              }));

                            // Send email using Resend
                            const result = await sendBridgeTeamResourcesEmail({
                              participantEmail: email,
                              participantName: participant.firstName,
                              resources: resourcesToSend,
                              notes: resourceNotes || undefined,
                              senderName: currentUser?.name || "Bridge Team",
                            });

                            if (result.success) {
                              // Log the email send to participant history
                              try {
                                const { addHistoryEntry } = useParticipantStore.getState();
                                await addHistoryEntry(participant.id, {
                                  type: "form_submitted",
                                  description: "Resources emailed to participant",
                                  createdBy: currentUser.id,
                                  createdByName: currentUser.name,
                                  metadata: {
                                    participantId: participant.id,
                                    participantEmail: email,
                                    resourcesSent: resourcesToSend.map(r => r.title),
                                    sentBy: currentUser.id,
                                    sentByName: currentUser.name,
                                    sentVia: "email",
                                    sentAt: new Date().toISOString(),
                                    notes: resourceNotes,
                                    messageId: result.messageId,
                                  },
                                });
                              } catch (logError) {
                                console.error("Failed to log email send:", logError);
                              }

                              Alert.alert(
                                "Success",
                                `Resources emailed to ${email} from bridgeteam@7more.net.`,
                                [{ text: "OK" }]
                              );
                            } else {
                              Alert.alert(
                                "Email Error",
                                result.error || "Could not send email. Please ensure RESEND_API_KEY is configured in ENV tab."
                              );
                            }
                          } catch (error) {
                            console.error("Error sending email:", error);
                            Alert.alert(
                              "Error",
                              "An unexpected error occurred while sending the email. Please try again."
                            );
                          } finally {
                            setIsSendingEmail(false);
                          }
                        }}
                        disabled={isSendingEmail}
                        className={`flex-1 rounded-xl py-3 items-center active:opacity-80 ${isSendingEmail ? "bg-blue-400" : "bg-blue-600"}`}
                      >
                        {isSendingEmail ? (
                          <View className="flex-row items-center">
                            <Text className="text-white text-sm font-semibold">Sending...</Text>
                          </View>
                        ) : (
                          <View className="flex-row items-center">
                            <Ionicons name="mail" size={18} color="white" />
                            <Text className="text-white text-sm font-semibold ml-2">Email</Text>
                          </View>
                        )}
                      </Pressable>

                      {phoneNumber && phoneNumber.trim() !== "" && (
                        <Pressable
                          onPress={async () => {
                            setIsSendingSMS(true);
                            try {
                              // Send SMS via Aircall API
                              const text = generateResourceText();
                              const result = await sendAircallSMS(phoneNumber, text);

                              if (result.success) {
                                Alert.alert("Success", "Resources sent via SMS successfully!");
                              } else {
                                Alert.alert(
                                  "SMS Error",
                                  result.error || "Could not send SMS. Please check your Aircall configuration."
                                );
                              }
                            } finally {
                              setIsSendingSMS(false);
                            }
                          }}
                          disabled={isSendingSMS}
                          className={`flex-1 rounded-xl py-3 items-center active:opacity-80 ${isSendingSMS ? "bg-green-400" : "bg-green-600"}`}
                        >
                          {isSendingSMS ? (
                            <View className="flex-row items-center">
                              <Text className="text-white text-sm font-semibold">Sending...</Text>
                            </View>
                          ) : (
                            <View className="flex-row items-center">
                              <Ionicons name="chatbubble" size={18} color="white" />
                              <Text className="text-white text-sm font-semibold ml-2">SMS</Text>
                            </View>
                          )}
                        </Pressable>
                      )}

                      <Pressable
                        onPress={() => {
                          // Show preview modal with copy option
                          setShowResourcePreviewModal(true);
                        }}
                        className="flex-1 bg-gray-700 rounded-xl py-3 items-center active:opacity-80"
                      >
                        <View className="flex-row items-center">
                          <Ionicons name="copy" size={18} color="white" />
                          <Text className="text-white text-sm font-semibold ml-2">Copy Text</Text>
                        </View>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Other resource description */}
                {selectedResources.includes("other") && (
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Other Resource Description</Text>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="Describe other resources sent..."
                      value={resourcesOtherDescription}
                      onChangeText={setResourcesOtherDescription}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                )}

                {/* Resource notes */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Notes (why these resources were sent / additional context)
                  </Text>
                  <TextInput
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Add context about why these resources were shared..."
                    value={resourceNotes}
                    onChangeText={setResourceNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting || !participantInfoConfirmed}
            className={`rounded-xl py-4 items-center mb-3 ${
              isSubmitting || !participantInfoConfirmed ? "bg-gray-300" : "bg-yellow-600 active:opacity-80"
            }`}
          >
            <Text className="text-white text-base font-bold">
              {isSubmitting ? "Submitting..." : "Submit Follow-Up Form"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-gray-100 rounded-xl py-3 items-center active:opacity-80"
          >
            <Text className="text-gray-700 text-sm font-semibold">Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Resources Selection Modal */}
      <Modal
        visible={showResourcesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResourcesModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 mx-6 w-80 max-h-96">
            <Text className="text-lg font-bold text-gray-900 mb-4">Select Resources</Text>
            <ScrollView>
              {resourceCategories.map((category) => {
                const categoryResources = allResources.filter((r) => r.category === category);
                return (
                  <View key={category} className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">{category}</Text>
                    {categoryResources.map((resource) => (
                      <Pressable
                        key={resource.id}
                        onPress={() => toggleResource(resource.id)}
                        className="flex-row items-center mb-3"
                      >
                        <View
                          className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                            selectedResources.includes(resource.id)
                              ? "bg-yellow-600 border-yellow-600"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {selectedResources.includes(resource.id) && (
                            <Ionicons name="checkmark" size={18} color="white" />
                          )}
                        </View>
                        <Text className="text-base text-gray-900 flex-1">{resource.title}</Text>
                      </Pressable>
                    ))}
                  </View>
                );
              })}

              {/* Other resource option */}
              <View className="mb-2">
                <Pressable
                  onPress={() => toggleResource("other")}
                  className="flex-row items-center"
                >
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                      selectedResources.includes("other")
                        ? "bg-yellow-600 border-yellow-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {selectedResources.includes("other") && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </View>
                  <Text className="text-base text-gray-900">Other resource</Text>
                </Pressable>
              </View>
            </ScrollView>

            <Pressable
              onPress={() => setShowResourcesModal(false)}
              className="bg-yellow-600 rounded-xl py-3 items-center mt-4"
            >
              <Text className="text-white font-semibold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Gender Modal */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowGenderModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 mx-6 w-80">
            <Text className="text-lg font-bold text-gray-900 mb-4">Select Gender</Text>
            {GENDER_OPTIONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setGender(option);
                  setShowGenderModal(false);
                }}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  gender === option
                    ? "bg-slate-100 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    gender === option ? "text-slate-900" : "text-gray-900"
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Release Location Modal */}
      <Modal
        visible={showReleaseLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReleaseLocationModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowReleaseLocationModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 mx-6 w-80">
            <Text className="text-lg font-bold text-gray-900 mb-4">Select Release Location</Text>
            {RELEASE_LOCATION_OPTIONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setReleasedFrom(option);
                  if (option !== "Other") {
                    setOtherReleaseLocation("");
                  }
                  setShowReleaseLocationModal(false);
                }}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  releasedFrom === option
                    ? "bg-slate-100 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    releasedFrom === option ? "text-slate-900" : "text-gray-900"
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Referral Source Modal */}
      <Modal
        visible={showReferralSourceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReferralSourceModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowReferralSourceModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 mx-6 w-80">
            <Text className="text-lg font-bold text-gray-900 mb-4">How did they hear about 7more?</Text>
            {REFERRAL_SOURCE_OPTIONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setReferralSource(option);
                  if (option !== "Other") {
                    setOtherReferralSource("");
                  }
                  setShowReferralSourceModal(false);
                }}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  referralSource === option
                    ? "bg-slate-100 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    referralSource === option ? "text-slate-900" : "text-gray-900"
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Critical Needs Modal */}
      <Modal
        visible={showCriticalNeedsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCriticalNeedsModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowCriticalNeedsModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 mx-6 w-80 max-h-96">
            <Text className="text-lg font-bold text-gray-900 mb-4">Critical Needs</Text>
            <ScrollView>
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
              className="bg-gray-600 rounded-xl py-3 items-center active:opacity-80 mt-4"
            >
              <Text className="text-white text-sm font-semibold">Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Legal Status Modal */}
      <Modal
        visible={showLegalStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLegalStatusModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowLegalStatusModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 mx-6 w-80 max-h-96">
            <Text className="text-lg font-bold text-gray-900 mb-2">Which of the following apply?</Text>
            <Text className="text-sm text-gray-500 mb-4">(Select all that apply)</Text>
            <ScrollView>
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
              className="bg-gray-600 rounded-xl py-3 items-center active:opacity-80 mt-4"
            >
              <Text className="text-white text-sm font-semibold">Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Resource Preview Modal */}
      <Modal
        visible={showResourcePreviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResourcePreviewModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowResourcePreviewModal(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 mx-6 max-w-md w-full max-h-96">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">Resource Preview</Text>
              <Pressable onPress={() => setShowResourcePreviewModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView className="mb-4 max-h-60">
              <Text className="text-sm text-gray-800 leading-6">{generateResourceText()}</Text>
            </ScrollView>

            <View className="gap-3">
              <Pressable
                onPress={async () => {
                  try {
                    // Note: Clipboard functionality temporarily removed due to TypeScript issues
                    // Will need to implement proper clipboard handling
                    alert("Text copied! (Note: Clipboard functionality pending implementation)");
                    setShowResourcePreviewModal(false);
                  } catch (error) {
                    alert("Failed to copy text");
                  }
                }}
                className="bg-gray-700 rounded-xl py-3 items-center active:opacity-80"
              >
                <View className="flex-row items-center">
                  <Ionicons name="copy" size={18} color="white" />
                  <Text className="text-white text-sm font-semibold ml-2">Copy to Clipboard</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowResourcePreviewModal(false);
                }}
                className="bg-gray-200 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-gray-700 text-sm font-semibold">Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
