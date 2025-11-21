import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useAuthStore, useCurrentUser } from "../state/authStore";
import { useUsersStore } from "../state/usersStore";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const loginError = useAuthStore((s) => s.loginError);
  const clearError = useAuthStore((s) => s.clearError);
  const currentUser = useCurrentUser();
  const invitedUsers = useUsersStore((s) => s.invitedUsers);

  // Try direct fetch if users haven't loaded after 3 seconds
  useEffect(() => {
    const timer = setTimeout(async () => {
      const currentCount = useUsersStore.getState().invitedUsers.length;
      if (currentCount === 0) {
        console.log("⚠️ Users not loaded after 3 seconds, trying direct fetch...");
        try {
          await useUsersStore.getState().fetchUsersDirectly();
        } catch (error) {
          console.error("❌ Direct fetch failed:", error);
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    if (email && password) {
      setIsLoading(true);

      // If users still haven't loaded, wait a bit and try direct fetch
      let currentUsers = useUsersStore.getState().invitedUsers;
      if (currentUsers.length === 0) {
        console.log("⚠️ Attempting login with 0 users, trying direct fetch first...");
        try {
          await useUsersStore.getState().fetchUsersDirectly();
          // Wait a moment for state to update
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error("❌ Direct fetch failed during login:", error);
        }
      }

      const result = await login(email, password);
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
          <View className="mb-12">
            <Text className="text-4xl font-bold text-[#fcc85c] mb-2">Welcome</Text>
            <Text className="text-lg text-[#99896c]">Sign in to continue helping participants</Text>
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#3c3832] mb-2">Email</Text>
            <TextInput
              className="bg-[#f8f8f8] border border-[#d7d7d6] rounded-xl px-4 py-4 text-base"
              placeholder="your.email@organization.org"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-[#3c3832] mb-2">Password</Text>
            <TextInput
              className="bg-[#f8f8f8] border border-[#d7d7d6] rounded-xl px-4 py-4 text-base"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (loginError) clearError();
              }}
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
              returnKeyType="go"
            />
          </View>

          {/* Error Message */}
          {loginError && (
            <View className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <Text className="text-red-800 text-sm">{loginError}</Text>
            </View>
          )}

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading || !email || !password}
            className={`rounded-xl py-4 items-center mb-4 ${
              isLoading || !email || !password
                ? "bg-[#d7d7d6]"
                : "bg-[#405b69] active:opacity-80"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-semibold">Sign In</Text>
            )}
          </Pressable>

          {/* Help Text */}
          <Text className="text-center text-sm text-[#99896c]">
            {"Don't have an account? Contact your admin to get invited."}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
