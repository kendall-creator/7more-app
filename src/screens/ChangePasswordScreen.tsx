import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useCurrentUser, useAuthStore } from "../state/authStore";
import { useUsersStore } from "../state/usersStore";
import { Ionicons } from "@expo/vector-icons";

export default function ChangePasswordScreen({ navigation }: any) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = useCurrentUser();
  const changePassword = useUsersStore((s) => s.changePassword);
  const validateCredentials = useUsersStore((s) => s.validateCredentials);
  const setUser = useAuthStore((s) => s.setUser);

  const handleChangePassword = async () => {
    setError("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (!currentUser) {
      setError("User not found. Please log in again.");
      return;
    }

    // Verify current password
    const validUser = validateCredentials(currentUser.email, currentPassword);
    if (!validUser) {
      setError("Current password is incorrect.");
      return;
    }

    setIsLoading(true);

    try {
      // Change password
      await changePassword(currentUser.id, newPassword);

      // Update current user to remove requiresPasswordChange flag
      const updatedUser = {
        ...currentUser,
        requiresPasswordChange: false,
      };
      setUser(updatedUser);

      // Navigate to main app
      navigation.replace("MainTabs");
    } catch (err) {
      setError("Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-yellow-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="key" size={40} color="#F59E0B" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Change Password</Text>
            <Text className="text-center text-gray-600">
              For security reasons, you must change your temporary password before continuing.
            </Text>
          </View>

          {/* Current Password */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Current Password</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* New Password */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">New Password</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="At least 6 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Confirm New Password */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Confirm New Password</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={handleChangePassword}
              returnKeyType="done"
            />
          </View>

          {/* Error Message */}
          {error ? (
            <View className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <Text className="text-red-800 text-sm">{error}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <Pressable
            onPress={handleChangePassword}
            disabled={isLoading}
            className={`rounded-xl py-4 items-center mb-4 ${
              isLoading ? "bg-gray-300" : "bg-gray-600 active:opacity-80"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-semibold">Change Password</Text>
            )}
          </Pressable>

          {/* Security Tips */}
          <View className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Password Tips:</Text>
            <Text className="text-xs text-gray-600 mb-1">• Use at least 6 characters</Text>
            <Text className="text-xs text-gray-600 mb-1">• Include numbers and symbols</Text>
            <Text className="text-xs text-gray-600">• Do not reuse old passwords</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
