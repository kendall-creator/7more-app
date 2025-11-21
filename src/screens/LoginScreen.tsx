import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useAuthStore, useCurrentUser } from "../state/authStore";
import { useUsersStore } from "../state/usersStore";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usersReady, setUsersReady] = useState(false);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const login = useAuthStore((s) => s.login);
  const loginError = useAuthStore((s) => s.loginError);
  const clearError = useAuthStore((s) => s.clearError);
  const currentUser = useCurrentUser();
  const invitedUsers = useUsersStore((s) => s.invitedUsers);

  // Wait for users to load before allowing login
  useEffect(() => {
    console.log("🔄 LoginScreen mounted - waiting for users to load");
    console.log(`Current users loaded: ${invitedUsers.length}`);

    const waitForUsers = async () => {
      let attempts = 0;
      let currentCount = useUsersStore.getState().invitedUsers.length;

      // Wait up to 30 seconds for users to load (60 attempts x 500ms)
      while (currentCount === 0 && attempts < 60) {
        if (attempts % 10 === 0) {
          console.log(`⏳ Still waiting for users... ${attempts * 0.5} seconds elapsed`);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        currentCount = useUsersStore.getState().invitedUsers.length;
        attempts++;
      }

      if (currentCount > 0) {
        console.log(`✅ Users loaded successfully: ${currentCount} users`);
        setUsersReady(true);
        setShowConnectionError(false);
      } else {
        // Try direct fetch as last resort
        console.log("⚠️  No users loaded after 30 seconds, trying direct fetch...");
        try {
          await useUsersStore.getState().fetchUsersDirectly();
          currentCount = useUsersStore.getState().invitedUsers.length;
          if (currentCount > 0) {
            console.log(`✅ Direct fetch successful: ${currentCount} users loaded`);
            setUsersReady(true);
            setShowConnectionError(false);
          } else {
            console.error("❌ Users still not loaded after direct fetch");
            setUsersReady(false);
            setShowConnectionError(true);
          }
        } catch (error) {
          console.error("❌ Direct fetch failed:", error);
          setUsersReady(false);
          setShowConnectionError(true);
        }
      }
    };

    waitForUsers();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      console.log("❌ Login blocked: email or password empty");
      return;
    }

    // Allow login even if usersReady is false (emergency fallback will handle it)
    console.log(`🚀 handleLogin called - usersReady: ${usersReady}`);

    try {
      setIsLoading(true);
      console.log("===========================================");
      console.log("🔐 LOGIN ATTEMPT");
      console.log("===========================================");
      console.log(`Email: ${email}`);
      console.log(`Users ready: ${usersReady}`);

      const result = await login(email, password);
      console.log(`Login result: ${result ? "SUCCESS" : "FAILED"}`);

      setIsLoading(false);
    } catch (error) {
      console.error("❌ Login exception:", error);
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
          {/* Connection Error Warning */}
          {showConnectionError && (
            <View className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-4">
              <Text className="text-red-800 text-base font-bold mb-2">⚠️ Connection Error</Text>
              <Text className="text-red-700 text-sm mb-3">
                Cannot connect to server. This app requires an internet connection.
              </Text>
              <Text className="text-red-700 text-sm font-semibold">To fix this:</Text>
              <Text className="text-red-700 text-sm">
                1. Check your internet connection{"\n"}
                2. Close this browser tab{"\n"}
                3. Open a new tab with the app link{"\n"}
                4. Wait 10-15 seconds before trying to login
              </Text>
            </View>
          )}

          {/* Loading Message */}
          {!usersReady && !showConnectionError && (
            <View className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <ActivityIndicator size="small" color="#405b69" />
                <Text className="text-blue-800 text-base font-bold ml-2">Loading...</Text>
              </View>
              <Text className="text-blue-700 text-sm">
                Connecting to server, please wait...
              </Text>
            </View>
          )}

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

          {/* Debug Button - Development Only */}
          <Pressable
            onPress={() => navigation.navigate("DebugUsers")}
            className="mt-4 py-2"
          >
            <Text className="text-center text-xs text-gray-400">Debug: View All Users</Text>
          </Pressable>

          {/* Diagnostics Button */}
          <Pressable
            onPress={() => navigation.navigate("Diagnostics")}
            className="py-2"
          >
            <Text className="text-center text-xs text-gray-400">Run Connection Diagnostics</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
