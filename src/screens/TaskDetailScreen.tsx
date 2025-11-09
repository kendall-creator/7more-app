import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal, Switch } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTaskStore } from "../state/taskStore";
import { useCurrentUser } from "../state/authStore";
import { useParticipantStore } from "../state/participantStore";
import { Ionicons } from "@expo/vector-icons";
import { TaskFormResponse, TaskFormField } from "../types";

export default function TaskDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { taskId } = route.params;

  const currentUser = useCurrentUser();
  const task = useTaskStore((s) => s.tasks.find((t) => t.id === taskId));
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const submitTaskForm = useTaskStore((s) => s.submitTaskForm);
  const allParticipants = useParticipantStore((s) => s.participants);

  const [formResponses, setFormResponses] = useState<Record<string, string | number | boolean>>({});
  const [completionComment, setCompletionComment] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Debug logging - must be before early return
  React.useEffect(() => {
    if (task && currentUser) {
      console.log("TaskDetailScreen - Task:", task.id);
      console.log("TaskDetailScreen - Current User ID:", currentUser.id);
      console.log("TaskDetailScreen - Assigned To:", task.assignedToUserId);
      console.log("TaskDetailScreen - Status:", task.status);
      console.log("TaskDetailScreen - Custom Form:", task.customForm?.length || 0, "fields");
      console.log("TaskDetailScreen - Show Actions:", task.assignedToUserId === currentUser.id && task.status !== "completed");
    }
  }, [task, currentUser]);

  if (!task) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Task not found</Text>
      </View>
    );
  }

  // Dynamically look up participant info if task is related to a participant
  const relatedParticipant = task.relatedParticipantId
    ? allParticipants.find((p) => p.id === task.relatedParticipantId)
    : null;

  const participantDisplayName = relatedParticipant
    ? `${relatedParticipant.firstName} ${relatedParticipant.lastName}`
    : task.relatedParticipantName; // Fallback to stored name if participant not found

  const isCompleted = task.status === "completed";
  const canEdit = task.assignedToUserId === currentUser?.id && !isCompleted;

  const handleUpdateStatus = async (newStatus: "pending" | "in_progress" | "completed") => {
    if (!currentUser) return;
    try {
      await updateTaskStatus(taskId, newStatus, currentUser.id);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleSubmitForm = async () => {
    if (!currentUser || !task.customForm) return;

    // Validate required fields
    for (const field of task.customForm) {
      if (field.required && !formResponses[field.id]) {
        setErrorMessage(`Please fill in the required field: ${field.label}`);
        setShowErrorModal(true);
        return;
      }
    }

    // Convert responses to TaskFormResponse format
    const responses: TaskFormResponse[] = Object.entries(formResponses).map(([fieldId, value]) => ({
      fieldId,
      value,
    }));

    try {
      await submitTaskForm(taskId, responses, currentUser.id, completionComment);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage("Failed to submit task. Please try again.");
      setShowErrorModal(true);
    }
  };

  const handleCompleteWithoutForm = async () => {
    if (!currentUser) return;
    try {
      await updateTaskStatus(taskId, "completed", currentUser.id, completionComment);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage("Failed to complete task. Please try again.");
      setShowErrorModal(true);
    }
  };

  const renderFormField = (field: TaskFormField) => {
    const value = formResponses[field.id];

    switch (field.type) {
      case "text":
        return (
          <View key={field.id} className="mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              {field.label}
              {field.required && <Text className="text-red-600"> *</Text>}
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={(value as string) || ""}
              onChangeText={(text) => setFormResponses({ ...formResponses, [field.id]: text })}
              editable={canEdit}
            />
          </View>
        );

      case "textarea":
        return (
          <View key={field.id} className="mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              {field.label}
              {field.required && <Text className="text-red-600"> *</Text>}
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={(value as string) || ""}
              onChangeText={(text) => setFormResponses({ ...formResponses, [field.id]: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={canEdit}
            />
          </View>
        );

      case "number":
        return (
          <View key={field.id} className="mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              {field.label}
              {field.required && <Text className="text-red-600"> *</Text>}
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder={field.placeholder || "Enter number"}
              value={value?.toString() || ""}
              onChangeText={(text) => {
                const num = parseFloat(text);
                setFormResponses({ ...formResponses, [field.id]: isNaN(num) ? 0 : num });
              }}
              keyboardType="numeric"
              editable={canEdit}
            />
          </View>
        );

      case "date":
        return (
          <View key={field.id} className="mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              {field.label}
              {field.required && <Text className="text-red-600"> *</Text>}
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder="YYYY-MM-DD"
              value={(value as string) || ""}
              onChangeText={(text) => setFormResponses({ ...formResponses, [field.id]: text })}
              editable={canEdit}
            />
          </View>
        );

      case "checkbox":
        return (
          <View key={field.id} className="mb-4 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-gray-900">
              {field.label}
              {field.required && <Text className="text-red-600"> *</Text>}
            </Text>
            <Switch
              value={(value as boolean) || false}
              onValueChange={(checked) => setFormResponses({ ...formResponses, [field.id]: checked })}
              disabled={!canEdit}
            />
          </View>
        );

      case "select":
        return (
          <View key={field.id} className="mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              {field.label}
              {field.required && <Text className="text-red-600"> *</Text>}
            </Text>
            <View className="bg-white border border-gray-300 rounded-xl overflow-hidden">
              {field.options?.map((option, index) => (
                <Pressable
                  key={option}
                  onPress={() => canEdit && setFormResponses({ ...formResponses, [field.id]: option })}
                  className={`px-4 py-3 ${index !== 0 ? "border-t border-gray-200" : ""} ${
                    value === option ? "bg-yellow-50" : ""
                  } active:opacity-70`}
                  disabled={!canEdit}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-5 h-5 rounded-full border-2 ${
                        value === option ? "border-yellow-600 bg-yellow-600" : "border-gray-300"
                      } items-center justify-center mr-3`}
                    >
                      {value === option && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <Text className="text-base text-gray-900">{option}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return { bg: "bg-red-600", text: "text-white" };
      case "high":
        return { bg: "bg-orange-600", text: "text-white" };
      case "medium":
        return { bg: "bg-yellow-600", text: "text-white" };
      case "low":
        return { bg: "bg-gray-600", text: "text-white" };
      default:
        return { bg: "bg-gray-600", text: "text-white" };
    }
  };

  const priorityColor = getPriorityColor(task.priority);

  const formatDate = (dateString: string) => {
    try {
      // Parse date string in YYYY-MM-DD format properly to avoid timezone issues
      // Also handle ISO timestamp format (YYYY-MM-DDTHH:mm:ss.sssZ)
      if (dateString.includes("T")) {
        // This is an ISO timestamp, use Date constructor
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid date";
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      } else {
        // This is a YYYY-MM-DD date string, parse manually
        const parts = dateString.split("-");
        if (parts.length !== 3) return "Invalid date";
        const [year, month, day] = parts.map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) return "Invalid date";
        const date = new Date(year, month - 1, day);
        if (isNaN(date.getTime())) return "Invalid date";
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className={`${priorityColor.bg} pt-16 pb-6 px-6`}>
        <Pressable onPress={() => navigation.goBack()} className="mb-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className={`text-2xl font-bold ${priorityColor.text} mb-2`}>{task.title}</Text>
        <View className="flex-row items-center gap-3">
          <View className="bg-white/20 px-3 py-1 rounded-full">
            <Text className={`text-xs font-semibold ${priorityColor.text}`}>
              {task.priority.toUpperCase()}
            </Text>
          </View>
          <View className="bg-white/20 px-3 py-1 rounded-full">
            <Text className={`text-xs font-semibold ${priorityColor.text}`}>
              {task.status.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Task Info */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
          <Text className="text-sm font-semibold text-gray-900 mb-3">Task Details</Text>
          <Text className="text-base text-gray-700 mb-4">{task.description}</Text>

          <View className="space-y-2">
            <View className="flex-row items-center py-2 border-t border-gray-100">
              <Ionicons name="person-outline" size={18} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-3 flex-1">Assigned by:</Text>
              <Text className="text-sm font-semibold text-gray-900">{task.assignedByUserName}</Text>
            </View>

            {task.dueDate && (
              <View className="flex-row items-center py-2 border-t border-gray-100">
                <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-3 flex-1">Due date:</Text>
                <Text className="text-sm font-semibold text-gray-900">{formatDate(task.dueDate)}</Text>
              </View>
            )}

            {participantDisplayName && (
              <View className="flex-row items-center py-2 border-t border-gray-100">
                <Ionicons name="people-outline" size={18} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-3 flex-1">Related to:</Text>
                <Pressable
                  onPress={() => {
                    if (relatedParticipant) {
                      navigation.navigate("ParticipantProfile", { participantId: relatedParticipant.id });
                    }
                  }}
                  className="active:opacity-70"
                >
                  <Text className="text-sm font-semibold text-blue-600">{participantDisplayName}</Text>
                </Pressable>
              </View>
            )}

            {task.completedAt && (
              <View className="flex-row items-center py-2 border-t border-gray-100">
                <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
                <Text className="text-sm text-gray-600 ml-3 flex-1">Completed:</Text>
                <Text className="text-sm font-semibold text-green-600">{formatDate(task.completedAt)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Custom Form */}
        {task.customForm && task.customForm.length > 0 && (
          <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
            <Text className="text-sm font-semibold text-gray-900 mb-4">
              {isCompleted ? "Form Submission" : "Required Form"}
            </Text>

            {isCompleted && task.formResponse ? (
              // Show completed form responses
              <View>
                {task.customForm.map((field) => {
                  const response = task.formResponse?.find((r) => r.fieldId === field.id);
                  return (
                    <View key={field.id} className="mb-3">
                      <Text className="text-sm font-semibold text-gray-700 mb-1">{field.label}</Text>
                      <Text className="text-base text-gray-900">{response?.value?.toString() || "N/A"}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              // Show editable form
              task.customForm.map(renderFormField)
            )}
          </View>
        )}

        {/* Status Actions */}
        {task.assignedToUserId === currentUser?.id && !isCompleted && (
          <View className="mb-4">
            {task.status === "pending" && (
              <Pressable
                onPress={() => handleUpdateStatus("in_progress")}
                className="bg-blue-600 rounded-xl py-4 items-center active:opacity-80 mb-3"
              >
                <Text className="text-white text-base font-bold">Start Working</Text>
              </Pressable>
            )}

            {/* Completion Comment Field */}
            <View className="bg-white rounded-2xl p-5 mb-3 border border-gray-100">
              <Text className="text-sm font-semibold text-gray-900 mb-2">
                Completion Comment (Optional)
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="Add any notes or comments about completing this task..."
                value={completionComment}
                onChangeText={setCompletionComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {task.customForm && task.customForm.length > 0 ? (
              <Pressable
                onPress={handleSubmitForm}
                className="bg-green-600 rounded-xl py-4 items-center active:opacity-80"
              >
                <Text className="text-white text-base font-bold">Submit & Complete</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleCompleteWithoutForm}
                className="bg-green-600 rounded-xl py-4 items-center active:opacity-80"
              >
                <Text className="text-white text-base font-bold">Mark as Complete</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Show completion comment if task is completed */}
        {isCompleted && task.completionComment && (
          <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Completion Comment</Text>
            <Text className="text-base text-gray-700">{task.completionComment}</Text>
          </View>
        )}
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-8 w-80">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="checkmark-circle" size={40} color="#16A34A" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Task Completed!</Text>
              <Text className="text-sm text-gray-600 text-center">
                Great job! The task has been marked as complete.
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}
              className="bg-green-600 rounded-xl py-3 items-center active:opacity-80"
            >
              <Text className="text-white text-base font-bold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-8 w-80">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="close-circle" size={40} color="#DC2626" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Error</Text>
              <Text className="text-sm text-gray-600 text-center">{errorMessage}</Text>
            </View>
            <Pressable
              onPress={() => setShowErrorModal(false)}
              className="bg-red-600 rounded-xl py-3 items-center active:opacity-80"
            >
              <Text className="text-white text-base font-bold">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
