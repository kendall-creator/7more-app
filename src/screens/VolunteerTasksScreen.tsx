import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTaskStore } from "../state/taskStore";
import { useCurrentUser } from "../state/authStore";

type RootStackParamList = {
  TaskDetail: { taskId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function VolunteerTasksScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentUser = useCurrentUser();
  const allTasks = useTaskStore((s) => s.tasks);

  const [refreshing, setRefreshing] = React.useState(false);

  // Filter tasks to only show volunteer-related tasks assigned to current user
  const volunteerTasks = useMemo(() => {
    if (!currentUser) return [];

    return allTasks.filter(
      (task) =>
        task.assignedToUserId === currentUser.id &&
        (task.title.includes("Follow Up") ||
          task.title.includes("Monetary Donation") ||
          task.title.includes("Volunteer Inquiry"))
    );
  }, [allTasks, currentUser]);

  // Categorize tasks by status
  const categorizedTasks = useMemo(() => {
    const pending = volunteerTasks.filter((t) => t.status === "pending");
    const inProgress = volunteerTasks.filter((t) => t.status === "in_progress");
    const overdue = volunteerTasks.filter((t) => t.status === "overdue");
    const completed = volunteerTasks.filter((t) => t.status === "completed");

    return { pending, inProgress, overdue, completed };
  }, [volunteerTasks]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getInterestBadgeColor = (title: string) => {
    if (title.includes("Bridge Team")) return "bg-blue-100 text-blue-700";
    if (title.includes("Clothing")) return "bg-purple-100 text-purple-700";
    if (title.includes("Prison")) return "bg-orange-100 text-orange-700";
    if (title.includes("Administrative")) return "bg-indigo-100 text-indigo-700";
    if (title.includes("General")) return "bg-green-100 text-green-700";
    if (title.includes("Monetary")) return "bg-emerald-100 text-emerald-700";
    return "bg-gray-100 text-gray-700";
  };

  const TaskCard = ({ task }: { task: any }) => {
    const badgeColor = getInterestBadgeColor(task.title);

    return (
      <Pressable
        onPress={() => navigation.navigate("TaskDetail", { taskId: task.id })}
        className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
      >
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-base font-bold text-gray-900 mb-1">{task.title}</Text>
            <View className={`self-start px-2 py-1 rounded ${badgeColor}`}>
              <Text className="text-xs font-medium">
                {task.title.split("-")[1]?.trim() || "Volunteer Task"}
              </Text>
            </View>
          </View>
          <View
            className={`px-2 py-1 rounded ${
              task.status === "overdue"
                ? "bg-red-100"
                : task.status === "in_progress"
                ? "bg-blue-100"
                : task.status === "completed"
                ? "bg-green-100"
                : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                task.status === "overdue"
                  ? "text-red-700"
                  : task.status === "in_progress"
                  ? "text-blue-700"
                  : task.status === "completed"
                  ? "text-green-700"
                  : "text-gray-700"
              }`}
            >
              {task.status === "in_progress"
                ? "In Progress"
                : task.status === "overdue"
                ? "Overdue"
                : task.status === "completed"
                ? "Completed"
                : "Pending"}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
          {task.description}
        </Text>

        {task.priority && (
          <View className="flex-row items-center mb-2">
            <Ionicons
              name="flag"
              size={14}
              color={
                task.priority === "urgent"
                  ? "#DC2626"
                  : task.priority === "high"
                  ? "#F59E0B"
                  : task.priority === "medium"
                  ? "#3B82F6"
                  : "#6B7280"
              }
            />
            <Text
              className={`text-xs font-medium ml-1 ${
                task.priority === "urgent"
                  ? "text-red-600"
                  : task.priority === "high"
                  ? "text-amber-600"
                  : task.priority === "medium"
                  ? "text-blue-600"
                  : "text-gray-600"
              }`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Text>
          </View>
        )}

        {task.dueDate && (
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Volunteer Tasks</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Tasks from volunteer inquiries assigned to you
        </Text>
      </View>

      {/* Stats */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row space-x-3">
          <View className="flex-1 bg-red-50 rounded-lg p-3">
            <Text className="text-2xl font-bold text-red-600">
              {categorizedTasks.overdue.length}
            </Text>
            <Text className="text-xs text-gray-600 mt-1">Overdue</Text>
          </View>
          <View className="flex-1 bg-blue-50 rounded-lg p-3">
            <Text className="text-2xl font-bold text-blue-600">
              {categorizedTasks.inProgress.length}
            </Text>
            <Text className="text-xs text-gray-600 mt-1">In Progress</Text>
          </View>
          <View className="flex-1 bg-gray-50 rounded-lg p-3">
            <Text className="text-2xl font-bold text-gray-600">
              {categorizedTasks.pending.length}
            </Text>
            <Text className="text-xs text-gray-600 mt-1">Pending</Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-lg p-3">
            <Text className="text-2xl font-bold text-green-600">
              {categorizedTasks.completed.length}
            </Text>
            <Text className="text-xs text-gray-600 mt-1">Completed</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {volunteerTasks.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="checkmark-circle-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-center mt-4 text-base">
              No volunteer tasks assigned
            </Text>
            <Text className="text-gray-400 text-center mt-2 text-sm">
              Volunteer inquiry tasks will appear here when assigned to you
            </Text>
          </View>
        ) : (
          <>
            {/* Overdue Tasks */}
            {categorizedTasks.overdue.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text className="text-base font-bold text-gray-900 ml-2">
                    Overdue ({categorizedTasks.overdue.length})
                  </Text>
                </View>
                {categorizedTasks.overdue.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </View>
            )}

            {/* In Progress Tasks */}
            {categorizedTasks.inProgress.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="time" size={20} color="#3B82F6" />
                  <Text className="text-base font-bold text-gray-900 ml-2">
                    In Progress ({categorizedTasks.inProgress.length})
                  </Text>
                </View>
                {categorizedTasks.inProgress.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </View>
            )}

            {/* Pending Tasks */}
            {categorizedTasks.pending.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="hourglass-outline" size={20} color="#6B7280" />
                  <Text className="text-base font-bold text-gray-900 ml-2">
                    Pending ({categorizedTasks.pending.length})
                  </Text>
                </View>
                {categorizedTasks.pending.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </View>
            )}

            {/* Completed Tasks */}
            {categorizedTasks.completed.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="text-base font-bold text-gray-900 ml-2">
                    Completed ({categorizedTasks.completed.length})
                  </Text>
                </View>
                {categorizedTasks.completed.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </View>
            )}
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
