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

  const handleLogin = async () => {
    if (email && password) {
      setIsLoading(true);

      // Debug logging
      console.log("===========================================");
      console.log("🔐 LOGIN ATTEMPT");
      console.log("===========================================");
      console.log(`Email entered: "${email}"`);
      console.log(`Password entered: "${password}"`);

      // Check current users count
      let currentUsers = useUsersStore.getState().invitedUsers;
      console.log(`Users loaded: ${currentUsers.length}`);

      // Wait for users to load if needed
      let attempts = 0;
      while (currentUsers.length === 0 && attempts < 10) {
        console.log(`⏳ Waiting for users to load... attempt ${attempts + 1}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        currentUsers = useUsersStore.getState().invitedUsers;
        attempts++;
      }

      console.log(`✅ Final user count: ${currentUsers.length}`);

      // FALLBACK: If users failed to load but credentials match known users, allow login
      if (currentUsers.length === 0) {
        console.log("❌ Users failed to load - attempting fallback authentication");

        // Define fallback users for emergency login when Firebase won't connect
        const fallbackUsers = [
          { email: "mlowry@7more.net", password: "mlowry", name: "Madi Lowry", role: "bridge_team_leader", id: "user_madi_fallback" },
          { email: "kendall@7more.net", password: "7moreHouston!", name: "Kendall", role: "admin", id: "admin_default" },
          { email: "pauljalfaro@hotmail.com", password: "palfaro", name: "Paul Alfaro", role: "mentorship_leader", id: "user_paul" },
        ];

        const fallbackUser = fallbackUsers.find(
          u => u.email.toLowerCase() === email.toLowerCase().trim() &&
               (u.password === password || u.password.trim() === password.trim())
        );

        if (fallbackUser) {
          console.log(`✅ Fallback authentication successful for: ${fallbackUser.name}`);
          // Manually set the user
          useAuthStore.getState().setUser({
            id: fallbackUser.id,
            name: fallbackUser.name,
            email: fallbackUser.email,
            role: fallbackUser.role as any,
          });
          setIsLoading(false);
          return;
        } else {
          console.log("❌ Fallback authentication failed - credentials don't match any fallback users");
          setIsLoading(false);
          useAuthStore.getState().loginError = "Unable to connect to server. Please check your internet connection and try again.";
          return;
        }
      }

      // Log all available users for debugging
      console.log("Available users:");
      currentUsers.forEach(u => console.log(`  - ${u.email} (${u.name})`));

      // Try login
      const result = await login(email, password);
      console.log(`Login result: ${result ? "SUCCESS" : "FAILED"}`);

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
