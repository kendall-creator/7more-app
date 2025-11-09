import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useParticipantStore } from "../state/participantStore";
import { useFormFields, useFormConfig } from "../state/intakeFormStore";
import { ParticipantStatus } from "../types";
import { IntakeFormField } from "../types/intakeForm";

export default function IntakeFormScreen({ navigation }: any) {
  const formConfig = useFormConfig();
  const formFields = useFormFields();
  // Memoize the enabled fields to prevent infinite loops
  const enabledFields = useMemo(
    () => formFields.filter((f) => f.enabled).sort((a, b) => a.order - b.order),
    [formFields]
  );
  const addParticipant = useParticipantStore((s) => s.addParticipant);

  // Dynamic form state
  const [formData, setFormData] = useState<Record<string, any>>({
    dateOfBirth: new Date(),
    releaseDate: new Date(),
  });
  const [showDatePickers, setShowDatePickers] = useState<Record<string, boolean>>({});

  const updateField = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const toggleDatePicker = (fieldId: string, show: boolean) => {
    setShowDatePickers((prev) => ({ ...prev, [fieldId]: show }));
  };

  const calculateAge = (dob: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const calculateTimeOut = (release: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - release.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSubmit = () => {
    // Validation - check all required fields
    const missingFields = enabledFields.filter(
      (field) => field.required && !formData[field.id]
    );

    if (missingFields.length > 0) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    // Check if "Other" is selected for releasedFrom and the text field is filled
    if (formData.releasedFrom === "Other" && !formData.releasedFrom_other?.trim()) {
      Alert.alert("Missing Information", "Please specify the facility name.");
      return;
    }

    const dateOfBirth = formData.dateOfBirth || new Date();
    const releaseDate = formData.releaseDate || new Date();
    const age = calculateAge(dateOfBirth);
    const timeOut = calculateTimeOut(releaseDate);

    // Use the "other" text if "Other" is selected, otherwise use the selected value
    const releasedFromValue =
      formData.releasedFrom === "Other"
        ? formData.releasedFrom_other
        : formData.releasedFrom;

    addParticipant({
      participantNumber: formData.participantNumber || "",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      dateOfBirth: dateOfBirth.toISOString(),
      age,
      gender: formData.gender || "",
      phoneNumber: formData.phoneNumber || undefined,
      email: formData.email || undefined,
      releaseDate: releaseDate.toISOString(),
      timeOut,
      releasedFrom: releasedFromValue || "",
      status: "pending_bridge" as ParticipantStatus,
      completedGraduationSteps: [],
    });

    Alert.alert(
      "Form Submitted",
      "Thank you! Your information has been received. Our Bridge Team will contact you soon.",
      [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setFormData({
              dateOfBirth: new Date(),
              releaseDate: new Date(),
            });
          },
        },
      ]
    );
  };

  const renderField = (field: IntakeFormField) => {
    switch (field.type) {
      case "text":
      case "textarea":
        return (
          <View key={field.id} className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <Text className="text-red-500">*</Text>}
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder={field.placeholder}
              value={formData[field.id] || ""}
              onChangeText={(text) => updateField(field.id, text)}
              multiline={field.type === "textarea"}
              numberOfLines={field.type === "textarea" ? 4 : 1}
            />
          </View>
        );

      case "date":
        const dateValue = formData[field.id] || new Date();
        return (
          <View key={field.id} className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <Text className="text-red-500">*</Text>}
            </Text>
            <Pressable
              onPress={() => toggleDatePicker(field.id, true)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4"
            >
              <Text className="text-base text-gray-900">{formatDate(dateValue)}</Text>
            </Pressable>
            {showDatePickers[field.id] && (
              <DateTimePicker
                value={dateValue}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  toggleDatePicker(field.id, false);
                  if (selectedDate) {
                    updateField(field.id, selectedDate);
                  }
                }}
                maximumDate={field.id === "dateOfBirth" ? new Date() : undefined}
              />
            )}
          </View>
        );

      case "radio":
        return (
          <View key={field.id} className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <Text className="text-red-500">*</Text>}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {field.options?.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => updateField(field.id, option)}
                  className={`flex-1 min-w-[30%] border-2 rounded-xl py-3 items-center ${
                    formData[field.id] === option
                      ? "bg-gray-50 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      formData[field.id] === option ? "text-yellow-600" : "text-gray-700"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case "select":
        const isOtherSelected = formData[field.id] === "Other";
        const hasOtherOption = field.options?.includes("Other");

        return (
          <View key={field.id} className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <Text className="text-red-500">*</Text>}
            </Text>
            <View className="space-y-2">
              {field.options?.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    updateField(field.id, option);
                    // Clear the "other" text field if switching away from "Other"
                    if (option !== "Other") {
                      updateField(`${field.id}_other`, "");
                    }
                  }}
                  className={`border-2 rounded-xl px-4 py-3 ${
                    formData[field.id] === option
                      ? "bg-gray-50 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      formData[field.id] === option ? "text-yellow-600" : "text-gray-700"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Show text input if "Other" is selected */}
            {hasOtherOption && isOtherSelected && (
              <View className="mt-3">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Please specify:
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Enter facility name"
                  value={formData[`${field.id}_other`] || ""}
                  onChangeText={(text) => updateField(`${field.id}_other`, text)}
                />
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="bg-gray-600 pt-16 pb-8 px-6">
          <Text className="text-3xl font-bold text-white mb-2">{formConfig.title}</Text>
          <Text className="text-yellow-100 text-base">{formConfig.description}</Text>
        </View>

        <View className="px-6 pt-6">
          {/* Render all enabled fields dynamically */}
          {enabledFields.map(renderField)}

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            className="bg-gray-600 rounded-xl py-4 items-center mb-4 active:opacity-80"
          >
            <Text className="text-white text-base font-bold">Submit Form</Text>
          </Pressable>

          {/* Back Button */}
          {navigation && (
            <Pressable
              onPress={() => navigation.goBack()}
              className="bg-gray-100 rounded-xl py-3 items-center active:opacity-80"
            >
              <Text className="text-gray-700 text-sm font-semibold">Back</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
