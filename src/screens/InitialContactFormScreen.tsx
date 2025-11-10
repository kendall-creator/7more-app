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
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useParticipantStore } from "../state/participantStore";
import { useAllResources } from "../state/resourceStore";
import { useCurrentUser } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";
import { ContactAttemptType, InitialContactFormData } from "../types";
import { sendAircallSMS } from "../api/aircall-sms";
import { sendResourcesEmail } from "../services/emailService";

export default function InitialContactFormScreen({ route, navigation }: any) {
  const { participantId } = route.params;
  const currentUser = useCurrentUser();
  const participant = useParticipantStore((s) => s.getParticipantById(participantId));
  const recordInitialContact = useParticipantStore((s) => s.recordInitialContact);
  const allResources = useAllResources();

  // Contact Outcome
  const [contactOutcome, setContactOutcome] = useState<"successful" | "attempted" | "unable">("successful");

  // Attempted Contact fields
  const [attemptType, setAttemptType] = useState<ContactAttemptType>("left_voicemail");
  const [attemptNotes, setAttemptNotes] = useState("");

  // Unable to Contact fields
  const [unableReason, setUnableReason] = useState("");

  // Contact Date - using local date string like scheduler
  const [contactDateString, setContactDateString] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Mentorship Offered
  const [mentorshipOffered, setMentorshipOffered] = useState("");
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);

  // Living Situation
  const [livingSituation, setLivingSituation] = useState("");
  const [showLivingSituationModal, setShowLivingSituationModal] = useState(false);
  const [livingSituationDetail, setLivingSituationDetail] = useState("");
  const [showLivingDetailModal, setShowLivingDetailModal] = useState(false);

  // Employment Status
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);
  const [employmentOther, setEmploymentOther] = useState("");

  // Clothing Needs
  const [clothingNeeds, setClothingNeeds] = useState("");
  const [showClothingModal, setShowClothingModal] = useState(false);

  // Checkboxes
  const [openInvitationToCall, setOpenInvitationToCall] = useState(false);
  const [prayerOffered, setPrayerOffered] = useState(false);

  // Additional Notes
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Guidance Needed
  const [guidanceNeeded, setGuidanceNeeded] = useState(false);
  const [guidanceNotes, setGuidanceNotes] = useState("");

  // Resources Sent
  const [resourcesSent, setResourcesSent] = useState(false);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showResourcePreviewModal, setShowResourcePreviewModal] = useState(false);

  if (!participant || !currentUser) {
    return null;
  }

  // Generate resource text helper
  const generateResourceText = () => {
    const resourcesToSend = allResources.filter((r) => selectedResources.includes(r.id));
    let text = `Hello ${participant.firstName},\n\nHere are some resources that may help you:\n\n`;

    resourcesToSend.forEach((resource, index) => {
      text += `${index + 1}. ${resource.title}\n`;
      text += `${resource.content}\n\n`;
    });

    text += "If you have any questions, please reach out to us.\n\nBest regards,\n7more Team";
    return text;
  };

  const toggleResource = (resourceId: string) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId) ? prev.filter((id) => id !== resourceId) : [...prev, resourceId]
    );
  };

  const confirmDateSelection = () => {
    // Fix timezone issue - get local date string in YYYY-MM-DD format
    const year = tempDate.getFullYear();
    const month = String(tempDate.getMonth() + 1).padStart(2, "0");
    const day = String(tempDate.getDate()).padStart(2, "0");
    setContactDateString(`${year}-${month}-${day}`);
    setShowDatePicker(false);
  };

  const formatDateDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSubmit = async () => {
    // For unsuccessful contacts, only require date and details
    if (contactOutcome === "attempted") {
      if (!attemptNotes.trim()) {
        Alert.alert("Missing Information", "Please add notes about your contact attempt.");
        return;
      }

      // Save attempted contact
      const formData = {
        participantId,
        contactDate: contactDateString,
        contactOutcome,
        attemptType,
        attemptNotes,
        mentorshipOffered: "",
        livingSituation: "",
        livingSituationDetail: "",
        employmentStatus: "",
        clothingNeeds: "",
        openInvitationToCall: false,
        prayerOffered: false,
        additionalNotes: "",
        guidanceNeeded: false,
        guidanceNotes: "",
      };

      try {
        console.log("📝 Submitting contact attempt form...");
        await recordInitialContact(formData, currentUser.id, currentUser.name);
        console.log("✅ Contact attempt recorded, showing success alert");

        Alert.alert("Success", "Contact attempt recorded successfully!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } catch (error) {
        console.error("❌ Error recording contact attempt:", error);
        Alert.alert("Error", "Failed to record contact attempt. Please try again.");
      }
      return;
    }

    if (contactOutcome === "unable") {
      if (!unableReason.trim()) {
        Alert.alert("Missing Information", "Please explain why you were unable to contact them.");
        return;
      }

      // Save unable to contact
      const formData: InitialContactFormData = {
        participantId,
        contactDate: contactDateString,
        contactOutcome,
        unableReason,
        attemptType: "left_voicemail" as ContactAttemptType,
        attemptNotes: "",
        mentorshipOffered: "",
        livingSituation: "",
        livingSituationDetail: "",
        employmentStatus: "",
        clothingNeeds: "",
        openInvitationToCall: false,
        prayerOffered: false,
        additionalNotes: "",
        guidanceNeeded: false,
        guidanceNotes: "",
      };

      try {
        console.log("📝 Submitting unable to contact form...");
        await recordInitialContact(formData, currentUser.id, currentUser.name);
        console.log("✅ Unable to contact recorded, showing success alert");

        Alert.alert("Success", "Unable to contact information recorded successfully!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } catch (error) {
        console.error("❌ Error recording unable to contact:", error);
        Alert.alert("Error", "Failed to record information. Please try again.");
      }
      return;
    }

    // For successful contact, validate all required fields
    if (!mentorshipOffered) {
      Alert.alert("Missing Information", "Please select if mentorship was offered.");
      return;
    }

    if (!livingSituation) {
      Alert.alert("Missing Information", "Please select living situation.");
      return;
    }

    if (livingSituation === "Stable" && !livingSituationDetail) {
      Alert.alert("Missing Information", "Please select living situation details.");
      return;
    }

    if (livingSituation === "Needs Assistance" && !livingSituationDetail) {
      Alert.alert("Missing Information", "Please select living situation assistance details.");
      return;
    }

    if (!employmentStatus) {
      Alert.alert("Missing Information", "Please select employment status.");
      return;
    }

    if (employmentStatus === "Other" && !employmentOther.trim()) {
      Alert.alert("Missing Information", "Please specify other employment status.");
      return;
    }

    if (!clothingNeeds) {
      Alert.alert("Missing Information", "Please select clothing needs.");
      return;
    }

    // Prepare form data for successful contact
    const formData: InitialContactFormData = {
      participantId,
      contactDate: contactDateString,
      contactOutcome,
      attemptType: "left_voicemail" as ContactAttemptType,
      attemptNotes: "",
      unableReason: "",
      mentorshipOffered,
      livingSituation,
      livingSituationDetail,
      employmentStatus: employmentStatus === "Other" ? employmentOther : employmentStatus,
      clothingNeeds,
      openInvitationToCall,
      prayerOffered,
      additionalNotes,
      guidanceNeeded,
      guidanceNotes: guidanceNeeded ? guidanceNotes : "",
    };

    try {
      console.log("📝 Submitting successful contact form...");
      await recordInitialContact(formData, currentUser.id, currentUser.name);
      console.log("✅ Initial contact recorded, showing success alert");

      Alert.alert("Success", "Initial contact form completed successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("❌ Error recording initial contact:", error);
      Alert.alert("Error", "Failed to record initial contact. Please try again.");
    }
  };

  const getHeaderColor = () => {
    switch (contactOutcome) {
      case "successful":
        return "bg-yellow-600";
      case "attempted":
        return "bg-amber-600";
      case "unable":
        return "bg-gray-600";
      default:
        return "bg-yellow-600";
    }
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
        <View className={`${getHeaderColor()} pt-16 pb-6 px-6`}>
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-2xl font-bold text-white mb-2">Initial Contact Form</Text>
          <Text className="text-white opacity-90 text-base">
            {participant.firstName} {participant.lastName} • #{participant.participantNumber}
          </Text>
        </View>

        <View className="px-6 pt-6">
          {/* Contact Outcome */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Contact Outcome <Text className="text-red-500">*</Text>
            </Text>
            <View className="gap-2">
              <Pressable
                onPress={() => setContactOutcome("successful")}
                className={`border-2 rounded-xl px-4 py-4 ${
                  contactOutcome === "successful"
                    ? "bg-yellow-50 border-yellow-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={contactOutcome === "successful" ? "#CA8A04" : "#9CA3AF"}
                  />
                  <Text
                    className={`text-base font-semibold ml-2 ${
                      contactOutcome === "successful" ? "text-yellow-900" : "text-gray-900"
                    }`}
                  >
                    Successful Contact
                  </Text>
                </View>
                <Text
                  className={`text-sm mt-1 ml-7 ${
                    contactOutcome === "successful" ? "text-yellow-700" : "text-gray-500"
                  }`}
                >
                  Complete initial contact form with participant details
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setContactOutcome("attempted")}
                className={`border-2 rounded-xl px-4 py-4 ${
                  contactOutcome === "attempted"
                    ? "bg-amber-50 border-amber-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={contactOutcome === "attempted" ? "#D97706" : "#9CA3AF"}
                  />
                  <Text
                    className={`text-base font-semibold ml-2 ${
                      contactOutcome === "attempted" ? "text-amber-900" : "text-gray-900"
                    }`}
                  >
                    Attempted Contact
                  </Text>
                </View>
                <Text
                  className={`text-sm mt-1 ml-7 ${
                    contactOutcome === "attempted" ? "text-amber-700" : "text-gray-500"
                  }`}
                >
                  Left voicemail or unable to reach participant
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setContactOutcome("unable")}
                className={`border-2 rounded-xl px-4 py-4 ${
                  contactOutcome === "unable"
                    ? "bg-gray-50 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color={contactOutcome === "unable" ? "#4B5563" : "#9CA3AF"}
                  />
                  <Text
                    className={`text-base font-semibold ml-2 ${
                      contactOutcome === "unable" ? "text-gray-900" : "text-gray-900"
                    }`}
                  >
                    Unable to Contact
                  </Text>
                </View>
                <Text
                  className={`text-sm mt-1 ml-7 ${
                    contactOutcome === "unable" ? "text-gray-700" : "text-gray-500"
                  }`}
                >
                  Cannot reach participant for specific reason
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Contact Date */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Contact Date <Text className="text-red-500">*</Text>
            </Text>
            <Pressable
              onPress={() => {
                // Initialize tempDate from contactDateString
                const [year, month, day] = contactDateString.split("-").map(Number);
                setTempDate(new Date(year, month - 1, day));
                setShowDatePicker(true);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-gray-900">{formatDateDisplay(contactDateString)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              </View>
            </Pressable>
          </View>

          {/* Attempted Contact Fields */}
          {contactOutcome === "attempted" && (
            <>
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
                  <Pressable
                    onPress={() => setAttemptType("no_answer")}
                    className={`border-2 rounded-xl px-4 py-4 ${
                      attemptType === "no_answer"
                        ? "bg-amber-50 border-amber-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        attemptType === "no_answer" ? "text-amber-700" : "text-gray-700"
                      }`}
                    >
                      No Answer
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Attempt Notes <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                  placeholder="Details about your contact attempt..."
                  value={attemptNotes}
                  onChangeText={setAttemptNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </>
          )}

          {/* Unable to Contact Fields */}
          {contactOutcome === "unable" && (
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Reason Unable to Contact <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                placeholder="Explain why you cannot contact this participant..."
                value={unableReason}
                onChangeText={setUnableReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Only show full form fields for successful contact */}
          {contactOutcome === "successful" && (
            <>
              {/* Mentorship Offered */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Are you alright with me continuing to reach out and check up on you? <Text className="text-red-500">*</Text>
                </Text>
                <Pressable
                  onPress={() => setShowMentorshipModal(true)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-base ${mentorshipOffered ? "text-gray-900" : "text-gray-400"}`}>
                      {mentorshipOffered || "Select response..."}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </Pressable>
              </View>

              {/* Living Situation */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Living Situation <Text className="text-red-500">*</Text>
                </Text>
                <Pressable
                  onPress={() => setShowLivingSituationModal(true)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-base ${livingSituation ? "text-gray-900" : "text-gray-400"}`}>
                      {livingSituation || "Select situation..."}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </Pressable>
              </View>

              {/* Living Situation Detail - Conditional */}
              {livingSituation && (
                <View className="mb-5">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    {livingSituation === "Stable" ? "Current Living Arrangement" : "Assistance Needed"}
                    <Text className="text-red-500"> *</Text>
                  </Text>
                  <Pressable
                    onPress={() => setShowLivingDetailModal(true)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className={`text-base ${livingSituationDetail ? "text-gray-900" : "text-gray-400"}`}>
                        {livingSituationDetail || "Select details..."}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6B7280" />
                    </View>
                  </Pressable>
                </View>
              )}

              {/* Employment Status */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Employment Status <Text className="text-red-500">*</Text>
                </Text>
                <Pressable
                  onPress={() => setShowEmploymentModal(true)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-base ${employmentStatus ? "text-gray-900" : "text-gray-400"}`}>
                      {employmentStatus || "Select status..."}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </Pressable>
              </View>

              {/* Employment Other - Conditional */}
              {employmentStatus === "Other" && (
                <View className="mb-5">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Please Specify <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                    placeholder="Enter employment status..."
                    value={employmentOther}
                    onChangeText={setEmploymentOther}
                  />
                </View>
              )}

              {/* Clothing Needs */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Clothing Needs <Text className="text-red-500">*</Text>
                </Text>
                <Pressable
                  onPress={() => setShowClothingModal(true)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-base ${clothingNeeds ? "text-gray-900" : "text-gray-400"}`}>
                      {clothingNeeds || "Select needs..."}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </Pressable>
              </View>

              {/* Open Invitation to Call Given */}
              <View className="mb-5">
                <Pressable
                  onPress={() => setOpenInvitationToCall(!openInvitationToCall)}
                  className="flex-row items-center"
                >
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                      openInvitationToCall ? "bg-yellow-600 border-yellow-600" : "bg-white border-gray-300"
                    }`}
                  >
                    {openInvitationToCall && <Ionicons name="checkmark" size={18} color="white" />}
                  </View>
                  <Text className="text-base text-gray-900">Open Invitation to Call Given</Text>
                </Pressable>
              </View>

              {/* Prayer Offered */}
              <View className="mb-5">
                <Pressable
                  onPress={() => setPrayerOffered(!prayerOffered)}
                  className="flex-row items-center"
                >
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                      prayerOffered ? "bg-yellow-600 border-yellow-600" : "bg-white border-gray-300"
                    }`}
                  >
                    {prayerOffered && <Ionicons name="checkmark" size={18} color="white" />}
                  </View>
                  <Text className="text-base text-gray-900">Prayer Offered</Text>
                </Pressable>
              </View>

              {/* Additional Notes */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Additional Notes</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                  placeholder="Any additional observations or notes..."
                  value={additionalNotes}
                  onChangeText={setAdditionalNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Guidance Needed */}
              <View className="mb-5">
                <Pressable
                  onPress={() => setGuidanceNeeded(!guidanceNeeded)}
                  className="flex-row items-center mb-3"
                >
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                      guidanceNeeded ? "bg-yellow-600 border-yellow-600" : "bg-white border-gray-300"
                    }`}
                  >
                    {guidanceNeeded && <Ionicons name="checkmark" size={18} color="white" />}
                  </View>
                  <Text className="text-base text-gray-900 font-semibold">Guidance Needed from Leadership</Text>
                </Pressable>
                {guidanceNeeded && (
                  <View className="ml-9">
                    <Text className="text-sm text-gray-600 mb-2">
                      This will create a task for mentorship leaders to review and provide guidance.
                    </Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                      placeholder="Describe what guidance you need..."
                      value={guidanceNotes}
                      onChangeText={setGuidanceNotes}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                )}
              </View>

              {/* Resources Sent */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-3">Resources to Send</Text>
                <Text className="text-xs text-gray-500 mb-3">Select resources to share with the participant</Text>

                <Pressable
                  onPress={() => setShowResourcesModal(true)}
                  className="bg-blue-50 border border-blue-200 rounded-xl py-3 px-4 mb-3 active:opacity-70"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons name="add-circle" size={20} color="#2563EB" />
                      <Text className="text-blue-600 text-sm font-semibold ml-2">
                        {selectedResources.length > 0
                          ? `${selectedResources.length} Resource${selectedResources.length > 1 ? "s" : ""} Selected`
                          : "Select Resources"}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#2563EB" />
                  </View>
                </Pressable>

                {/* Selected Resources Display */}
                {selectedResources.length > 0 && (
                  <View className="mb-4">
                    {selectedResources.map((resourceId) => {
                      const resource = allResources.find((r) => r.id === resourceId);
                      if (!resource) return null;
                      return (
                        <View key={resourceId} className="mb-2">
                          <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                            <View className="flex-row items-start justify-between">
                              <View className="flex-1 mr-2">
                                <Text className="text-sm font-semibold text-gray-900 mb-1">{resource.title}</Text>
                                <Text className="text-xs text-gray-600">{resource.category}</Text>
                              </View>
                              <Pressable onPress={() => toggleResource(resourceId)}>
                                <Ionicons name="close-circle" size={20} color="#FFC107" />
                              </Pressable>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Communication Options - Show when resources are selected */}
                {selectedResources.length > 0 && (participant.phoneNumber || participant.email) && (
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-3">Send Resources to Participant</Text>
                    <View className="flex-row gap-3 flex-wrap">
                      {participant.email && (
                        <Pressable
                          onPress={async () => {
                            const resourcesToSend = allResources
                              .filter((r) => selectedResources.includes(r.id))
                              .map((r) => ({
                                title: r.title,
                                content: r.content,
                                category: r.category,
                              }));

                            const result = await sendResourcesEmail(
                              participant.email!,
                              participant.firstName,
                              resourcesToSend
                            );

                            if (result.success) {
                              Alert.alert("Success", "Resources sent via email successfully!");
                            } else {
                              Alert.alert(
                                "Email Error",
                                result.error || "Could not send email. Please ensure Gmail is configured in ENV tab."
                              );
                            }
                          }}
                          className="flex-1 bg-blue-600 rounded-xl py-3 items-center active:opacity-80"
                        >
                          <View className="flex-row items-center">
                            <Ionicons name="mail" size={18} color="white" />
                            <Text className="text-white text-sm font-semibold ml-2">Email</Text>
                          </View>
                        </Pressable>
                      )}

                      {participant.phoneNumber && (
                        <Pressable
                          onPress={async () => {
                            const text = generateResourceText();
                            const result = await sendAircallSMS(participant.phoneNumber!, text);
                            if (result.success) {
                              Alert.alert("Success", "Resources sent via SMS successfully!");
                            } else {
                              Alert.alert(
                                "SMS Error",
                                result.error || "Could not send SMS. Please check your Aircall configuration."
                              );
                            }
                          }}
                          className="flex-1 bg-green-600 rounded-xl py-3 items-center active:opacity-80"
                        >
                          <View className="flex-row items-center">
                            <Ionicons name="chatbubble" size={18} color="white" />
                            <Text className="text-white text-sm font-semibold ml-2">SMS</Text>
                          </View>
                        </Pressable>
                      )}

                      <Pressable
                        onPress={() => setShowResourcePreviewModal(true)}
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
              </View>
            </>
          )}

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            className="bg-yellow-600 rounded-xl py-4 items-center mb-3 active:opacity-80"
          >
            <Text className="text-white text-base font-bold">
              {contactOutcome === "successful"
                ? "Complete Initial Contact"
                : contactOutcome === "attempted"
                ? "Record Contact Attempt"
                : "Record Unable to Contact"}
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

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal transparent animationType="fade">
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-white rounded-2xl p-6 mx-6 w-80">
              <Text className="text-lg font-bold text-gray-900 mb-4">Select Date</Text>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTempDate(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
              <View className="flex-row gap-3 mt-4">
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                >
                  <Text className="text-gray-700 font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={confirmDateSelection}
                  className="flex-1 bg-yellow-600 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-semibold">Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Mentorship Offered Modal */}
      <Modal
        visible={showMentorshipModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMentorshipModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowMentorshipModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 mx-6 w-80">
            <Text className="text-lg font-bold text-gray-900 mb-4">Continue Reaching Out?</Text>
            {["Yes", "No"].map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setMentorshipOffered(option);
                  setShowMentorshipModal(false);
                }}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  mentorshipOffered === option
                    ? "bg-yellow-50 border-yellow-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    mentorshipOffered === option ? "text-yellow-900" : "text-gray-900"
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Living Situation Modal */}
      <Modal
        visible={showLivingSituationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLivingSituationModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowLivingSituationModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 mx-6 w-80">
            <Text className="text-lg font-bold text-gray-900 mb-4">Living Situation</Text>
            {["Stable", "Needs Assistance"].map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setLivingSituation(option);
                  setLivingSituationDetail(""); // Reset detail when changing main option
                  setShowLivingSituationModal(false);
                }}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  livingSituation === option
                    ? "bg-yellow-50 border-yellow-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    livingSituation === option ? "text-yellow-900" : "text-gray-900"
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Living Situation Detail Modal */}
      <Modal
        visible={showLivingDetailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLivingDetailModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowLivingDetailModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 mx-6 w-80">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              {livingSituation === "Stable" ? "Current Living Arrangement" : "Assistance Needed"}
            </Text>
            {livingSituation === "Stable"
              ? ["Living on Own", "Living with Friend or Family Member", "Staying at Transition House"].map(
                  (option) => (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setLivingSituationDetail(option);
                        setShowLivingDetailModal(false);
                      }}
                      className={`border-2 rounded-xl p-4 mb-3 ${
                        livingSituationDetail === option
                          ? "bg-yellow-50 border-yellow-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-base font-semibold ${
                          livingSituationDetail === option ? "text-yellow-900" : "text-gray-900"
                        }`}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  )
                )
              : [
                  "Needs to Move to Transitional Home",
                  "Currently on Couch",
                  "Staying in High Stress Environment",
                ].map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setLivingSituationDetail(option);
                      setShowLivingDetailModal(false);
                    }}
                    className={`border-2 rounded-xl p-4 mb-3 ${
                      livingSituationDetail === option
                        ? "bg-yellow-50 border-yellow-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-base font-semibold ${
                        livingSituationDetail === option ? "text-yellow-900" : "text-gray-900"
                      }`}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
          </View>
        </Pressable>
      </Modal>

      {/* Employment Status Modal */}
      <Modal
        visible={showEmploymentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmploymentModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowEmploymentModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 mx-6 w-80">
            <Text className="text-lg font-bold text-gray-900 mb-4">Employment Status</Text>
            {["Employed", "Needs Employment", "Other"].map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setEmploymentStatus(option);
                  if (option !== "Other") {
                    setEmploymentOther("");
                  }
                  setShowEmploymentModal(false);
                }}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  employmentStatus === option
                    ? "bg-yellow-50 border-yellow-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    employmentStatus === option ? "text-yellow-900" : "text-gray-900"
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Clothing Needs Modal */}
      <Modal
        visible={showClothingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClothingModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowClothingModal(false)}
        >
          <View className="bg-white rounded-2xl p-6 mx-6 w-80">
            <Text className="text-lg font-bold text-gray-900 mb-4">Clothing Needs</Text>
            {["In Need of Clothing", "No Need for Clothing"].map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setClothingNeeds(option);
                  setShowClothingModal(false);
                }}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  clothingNeeds === option
                    ? "bg-yellow-50 border-yellow-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    clothingNeeds === option ? "text-yellow-900" : "text-gray-900"
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Resources Selection Modal */}
      <Modal visible={showResourcesModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-20 bg-white rounded-t-3xl">
            <View className="p-6 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-bold text-gray-900">Select Resources</Text>
                <Pressable onPress={() => setShowResourcesModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </Pressable>
              </View>
            </View>
            <ScrollView className="flex-1 px-6 py-4">
              {allResources.map((resource) => (
                <Pressable
                  key={resource.id}
                  onPress={() => toggleResource(resource.id)}
                  className="mb-3 bg-white border border-gray-200 rounded-xl p-4 active:opacity-70"
                >
                  <View className="flex-row items-start">
                    <View
                      className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                        selectedResources.includes(resource.id)
                          ? "bg-yellow-600 border-yellow-600"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {selectedResources.includes(resource.id) && <Ionicons name="checkmark" size={18} color="white" />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 mb-1">{resource.title}</Text>
                      <Text className="text-xs text-gray-500 mb-2">{resource.category}</Text>
                      <Text className="text-sm text-gray-700" numberOfLines={3}>
                        {resource.content}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <View className="p-6 border-t border-gray-200">
              <Pressable
                onPress={() => setShowResourcesModal(false)}
                className="bg-yellow-600 rounded-xl py-4 items-center active:opacity-80"
              >
                <Text className="text-white text-base font-bold">
                  Done ({selectedResources.length} Selected)
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Resource Preview Modal */}
      <Modal visible={showResourcePreviewModal} transparent animationType="fade">
        <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={() => setShowResourcePreviewModal(false)}>
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
                onPress={() => {
                  Alert.alert("Copied", "Resource text copied to clipboard (Note: Actual clipboard functionality pending)");
                  setShowResourcePreviewModal(false);
                }}
                className="bg-gray-700 rounded-xl py-3 items-center active:opacity-80"
              >
                <View className="flex-row items-center">
                  <Ionicons name="copy" size={18} color="white" />
                  <Text className="text-white text-sm font-semibold ml-2">Copy to Clipboard</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setShowResourcePreviewModal(false)}
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
