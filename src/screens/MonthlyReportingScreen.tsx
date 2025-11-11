import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useCurrentUser } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";

export default function MonthlyReportingScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();

  const isAdmin = currentUser?.role === "admin";
  const isBoardMember = currentUser?.role === "board_member";

  // Auto-navigate board members directly to viewer
  useEffect(() => {
    if (isBoardMember) {
      navigation.navigate("ViewReporting");
    }
  }, [isBoardMember, navigation]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900">Monthly Reporting</Text>
        <Text className="text-gray-600 text-sm mt-1">
          {isAdmin ? "View reports or manage data entry" : "View monthly reports and metrics"}
        </Text>
      </View>

      {/* Options */}
      <View className="flex-1 px-4 py-6">
        {/* View Reporting - Available to all */}
        <Pressable
          className="bg-white rounded-2xl p-6 mb-4 border border-gray-200 active:opacity-70"
          onPress={() => navigation.navigate("ViewReporting")}
        >
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center">
              <Ionicons name="analytics" size={24} color="#4F46E5" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-xl font-bold text-gray-900">View Reports</Text>
              <Text className="text-gray-600 text-sm mt-1">
                View monthly reports with filtering and comparisons
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </View>

          <View className="bg-gray-50 rounded-lg p-3 mt-2">
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text className="text-gray-700 text-xs ml-2">Single month or date range views</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text className="text-gray-700 text-xs ml-2">Total or average aggregation</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text className="text-gray-700 text-xs ml-2">Month-over-month comparisons</Text>
            </View>
          </View>
        </Pressable>

        {/* Manage Reporting - Admin only */}
        {isAdmin && (
          <Pressable
            className="bg-white rounded-2xl p-6 mb-4 border border-gray-200 active:opacity-70"
            onPress={() => navigation.navigate("ManageReporting")}
          >
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 bg-yellow-100 rounded-full items-center justify-center">
                <Ionicons name="create" size={24} color="#F59E0B" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-xl font-bold text-gray-900">Manage Reports</Text>
                <Text className="text-gray-600 text-sm mt-1">
                  Enter and edit monthly report data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </View>

            <View className="bg-gray-50 rounded-lg p-3 mt-2">
              <View className="flex-row items-center mb-2">
                <Ionicons name="lock-closed" size={16} color="#F59E0B" />
                <Text className="text-gray-700 text-xs ml-2">Admin only</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text className="text-gray-700 text-xs ml-2">Input data for all categories</Text>
              </View>
            </View>
          </Pressable>
        )}

        {/* Info Card */}
        <View className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#4F46E5" />
            <View className="flex-1 ml-3">
              <Text className="text-indigo-900 text-sm font-semibold mb-1">About Monthly Reporting</Text>
              <Text className="text-indigo-800 text-xs leading-5">
                Monthly reports track key metrics including releasees met, call volumes, mentorship assignments,
                donor data, and financials. {isAdmin ? "As an admin, you can enter data and view comprehensive analytics." : "View detailed reports with comparison tools."}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
