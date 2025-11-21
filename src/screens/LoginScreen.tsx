import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useAuthStore, useCurrentUser } from "../state/authStore";
import { useUsersStore } from "../state/usersStore";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCodeLogin, setShowCodeLogin] = useState(false);
  const [debugMessage, setDebugMessage] = useState("");
  const login = useAuthStore((s) => s.login);
  const loginError = useAuthStore((s) => s.loginError);
  const clearError = useAuthStore((s) => s.clearError);
  const setUser = useAuthStore((s) => s.setUser);
  const currentUser = useCurrentUser();
  const invitedUsers = useUsersStore((s) => s.invitedUsers);

  // Access code to user mapping
  const accessCodeMap: { [key: string]: string } = {
    "12345": "madi@7more.net",
  };

  const handleCodeLogin = async () => {
    setDebugMessage("Button pressed! Starting login...");
    console.log("\n🔐 CODE LOGIN ATTEMPT:");
    console.log(`  Access Code: ${accessCode}`);

    if (!accessCode) {
      console.log("❌ Missing access code");
      setDebugMessage("Error: No access code entered");
      return;
    }

    setDebugMessage(`Checking code: ${accessCode}`);
    setIsLoading(true);

    try {
      // Check if code is valid
      const userEmail = accessCodeMap[accessCode];
      if (!userEmail) {
        console.log("❌ Invalid access code");
        setDebugMessage("Invalid code!");
        useAuthStore.setState({ loginError: "Invalid access code. Please try again." });
        setIsLoading(false);
        return;
      }

      setDebugMessage(`Valid code! Loading user: ${userEmail}`);
      console.log(`✅ Valid code for: ${userEmail}`);

      // Wait for users to load if needed
      let currentUsers = useUsersStore.getState().invitedUsers;
      setDebugMessage(`Users loaded: ${currentUsers.length}`);
      console.log(`  Current users loaded: ${currentUsers.length}`);

      if (currentUsers.length === 0) {
        setDebugMessage("No users loaded, fetching from server...");
        console.log("⚠️ No users loaded, fetching directly...");
        try {
          await useUsersStore.getState().fetchUsersDirectly();
          await new Promise(resolve => setTimeout(resolve, 500));
          currentUsers = useUsersStore.getState().invitedUsers;
          setDebugMessage(`Fetched ${currentUsers.length} users`);
          console.log(`  Users after fetch: ${currentUsers.length}`);
        } catch (fetchError) {
          console.error("❌ Direct fetch failed:", fetchError);
          setDebugMessage("Failed to load users!");
          useAuthStore.setState({ loginError: "Unable to load user data. Please try again." });
          setIsLoading(false);
          return;
        }
      }

      // Find the user
      setDebugMessage(`Looking for user: ${userEmail}`);
      const user = currentUsers.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
      if (!user) {
        console.log("❌ User not found in database");
        setDebugMessage("User not found in database!");
        useAuthStore.setState({ loginError: "User account not found. Please contact admin." });
        setIsLoading(false);
        return;
      }

      setDebugMessage(`Found user: ${user.name}! Logging in...`);
      console.log(`✅ User found: ${user.name}`);

      // Log them in directly
      setDebugMessage("Setting user and logging in...");
      setUser({
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        roles: user.roles,
        requiresPasswordChange: user.requiresPasswordChange,
      });

      console.log("✅ Code login successful!");
      setDebugMessage("Login successful! Redirecting...");
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Code login error:", error);
      setDebugMessage(`Error: ${error}`);
      useAuthStore.setState({ loginError: "Login failed. Please try again." });
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      console.log("\n🔐 LOGIN ATTEMPT:");
      console.log(`  Email: ${email}`);
      console.log(`  Password length: ${password.length}`);
      console.log(`  Users loaded: ${invitedUsers.length}`);

      if (!email || !password) {
        console.log("❌ Missing email or password");
        return;
      }

      setIsLoading(true);

      // If no users loaded, try direct fetch immediately
      if (invitedUsers.length === 0) {
        console.log("⚠️ No users loaded, fetching directly...");
        try {
          await useUsersStore.getState().fetchUsersDirectly();
          console.log(`  Users after fetch: ${useUsersStore.getState().invitedUsers.length}`);
        } catch (fetchError) {
          console.error("❌ Direct fetch failed:", fetchError);
        }
      }

      console.log("🔄 Calling login function...");
      const result = await login(email, password);
      console.log(`  Login result: ${result ? "SUCCESS" : "FAILED"}`);
    } catch (error) {
      console.error("❌ Login error:", error);
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
          <View className="mb-12">
            <Text className="text-4xl font-bold text-[#fcc85c] mb-2">Welcome</Text>
            <Text className="text-lg text-[#99896c]">Sign in to continue helping participants</Text>
          </View>

          {showCodeLogin ? (
            // CODE LOGIN
            <>
              {/* Access Code Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-[#3c3832] mb-2">Access Code</Text>
                <TextInput
                  className="bg-[#f8f8f8] border border-[#d7d7d6] rounded-xl px-4 py-4 text-base text-center text-2xl tracking-widest"
                  placeholder="Enter code"
                  value={accessCode}
                  onChangeText={(text) => {
                    setAccessCode(text);
                    if (loginError) clearError();
                  }}
                  keyboardType="number-pad"
                  maxLength={5}
                  autoCapitalize="none"
                  onSubmitEditing={handleCodeLogin}
                  returnKeyType="go"
                />
              </View>

              {/* Debug Message */}
              {debugMessage && (
                <View className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                  <Text className="text-yellow-900 text-xs font-mono">{debugMessage}</Text>
                </View>
              )}

              {/* Error Message */}
              {loginError && (
                <View className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <Text className="text-red-800 text-sm">{loginError}</Text>
                </View>
              )}

              {/* Code Login Button */}
              <Pressable
                onPress={handleCodeLogin}
                disabled={isLoading || !accessCode}
                className={`rounded-xl py-4 items-center mb-4 ${
                  isLoading || !accessCode
                    ? "bg-[#d7d7d6]"
                    : "bg-[#405b69] active:opacity-80"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-base font-semibold">Sign In with Code</Text>
                )}
              </Pressable>

              {/* Switch to email login */}
              <Pressable onPress={() => setShowCodeLogin(false)} className="py-2">
                <Text className="text-center text-sm text-[#405b69] underline">
                  Use email and password instead
                </Text>
              </Pressable>
            </>
          ) : (
            // EMAIL/PASSWORD LOGIN
            <>
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

              {/* Switch to code login */}
              <Pressable onPress={() => setShowCodeLogin(true)} className="py-2 mb-4">
                <Text className="text-center text-sm text-[#405b69] underline">
                  Have an access code? Click here
                </Text>
              </Pressable>

              {/* Help Text */}
              <Text className="text-center text-sm text-[#99896c]">
                {"Don't have an account? Contact your admin to get invited."}
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
