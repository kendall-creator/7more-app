import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useVolunteerStore } from "../state/volunteerStore";
import { useUsersStore } from "../state/usersStore";
import { useCurrentUser } from "../state/authStore";
import { VolunteerRecord, VolunteerInterestArea, UserRole } from "../types";

type RootStackParamList = {
  MainTabs: undefined;
  VolunteerProfile: { volunteerId: string };
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

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: "volunteer", label: "Lead Volunteer", description: "Can sign up for any volunteer shift" },
  { value: "volunteer_support", label: "Support Volunteer", description: "Can sign up for support-designated shifts" },
  { value: "mentor", label: "Mentor", description: "Direct participant engagement and progress tracking" },
  { value: "bridge_team", label: "Bridge Team", description: "Initial contact and participant intake management" },
  { value: "mentorship_leader", label: "Mentorship Leader", description: "Assigns participants to mentors" },
  { value: "admin", label: "Admin", description: "Complete access to all features" },
];

export default function VolunteerDatabaseScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentUser = useCurrentUser();

  const volunteers = useVolunteerStore((s) => s.volunteers);
  const updateVolunteerRecord = useVolunteerStore((s) => s.updateVolunteerRecord);
  const deleteVolunteerRecord = useVolunteerStore((s) => s.deleteVolunteerRecord);
  const addVolunteerHistoryEntry = useVolunteerStore((s) => s.addVolunteerHistoryEntry);
  const addUser = useUsersStore((s) => s.addUser);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterInterest, setFilterInterest] = useState<VolunteerInterestArea | "all">("all");
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("volunteer");
  const [isConverting, setIsConverting] = useState(false);

  // Filter volunteers
  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.phoneNumber?.includes(searchQuery);

    const matchesFilter =
      filterInterest === "all" || volunteer.interests.includes(filterInterest);

    return matchesSearch && matchesFilter;
  });

  const handleConvertToUser = async () => {
    if (!selectedVolunteer) return;

    if (!selectedVolunteer.email) {
      Alert.alert(
        "Email Required",
        "This volunteer does not have an email address. Please add one before converting to a user.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsConverting(true);

    try {
      // Generate password based on name (first initial + last name)
      const firstInitial = selectedVolunteer.firstName.charAt(0).toLowerCase();
      const lastName = selectedVolunteer.lastName.toLowerCase().replace(/\s/g, "");
      const password = `${firstInitial}${lastName}`;

      // Create user account
      const result = await addUser(
        `${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`,
        selectedVolunteer.email,
        selectedRole,
        password,
        currentUser!.id,
        selectedVolunteer.phoneNumber,
        undefined // No nickname
      );

      if (result.success) {
        // Add history entry to volunteer record
        await addVolunteerHistoryEntry(selectedVolunteer.id, {
          type: "note_added",
          description: "Converted to system user",
          details: `Role: ${ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label}`,
          createdBy: currentUser!.id,
          createdByName: currentUser!.name,
        });

        Alert.alert(
          "Success",
          `${selectedVolunteer.firstName} ${selectedVolunteer.lastName} has been converted to a ${ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label}.\n\nLogin credentials:\nEmail: ${selectedVolunteer.email}\nPassword: ${password}\n\nPlease share these credentials with the user.`,
          [
            {
              text: "OK",
              onPress: () => {
                setShowConvertModal(false);
                setSelectedVolunteer(null);
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Error converting volunteer to user:", error);
      Alert.alert("Error", error.message || "Failed to convert volunteer to user");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDeleteVolunteer = (volunteer: VolunteerRecord) => {
    Alert.alert(
      "Delete Volunteer",
      `Are you sure you want to delete ${volunteer.firstName} ${volunteer.lastName} from the volunteer database? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVolunteerRecord(volunteer.id);
              Alert.alert("Success", "Volunteer deleted successfully");
            } catch (error) {
              console.error("Error deleting volunteer:", error);
              Alert.alert("Error", "Failed to delete volunteer");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4F46E5" />
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">Volunteer Database</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Search and Filter */}
      <View className="px-4 py-3 border-b border-gray-200">
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
          placeholder="Search volunteers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable
            onPress={() => setFilterInterest("all")}
            className={`px-3 py-2 rounded-full mr-2 ${
              filterInterest === "all" ? "bg-indigo-600" : "bg-gray-200"
            }`}
          >
            <Text className={`text-sm font-medium ${filterInterest === "all" ? "text-white" : "text-gray-700"}`}>
              All
            </Text>
          </Pressable>
          {Object.entries(INTEREST_LABELS).map(([interest, label]) => (
            <Pressable
              key={interest}
              onPress={() => setFilterInterest(interest as VolunteerInterestArea)}
              className={`px-3 py-2 rounded-full mr-2 ${
                filterInterest === interest ? "bg-indigo-600" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filterInterest === interest ? "text-white" : "text-gray-700"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Volunteer Count */}
      <View className="px-4 py-2 bg-gray-50">
        <Text className="text-sm text-gray-600">
          {filteredVolunteers.length} volunteer{filteredVolunteers.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Volunteer List */}
      <ScrollView className="flex-1 px-4 py-4">
        {filteredVolunteers.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-center mt-4">No volunteers found</Text>
          </View>
        ) : (
          filteredVolunteers.map((volunteer) => (
            <View key={volunteer.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {volunteer.firstName} {volunteer.lastName}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Added {new Date(volunteer.addedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Contact Info */}
              {volunteer.email && (
                <View className="flex-row items-center mb-1">
                  <Ionicons name="mail-outline" size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-700 ml-2">{volunteer.email}</Text>
                </View>
              )}
              {volunteer.phoneNumber && (
                <View className="flex-row items-center mb-2">
                  <Ionicons name="call-outline" size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-700 ml-2">{volunteer.phoneNumber}</Text>
                </View>
              )}

              {/* Interests */}
              <View className="flex-row flex-wrap mb-3">
                {volunteer.interests.map((interest) => (
                  <View key={interest} className="bg-indigo-50 px-2 py-1 rounded mr-2 mb-1">
                    <Text className="text-xs text-indigo-700">{INTEREST_LABELS[interest]}</Text>
                  </View>
                ))}
              </View>

              {/* Monetary Donation Badge */}
              {volunteer.monetaryDonationAmount && (
                <View className="bg-green-50 px-3 py-2 rounded-lg mb-3">
                  <Text className="text-sm font-semibold text-green-700">
                    Monetary Donation: ${volunteer.monetaryDonationAmount.toLocaleString()}
                  </Text>
                </View>
              )}

              {/* Notes */}
              {volunteer.notes && (
                <View className="bg-gray-50 p-2 rounded mb-3">
                  <Text className="text-sm text-gray-700">{volunteer.notes}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row space-x-2">
                <Pressable
                  onPress={() => {
                    setSelectedVolunteer(volunteer);
                    setShowConvertModal(true);
                  }}
                  className="flex-1 bg-indigo-600 py-2 rounded-lg mr-2"
                >
                  <Text className="text-white text-center text-sm font-medium">Convert to User</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDeleteVolunteer(volunteer)}
                  className="bg-red-600 px-4 py-2 rounded-lg"
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                </Pressable>
              </View>
            </View>
          ))
        )}
        <View className="h-8" />
      </ScrollView>

      {/* Convert to User Modal */}
      <Modal
        visible={showConvertModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConvertModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-gray-900 mb-2">Convert to System User</Text>
            <Text className="text-sm text-gray-600 mb-4">
              {selectedVolunteer?.firstName} {selectedVolunteer?.lastName}
            </Text>

            <Text className="text-sm font-medium text-gray-700 mb-3">Select User Role</Text>
            {ROLE_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setSelectedRole(option.value)}
                className={`border rounded-lg p-3 mb-2 ${
                  selectedRole === option.value ? "bg-indigo-50 border-indigo-500" : "border-gray-300"
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                      selectedRole === option.value ? "bg-indigo-600 border-indigo-600" : "border-gray-400"
                    }`}
                  >
                    {selectedRole === option.value && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900">{option.label}</Text>
                    <Text className="text-xs text-gray-600">{option.description}</Text>
                  </View>
                </View>
              </Pressable>
            ))}

            {!selectedVolunteer?.email && (
              <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <Text className="text-sm text-amber-800">
                  ⚠️ This volunteer does not have an email address. An email is required to create a user account.
                </Text>
              </View>
            )}

            <View className="flex-row space-x-2 mt-4">
              <Pressable
                onPress={() => {
                  setShowConvertModal(false);
                  setSelectedVolunteer(null);
                }}
                disabled={isConverting}
                className="flex-1 bg-gray-300 py-3 rounded-lg mr-2"
              >
                <Text className="text-gray-800 text-center font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConvertToUser}
                disabled={isConverting || !selectedVolunteer?.email}
                className={`flex-1 py-3 rounded-lg ${
                  isConverting || !selectedVolunteer?.email ? "bg-gray-400" : "bg-indigo-600"
                }`}
              >
                <Text className="text-white text-center font-semibold">
                  {isConverting ? "Converting..." : "Convert"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
