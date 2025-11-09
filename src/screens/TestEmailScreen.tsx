import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { sendWelcomeEmail, sendPasswordResetEmail, sendResourcesEmail } from "../services/emailService";

export default function TestEmailScreen() {
  const [testType, setTestType] = useState<"welcome" | "reset" | "resources">("welcome");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleSendTest = async () => {
    if (!email || !name) {
      setResult({ success: false, error: "Please enter email and name" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let res;
      if (testType === "welcome") {
        res = await sendWelcomeEmail(email, name, "testPassword123", "7more", "https://7more.org/app");
      } else if (testType === "reset") {
        res = await sendPasswordResetEmail(email, name, "newPassword456", "7more");
      } else {
        res = await sendResourcesEmail(
          email,
          name,
          [
            {
              title: "Test Resource 1",
              content: "This is a test resource content for demonstration purposes.",
              category: "General",
            },
            {
              title: "Test Resource 2",
              content: "Another test resource to show multiple resources in one email.",
              category: "Support",
            },
          ],
          "7more"
        );
      }
      setResult(res);
    } catch (error: any) {
      setResult({ success: false, error: error.message || String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <ScrollView className="flex-1 bg-white">
        <View className="p-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Email Test</Text>
          <Text className="text-base text-gray-600 mb-8">Test the Resend email functionality</Text>

          {/* Email Type Selection */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">Select Email Type</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setTestType("welcome")}
                className={`flex-1 py-3 px-4 rounded-xl ${testType === "welcome" ? "bg-blue-500" : "bg-gray-100"}`}
              >
                <Text className={`text-center font-medium ${testType === "welcome" ? "text-white" : "text-gray-700"}`}>
                  Welcome
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setTestType("reset")}
                className={`flex-1 py-3 px-4 rounded-xl ${testType === "reset" ? "bg-blue-500" : "bg-gray-100"}`}
              >
                <Text className={`text-center font-medium ${testType === "reset" ? "text-white" : "text-gray-700"}`}>
                  Reset
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setTestType("resources")}
                className={`flex-1 py-3 px-4 rounded-xl ${testType === "resources" ? "bg-blue-500" : "bg-gray-100"}`}
              >
                <Text className={`text-center font-medium ${testType === "resources" ? "text-white" : "text-gray-700"}`}>
                  Resources
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Input Fields */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Recipient Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="test@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Recipient Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              autoCapitalize="words"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
            />
          </View>

          {/* Send Button */}
          <Pressable
            onPress={handleSendTest}
            disabled={loading}
            className={`py-4 rounded-xl ${loading ? "bg-gray-300" : "bg-blue-500"}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">Send Test Email</Text>
            )}
          </Pressable>

          {/* Result Display */}
          {result && (
            <View className={`mt-6 p-4 rounded-xl ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <Text className={`font-semibold mb-2 ${result.success ? "text-green-800" : "text-red-800"}`}>
                {result.success ? "✅ Success!" : "❌ Failed"}
              </Text>
              {result.error && <Text className="text-red-700 text-sm">{result.error}</Text>}
              {result.success && (
                <Text className="text-green-700 text-sm">
                  Email sent successfully! Check {email} inbox (including spam folder).
                </Text>
              )}
            </View>
          )}

          {/* Info Box */}
          <View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <Text className="text-sm font-semibold text-blue-900 mb-2">Current Configuration</Text>
            <Text className="text-xs text-blue-700 mb-1">
              From: {process.env.EXPO_PUBLIC_EMAIL_FROM || "onboarding@resend.dev"}
            </Text>
            <Text className="text-xs text-blue-700 mb-1">
              API Key: {process.env.EXPO_PUBLIC_EMAIL_API_KEY ? "✅ Configured" : "❌ Not configured"}
            </Text>
            <Text className="text-xs text-blue-700 mt-3">
              Note: If using bridgeteam@7more.net, ensure the domain is verified in your Resend dashboard.
            </Text>
          </View>

          {/* Email Type Info */}
          <View className="mt-4 p-4 bg-gray-50 rounded-xl">
            <Text className="text-sm font-semibold text-gray-900 mb-2">About {testType} email:</Text>
            {testType === "welcome" && (
              <Text className="text-xs text-gray-600">
                Sends a welcome email with login credentials (test password: testPassword123)
              </Text>
            )}
            {testType === "reset" && (
              <Text className="text-xs text-gray-600">
                Sends a password reset email with new credentials (test password: newPassword456)
              </Text>
            )}
            {testType === "resources" && (
              <Text className="text-xs text-gray-600">
                Sends resources email with test resources. Includes bridgeteam@7more.net as reply-to address.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
