import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTaskStore } from "../state/taskStore";
import { useUsersStore } from "../state/usersStore";
import { useParticipantStore } from "../state/participantStore";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../types";

type SortBy = "completedDate" | "user" | "title";

export default function CompletedTasksScreen() {
  const navigation = useNavigation<any>();
  const allTasks = useTaskStore((s) => s.tasks);
  const users = useUsersStore((s) => s.invitedUsers);
  const participants = useParticipantStore((s) => s.participants);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("completedDate");
  const [sortAscending, setSortAscending] = useState(false);

  // Get only completed tasks
  const completedTasks = useMemo(
    () => allTasks.filter((t) => t.status === "completed"),
    [allTasks]
  );

  // Filter tasks by search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return completedTasks;

    const query = searchQuery.toLowerCase();
    return completedTasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(query);
      const descMatch = task.description.toLowerCase().includes(query);
      const userMatch = task.assignedToUserName.toLowerCase().includes(query);
      const commentMatch = task.completionComment?.toLowerCase().includes(query);
      return titleMatch || descMatch || userMatch || commentMatch;
    });
  }, [completedTasks, searchQuery]);

  // Sort filtered tasks
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "completedDate":
          const dateA = new Date(a.completedAt || 0).getTime();
          const dateB = new Date(b.completedAt || 0).getTime();
          comparison = dateB - dateA; // Most recent first by default
          break;

        case "user":
          comparison = a.assignedToUserName.localeCompare(b.assignedToUserName);
          break;

        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortAscending ? comparison : -comparison;
    });

    return sorted;
  }, [filteredTasks, sortBy, sortAscending]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const renderTaskCard = (task: Task) => {
    // Dynamically look up participant info if task is related to a participant
    const relatedParticipant = task.relatedParticipantId
      ? participants.find((p) => p.id === task.relatedParticipantId)
      : null;

    const participantDisplayName = relatedParticipant
      ? `${relatedParticipant.firstName} ${relatedParticipant.lastName}`
      : task.relatedParticipantName;

    return (
      <Pressable
        key={task.id}
        onPress={() => navigation.navigate("TaskDetail", { taskId: task.id })}
        className="bg-white rounded-2xl p-4 mb-3 border-2 border-green-200 active:opacity-70"
      >
        {/* Header Row */}
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-lg font-bold text-[#3c3832] mb-1">{task.title}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="person" size={14} color="#99896c" />
              <Text className="text-xs text-[#99896c] ml-1">{task.assignedToUserName}</Text>
            </View>
            {participantDisplayName && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="people" size={14} color="#99896c" />
                <Text className="text-xs text-[#99896c] ml-1">{participantDisplayName}</Text>
              </View>
            )}
          </View>
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-green-800">COMPLETED</Text>
          </View>
        </View>

        {/* Description */}
        <Text className="text-sm text-[#99896c] mb-2" numberOfLines={2}>
          {task.description}
        </Text>

        {/* Completion Info */}
        {task.completedAt && (
          <View className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text className="text-xs text-green-700 ml-1">{formatDate(task.completedAt)}</Text>
          </View>
        )}

        {/* Completion Comment Preview */}
        {task.completionComment && (
          <View className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mt-2">
            <View className="flex-row items-center mb-1">
              <Ionicons name="chatbox-outline" size={14} color="#2563EB" />
              <Text className="text-xs font-semibold text-blue-800 ml-1">Comment:</Text>
            </View>
            <Text className="text-xs text-blue-700" numberOfLines={2}>
              {task.completionComment}
            </Text>
          </View>
        )}

        {/* Form Response Indicator */}
        {task.formResponse && task.formResponse.length > 0 && (
          <View className="flex-row items-center mt-2">
            <Ionicons name="clipboard" size={14} color="#99896c" />
            <Text className="text-xs text-[#99896c] ml-1">
              Form completed ({task.formResponse.length} field{task.formResponse.length !== 1 ? "s" : ""})
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      {/* Header */}
      <View className="bg-[#405b69] pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-between mb-3">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
        </View>
        <Text className="text-2xl font-bold text-white mb-1">Completed Tasks</Text>
        <Text className="text-white/80 text-sm">{sortedTasks.length} completed task{sortedTasks.length !== 1 ? "s" : ""}</Text>
      </View>

      {/* Search Bar */}
      <View className="px-6 py-4">
        <View className="bg-white border border-[#d7d7d6] rounded-xl px-4 py-3 flex-row items-center">
          <Ionicons name="search" size={18} color="#99896c" />
          <TextInput
            className="flex-1 ml-2 text-sm"
            placeholder="Search tasks, users, or comments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#99896c"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#99896c" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Sort Options */}
      <View className="px-6 pb-4">
        <Text className="text-xs font-semibold text-[#99896c] mb-2">SORT BY</Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => {
              if (sortBy === "completedDate") {
                setSortAscending(!sortAscending);
              } else {
                setSortBy("completedDate");
                setSortAscending(false);
              }
            }}
            className={`flex-1 px-3 py-2 rounded-xl border-2 ${
              sortBy === "completedDate" ? "border-[#fcc85c] bg-[#fcc85c]/20" : "border-[#d7d7d6] bg-white"
            } active:opacity-70 flex-row items-center justify-center`}
          >
            <Text
              className={`text-xs font-semibold ${
                sortBy === "completedDate" ? "text-[#291403]" : "text-[#99896c]"
              }`}
            >
              Date
            </Text>
            {sortBy === "completedDate" && (
              <Ionicons
                name={sortAscending ? "arrow-up" : "arrow-down"}
                size={12}
                color="#291403"
                style={{ marginLeft: 4 }}
              />
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              if (sortBy === "user") {
                setSortAscending(!sortAscending);
              } else {
                setSortBy("user");
                setSortAscending(true);
              }
            }}
            className={`flex-1 px-3 py-2 rounded-xl border-2 ${
              sortBy === "user" ? "border-[#fcc85c] bg-[#fcc85c]/20" : "border-[#d7d7d6] bg-white"
            } active:opacity-70 flex-row items-center justify-center`}
          >
            <Text
              className={`text-xs font-semibold ${
                sortBy === "user" ? "text-[#291403]" : "text-[#99896c]"
              }`}
            >
              User
            </Text>
            {sortBy === "user" && (
              <Ionicons
                name={sortAscending ? "arrow-up" : "arrow-down"}
                size={12}
                color="#291403"
                style={{ marginLeft: 4 }}
              />
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              if (sortBy === "title") {
                setSortAscending(!sortAscending);
              } else {
                setSortBy("title");
                setSortAscending(true);
              }
            }}
            className={`flex-1 px-3 py-2 rounded-xl border-2 ${
              sortBy === "title" ? "border-[#fcc85c] bg-[#fcc85c]/20" : "border-[#d7d7d6] bg-white"
            } active:opacity-70 flex-row items-center justify-center`}
          >
            <Text
              className={`text-xs font-semibold ${
                sortBy === "title" ? "text-[#291403]" : "text-[#99896c]"
              }`}
            >
              Title
            </Text>
            {sortBy === "title" && (
              <Ionicons
                name={sortAscending ? "arrow-up" : "arrow-down"}
                size={12}
                color="#291403"
                style={{ marginLeft: 4 }}
              />
            )}
          </Pressable>
        </View>
      </View>

      {/* Task List */}
      <ScrollView className="flex-1 px-6">
        {sortedTasks.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="checkmark-done-circle-outline" size={64} color="#d7d7d6" />
            <Text className="text-[#99896c] text-base mt-4">
              {searchQuery ? "No matching completed tasks" : "No completed tasks yet"}
            </Text>
          </View>
        ) : (
          sortedTasks.map(renderTaskCard)
        )}
      </ScrollView>
    </View>
  );
}
