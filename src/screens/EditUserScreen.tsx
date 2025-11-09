import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useUsersStore } from "../state/usersStore";
import { useCurrentUser } from "../state/authStore";
import { UserRole } from "../types";
import { Ionicons } from "@expo/vector-icons";

export default function EditUserScreen({ navigation, route }: any) {
  const { userId } = route.params;
  const getUserById = useUsersStore((s) => s.getUserById);
  const updateUser = useUsersStore((s) => s.updateUser);
  const currentUser = useCurrentUser();

  const user = getUserById(userId);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("bridge_team");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setSelectedRole(user.role);
    }
  }, [user]);

  const roles: { value: UserRole; label: string; description: string }[] = [
    {
      value: "admin",
      label: "Admin",
      description: "Full access to all features and user management",
    },
    {
      value: "bridge_team",
      label: "Bridge Team",
      description: "Initial contact and participant processing",
    },
    {
      value: "mentorship_leader",
      label: "Mentorship Leader",
      description: "Assign participants to mentors and manage shifts",
    },
    {
      value: "mentor",
      label: "Mentor",
      description: "Direct participant engagement and updates",
    },
    {
      value: "volunteer",
      label: "Lead Volunteer",
      description: "Can sign up for any available shift",
    },
    {
      value: "volunteer_support",
      label: "Support Volunteer",
      description: "Can only sign up for support volunteer shifts",
    },
  ];

  const handleCallPhone = () => {
    if (phone) {
      const phoneNumber = phone.replace(/[^0-9]/g, "");
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleTextPhone = () => {
    if (phone) {
      const phoneNumber = phone.replace(/[^0-9]/g, "");
      Linking.openURL(`sms:${phoneNumber}`);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim() || !email.trim()) {
      setErrorMessage("Please fill in all required fields.");
      setShowErrorModal(true);
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      await updateUser(userId, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role: selectedRole,
      });

      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage("Failed to update user. Please try again.");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-600">User not found</Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-gray-600 underline">Go Back</Text>
        </Pressable>
      </View>
    );
  }

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
          <Text className="text-3xl font-bold text-white mb-2">Edit User</Text>
          <Text className="text-yellow-100 text-base">Update user information</Text>
        </View>

        <View className="px-6 pt-6">
          {/* Full Name */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Full Name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Email Address <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="john.doe@7more.org"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          {/* Phone Number */}
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold text-gray-700">
                Phone Number
              </Text>
              {phone && (
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={handleCallPhone}
                    className="bg-green-100 px-3 py-1 rounded-lg flex-row items-center active:opacity-70"
                  >
                    <Ionicons name="call" size={14} color="#10B981" />
                    <Text className="text-green-700 text-xs font-semibold ml-1">Call</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleTextPhone}
                    className="bg-blue-100 px-3 py-1 rounded-lg flex-row items-center active:opacity-70"
                  >
                    <Ionicons name="chatbubble" size={14} color="#3B82F6" />
                    <Text className="text-blue-700 text-xs font-semibold ml-1">Text</Text>
                  </Pressable>
                </View>
              )}
            </View>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="(555) 123-4567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Text className="text-xs text-gray-500 mt-2">
              Optional - for sending welcome texts and quick contact
            </Text>
          </View>

          {/* Role Selection */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              User Role <Text className="text-red-500">*</Text>
            </Text>
            <View className="gap-3">
              {roles.map((role) => (
                <Pressable
                  key={role.value}
                  onPress={() => setSelectedRole(role.value)}
                  className={`border-2 rounded-xl px-4 py-4 ${
                    selectedRole === role.value
                      ? "bg-gray-50 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      className={`text-base font-semibold ${
                        selectedRole === role.value ? "text-yellow-600" : "text-gray-900"
                      }`}
                    >
                      {role.label}
                    </Text>
                    {selectedRole === role.value && (
                      <View className="w-5 h-5 bg-gray-600 rounded-full items-center justify-center">
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-gray-500">{role.description}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            className={`rounded-xl py-4 items-center mb-4 ${
              isLoading ? "bg-gray-400" : "bg-gray-600 active:opacity-80"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-bold">Save Changes</Text>
            )}
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

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="checkmark-circle" size={40} color="#10B981" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">User Updated!</Text>
              <Text className="text-center text-gray-600 mb-4">
                {name} has been successfully updated.
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
                <Ionicons name="alert-circle" size={40} color="#EF4444" />
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
