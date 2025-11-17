import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useVolunteerStore } from "../state/volunteerStore";
import { useUsersStore } from "../state/usersStore";
import { useCurrentUser } from "../state/authStore";
import { VolunteerInterestArea } from "../types";

type RootStackParamList = {
  MainTabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const INTEREST_LABELS: Record<VolunteerInterestArea, string> = {
  bridge_team: "Bridge Team",
  clothing_donation: "Clothing Donation",
  in_prison_volunteering: "In-Prison Volunteering",
  administrative_work: "Administrative Work",
  general_volunteer: "General Volunteer",
  monetary_donation: "Monetary Donation",
  other: "Other",
};

export default function VolunteerRoutingRulesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentUser = useCurrentUser();

  const routingRules = useVolunteerStore((s) => s.routingRules);
  const updateRoutingRule = useVolunteerStore((s) => s.updateRoutingRule);
  const donationSettings = useVolunteerStore((s) => s.donationSettings);
  const updateDonationSettings = useVolunteerStore((s) => s.updateDonationSettings);
  const allUsers = useUsersStore((s) => s.invitedUsers);

  const [selectedInterest, setSelectedInterest] = useState<VolunteerInterestArea | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditingDonation, setIsEditingDonation] = useState(false);
  const [threshold, setThreshold] = useState(donationSettings.threshold.toString());
  const [belowInstruction, setBelowInstruction] = useState(donationSettings.belowThresholdInstruction);
  const [aboveInstruction, setAboveInstruction] = useState(donationSettings.aboveThresholdInstruction);
  const [checkAddress, setCheckAddress] = useState(donationSettings.checkAddress);

  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = async (userId: string, userName: string) => {
    if (!selectedInterest) return;

    try {
      await updateRoutingRule(
        selectedInterest,
        userId,
        userName,
        currentUser!.id,
        currentUser!.name
      );

      Alert.alert(
        "Success",
        `${INTEREST_LABELS[selectedInterest]} tasks will now be assigned to ${userName}`
      );
      setSelectedInterest(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Error updating routing rule:", error);
      Alert.alert("Error", "Failed to update routing rule");
    }
  };

  const handleSaveDonationSettings = async () => {
    const thresholdNum = parseFloat(threshold);
    if (isNaN(thresholdNum) || thresholdNum <= 0) {
      Alert.alert("Invalid Threshold", "Please enter a valid threshold amount");
      return;
    }

    if (!belowInstruction.trim() || !aboveInstruction.trim() || !checkAddress.trim()) {
      Alert.alert("Required Fields", "All donation setting fields are required");
      return;
    }

    try {
      await updateDonationSettings(
        {
          threshold: thresholdNum,
          belowThresholdInstruction: belowInstruction.trim(),
          aboveThresholdInstruction: aboveInstruction.trim(),
          checkAddress: checkAddress.trim(),
        },
        currentUser!.id,
        currentUser!.name
      );

      Alert.alert("Success", "Donation settings updated successfully");
      setIsEditingDonation(false);
    } catch (error) {
      console.error("Error updating donation settings:", error);
      Alert.alert("Error", "Failed to update donation settings");
    }
  };

  const handleCancelDonationEdit = () => {
    setThreshold(donationSettings.threshold.toString());
    setBelowInstruction(donationSettings.belowThresholdInstruction);
    setAboveInstruction(donationSettings.aboveThresholdInstruction);
    setCheckAddress(donationSettings.checkAddress);
    setIsEditingDonation(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4F46E5" />
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">Routing Rules</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Routing Rules Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-2">Task Assignment Rules</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Configure which user receives tasks for each volunteer interest area
          </Text>

          {Object.entries(INTEREST_LABELS).map(([interest, label]) => {
            const rule = routingRules.find((r) => r.interestArea === interest);
            const isSelecting = selectedInterest === interest;

            return (
              <View key={interest} className="mb-3">
                <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-semibold text-gray-900">{label}</Text>
                    <Pressable
                      onPress={() => {
                        if (isSelecting) {
                          setSelectedInterest(null);
                          setSearchQuery("");
                        } else {
                          setSelectedInterest(interest as VolunteerInterestArea);
                          setSearchQuery("");
                        }
                      }}
                      className="bg-indigo-600 px-3 py-2 rounded-lg"
                    >
                      <Text className="text-white text-sm font-medium">
                        {isSelecting ? "Cancel" : "Change"}
                      </Text>
                    </Pressable>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="person" size={16} color="#6B7280" />
                    <Text className="text-sm text-gray-700 ml-2">
                      Assigned to: <Text className="font-semibold">{rule?.assignedToUserName || "Not set"}</Text>
                    </Text>
                  </View>

                  {rule?.updatedAt && (
                    <Text className="text-xs text-gray-500 mt-1">
                      Last updated by {rule.updatedByName} on {new Date(rule.updatedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                {/* User Selection */}
                {isSelecting && (
                  <View className="mt-2 bg-white border border-indigo-300 rounded-lg p-3">
                    <Text className="text-sm font-medium text-gray-900 mb-2">Select User</Text>

                    <TextInput
                      className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />

                    <ScrollView className="max-h-48">
                      {filteredUsers.map((user) => (
                        <Pressable
                          key={user.id}
                          onPress={() => handleSelectUser(user.id, user.name)}
                          className="flex-row items-center py-2 px-2 border-b border-gray-100"
                        >
                          <Ionicons name="person-circle" size={24} color="#4F46E5" />
                          <View className="ml-2 flex-1">
                            <Text className="text-sm font-medium text-gray-900">{user.name}</Text>
                            <Text className="text-xs text-gray-500">{user.email}</Text>
                          </View>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Monetary Donation Settings */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-xl font-bold text-gray-900">Monetary Donation Settings</Text>
              <Text className="text-sm text-gray-600 mt-1">
                Configure threshold and instructions for donations
              </Text>
            </View>
            {!isEditingDonation && (
              <Pressable
                onPress={() => setIsEditingDonation(true)}
                className="bg-indigo-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white text-sm font-medium">Edit</Text>
              </Pressable>
            )}
          </View>

          {isEditingDonation ? (
            <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <Text className="text-sm font-medium text-gray-700 mb-1">Threshold Amount ($)</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 mb-3 bg-white">
                <Text className="text-gray-700 mr-1">$</Text>
                <TextInput
                  className="flex-1"
                  value={threshold}
                  onChangeText={setThreshold}
                  placeholder="1000"
                  keyboardType="decimal-pad"
                />
              </View>

              <Text className="text-sm font-medium text-gray-700 mb-1">
                Below Threshold Instruction
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 mb-3 bg-white"
                value={belowInstruction}
                onChangeText={setBelowInstruction}
                placeholder="Instruction for amounts below threshold"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />

              <Text className="text-sm font-medium text-gray-700 mb-1">
                Above Threshold Instruction
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 mb-3 bg-white"
                value={aboveInstruction}
                onChangeText={setAboveInstruction}
                placeholder="Instruction for amounts above threshold"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />

              <Text className="text-sm font-medium text-gray-700 mb-1">Check Mailing Address</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 mb-4 bg-white"
                value={checkAddress}
                onChangeText={setCheckAddress}
                placeholder="Full mailing address for checks"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />

              <View className="flex-row space-x-2">
                <Pressable
                  onPress={handleCancelDonationEdit}
                  className="flex-1 bg-gray-300 py-3 rounded-lg mr-2"
                >
                  <Text className="text-gray-800 text-center font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveDonationSettings}
                  className="flex-1 bg-indigo-600 py-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700">Threshold Amount</Text>
                <Text className="text-lg font-bold text-gray-900">${donationSettings.threshold.toLocaleString()}</Text>
              </View>

              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700">Below Threshold</Text>
                <Text className="text-sm text-gray-900">{donationSettings.belowThresholdInstruction}</Text>
              </View>

              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700">Above Threshold</Text>
                <Text className="text-sm text-gray-900">{donationSettings.aboveThresholdInstruction}</Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700">Check Address</Text>
                <Text className="text-sm text-gray-900">{donationSettings.checkAddress}</Text>
              </View>

              {donationSettings.updatedAt && (
                <Text className="text-xs text-gray-500 mt-3">
                  Last updated by {donationSettings.updatedByName} on{" "}
                  {new Date(donationSettings.updatedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
