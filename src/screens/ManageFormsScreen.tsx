import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ManageFormsScreen({ navigation }: any) {
  const forms = [
    {
      id: "initial_contact",
      name: "Initial Contact Form",
      description: "Form used by mentors for first contact with participants",
      icon: "call" as const,
      color: "bg-orange-500",
    },
    {
      id: "bridge_followup",
      name: "Bridge Team Follow-Up Form",
      description: "Form used by Bridge Team for follow-up contacts",
      icon: "people" as const,
      color: "bg-blue-500",
    },
    {
      id: "weekly_update",
      name: "Weekly Update Form",
      description: "Weekly check-in form for active mentorship participants",
      icon: "document-text" as const,
      color: "bg-yellow-500",
    },
    {
      id: "monthly_checkin",
      name: "Monthly Check-In Form",
      description: "Monthly comprehensive check-in for participants",
      icon: "calendar" as const,
      color: "bg-green-500",
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-6 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-2">Manage Forms</Text>
        <Text className="text-gray-100 text-sm">
          Customize questions and options for your forms
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        <Text className="text-sm font-bold text-gray-900 mb-4 uppercase">Available Forms</Text>

        {forms.map((form) => (
          <Pressable
            key={form.id}
            onPress={() => navigation.navigate("EditFormQuestions", { formType: form.id })}
            className="bg-white rounded-2xl p-5 mb-4 border border-gray-100 active:opacity-70"
          >
            <View className="flex-row items-start">
              <View className={`w-12 h-12 ${form.color} rounded-xl items-center justify-center mr-4`}>
                <Ionicons name={form.icon} size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 mb-1">{form.name}</Text>
                <Text className="text-sm text-gray-600 mb-3">{form.description}</Text>
                <View className="flex-row items-center">
                  <Ionicons name="create-outline" size={16} color="#3B82F6" />
                  <Text className="text-blue-600 text-sm font-semibold ml-1">Edit Questions</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </View>
          </Pressable>
        ))}

        {/* Info Box */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="flex-1 ml-2">
              <Text className="text-blue-900 text-sm font-semibold mb-1">About Form Customization</Text>
              <Text className="text-blue-800 text-xs leading-5">
                You can edit question text, change options, mark questions as required or optional, and reorder questions. Changes apply immediately to all users.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
