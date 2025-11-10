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
  ActivityIndicator,
  Clipboard,
} from "react-native";
import { useUsersStore } from "../state/usersStore";
import { useCurrentUser } from "../state/authStore";
import { UserRole } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { generatePasswordFromName, sendWelcomeEmail } from "../services/emailService";
import { sendWelcomeSMS } from "../services/smsService";

export default function AddUserScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("bridge_team");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const addUser = useUsersStore((s) => s.addUser);
  const getUserByEmail = useUsersStore((s) => s.getUserByEmail);
  const currentUser = useCurrentUser();

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
      value: "board_member",
      label: "Board Member",
      description: "View scheduler, tasks, and monthly reporting analytics",
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

  const handleSubmit = async () => {
    console.log("📝 AddUser form submitted");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Nickname:", nickname);
    console.log("Phone:", phone);

    // Validation
    if (!name.trim() || !email.trim()) {
      console.log("❌ Validation failed: Missing name or email");
      setErrorMessage("Please fill in all required fields.");
      setShowErrorModal(true);
      return;
    }

    if (!email.includes("@")) {
      console.log("❌ Validation failed: Invalid email");
      setErrorMessage("Please enter a valid email address.");
      setShowErrorModal(true);
      return;
    }

    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      console.log("❌ User already exists:", email);
      setErrorMessage("A user with this email already exists.");
      setShowErrorModal(true);
      return;
    }

    console.log("✅ Validation passed, creating user...");
    setIsLoading(true);

    try {
      // Generate password from name (first initial + last name)
      const generatedPassword = generatePasswordFromName(name.trim());

      const nicknameValue = nickname.trim() || undefined;
      const phoneValue = phone.trim() || undefined;

      console.log("Calling addUser with nickname:", nicknameValue);
      console.log("Calling addUser with phone:", phoneValue);

      // Add the user
      const result = await addUser(
        name.trim(),
        email.trim(),
        selectedRole,
        generatedPassword,
        currentUser?.id || "system",
        phoneValue,
        nicknameValue
      );

      if (result.success) {
        setGeneratedPassword(result.password);

        // Try to send welcome email
        const emailResult = await sendWelcomeEmail(
          email.trim(),
          name.trim(),
          result.password,
          "7more",
          "https://7more.org/app"
        );

        setEmailSent(emailResult.success);

        // Try to send welcome SMS if phone number provided
        if (phone.trim()) {
          const smsResult = await sendWelcomeSMS(
            phone.trim(),
            name.trim(),
            result.password,
            "https://7more.org/app"
          );
          setSmsSent(smsResult.success);
        }

        setShowSuccessModal(true);
      }
    } catch (error) {
      setErrorMessage("Failed to create user. Please try again.");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPasswordToClipboard = () => {
    Clipboard.setString(generatedPassword);
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
          <Text className="text-3xl font-bold text-white mb-2">Add New User</Text>
          <Text className="text-yellow-100 text-base">Create a new staff account</Text>
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

          {/* Nickname */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Nickname (Optional)
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Johnny"
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="words"
            />
            <Text className="text-xs text-gray-500 mt-2">
              If provided, will be displayed alongside full name
            </Text>
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
            <Text className="text-xs text-gray-500 mt-2">
              A password will be automatically generated based on their name (first initial + last name).
            </Text>
          </View>

          {/* Phone Number */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </Text>
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
              <Text className="text-white text-base font-bold">Create User Account</Text>
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
              <Text className="text-xl font-bold text-gray-900 mb-2">User Added!</Text>
              <Text className="text-center text-gray-600 mb-4">
                {name} has been successfully invited to the platform.
              </Text>

              {/* Email Status */}
              {emailSent ? (
                <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 w-full">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="mail" size={16} color="#10B981" />
                    <Text className="text-green-800 font-semibold ml-2">Email Sent</Text>
                  </View>
                  <Text className="text-green-700 text-xs">
                    Welcome email with login credentials sent to {email}
                  </Text>
                </View>
              ) : (
                <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3 w-full">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="warning" size={16} color="#F59E0B" />
                    <Text className="text-yellow-800 font-semibold ml-2">Email Not Configured</Text>
                  </View>
                  <Text className="text-yellow-700 text-xs mb-2">
                    Please share the password with the user manually.
                  </Text>
                </View>
              )}

              {/* SMS Status */}
              {phone && (
                smsSent ? (
                  <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 w-full">
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="chatbubble" size={16} color="#10B981" />
                      <Text className="text-green-800 font-semibold ml-2">SMS Sent</Text>
                    </View>
                    <Text className="text-green-700 text-xs">
                      Welcome text with app link sent to {phone}
                    </Text>
                  </View>
                ) : (
                  <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 w-full">
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="warning" size={16} color="#F59E0B" />
                      <Text className="text-yellow-800 font-semibold ml-2">SMS Not Configured</Text>
                    </View>
                    <Text className="text-yellow-700 text-xs">
                      Configure Twilio in ENV tab to send welcome texts.
                    </Text>
                  </View>
                )
              )}

              {/* Password Display */}
              <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 w-full">
                <Text className="text-gray-700 font-semibold mb-2 text-center">
                  Generated Password
                </Text>
                <View className="bg-white border border-gray-300 rounded-lg p-3 mb-3">
                  <Text className="text-gray-900 font-mono text-center" selectable>
                    {generatedPassword}
                  </Text>
                </View>
                <Pressable
                  onPress={copyPasswordToClipboard}
                  className="bg-gray-600 rounded-lg py-2 items-center active:opacity-80"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="copy-outline" size={16} color="white" />
                    <Text className="text-white text-sm font-semibold ml-2">Copy Password</Text>
                  </View>
                </Pressable>
              </View>

              <Text className="text-xs text-gray-500 text-center">
                Users can change their password anytime from their account settings.
              </Text>
            </View>

            <Pressable
              onPress={() => {
                setShowSuccessModal(false);
                setName("");
                setNickname("");
                setEmail("");
                setPhone("");
                setGeneratedPassword("");
                setEmailSent(false);
                setSmsSent(false);
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
