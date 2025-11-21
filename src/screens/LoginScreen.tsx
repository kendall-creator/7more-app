import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useAuthStore } from "../state/authStore";
import { useUsersStore } from "../state/usersStore";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCodeLogin, setShowCodeLogin] = useState(false);
  const login = useAuthStore((s) => s.login);
  const loginError = useAuthStore((s) => s.loginError);
  const clearError = useAuthStore((s) => s.clearError);
  const setUser = useAuthStore((s) => s.setUser);
  // Don't subscribe to currentUser or invitedUsers - we fetch them directly when needed

  // Access code to user mapping
  const accessCodeMap: { [key: string]: string } = {
    "12345": "debs@7more.net",
  };

  const handleCodeLogin = async () => {
    if (!accessCode) return;

    setIsLoading(true);
    clearError();

    try {
      // Check if access code is valid first
      const userEmail = accessCodeMap[accessCode];
      if (!userEmail) {
        useAuthStore.setState({ loginError: "Invalid access code. Please check and try again." });
        setIsLoading(false);
        return;
      }

      // Get users directly from store
      let currentUsers = useUsersStore.getState().invitedUsers;
      console.log(`🔑 Code login: Starting with ${currentUsers.length} users loaded`);

      // Wait up to 20 seconds for users to load (extended for slow networks)
      let attempts = 0;
      const maxAttempts = 40; // 40 * 500ms = 20 seconds
      while (currentUsers.length === 0 && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        currentUsers = useUsersStore.getState().invitedUsers;
        attempts++;

        if (attempts % 10 === 0) {
          console.log(`   Still waiting... (${attempts * 0.5}s elapsed)`);
        }
      }

      console.log(`🔑 After waiting: ${currentUsers.length} users loaded`);

      if (currentUsers.length === 0) {
        useAuthStore.setState({
          loginError: "Unable to load user data. Please check your connection and try again."
        });
        setIsLoading(false);
        return;
      }

      // Find user by email (case-insensitive)
      const user = currentUsers.find(u =>
        u.email.toLowerCase().trim() === userEmail.toLowerCase().trim()
      );

      if (!user) {
        console.error(`❌ User not found: ${userEmail}`);
        console.error(`   Available users:`, currentUsers.map(u => u.email));
        useAuthStore.setState({
          loginError: `Unable to find user account for ${userEmail}. ${currentUsers.length} users available. Please contact support.`
        });
        setIsLoading(false);
        return;
      }

      console.log(`✅ User found: ${user.name} (${user.email})`);

      // Login user
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
      setIsLoading(false);
    } catch (error: any) {
      console.error("❌ Error during code login:", error);
      useAuthStore.setState({
        loginError: "An error occurred during login. Please try again."
      });
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (email && password) {
      setIsLoading(true);
      await login(email, password);
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
