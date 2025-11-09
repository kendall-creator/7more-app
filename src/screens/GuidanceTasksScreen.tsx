import React, { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGuidanceStore } from "../state/guidanceStore";
import { useCurrentUser, useUserRole } from "../state/authStore";
import { useParticipantStore } from "../state/participantStore";

export default function GuidanceTasksScreen({ navigation }: any) {
  const currentUser = useCurrentUser();
  const userRole = useUserRole();
  const guidanceTasks = useGuidanceStore((s) => s.guidanceTasks);
  const completeGuidanceTask = useGuidanceStore((s) => s.completeGuidanceTask);
  const participants = useParticipantStore((s) => s.participants);

  // Use useMemo to prevent re-creating arrays on every render
  const pendingTasks = useMemo(
    () => guidanceTasks.filter((t) => t.status === "pending"),
    [guidanceTasks]
  );

  const completedTasks = useMemo(
    () => guidanceTasks.filter((t) => t.status === "completed"),
    [guidanceTasks]
  );

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  if (!currentUser) {
    return null;
  }

  const isAuthorized = userRole === "admin" || userRole === "mentorship_leader";

  if (!isAuthorized) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="lock-closed-outline" size={64} color="#9CA3AF" />
        <Text className="text-lg font-semibold text-gray-700 mt-4 text-center">
          Access Restricted
        </Text>
        <Text className="text-sm text-gray-500 text-center mt-2">
          Only admins and mentorship leaders can access guidance tasks.
        </Text>
      </View>
    );
  }

  const handleOpenCompleteModal = (task: any) => {
    setSelectedTask(task);
    setResponse("");
    setFollowUpNotes("");
    setShowCompletionModal(true);
  };

  const handleCompleteTask = async () => {
    if (!selectedTask || !response.trim()) {
      Alert.alert("Missing Information", "Please provide your guidance response.");
      return;
    }

    try {
      await completeGuidanceTask(
        selectedTask.id,
        currentUser.id,
        currentUser.name,
        response,
        followUpNotes
      );

      Alert.alert("Success", "Guidance task completed successfully!");
      setShowCompletionModal(false);
      setSelectedTask(null);
      setResponse("");
      setFollowUpNotes("");
    } catch (error) {
      Alert.alert("Error", "Failed to complete guidance task. Please try again.");
    }
  };

  const getParticipantByid = (participantId: string) => {
    return participants.find((p) => p.id === participantId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const tasksToDisplay = showCompleted ? completedTasks : pendingTasks;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-indigo-600 pt-16 pb-6 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-3xl font-bold text-white mb-2">Guidance Tasks</Text>
        <Text className="text-indigo-100 text-base">
          {pendingTasks.length} pending task{pendingTasks.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Toggle Tabs */}
      <View className="flex-row bg-gray-50 px-6 py-3 border-b border-gray-200">
        <Pressable
          onPress={() => setShowCompleted(false)}
          className={`flex-1 py-3 rounded-lg mr-2 ${
            !showCompleted ? "bg-indigo-600" : "bg-white"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              !showCompleted ? "text-white" : "text-gray-700"
            }`}
          >
            Pending ({pendingTasks.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setShowCompleted(true)}
          className={`flex-1 py-3 rounded-lg ml-2 ${
            showCompleted ? "bg-indigo-600" : "bg-white"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              showCompleted ? "text-white" : "text-gray-700"
            }`}
          >
            Completed ({completedTasks.length})
          </Text>
        </Pressable>
      </View>

      {/* Tasks List */}
      <ScrollView className="flex-1 px-6 pt-4">
        {tasksToDisplay.length === 0 ? (
          <View className="bg-gray-50 rounded-xl p-8 items-center mt-8">
            <Ionicons
              name={showCompleted ? "checkmark-done-circle-outline" : "help-circle-outline"}
              size={64}
              color="#9CA3AF"
            />
            <Text className="text-gray-500 text-center mt-4 text-base">
              {showCompleted
                ? "No completed guidance tasks yet."
                : "No pending guidance tasks. Great job!"}
            </Text>
          </View>
        ) : (
          <View className="gap-4 pb-6">
            {tasksToDisplay.map((task) => {
              const participant = getParticipantByid(task.participantId);

              return (
                <View
                  key={task.id}
                  className={`border-2 rounded-xl p-4 ${
                    task.status === "pending"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  {/* Task Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900">{task.participantName}</Text>
                      <Text className="text-sm text-gray-600 mt-1">
                        Mentor: {task.mentorName}
                      </Text>
                    </View>
                    {task.status === "pending" && (
                      <View className="bg-amber-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-semibold text-amber-800">PENDING</Text>
                      </View>
                    )}
                    {task.status === "completed" && (
                      <View className="bg-green-100 px-3 py-1 rounded-full">
                        <Text className="text-xs font-semibold text-green-800">COMPLETED</Text>
                      </View>
                    )}
                  </View>

                  {/* Task Details */}
                  <View className="mb-3">
                    <Text className="text-sm font-semibold text-gray-700 mb-1">Guidance Needed:</Text>
                    <Text className="text-base text-gray-900">{task.guidanceNotes}</Text>
                  </View>

                  {/* Completed Task Info */}
                  {task.status === "completed" && task.response && (
                    <View className="mt-3 pt-3 border-t border-green-200">
                      <Text className="text-sm font-semibold text-gray-700 mb-1">Response:</Text>
                      <Text className="text-base text-gray-900 mb-2">{task.response}</Text>

                      {task.followUpNotes && (
                        <>
                          <Text className="text-sm font-semibold text-gray-700 mb-1 mt-2">
                            Follow-up Notes:
                          </Text>
                          <Text className="text-base text-gray-900">{task.followUpNotes}</Text>
                        </>
                      )}

                      <Text className="text-xs text-gray-500 mt-2">
                        Completed by {task.completedByName} on {formatDate(task.completedAt!)}
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View className="flex-row gap-2 mt-4 pt-3 border-t border-gray-200">
                    <Pressable
                      onPress={() =>
                        participant && navigation.navigate("ParticipantProfile", { participantId: participant.id })
                      }
                      className="flex-1 bg-blue-50 border border-blue-200 rounded-lg py-2 flex-row items-center justify-center active:opacity-70"
                    >
                      <Ionicons name="person-outline" size={16} color="#2563EB" />
                      <Text className="text-blue-600 text-sm font-semibold ml-1">View Profile</Text>
                    </Pressable>

                    {task.status === "pending" && (
                      <Pressable
                        onPress={() => handleOpenCompleteModal(task)}
                        className="flex-1 bg-indigo-600 border border-indigo-600 rounded-lg py-2 flex-row items-center justify-center active:opacity-80"
                      >
                        <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                        <Text className="text-white text-sm font-semibold ml-1">Complete</Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Created Date */}
                  <Text className="text-xs text-gray-500 mt-3">
                    Created {formatDate(task.createdAt)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Complete Task Modal */}
      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl w-full max-w-md p-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Provide Guidance</Text>

            {selectedTask && (
              <>
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">Participant:</Text>
                  <Text className="text-base text-gray-900">{selectedTask.participantName}</Text>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">Mentor:</Text>
                  <Text className="text-base text-gray-900">{selectedTask.mentorName}</Text>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">Request:</Text>
                  <Text className="text-base text-gray-900">{selectedTask.guidanceNotes}</Text>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Your Guidance <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Provide your guidance and recommendations..."
                    value={response}
                    onChangeText={setResponse}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Follow-up Notes (Optional)
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Any additional follow-up instructions for the mentor..."
                    value={followUpNotes}
                    onChangeText={setFollowUpNotes}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </>
            )}

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowCompletionModal(false)}
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleCompleteTask}
                className="flex-1 bg-indigo-600 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white font-semibold">Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
