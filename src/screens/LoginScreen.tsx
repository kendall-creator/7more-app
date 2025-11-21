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
  const [usersReady, setUsersReady] = useState(false);
  const login = useAuthStore((s) => s.login);
  const loginError = useAuthStore((s) => s.loginError);
  const clearError = useAuthStore((s) => s.clearError);
  const setUser = useAuthStore((s) => s.setUser);
  const currentUser = useCurrentUser();
  const invitedUsers = useUsersStore((s) => s.invitedUsers);

  // Wait for users to load from Firebase
  useEffect(() => {
    console.log(`📊 Users loaded count: ${invitedUsers.length}`);

    if (invitedUsers.length > 0) {
      console.log("✅ Users are ready for login");
      setUsersReady(true);
      setDebugMessage(`Ready! ${invitedUsers.length} users loaded.`);
    } else {
      console.log("⏳ Waiting for users to load...");
      setDebugMessage("Loading user data...");

      // Set a timeout to try direct fetch if users don't load within 2 seconds
      const timeout = setTimeout(async () => {
        if (invitedUsers.length === 0) {
          console.log("⚠️ Users still not loaded after 2s, trying direct fetch...");
          setDebugMessage("Connecting to Firebase...");
          try {
            // Create a timeout promise (5 seconds max)
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 5000)
            );

            // Race between fetch and timeout
            await Promise.race([
              useUsersStore.getState().fetchUsersDirectly(),
              timeoutPromise
            ]);

            const users = useUsersStore.getState().invitedUsers;
            if (users.length > 0) {
              setUsersReady(true);
              setDebugMessage(`Ready! ${users.length} users loaded.`);
            } else {
              setDebugMessage("ERROR: Firebase connected but returned 0 users. Check database permissions.");
              setUsersReady(false);
            }
          } catch (error: any) {
            console.error("❌ Direct fetch failed:", error);
            const errorMsg = error?.message || String(error);
            setDebugMessage(`ERROR: Cannot connect to Firebase. ${errorMsg}`);
            setUsersReady(false);
          }
        }
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [invitedUsers.length]);

  // Access code to user mapping
  const accessCodeMap: { [key: string]: string } = {
    "12345": "debs@7more.net",
  };

  // Emergency fallback users (in case Firebase fails to load)
  const fallbackUsers = [
    {
      id: "user_debs_default",
      name: "Deborah Walker",
      nickname: "Debs",
      email: "debs@7more.net",
      role: "admin" as const,
      roles: ["admin" as const],
      requiresPasswordChange: false,
    },
    {
      id: "admin_default",
      name: "Kendall",
      email: "kendall@7more.net",
      role: "admin" as const,
      roles: ["admin" as const],
      requiresPasswordChange: false,
    },
  ];

  const handleCodeLogin = async () => {
    console.log("\n🔐 CODE LOGIN ATTEMPT:");
    console.log(`  Access Code: ${accessCode}`);
    console.log(`  Users ready: ${usersReady}`);
    console.log(`  Users count: ${invitedUsers.length}`);

    if (!accessCode) {
      console.log("❌ Missing access code");
      setDebugMessage("Error: No access code entered");
      return;
    }

    // Always ensure we have users before proceeding
    setIsLoading(true);
    let currentUsers = invitedUsers;

    if (currentUsers.length === 0) {
      setDebugMessage("Loading users from server...");
      console.log("⚠️ No users loaded, fetching directly...");
      try {
        // Create a timeout promise (3 seconds max)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Firebase timeout")), 3000)
        );

        // Race between fetch and timeout
        await Promise.race([
          useUsersStore.getState().fetchUsersDirectly(),
          timeoutPromise
        ]);

        await new Promise(resolve => setTimeout(resolve, 500));
        currentUsers = useUsersStore.getState().invitedUsers;
        console.log(`  Users after fetch: ${currentUsers.length}`);

        if (currentUsers.length === 0) {
          console.log("⚠️ Firebase fetch failed, using fallback users");
          setDebugMessage("Using emergency backup login...");
          currentUsers = fallbackUsers as any;
        } else {
          setDebugMessage(`Loaded ${currentUsers.length} users`);
        }
      } catch (fetchError) {
        console.error("❌ Direct fetch failed or timed out:", fetchError);
        console.log("⚠️ Using fallback users due to error");
        setDebugMessage("Using emergency backup login...");
        currentUsers = fallbackUsers as any;
      }
    }

    // Check if code is valid
    const userEmail = accessCodeMap[accessCode];
    if (!userEmail) {
      console.log("❌ Invalid access code");
      setDebugMessage("Invalid code!");
      useAuthStore.setState({ loginError: "Invalid access code. Please try again." });
      setIsLoading(false);
      return;
    }

    setDebugMessage(`Valid code! Looking for: ${userEmail}`);
    console.log(`✅ Valid code for: ${userEmail}`);

    // Find the user
    const user = currentUsers.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
    if (!user) {
      console.log("❌ User not found in database");
      console.log(`  Available users: ${currentUsers.map(u => u.email).join(", ")}`);
      setDebugMessage(`User ${userEmail} not found!`);
      useAuthStore.setState({ loginError: "User account not found. Please contact admin." });
      setIsLoading(false);
      return;
    }

    setDebugMessage(`Found user: ${user.name}! Logging in...`);
    console.log(`✅ User found: ${user.name}`);

    // Log them in directly
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
    setDebugMessage("Login successful!");
    setIsLoading(false);
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

              {/* Debug Message - Show loading status */}
              {debugMessage && (
                <View className={`mb-4 border rounded-xl px-4 py-3 ${
                  usersReady
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  <Text className={`text-xs font-mono ${
                    usersReady ? "text-green-900" : "text-yellow-900"
                  }`}>{debugMessage}</Text>

                  {/* Manual Refresh Button - always show for debugging */}
                  <Pressable
                    onPress={async () => {
                      setDebugMessage("Testing Firebase connection...");
                      try {
                        // Import Firebase to test connection
                        const { database } = await import("../config/firebase");
                        const { FIREBASE_FALLBACK_CONFIG } = await import("../config/firebase-fallback");

                        if (!database) {
                          setDebugMessage("ERROR: Firebase database is null. Check Firebase config.");
                          setUsersReady(false);
                          return;
                        }

                        setDebugMessage(`Testing connection to: ${FIREBASE_FALLBACK_CONFIG.databaseURL}`);

                        // Create a timeout promise (10 seconds to be sure)
                        const timeoutPromise = new Promise((_, reject) =>
                          setTimeout(() => reject(new Error("Connection timeout - Firebase servers unreachable from this device. Check network/firewall.")), 10000)
                        );

                        // Race between fetch and timeout
                        await Promise.race([
                          useUsersStore.getState().fetchUsersDirectly(),
                          timeoutPromise
                        ]);

                        const users = useUsersStore.getState().invitedUsers;
                        if (users.length > 0) {
                          setUsersReady(true);
                          setDebugMessage(`SUCCESS! ${users.length} users loaded from Firebase.`);
                        } else {
                          setDebugMessage("ERROR: Connected but 0 users returned. Database empty or read permission denied. Firebase URL: " + FIREBASE_FALLBACK_CONFIG.databaseURL);
                          setUsersReady(false);
                        }
                      } catch (error: any) {
                        const errorMsg = error?.message || String(error);
                        const errorCode = error?.code || "";

                        // Provide specific troubleshooting
                        let troubleshooting = "\n\nPossible causes:\n";
                        if (errorMsg.includes("timeout") || errorMsg.includes("unreachable")) {
                          troubleshooting += "• Device network is blocking Firebase\n• Firewall blocking *.firebaseio.com\n• Try different WiFi/cellular network";
                        } else if (errorCode === "PERMISSION_DENIED") {
                          troubleshooting += "• Firebase database rules blocking read access\n• Check Firebase Console → Rules";
                        }

                        setDebugMessage(`ERROR: ${errorCode ? errorCode + " - " : ""}${errorMsg}${troubleshooting}`);
                        setUsersReady(false);
                      }
                    }}
                    className="mt-2 bg-yellow-600 rounded-lg py-2 px-3 active:opacity-70"
                  >
                    <Text className="text-white text-xs font-semibold text-center">
                      Test Firebase Connection
                    </Text>
                  </Pressable>
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
