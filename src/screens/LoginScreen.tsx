import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useAuthStore, useCurrentUser } from "../state/authStore";
import { useUsersStore } from "../state/usersStore";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const login = useAuthStore((s) => s.login);
  const loginError = useAuthStore((s) => s.loginError);
  const clearError = useAuthStore((s) => s.clearError);
  const currentUser = useCurrentUser();
  const invitedUsers = useUsersStore((s) => s.invitedUsers);

  // Force refresh Firebase listeners when login screen mounts
  useEffect(() => {
    console.log("🔄 LoginScreen mounted - checking Firebase connection");
    console.log(`Current users loaded: ${invitedUsers.length}`);

    // If no users loaded after 5 seconds, show connection error
    const checkTimer = setTimeout(async () => {
      const currentCount = useUsersStore.getState().invitedUsers.length;
      if (currentCount === 0) {
        console.log("⚠️  No users loaded after 5 seconds, trying direct fetch...");
        try {
          await useUsersStore.getState().fetchUsersDirectly();
          const newCount = useUsersStore.getState().invitedUsers.length;
          if (newCount > 0) {
            console.log(`✅ Direct fetch successful: ${newCount} users loaded`);
            setShowConnectionError(false);
          } else {
            console.log("❌ Direct fetch returned 0 users - showing connection error");
            setShowConnectionError(true);
          }
        } catch (error) {
          console.error("❌ Direct fetch failed:", error);
          setShowConnectionError(true);
        }
      } else {
        console.log(`✅ Users successfully loaded: ${currentCount} users`);
        setShowConnectionError(false);
      }
    }, 5000);

    return () => clearTimeout(checkTimer);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    console.log("🚀 handleLogin CALLED");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

    // Wrap entire login in a timeout to prevent infinite spinning
    const loginTimeout = setTimeout(() => {
      console.error("❌ LOGIN TIMEOUT - 15 seconds elapsed");
      setIsLoading(false);
      clearError();
      useAuthStore.setState({
        loginError: "Login timeout. Please try again or contact support.",
        isAuthenticated: false,
        currentUser: null
      });
    }, 15000); // 15 second timeout

    try {
      setIsLoading(true);

      console.log("===========================================");
      console.log("🔐 LOGIN ATTEMPT STARTED");
      console.log("===========================================");

      // CRITICAL FIX: Wait for users to load before attempting login
      let currentUsers = useUsersStore.getState().invitedUsers;
      console.log(`Current users loaded: ${currentUsers.length}`);

      // Wait up to 10 seconds for users to load
      let waitAttempts = 0;
      while (currentUsers.length === 0 && waitAttempts < 20) {
        console.log(`⏳ Waiting for users to load... attempt ${waitAttempts + 1}/20`);
        await new Promise(resolve => setTimeout(resolve, 500));
        currentUsers = useUsersStore.getState().invitedUsers;
        waitAttempts++;
      }

      // If users still not loaded, try direct fetch as last resort
      if (currentUsers.length === 0) {
        console.log("⚠️ Users not loaded via listener, attempting direct fetch...");
        try {
          await useUsersStore.getState().fetchUsersDirectly();
          currentUsers = useUsersStore.getState().invitedUsers;
          console.log(`Direct fetch result: ${currentUsers.length} users`);
        } catch (fetchError) {
          console.error("❌ Direct fetch failed:", fetchError);
        }
      }

      if (currentUsers.length === 0) {
        console.error("❌ CRITICAL: Users never loaded after all attempts");
        clearTimeout(loginTimeout);
        setIsLoading(false);
        useAuthStore.setState({
          loginError: "Cannot connect to server. Please check your internet connection and try again. If this persists, delete and reinstall the app.",
          isAuthenticated: false,
          currentUser: null
        });
        return;
      }

      console.log(`✅ Users loaded: ${currentUsers.length} users`);
      console.log(`Available emails:`, currentUsers.map(u => u.email));

      // Now attempt login
      const result = await login(email, password);

      console.log(`✅ Login function returned: ${result ? "SUCCESS" : "FAILED"}`);

      // Clear the timeout since we got a result
      clearTimeout(loginTimeout);

      setIsLoading(false);

      // If successful, navigation will happen automatically via RootNavigator
      if (result) {
        console.log("✅ Login successful - RootNavigator should redirect now");
      } else {
        console.log("❌ Login failed - error message should be visible");
      }

    } catch (error) {
      clearTimeout(loginTimeout);
      console.error("❌ EXCEPTION in handleLogin:", error);
      setIsLoading(false);
      useAuthStore.setState({
        loginError: "An error occurred during login. Please try again.",
        isAuthenticated: false,
        currentUser: null
      });
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
              <Text className="text-red-700 text-sm font-semibold">
                To fix this:
              </Text>
              <Text className="text-red-700 text-sm">
                1. Check your internet connection{"\n"}
                2. Force-close this app completely{"\n"}
                3. Reopen the app{"\n"}
                4. If issue persists, delete and reinstall the app
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
