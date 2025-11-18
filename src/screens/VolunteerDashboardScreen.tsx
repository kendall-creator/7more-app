import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useVolunteerStore } from "../state/volunteerStore";
import { useTaskStore } from "../state/taskStore";
import { useCurrentUser } from "../state/authStore";
import { VolunteerInterestArea } from "../types";

type RootStackParamList = {
  VolunteerIntakeForm: undefined;
  VolunteerDatabase: undefined;
  VolunteerRoutingRules: undefined;
  MainTabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const INTEREST_LABELS: Record<VolunteerInterestArea, string> = {
  bridge_team: "Bridge Team",
  clothing_donation: "Clothing Donation",
  in_prison_volunteering: "In-Prison Volunteering",
  administrative_work: "Administrative Work",
  general_volunteer: "General Volunteer",
  monetary_donation: "Monetary Donation",
  other: "Other",
};

export default function VolunteerDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentUser = useCurrentUser();

  const inquiries = useVolunteerStore((s) => s.inquiries);
  const volunteers = useVolunteerStore((s) => s.volunteers);
  const tasks = useTaskStore((s) => s.tasks);

  const [refreshing, setRefreshing] = useState(false);

  // Get pending inquiries (assigned to Debs)
  const pendingInquiries = inquiries.filter(
    (inquiry) => inquiry.status === "pending" || inquiry.status === "in_progress"
  );

  // Get completed inquiries (for reference)
  const completedInquiries = inquiries.filter((inquiry) => inquiry.status === "completed");

  // Get tasks related to volunteer inquiries assigned to current user
  const myVolunteerTasks = tasks.filter(
    (task) =>
      task.assignedToUserId === currentUser?.id &&
      (task.title.includes("Follow Up") || task.title.includes("Monetary Donation"))
  );

  const onRefresh = () => {
    setRefreshing(true);
    // Firebase listeners will automatically update
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Volunteer Management</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Welcome, {currentUser?.name || "Debs"}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Quick Stats */}
        <View className="px-4 py-4">
          <View className="flex-row space-x-3">
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
              <Text className="text-3xl font-bold text-indigo-600">{pendingInquiries.length}</Text>
              <Text className="text-sm text-gray-600 mt-1">Pending Inquiries</Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
              <Text className="text-3xl font-bold text-green-600">{volunteers.length}</Text>
              <Text className="text-sm text-gray-600 mt-1">Total Volunteers</Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
              <Text className="text-3xl font-bold text-amber-600">{myVolunteerTasks.length}</Text>
              <Text className="text-sm text-gray-600 mt-1">My Tasks</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 pb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Quick Actions</Text>
          <View className="flex-row space-x-3">
            <Pressable
              onPress={() => navigation.navigate("VolunteerIntakeForm")}
              className="flex-1 bg-indigo-600 rounded-lg p-4"
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white font-semibold mt-2">New Inquiry</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("VolunteerDatabase")}
              className="flex-1 bg-green-600 rounded-lg p-4"
            >
              <Ionicons name="people" size={24} color="white" />
              <Text className="text-white font-semibold mt-2">Database</Text>
            </Pressable>
          </View>
        </View>

        {/* Pending Inquiries */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">
              Pending Inquiries ({pendingInquiries.length})
            </Text>
          </View>

          {pendingInquiries.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center border border-gray-200">
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              <Text className="text-gray-600 text-center mt-2">
                No pending inquiries
              </Text>
            </View>
          ) : (
            pendingInquiries.map((inquiry) => {
              const daysAgo = getDaysAgo(inquiry.submittedAt);
              return (
                <View key={inquiry.id} className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900">
                        {inquiry.firstName} {inquiry.lastName}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`}
                      </Text>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full ${
                        inquiry.status === "pending" ? "bg-amber-100" : "bg-blue-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          inquiry.status === "pending" ? "text-amber-700" : "text-blue-700"
                        }`}
                      >
                        {inquiry.status === "pending" ? "Pending" : "In Progress"}
                      </Text>
                    </View>
                  </View>

                  {/* Contact Info */}
                  {inquiry.email && (
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="mail-outline" size={16} color="#6B7280" />
                      <Text className="text-sm text-gray-700 ml-2">{inquiry.email}</Text>
                    </View>
                  )}
                  {inquiry.phoneNumber && (
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="call-outline" size={16} color="#6B7280" />
                      <Text className="text-sm text-gray-700 ml-2">{inquiry.phoneNumber}</Text>
                    </View>
                  )}

                  {/* Interests */}
                  <Text className="text-sm font-medium text-gray-700 mb-1">Interests:</Text>
                  <View className="flex-row flex-wrap mb-2">
                    {inquiry.selectedInterests.map((interest) => (
                      <View key={interest} className="bg-indigo-50 px-2 py-1 rounded mr-2 mb-1">
                        <Text className="text-xs text-indigo-700">{INTEREST_LABELS[interest]}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Monetary Donation */}
                  {inquiry.monetaryDonationAmount && (
                    <View className="bg-green-50 px-3 py-2 rounded-lg mb-2">
                      <Text className="text-sm font-semibold text-green-700">
                        Monetary Donation: ${inquiry.monetaryDonationAmount.toLocaleString()}
                      </Text>
                    </View>
                  )}

                  {/* Notes */}
                  {inquiry.notes && (
                    <View className="bg-gray-50 p-2 rounded mb-2">
                      <Text className="text-xs text-gray-600 font-medium mb-1">Notes:</Text>
                      <Text className="text-sm text-gray-700">{inquiry.notes}</Text>
                    </View>
                  )}

                  {/* Task Count */}
                  <View className="flex-row items-center">
                    <Ionicons name="checkbox-outline" size={16} color="#4F46E5" />
                    <Text className="text-sm text-indigo-600 ml-1 font-medium">
                      {inquiry.generatedTaskIds.length} task{inquiry.generatedTaskIds.length !== 1 ? "s" : ""} created
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Recently Completed */}
        {completedInquiries.length > 0 && (
          <View className="px-4 pb-4">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Recently Completed ({completedInquiries.slice(0, 5).length})
            </Text>
            {completedInquiries.slice(0, 5).map((inquiry) => (
              <View key={inquiry.id} className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {inquiry.firstName} {inquiry.lastName}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Completed {new Date(inquiry.completedAt!).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Resources for Admin (if user is admin) */}
        {currentUser?.role === "admin" && (
          <View className="px-4 pb-4">
            <Text className="text-lg font-bold text-gray-900 mb-3">Resources (Admin Only)</Text>

            <Pressable
              onPress={() => navigation.navigate("FileManagement" as any)}
              className="bg-white rounded-lg p-4 mb-3 border border-gray-200 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Ionicons name="folder-open" size={24} color="#10B981" />
                <View className="ml-3">
                  <Text className="text-base font-semibold text-gray-900">File Management</Text>
                  <Text className="text-sm text-gray-600">Access volunteer and participant forms</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("VolunteerRoutingRules")}
              className="bg-white rounded-lg p-4 border border-gray-200 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Ionicons name="settings-outline" size={24} color="#4F46E5" />
                <View className="ml-3">
                  <Text className="text-base font-semibold text-gray-900">Routing Rules</Text>
                  <Text className="text-sm text-gray-600">Configure task assignments</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
