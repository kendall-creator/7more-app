import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useIntakeFormStore } from "../state/intakeFormStore";
import { IntakeFormField } from "../types/intakeForm";

export default function EditIntakeFormScreen() {
  const navigation = useNavigation<any>();
  const formConfig = useIntakeFormStore((s) => s.formConfig);
  const updateFormConfig = useIntakeFormStore((s) => s.updateFormConfig);
  const updateField = useIntakeFormStore((s) => s.updateField);
  const toggleFieldEnabled = useIntakeFormStore((s) => s.toggleFieldEnabled);
  const updateFieldOptions = useIntakeFormStore((s) => s.updateFieldOptions);
  const resetToDefault = useIntakeFormStore((s) => s.resetToDefault);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingOptions, setEditingOptions] = useState<string>("");

  const handleSaveOptions = (fieldId: string) => {
    const options = editingOptions
      .split("\n")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (options.length > 0) {
      updateFieldOptions(fieldId, options);
      setEditingField(null);
      setEditingOptions("");
    } else {
      Alert.alert("Error", "Please enter at least one option");
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Form",
      "Are you sure you want to reset the form to default settings? This will remove all customizations.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetToDefault();
            Alert.alert("Success", "Form has been reset to default settings");
          },
        },
      ]
    );
  };

  const sortedFields = [...formConfig.fields].sort((a, b) => a.order - b.order);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-6 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <View className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white text-base ml-2 font-semibold">Back</Text>
          </View>
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-1">Edit Intake Form</Text>
        <Text className="text-yellow-100 text-sm">
          Customize form fields and options
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Form Title & Description */}
        <View className="px-6 py-4">
          <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">Form Settings</Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Form Title</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                value={formConfig.title}
                onChangeText={(text) => updateFormConfig({ title: text })}
                placeholder="Form title"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                value={formConfig.description}
                onChangeText={(text) => updateFormConfig({ description: text })}
                placeholder="Form description"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View className="px-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Form Fields</Text>

          {sortedFields.map((field) => (
            <View
              key={field.id}
              className={`bg-white rounded-2xl p-5 border-2 mb-4 ${
                field.enabled ? "border-gray-200" : "border-gray-100"
              }`}
            >
              {/* Field Header */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1 mr-3">
                  <Text className="text-base font-bold text-gray-900">{field.label}</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {field.type.charAt(0).toUpperCase() + field.type.slice(1)} • Order: {field.order}
                  </Text>
                </View>

                <Pressable
                  onPress={() => toggleFieldEnabled(field.id)}
                  className={`px-4 py-2 rounded-lg ${
                    field.enabled ? "bg-yellow-100" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      field.enabled ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {field.enabled ? "Enabled" : "Disabled"}
                  </Text>
                </Pressable>
              </View>

              {/* Field Properties */}
              <View className="bg-gray-50 rounded-xl p-3 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs text-gray-600">Required</Text>
                  <Pressable
                    onPress={() => updateField(field.id, { required: !field.required })}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-5 h-5 rounded ${
                        field.required ? "bg-gray-600" : "bg-gray-300"
                      } items-center justify-center mr-2`}
                    >
                      {field.required && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <Text className="text-xs text-gray-700">
                      {field.required ? "Yes" : "No"}
                    </Text>
                  </Pressable>
                </View>

                {field.placeholder && (
                  <View className="mb-2">
                    <Text className="text-xs text-gray-600 mb-1">Placeholder</Text>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs"
                      value={field.placeholder}
                      onChangeText={(text) => updateField(field.id, { placeholder: text })}
                    />
                  </View>
                )}

                <View>
                  <Text className="text-xs text-gray-600 mb-1">Label</Text>
                  <TextInput
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs"
                    value={field.label}
                    onChangeText={(text) => updateField(field.id, { label: text })}
                  />
                </View>
              </View>

              {/* Options for radio/select fields */}
              {(field.type === "radio" || field.type === "select") && field.options && (
                <View>
                  {editingField === field.id ? (
                    <View>
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        Edit Options (one per line)
                      </Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3"
                        value={editingOptions}
                        onChangeText={setEditingOptions}
                        multiline
                        numberOfLines={5}
                        placeholder="Male&#10;Female&#10;Other"
                      />
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => handleSaveOptions(field.id)}
                          className="flex-1 bg-gray-600 rounded-xl py-3 items-center active:opacity-80"
                        >
                          <Text className="text-white text-sm font-bold">Save Options</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            setEditingField(null);
                            setEditingOptions("");
                          }}
                          className="bg-gray-200 rounded-xl px-4 py-3 items-center active:opacity-80"
                        >
                          <Text className="text-gray-700 text-sm font-bold">Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-semibold text-gray-700">Options</Text>
                        <Pressable
                          onPress={() => {
                            setEditingField(field.id);
                            setEditingOptions(field.options?.join("\n") || "");
                          }}
                          className="flex-row items-center"
                        >
                          <Ionicons name="create-outline" size={16} color="#374151" />
                          <Text className="text-yellow-600 text-xs font-semibold ml-1">
                            Edit
                          </Text>
                        </Pressable>
                      </View>
                      <View className="flex-row flex-wrap gap-2">
                        {field.options.map((option, index) => (
                          <View
                            key={index}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                          >
                            <Text className="text-xs text-yellow-700">{option}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Actions */}
        <View className="px-6 mt-4">
          <Pressable
            onPress={handleReset}
            className="bg-red-50 border-2 border-red-200 rounded-xl py-4 flex-row items-center justify-center active:opacity-70 mb-4"
          >
            <Ionicons name="refresh" size={20} color="#DC2626" />
            <Text className="text-red-600 text-base font-bold ml-2">Reset to Default</Text>
          </Pressable>

          <View className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <View className="flex-1 ml-2">
                <Text className="text-xs font-semibold text-amber-900 mb-1">Note</Text>
                <Text className="text-xs text-amber-800">
                  Changes take effect immediately. Disabled fields will not appear on the public
                  intake form. Core fields (Participant Number, Name, DOB) cannot be removed.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
