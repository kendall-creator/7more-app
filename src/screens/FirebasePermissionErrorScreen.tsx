import React from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function FirebasePermissionErrorScreen() {
  const handleOpenFirebase = () => {
    Linking.openURL("https://console.firebase.google.com");
  };

  const handleOpenGuide = () => {
    Linking.openURL("https://firebase.google.com/docs/database/security");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="items-center pt-12 pb-6">
          <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="alert-circle" size={40} color="#DC2626" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Firebase Permission Error
          </Text>
          <Text className="text-base text-gray-600 text-center">
            The app cannot connect to your Firebase database
          </Text>
        </View>

        <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <Text className="text-sm font-semibold text-red-900 mb-2">
            Error Details:
          </Text>
          <Text className="text-sm text-red-800">
            permission_denied at multiple database paths
          </Text>
          <Text className="text-xs text-red-700 mt-2">
            Client does not have permission to access the desired data
          </Text>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="server" size={20} color="#3B82F6" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">
              What This Means
            </Text>
          </View>
          <Text className="text-base text-gray-700 leading-6 mb-3">
            Your Firebase Realtime Database security rules are blocking access from this app. This is a security feature that protects your data.
          </Text>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="key" size={20} color="#10B981" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">
              How to Fix This
            </Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-4 mb-3">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Option 1: Update Security Rules (Development Only)
            </Text>
            <Text className="text-sm text-gray-700 mb-3">
              For development and testing, you can temporarily allow public access:
            </Text>
            <View className="bg-white border border-gray-300 rounded-lg p-3 mb-2">
              <Text className="text-xs font-mono text-gray-800">
                {`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
              </Text>
            </View>
            <Text className="text-xs text-amber-700 font-medium">
              ⚠️ Warning: This allows anyone to read/write your database. Only use during development!
            </Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Option 2: Implement Authentication (Recommended)
            </Text>
            <Text className="text-sm text-gray-700">
              For production apps, implement Firebase Authentication to secure your database properly.
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Steps to Update Rules:
          </Text>
          <View className="space-y-3">
            <View className="flex-row mb-3">
              <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-xs font-bold text-blue-700">1</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700">
                Go to Firebase Console → Your Project
              </Text>
            </View>
            <View className="flex-row mb-3">
              <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-xs font-bold text-blue-700">2</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700">
                Navigate to Realtime Database → Rules
              </Text>
            </View>
            <View className="flex-row mb-3">
              <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-xs font-bold text-blue-700">3</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700">
                Update the rules and click Publish
              </Text>
            </View>
            <View className="flex-row mb-3">
              <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-xs font-bold text-blue-700">4</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700">
                Restart the app to reconnect
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleOpenFirebase}
          className="bg-blue-600 rounded-xl p-4 flex-row items-center justify-center mb-3 active:bg-blue-700"
        >
          <Ionicons name="open-outline" size={20} color="#FFFFFF" />
          <Text className="text-white font-semibold text-base ml-2">
            Open Firebase Console
          </Text>
        </Pressable>

        <Pressable
          onPress={handleOpenGuide}
          className="bg-gray-100 rounded-xl p-4 flex-row items-center justify-center mb-8 active:bg-gray-200"
        >
          <Ionicons name="book-outline" size={20} color="#374151" />
          <Text className="text-gray-700 font-semibold text-base ml-2">
            Read Security Guide
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
