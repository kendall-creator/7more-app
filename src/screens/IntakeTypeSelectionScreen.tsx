import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  navigation: any;
}

type IntakeOption = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const intakeOptions: IntakeOption[] = [
  {
    id: "full_form_entry",
    title: "Full Form Entry",
    description: "Participant completed online form or entering full intake manually. Requires follow-up call.",
    icon: "document-text",
    color: "bg-blue-500",
  },
  {
    id: "live_call_intake",
    title: "Live Call Intake",
    description: "Participant is on the phone now. Complete intake and follow-up in one call.",
    icon: "call",
    color: "bg-green-500",
  },
  {
    id: "missed_call_no_voicemail",
    title: "Missed Call – No Voicemail",
    description: "Phone rang, no answer, no voicemail left. Add to callback queue.",
    icon: "call-outline",
    color: "bg-amber-500",
  },
  {
    id: "missed_call_voicemail",
    title: "Missed Call – Voicemail Received",
    description: "Participant left a voicemail. Add to callback queue with notes.",
    icon: "mail",
    color: "bg-purple-500",
  },
];

export default function IntakeTypeSelectionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const handleSelectType = (type: string) => {
    switch (type) {
      case "full_form_entry":
        navigation.navigate("ManualIntakeForm", { intakeType: "full_form_entry" });
        break;
      case "live_call_intake":
        navigation.navigate("ManualIntakeForm", { intakeType: "live_call_intake" });
        break;
      case "missed_call_no_voicemail":
        navigation.navigate("MissedCallNoVoicemailForm");
        break;
      case "missed_call_voicemail":
        navigation.navigate("MissedCallVoicemailForm");
        break;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white border-b border-gray-200"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center px-4 py-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 active:opacity-70"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-xl font-semibold text-gray-900">
            Add Participant – Choose Entry Type
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-base text-gray-600 mb-6 px-1">
          Select how you are adding this participant to determine the correct workflow:
        </Text>

        {intakeOptions.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => handleSelectType(option.id)}
            className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden active:opacity-70"
          >
            <View className="flex-row items-center p-4">
              <View className={`${option.color} rounded-full p-4 mr-4`}>
                <Ionicons name={option.icon} size={28} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  {option.title}
                </Text>
                <Text className="text-sm text-gray-600 leading-5">
                  {option.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
