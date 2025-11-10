import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFormConfigStore, FormQuestion } from "../state/formConfigStore";

export default function EditFormQuestionsScreen({ route, navigation }: any) {
  const { formType } = route.params;
  const getQuestionsByFormType = useFormConfigStore((s) => s.getQuestionsByFormType);
  const updateQuestion = useFormConfigStore((s) => s.updateQuestion);
  const deleteQuestion = useFormConfigStore((s) => s.deleteQuestion);
  const addQuestion = useFormConfigStore((s) => s.addQuestion);
  const allQuestions = useFormConfigStore((s) => s.questions);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(null);

  // Form state for editing
  const [editLabel, setEditLabel] = useState("");
  const [editRequired, setEditRequired] = useState(true);
  const [editOptions, setEditOptions] = useState("");
  const [editPlaceholder, setEditPlaceholder] = useState("");
  const [editType, setEditType] = useState<FormQuestion["type"]>("text");

  const questions = getQuestionsByFormType(formType);

  // Debug log to see what questions are loaded
  useEffect(() => {
    console.log("=== EditFormQuestionsScreen Debug ===");
    console.log("Form Type:", formType);
    console.log("All Questions in Store:", allQuestions.length);
    console.log("Filtered Questions for this form:", questions.length);
    console.log("Questions:", questions);
    console.log("=====================================");
  }, [formType, allQuestions, questions]);

  const formTitles: Record<string, string> = {
    initial_contact: "Initial Contact Form",
    bridge_followup: "Bridge Team Follow-Up Form",
    weekly_update: "Weekly Update Form",
    monthly_checkin: "Monthly Check-In Form",
  };

  const handleEditQuestion = (question: FormQuestion) => {
    setEditingQuestion(question);
    setEditLabel(question.label);
    setEditRequired(question.required);
    setEditOptions(question.options?.join("\n") || "");
    setEditPlaceholder(question.placeholder || "");
    setEditType(question.type);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingQuestion) return;

    if (!editLabel.trim()) {
      Alert.alert("Error", "Question label cannot be empty");
      return;
    }

    const updates: Partial<FormQuestion> = {
      label: editLabel.trim(),
      required: editRequired,
      placeholder: editPlaceholder.trim() || undefined,
      type: editType,
    };

    if (editType === "radio" || editType === "dropdown") {
      const options = editOptions
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o.length > 0);

      if (options.length === 0) {
        Alert.alert("Error", "Please provide at least one option");
        return;
      }

      updates.options = options;
    }

    updateQuestion(editingQuestion.id, updates);
    setShowEditModal(false);
    Alert.alert("Success", "Question updated successfully");
  };

  const handleDeleteQuestion = (question: FormQuestion) => {
    Alert.alert(
      "Delete Question",
      `Are you sure you want to delete this question? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteQuestion(question.id);
            Alert.alert("Success", "Question deleted successfully");
          },
        },
      ]
    );
  };

  const handleAddQuestion = () => {
    setEditLabel("");
    setEditRequired(true);
    setEditOptions("");
    setEditPlaceholder("");
    setEditType("text");
    setEditingQuestion(null);
    setShowAddModal(true);
  };

  const handleSaveNewQuestion = () => {
    if (!editLabel.trim()) {
      Alert.alert("Error", "Question label cannot be empty");
      return;
    }

    const newQuestion: FormQuestion = {
      id: `q_custom_${Date.now()}`,
      label: editLabel.trim(),
      required: editRequired,
      placeholder: editPlaceholder.trim() || undefined,
      type: editType,
      order: questions.length + 1,
      formType: formType,
    };

    if (editType === "radio" || editType === "dropdown") {
      const options = editOptions
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o.length > 0);

      if (options.length === 0) {
        Alert.alert("Error", "Please provide at least one option");
        return;
      }

      newQuestion.options = options;
    }

    addQuestion(newQuestion);
    setShowAddModal(false);
    Alert.alert("Success", "Question added successfully");
  };

  const renderQuestionTypeIcon = (type: FormQuestion["type"]) => {
    switch (type) {
      case "text":
        return "text-outline";
      case "textarea":
        return "document-text-outline";
      case "radio":
        return "radio-button-on-outline";
      case "checkbox":
        return "checkbox-outline";
      case "dropdown":
        return "chevron-down-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const renderEditModal = (isAddMode: boolean) => (
    <Modal
      visible={isAddMode ? showAddModal : showEditModal}
      transparent
      animationType="slide"
      onRequestClose={() => (isAddMode ? setShowAddModal(false) : setShowEditModal(false))}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1" />
        <View className="bg-white rounded-t-3xl">
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24 }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">
                {isAddMode ? "Add New Question" : "Edit Question"}
              </Text>
              <Pressable onPress={() => (isAddMode ? setShowAddModal(false) : setShowEditModal(false))}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </Pressable>
            </View>

            {/* Question Label */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Question Label *</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                placeholder="Enter question text..."
                value={editLabel}
                onChangeText={setEditLabel}
                multiline
              />
            </View>

            {/* Question Type */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Question Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {(["text", "textarea", "radio", "checkbox", "dropdown"] as const).map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setEditType(type)}
                    className={`border-2 rounded-xl px-4 py-2 ${
                      editType === type ? "bg-gray-600 border-gray-600" : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold capitalize ${
                        editType === type ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {type}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Options (for radio/dropdown) */}
            {(editType === "radio" || editType === "dropdown") && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Options (one per line) *</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  value={editOptions}
                  onChangeText={setEditOptions}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
            )}

            {/* Placeholder (for text/textarea) */}
            {(editType === "text" || editType === "textarea") && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Placeholder Text</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Enter placeholder..."
                  value={editPlaceholder}
                  onChangeText={setEditPlaceholder}
                />
              </View>
            )}

            {/* Required Toggle */}
            <View className="mb-6">
              <Pressable onPress={() => setEditRequired(!editRequired)} className="flex-row items-center">
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                    editRequired ? "bg-gray-600 border-gray-600" : "bg-white border-gray-300"
                  }`}
                >
                  {editRequired && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <Text className="text-base text-gray-900">Required Question</Text>
              </Pressable>
            </View>

            {/* Save Button */}
            <Pressable
              onPress={isAddMode ? handleSaveNewQuestion : handleSaveEdit}
              className="bg-gray-600 rounded-xl py-4 items-center active:opacity-80 mb-3"
            >
              <Text className="text-white text-base font-bold">{isAddMode ? "Add Question" : "Save Changes"}</Text>
            </Pressable>

            {/* Cancel Button */}
            <Pressable
              onPress={() => (isAddMode ? setShowAddModal(false) : setShowEditModal(false))}
              className="bg-gray-100 rounded-xl py-4 items-center active:opacity-80 mb-4"
            >
              <Text className="text-gray-700 text-base font-semibold">Cancel</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-6 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-2">{formTitles[formType]}</Text>
        <Text className="text-gray-100 text-sm">{questions.length} question{questions.length !== 1 ? "s" : ""}</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {questions.map((question, index) => (
          <View key={question.id} className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <View className="flex-row items-center mb-2">
                  <View className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center mr-2">
                    <Text className="text-gray-700 text-sm font-bold">{index + 1}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name={renderQuestionTypeIcon(question.type)} size={16} color="#6B7280" />
                    <Text className="text-xs text-gray-500 ml-1 capitalize">{question.type}</Text>
                  </View>
                  {question.required && (
                    <View className="ml-2 bg-red-100 rounded-full px-2 py-0.5">
                      <Text className="text-red-700 text-xs font-semibold">Required</Text>
                    </View>
                  )}
                </View>
                <Text className="text-base text-gray-900 mb-2">{question.label}</Text>
                {question.options && question.options.length > 0 && (
                  <View className="ml-4">
                    {question.options.map((option, idx) => (
                      <Text key={idx} className="text-sm text-gray-600 mb-1">
                        • {option}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleEditQuestion(question)}
                  className="bg-blue-50 rounded-lg p-2 active:opacity-70"
                >
                  <Ionicons name="create-outline" size={20} color="#3B82F6" />
                </Pressable>
                <Pressable
                  onPress={() => handleDeleteQuestion(question)}
                  className="bg-red-50 rounded-lg p-2 active:opacity-70"
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        {questions.length === 0 && (
          <View className="items-center justify-center py-12">
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-base mt-4">No questions yet</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">Add your first question to get started</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <View className="absolute bottom-6 right-6">
        <Pressable
          onPress={handleAddQuestion}
          className="bg-gray-600 rounded-full w-14 h-14 items-center justify-center active:opacity-80"
          style={{ elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
        >
          <Ionicons name="add" size={32} color="white" />
        </Pressable>
      </View>

      {/* Edit Modal */}
      {renderEditModal(false)}

      {/* Add Modal */}
      {renderEditModal(true)}
    </View>
  );
}
