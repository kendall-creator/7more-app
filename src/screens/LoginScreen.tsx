import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useAuthStore, useCurrentUser } from "../state/authStore";
import { useUsersStore } from "../state/usersStore";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usersReady, setUsersReady] = useState(false);
  const login = useAuthStore((s) => s.login);
  const loginError = useAuthStore((s) => s.loginError);
  const clearError = useAuthStore((s) => s.clearError);
  const currentUser = useCurrentUser();
  const invitedUsers = useUsersStore((s) => s.invitedUsers);

  // Monitor when users are loaded
  useEffect(() => {
    console.log(`📊 LoginScreen: Users count = ${invitedUsers.length}`);
    if (invitedUsers.length > 0) {
      setUsersReady(true);
      console.log("✅ LoginScreen: Users are ready for login");
    }
  }, [invitedUsers.length]);

  const handleLogin = async () => {
    console.log("\n🔐 LOGIN ATTEMPT:");
    console.log(`  Email: ${email}`);
    console.log(`  Password length: ${password.length}`);
    console.log(`  Users loaded: ${invitedUsers.length}`);
    console.log(`  Users ready: ${usersReady}`);

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return;
    }

    // Wait for users to load if they haven't yet
    if (invitedUsers.length === 0) {
      console.log("⚠️ No users loaded yet, waiting 2 seconds...");
      setIsLoading(true);

      // Wait up to 2 seconds for users to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      const currentCount = useUsersStore.getState().invitedUsers.length;
      console.log(`  Users after wait: ${currentCount}`);

      if (currentCount === 0) {
        console.log("❌ Still no users after waiting - trying direct fetch");
        try {
          await useUsersStore.getState().fetchUsersDirectly();
          await new Promise(resolve => setTimeout(resolve, 500));
          const finalCount = useUsersStore.getState().invitedUsers.length;
          console.log(`  Users after direct fetch: ${finalCount}`);
        } catch (error) {
          console.error("❌ Direct fetch failed:", error);
        }
      }
    }

    setIsLoading(true);
    console.log("🔄 Calling login function...");
    const result = await login(email, password);
    console.log(`  Login result: ${result ? "SUCCESS" : "FAILED"}`);
    setIsLoading(false);
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

          {/* Loading indicator when users aren't ready */}
          {!usersReady && (
            <View className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex-row items-center">
              <ActivityIndicator size="small" color="#2563eb" />
              <Text className="text-blue-800 text-sm ml-3">Connecting to server...</Text>
            </View>
          )}

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
