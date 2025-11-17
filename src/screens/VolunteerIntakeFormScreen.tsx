import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useVolunteerStore } from "../state/volunteerStore";
import { useTaskStore } from "../state/taskStore";
import { useCurrentUser } from "../state/authStore";
import { VolunteerInterestArea } from "../types";

type RootStackParamList = {
  MainTabs: undefined;
  VolunteerIntakeForm: { inquiryId?: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, "VolunteerIntakeForm">;

const INTEREST_OPTIONS: { value: VolunteerInterestArea; label: string }[] = [
  { value: "bridge_team", label: "Bridge Team" },
  { value: "clothing_donation", label: "Clothing Donation" },
  { value: "in_prison_volunteering", label: "In-Prison Volunteering" },
  { value: "administrative_work", label: "Administrative Work" },
  { value: "general_volunteer", label: "General Volunteer" },
  { value: "monetary_donation", label: "Monetary Donation" },
  { value: "other", label: "Other" },
];

export default function VolunteerIntakeFormScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const currentUser = useCurrentUser();

  const addInquiry = useVolunteerStore((s) => s.addInquiry);
  const addTaskToInquiry = useVolunteerStore((s) => s.addTaskToInquiry);
  const addInquiryHistoryEntry = useVolunteerStore((s) => s.addInquiryHistoryEntry);
  const getRoutingRuleForInterest = useVolunteerStore((s) => s.getRoutingRuleForInterest);
  const donationSettings = useVolunteerStore((s) => s.donationSettings);
  const createTask = useTaskStore((s) => s.createTask);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<VolunteerInterestArea[]>([]);
  const [otherDescription, setOtherDescription] = useState("");
  const [monetaryAmount, setMonetaryAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (interest: VolunteerInterestArea) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Required Fields", "Please enter first and last name");
      return;
    }

    if (selectedInterests.length === 0) {
      Alert.alert("Required Fields", "Please select at least one interest area");
      return;
    }

    if (selectedInterests.includes("other") && !otherDescription.trim()) {
      Alert.alert("Required Fields", "Please describe the 'Other' interest");
      return;
    }

    if (selectedInterests.includes("monetary_donation") && !monetaryAmount.trim()) {
      Alert.alert("Required Fields", "Please enter donation amount");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the volunteer inquiry
      const inquiryId = await addInquiry({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        selectedInterests,
        otherInterestDescription: selectedInterests.includes("other") ? otherDescription.trim() : undefined,
        monetaryDonationAmount: selectedInterests.includes("monetary_donation") ? parseFloat(monetaryAmount) : undefined,
        notes: notes.trim() || undefined,
      });

      // Generate tasks based on selected interests
      for (const interest of selectedInterests) {
        const rule = getRoutingRuleForInterest(interest);

        if (!rule) {
          console.warn(`No routing rule found for interest: ${interest}`);
          continue;
        }

        let taskTitle = "";
        let taskDescription = "";

        // Special handling for monetary donation
        if (interest === "monetary_donation") {
          const amount = parseFloat(monetaryAmount);
          const threshold = donationSettings.threshold;

          if (amount < threshold) {
            taskTitle = `Monetary Donation - ${firstName} ${lastName} ($${amount})`;
            taskDescription = `${donationSettings.belowThresholdInstruction}\n\nVolunteer: ${firstName} ${lastName}\nAmount: $${amount}\nEmail: ${email || "Not provided"}\nPhone: ${phoneNumber || "Not provided"}`;
          } else {
            taskTitle = `Monetary Donation - ${firstName} ${lastName} ($${amount})`;
            taskDescription = `${donationSettings.aboveThresholdInstruction}\n${donationSettings.checkAddress}\n\nVolunteer: ${firstName} ${lastName}\nAmount: $${amount}\nEmail: ${email || "Not provided"}\nPhone: ${phoneNumber || "Not provided"}`;
          }
        } else {
          // Regular interest task
          const interestLabel = INTEREST_OPTIONS.find((opt) => opt.value === interest)?.label || interest;
          taskTitle = `Follow Up - ${interestLabel} Interest`;
          taskDescription = `Volunteer Inquiry from ${firstName} ${lastName}\nInterest: ${interestLabel}\n\nContact Info:\nEmail: ${email || "Not provided"}\nPhone: ${phoneNumber || "Not provided"}\n\n${notes ? `Notes: ${notes}` : ""}${interest === "other" && otherDescription ? `\nOther Details: ${otherDescription}` : ""}`;
        }

        // Create the task
        await createTask({
          title: taskTitle,
          description: taskDescription,
          assignedToUserId: rule.assignedToUserId,
          assignedToUserName: rule.assignedToUserName,
          assignedToUserRole: "admin", // Default to admin role for routing
          assignedByUserId: currentUser!.id,
          assignedByUserName: currentUser!.name,
          priority: "medium",
          dueDate: undefined, // No specific due date for volunteer inquiries
        });

        // Link task to inquiry (generate task ID similar to how tasks are generated)
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await addTaskToInquiry(inquiryId, taskId);
      }

      // Add history entry
      await addInquiryHistoryEntry(inquiryId, {
        type: "note_added",
        description: `Tasks created for ${selectedInterests.length} interest area(s)`,
        details: selectedInterests.map((i) => INTEREST_OPTIONS.find((opt) => opt.value === i)?.label).join(", "),
        createdBy: currentUser!.id,
        createdByName: currentUser!.name,
      });

      Alert.alert(
        "Success",
        `Volunteer inquiry submitted for ${firstName} ${lastName}. ${selectedInterests.length} task(s) created.`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting volunteer inquiry:", error);
      Alert.alert("Error", "Failed to submit volunteer inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4F46E5" />
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">Volunteer Intake</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Basic Information */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">Basic Information</Text>

          <Text className="text-sm font-medium text-gray-700 mb-1">First Name *</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            autoCapitalize="words"
          />

          <Text className="text-sm font-medium text-gray-700 mb-1">Last Name *</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            autoCapitalize="words"
          />

          <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text className="text-sm font-medium text-gray-700 mb-1">Phone Number</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
          />
        </View>

        {/* Interest Areas */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">Interest Areas *</Text>
          <Text className="text-sm text-gray-600 mb-3">Select all that apply</Text>

          {INTEREST_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => toggleInterest(option.value)}
              className={`flex-row items-center border rounded-lg px-4 py-3 mb-2 ${
                selectedInterests.includes(option.value)
                  ? "bg-indigo-50 border-indigo-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <View
                className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                  selectedInterests.includes(option.value)
                    ? "bg-indigo-600 border-indigo-600"
                    : "border-gray-400"
                }`}
              >
                {selectedInterests.includes(option.value) && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text className={`text-sm font-medium ${
                selectedInterests.includes(option.value) ? "text-indigo-900" : "text-gray-900"
              }`}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Other Description (conditional) */}
        {selectedInterests.includes("other") && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-1">Describe Other Interest *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={otherDescription}
              onChangeText={setOtherDescription}
              placeholder="Please describe the other interest area"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Monetary Donation Amount (conditional) */}
        {selectedInterests.includes("monetary_donation") && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-1">Donation Amount *</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
              <Text className="text-gray-700 mr-1">$</Text>
              <TextInput
                className="flex-1"
                value={monetaryAmount}
                onChangeText={setMonetaryAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              Amounts under ${donationSettings.threshold}: {donationSettings.belowThresholdInstruction}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              Amounts ${donationSettings.threshold}+: {donationSettings.aboveThresholdInstruction} {donationSettings.checkAddress}
            </Text>
          </View>
        )}

        {/* Notes */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-1">Additional Notes</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional information..."
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
            isSubmitting ? "bg-gray-400" : "bg-indigo-600"
          }`}
        >
          <Text className="text-white text-base font-semibold">
            {isSubmitting ? "Submitting..." : "Submit Inquiry"}
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
