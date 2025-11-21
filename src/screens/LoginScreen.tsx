import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useAuthStore, useCurrentUser } from "../state/authStore";
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
  const currentUser = useCurrentUser();
  const invitedUsers = useUsersStore((s) => s.invitedUsers);

  // Access code to user mapping
  const accessCodeMap: { [key: string]: string } = {
    "12345": "debs@7more.net",
  };

  const handleCodeLogin = async () => {
    if (!accessCode) return;

    setIsLoading(true);
    clearError();

    // Wait a moment for users to load if needed
    let attempts = 0;
    while (invitedUsers.length === 0 && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    const userEmail = accessCodeMap[accessCode];
    if (!userEmail) {
      useAuthStore.setState({ loginError: "Invalid access code. Please try again." });
      setIsLoading(false);
      return;
    }

    const user = invitedUsers.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
    if (!user) {
      useAuthStore.setState({ loginError: "User account not found. Please try again or contact admin." });
      setIsLoading(false);
      return;
    }

    setUser({
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      email: user.email,
      role: user.role,
      roles: user.roles,
      requiresPasswordChange: user.requiresPasswordChange,
    });

    setIsLoading(false);
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
