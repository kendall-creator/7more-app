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

// Constants from intake form
const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const RELEASE_LOCATION_OPTIONS = [
  "Pam Lychner",
  "Huntsville",
  "Plane",
  "Hawaii",
  "Other",
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

  // Section 2 - Mandated Restrictions
  const [onParole, setOnParole] = useState(false);
  const [onProbation, setOnProbation] = useState(false);
  const [onSexOffenderRegistry, setOnSexOffenderRegistry] = useState(false);
  const [onChildOffenderRegistry, setOnChildOffenderRegistry] = useState(false);
  const [noMandatedRestrictions, setNoMandatedRestrictions] = useState(false);
  const [otherLegalRestrictions, setOtherLegalRestrictions] = useState("");

  // Section 3 - Critical Needs
  const [needsPhoneCall, setNeedsPhoneCall] = useState(false);
  const [needsEmployment, setNeedsEmployment] = useState(false);
  const [needsHousing, setNeedsHousing] = useState(false);
  const [needsClothing, setNeedsClothing] = useState(false);
  const [needsFood, setNeedsFood] = useState(false);
  const [needsOther, setNeedsOther] = useState(false);
  const [needsOtherDescription, setNeedsOtherDescription] = useState("");
  const [currentHousingSituation, setCurrentHousingSituation] = useState("");
  const [currentHousingOther, setCurrentHousingOther] = useState("");
  const [transitionalHomeName, setTransitionalHomeName] = useState("");
  const [transitionalHomeNameOther, setTransitionalHomeNameOther] = useState("");
  const [showHousingSituationModal, setShowHousingSituationModal] = useState(false);
  const [showTransitionalHomeModal, setShowTransitionalHomeModal] = useState(false);

  // Section 4 - Communication Confirmation
  const [weeklyCallExplained, setWeeklyCallExplained] = useState(false);

  // Section 5 - Resources Sent
  const [resourcesSent, setResourcesSent] = useState(false);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [resourcesOtherDescription, setResourcesOtherDescription] = useState("");
  const [resourceNotes, setResourceNotes] = useState("");
  const [sendResourcesEmailChecked, setSendResourcesEmailChecked] = useState(false);
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

    if (needsHousing && currentHousingSituation === "Transitional home" && !transitionalHomeName) {
      alert("Please select a transitional home name.");
      return;
    }

    if (resourcesSent && selectedResources.length === 0 && !resourcesOtherDescription.trim()) {
      alert("Please select at least one resource or describe other resources sent.");
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
        onParole,
        onProbation,
        onSexOffenderRegistry,
        onChildOffenderRegistry,
        otherLegalRestrictions,
        needsPhoneCall,
        needsEmployment,
        needsHousing,
        needsClothing,
        needsFood,
        currentHousingSituation,
        currentHousingOther,
        transitionalHomeName,
        transitionalHomeNameOther,
        weeklyCallExplained,
        resourcesSent,
        resourcesSentList: selectedResources,
        resourcesOtherDescription,
        resourceNotes,
        sendResourcesEmail: sendResourcesEmailChecked,
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

          {/* SECTION 2 - Mandated Restrictions */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-1">Section 2: Mandated Restrictions</Text>

            {/* Helper text for Bridge Team */}
            <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#CA8A04" />
                <Text className="text-sm text-yellow-800 ml-2 flex-1">
                  Before asking these questions, remind the participant that we are not here to judge. We
                  simply want to connect them with the best resources and support for their situation.
                </Text>
              </View>
            </View>

            {/* Checkboxes */}
            <View className="gap-4">
              <Pressable
                onPress={() => {
                  setNoMandatedRestrictions(!noMandatedRestrictions);
                  if (!noMandatedRestrictions) {
                    // If checking "no restrictions", uncheck all others
                    setOnParole(false);
                    setOnProbation(false);
                    setOnSexOffenderRegistry(false);
                    setOnChildOffenderRegistry(false);
                  }
                }}
                className="flex-row items-start"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                    noMandatedRestrictions ? "bg-green-600 border-green-600" : "bg-white border-gray-300"
                  }`}
                >
                  {noMandatedRestrictions && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-900 font-medium">No Mandated Restrictions</Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Participant has no legal restrictions
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setOnParole(!onParole);
                  if (!onParole) setNoMandatedRestrictions(false);
                }}
                className="flex-row items-start"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                    onParole ? "bg-slate-700 border-slate-700" : "bg-white border-gray-300"
                  }`}
                >
                  {onParole && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-900 font-medium">On Parole</Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Currently under supervised release after incarceration
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setOnProbation(!onProbation);
                  if (!onProbation) setNoMandatedRestrictions(false);
                }}
                className="flex-row items-start"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                    onProbation ? "bg-slate-700 border-slate-700" : "bg-white border-gray-300"
                  }`}
                >
                  {onProbation && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-900 font-medium">On Probation</Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Serving a sentence within the community under supervision
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setOnSexOffenderRegistry(!onSexOffenderRegistry);
                  if (!onSexOffenderRegistry) setNoMandatedRestrictions(false);
                }}
                className="flex-row items-start"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                    onSexOffenderRegistry ? "bg-slate-700 border-slate-700" : "bg-white border-gray-300"
                  }`}
                >
                  {onSexOffenderRegistry && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-900 font-medium">On Sex Offender Registry (SA)</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setOnChildOffenderRegistry(!onChildOffenderRegistry);
                  if (!onChildOffenderRegistry) setNoMandatedRestrictions(false);
                }}
                className="flex-row items-start"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                    onChildOffenderRegistry ? "bg-slate-700 border-slate-700" : "bg-white border-gray-300"
                  }`}
                >
                  {onChildOffenderRegistry && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-900 font-medium">On Child Offender Registry</Text>
                </View>
              </Pressable>
            </View>

            {/* Other legal restrictions */}
            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Other Legal Restrictions</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                placeholder="Any other legal restrictions or notes..."
                value={otherLegalRestrictions}
                onChangeText={setOtherLegalRestrictions}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* SECTION 3 - Critical Needs */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-1">Section 3: Critical Needs</Text>

            {/* Helper text */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-start">
                <Ionicons name="help-circle" size={20} color="#2563EB" />
                <Text className="text-sm text-blue-800 ml-2 flex-1">
                  Ask the participant what their most urgent needs are so we can help prioritize next steps.
                </Text>
              </View>
            </View>

            {/* Immediate needs checkboxes */}
            <View className="gap-3 mb-4">
              <Pressable
                onPress={() => setNeedsPhoneCall(!needsPhoneCall)}
                className="flex-row items-center"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                    needsPhoneCall ? "bg-slate-700 border-slate-700" : "bg-white border-gray-300"
                  }`}
                >
                  {needsPhoneCall && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <Text className="text-base text-gray-900">Needs help getting a phone</Text>
              </Pressable>

              <Pressable
                onPress={() => setNeedsEmployment(!needsEmployment)}
                className="flex-row items-center"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                    needsEmployment ? "bg-slate-700 border-slate-700" : "bg-white border-gray-300"
                  }`}
                >
                  {needsEmployment && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <Text className="text-base text-gray-900">Employment needed</Text>
              </Pressable>

              <Pressable
                onPress={() => setNeedsHousing(!needsHousing)}
                className="flex-row items-center"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                    needsHousing ? "bg-slate-700 border-slate-700" : "bg-white border-gray-300"
                  }`}
                >
                  {needsHousing && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <Text className="text-base text-gray-900">Housing needed</Text>
              </Pressable>

              <Pressable
                onPress={() => setNeedsClothing(!needsClothing)}
                className="flex-row items-center"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                    needsClothing ? "bg-slate-700 border-slate-700" : "bg-white border-gray-300"
                  }`}
                >
                  {needsClothing && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <Text className="text-base text-gray-900">Clothing needed</Text>
              </Pressable>

              <Pressable
                onPress={() => setNeedsFood(!needsFood)}
                className="flex-row items-center"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                    needsFood ? "bg-slate-700 border-slate-700" : "bg-white border-gray-300"
                  }`}
                >
                  {needsFood && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <Text className="text-base text-gray-900">Food needed</Text>
              </Pressable>

              <Pressable
                onPress={() => setNeedsOther(!needsOther)}
                className="flex-row items-center"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                    needsOther ? "bg-slate-700 border-slate-700" : "bg-white border-gray-300"
                  }`}
                >
                  {needsOther && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <Text className="text-base text-gray-900">Other</Text>
              </Pressable>
            </View>

            {/* Other need description - conditional */}
            {needsOther && (
              <View className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Please specify other need</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Describe other need..."
                  value={needsOtherDescription}
                  onChangeText={setNeedsOtherDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            )}

            {/* Housing details - conditional */}
            {needsHousing && (
              <View className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <Text className="text-sm font-semibold text-gray-700 mb-3">Housing Details</Text>

                {/* Current housing situation */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Current Housing Situation <Text className="text-red-500">*</Text>
                  </Text>
                  <Pressable
                    onPress={() => setShowHousingSituationModal(true)}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className={`text-base ${currentHousingSituation ? "text-gray-900" : "text-gray-400"}`}>
                        {currentHousingSituation || "Select situation..."}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6B7280" />
                    </View>
                  </Pressable>
                </View>

                {/* Other housing situation - conditional */}
                {currentHousingSituation === "Other" && (
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Please specify</Text>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="Describe housing situation..."
                      value={currentHousingOther}
                      onChangeText={setCurrentHousingOther}
                    />
                  </View>
                )}

                {/* Transitional home - conditional */}
                {currentHousingSituation === "Transitional home" && (
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Transitional Home Name <Text className="text-red-500">*</Text>
                    </Text>
                    <Pressable
                      onPress={() => setShowTransitionalHomeModal(true)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className={`text-base ${transitionalHomeName ? "text-gray-900" : "text-gray-400"}`}>
                          {transitionalHomeName || "Select home..."}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#6B7280" />
                      </View>
                    </Pressable>

                    {/* High priority badge if Ben Reid selected */}
                    {transitionalHomeName === "Ben Reid / Southeast Texas Transitional Center" && (
                      <View className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3">
                        <View className="flex-row items-center">
                          <Ionicons name="flag" size={18} color="#DC2626" />
                          <Text className="text-sm text-red-800 font-semibold ml-2">
                            HIGH PRIORITY - Ben Reid Housing
                          </Text>
                        </View>
                        <Text className="text-xs text-red-700 mt-1">
                          This participant will be flagged as high priority for housing assistance.
                        </Text>
                      </View>
                    )}

                    {/* Other transitional home - conditional */}
                    {transitionalHomeName === "Other transitional home (not listed)" && (
                      <View className="mt-3">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Home name</Text>
                        <TextInput
                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                          placeholder="Enter transitional home name..."
                          value={transitionalHomeNameOther}
                          onChangeText={setTransitionalHomeNameOther}
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* SECTION 4 - Communication Confirmation */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-1">Section 4: Communication Confirmation</Text>
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

          {/* SECTION 5 - Resources Sent */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-1">Section 5: Resources Sent</Text>
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
                    setSendResourcesEmailChecked(false);
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
                          // Check if participant has email
                          if (!email || email.trim() === "") {
                            Alert.alert(
                              "No Email Address",
                              "Please add an email address for this participant in Section 1 before sending resources via email.",
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
                                content: r.content,
                                category: r.category,
                              }));

                            // Send email using Gmail SMTP
                            const result = await sendResourcesEmail(
                              email,
                              participant.firstName,
                              resourcesToSend,
                              currentUser?.name || "Bridge Team"
                            );

                            if (result.success) {
                              Alert.alert("Success", "Resources sent via email successfully!");
                            } else {
                              Alert.alert(
                                "Email Error",
                                result.error || "Could not send email. Please ensure Gmail is configured in ENV tab."
                              );
                            }
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

                {/* Email resources checkbox */}
                <Pressable
                  onPress={() => setSendResourcesEmailChecked(!sendResourcesEmailChecked)}
                  className="flex-row items-start"
                >
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                      sendResourcesEmailChecked ? "bg-slate-700 border-slate-700" : "bg-white border-gray-300"
                    }`}
                  >
                    {sendResourcesEmailChecked && <Ionicons name="checkmark" size={18} color="white" />}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base text-gray-900 font-medium">
                      Automatically email the selected resources to the participant
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      Resources will be sent from the 7more email account
                    </Text>
                  </View>
                </Pressable>
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

      {/* Housing Situation Modal */}
      <Modal
        visible={showHousingSituationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHousingSituationModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowHousingSituationModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 mx-6 w-80">
            <Text className="text-lg font-bold text-gray-900 mb-4">Current Housing Situation</Text>
            {["Unhoused", "Transitional home", "With family/friends", "Other"].map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setCurrentHousingSituation(option);
                  if (option !== "Transitional home") {
                    setTransitionalHomeName("");
                    setTransitionalHomeNameOther("");
                  }
                  if (option !== "Other") {
                    setCurrentHousingOther("");
                  }
                  setShowHousingSituationModal(false);
                }}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  currentHousingSituation === option
                    ? "bg-slate-100 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    currentHousingSituation === option ? "text-slate-900" : "text-gray-900"
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Transitional Home Modal */}
      <Modal
        visible={showTransitionalHomeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTransitionalHomeModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowTransitionalHomeModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 mx-6 w-80 max-h-96">
            <Text className="text-lg font-bold text-gray-900 mb-4">Select Transitional Home</Text>
            <ScrollView>
              {transitionalHomes.map((home: TransitionalHome) => (
                <Pressable
                  key={home.id}
                  onPress={() => {
                    setTransitionalHomeName(home.name);
                    setTransitionalHomeNameOther("");
                    setShowTransitionalHomeModal(false);
                  }}
                  className={`border-2 rounded-xl p-4 mb-3 ${
                    transitionalHomeName === home.name
                      ? "bg-slate-100 border-slate-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      transitionalHomeName === home.name ? "text-slate-900" : "text-gray-900"
                    }`}
                  >
                    {home.name}
                  </Text>
                  {home.name === "Ben Reid / Southeast Texas Transitional Center" && (
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="flag" size={14} color="#DC2626" />
                      <Text className="text-xs text-red-600 font-medium ml-1">High Priority</Text>
                    </View>
                  )}
                </Pressable>
              ))}

              {/* Other option */}
              <Pressable
                onPress={() => {
                  setTransitionalHomeName("Other transitional home (not listed)");
                  setShowTransitionalHomeModal(false);
                }}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  transitionalHomeName === "Other transitional home (not listed)"
                    ? "bg-slate-100 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    transitionalHomeName === "Other transitional home (not listed)"
                      ? "text-slate-900"
                      : "text-gray-900"
                  }`}
                >
                  Other transitional home (not listed)
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

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
