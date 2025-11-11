import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useTaskStore } from "../state/taskStore";
import { useCurrentUser, useIsImpersonating, useOriginalAdmin, useAuthStore, useUserRole } from "../state/authStore";
import { useInvitedUsers } from "../state/usersStore";
import { Task } from "../types";
import { Ionicons } from "@expo/vector-icons";

export default function TaskManagementScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const userRole = useUserRole();
  const isImpersonating = useIsImpersonating();
  const originalAdmin = useOriginalAdmin();
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation);
  const allTasks = useTaskStore((s) => s.tasks);
  const allUsers = useInvitedUsers();

  const [activeTab, setActiveTab] = useState<"my" | "assigned" | "all">("my");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "overdue" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tasks based on active tab
  const filteredTasks = useMemo(() => {
    let tasks: Task[] = [];

    if (activeTab === "my") {
      tasks = allTasks.filter((t) => t.assignedToUserId === currentUser?.id);
    } else if (activeTab === "assigned") {
      tasks = allTasks.filter((t) => t.assignedByUserId === currentUser?.id);
    } else {
      // For "all" tab, Bridge Team Leaders only see tasks assigned to Bridge Team members
      if (userRole === "bridge_team_leader") {
        const bridgeTeamUserIds = allUsers
          .filter((u) => u.role === "bridge_team" || u.role === "bridge_team_leader")
          .map((u) => u.id);
        tasks = allTasks.filter((t) => bridgeTeamUserIds.includes(t.assignedToUserId));
      } else {
        tasks = allTasks;
      }
    }

    // Apply status filter (only for "My Tasks" tab)
    if (activeTab === "my" && statusFilter !== "all") {
      tasks = tasks.filter((t) => t.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.assignedToUserName?.toLowerCase().includes(query) ||
          t.assignedByUserName?.toLowerCase().includes(query)
      );
    }

    return tasks;
  }, [activeTab, statusFilter, allTasks, currentUser, searchQuery, userRole, allUsers]);

  // Group tasks by assignee for "assigned" and "all" tabs
  const groupedTasks = useMemo(() => {
    if (activeTab === "my") {
      // For "My Tasks", group by status
      return {
        overdue: filteredTasks.filter((t) => t.status === "overdue"),
        pending: filteredTasks.filter((t) => t.status === "pending"),
        in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
        completed: filteredTasks.filter((t) => t.status === "completed"),
      };
    }

    // For "Tasks I Assigned" and "All Tasks", group by assignee
    const grouped: Record<string, Task[]> = {};

    filteredTasks.forEach((task) => {
      const assigneeName = task.assignedToUserName || "Unassigned";
      if (!grouped[assigneeName]) {
        grouped[assigneeName] = [];
      }
      grouped[assigneeName].push(task);
    });

    // Sort each group by priority and due date
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        // Priority order: urgent > high > medium > low
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;

        if (aPriority !== bPriority) return aPriority - bPriority;

        // Then by due date
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    });

    return grouped;
  }, [activeTab, filteredTasks]);

  // Calculate counts for status filters (only for My Tasks)
  const statusCounts = useMemo(() => {
    if (activeTab !== "my") return null;

    const myTasks = allTasks.filter((t) => t.assignedToUserId === currentUser?.id);
    return {
      all: myTasks.length,
      pending: myTasks.filter((t) => t.status === "pending").length,
      in_progress: myTasks.filter((t) => t.status === "in_progress").length,
      overdue: myTasks.filter((t) => t.status === "overdue").length,
      completed: myTasks.filter((t) => t.status === "completed").length,
    };
  }, [activeTab, allTasks, currentUser]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-gray-300";
      case "in_progress":
        return "border-blue-300 bg-blue-50";
      case "overdue":
        return "border-red-300 bg-red-50";
      case "completed":
        return "border-green-300 bg-green-50";
      default:
        return "border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "overdue":
        return "Overdue";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return "No due date";

    try {
      const parts = dueDate.split("-");
      if (parts.length !== 3) return "Invalid date";

      const [year, month, day] = parts.map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return "Invalid date";

      const date = new Date(year, month - 1, day);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`;
      if (diffDays === 0) return "Due today";
      if (diffDays === 1) return "Due tomorrow";
      return `Due in ${diffDays} days`;
    } catch (error) {
      return "Invalid date";
    }
  };

  const renderTaskCard = (task: Task, showAssignee: boolean = false) => {
    return (
      <Pressable
        key={task.id}
        onPress={() => navigation.navigate("TaskDetail", { taskId: task.id })}
        className={`bg-white rounded-xl p-4 mb-3 border-2 active:opacity-70 ${getStatusColor(task.status)}`}
      >
        {/* Priority and Status Badges */}
        <View className="flex-row items-center mb-3 gap-2">
          <View className={`px-3 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
            <Text className={`text-xs font-bold uppercase ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Text>
          </View>
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-gray-700">{getStatusLabel(task.status)}</Text>
          </View>
        </View>

        {/* Task Title */}
        <Text className="text-base font-bold text-gray-900 mb-2">{task.title}</Text>

        {/* Task Description */}
        {task.description && (
          <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
            {task.description}
          </Text>
        )}

        {/* Task Meta Info */}
        <View className="gap-2">
          {showAssignee && task.assignedToUserName && (
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1">
                Assigned to: {task.assignedToUserName}
              </Text>
            </View>
          )}
          {activeTab !== "my" && task.assignedByUserName && (
            <View className="flex-row items-center">
              <Ionicons name="person-add-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1">
                Created by: {task.assignedByUserName}
              </Text>
            </View>
          )}
          {task.dueDate && (
            <View className="flex-row items-center">
              <Ionicons
                name="calendar-outline"
                size={14}
                color={task.status === "overdue" ? "#EF4444" : "#6B7280"}
              />
              <Text
                className={`text-xs ml-1 font-semibold ${
                  task.status === "overdue" ? "text-red-600" : "text-gray-600"
                }`}
              >
                {formatDueDate(task.dueDate)}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  const handleReturnToAdmin = () => {
    stopImpersonation();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      })
    );
  };

  const contentContainerStyle = useMemo(
    () => ({ paddingBottom: isImpersonating ? 100 : 20 }),
    [isImpersonating]
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-4 px-6">
        <Text className="text-2xl font-bold text-white mb-1">Task Management</Text>
        <Text className="text-gray-100 text-sm">{filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}</Text>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row px-6">
          <Pressable
            onPress={() => setActiveTab("my")}
            className={`flex-1 py-4 border-b-2 ${
              activeTab === "my" ? "border-gray-600" : "border-transparent"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "my" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              My Tasks
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("assigned")}
            className={`flex-1 py-4 border-b-2 ${
              activeTab === "assigned" ? "border-gray-600" : "border-transparent"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "assigned" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Tasks I Assigned
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("all")}
            className={`flex-1 py-4 border-b-2 ${
              activeTab === "all" ? "border-gray-600" : "border-transparent"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "all" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              All Tasks
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-6 pt-4 pb-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Status Filter Tabs (only show on My Tasks tab) */}
      {activeTab === "my" && statusCounts && (
        <View className="bg-white border-b border-gray-200">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-6 py-3"
            contentContainerStyle={{ gap: 8 }}
          >
            <Pressable
              onPress={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-full border ${
                statusFilter === "all" ? "bg-gray-600 border-gray-600" : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  statusFilter === "all" ? "text-white" : "text-gray-700"
                }`}
              >
                All ({statusCounts.all})
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setStatusFilter("overdue")}
              className={`px-4 py-2 rounded-full border ${
                statusFilter === "overdue" ? "bg-red-600 border-red-600" : "bg-white border-red-300"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  statusFilter === "overdue" ? "text-white" : "text-red-700"
                }`}
              >
                Overdue ({statusCounts.overdue})
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setStatusFilter("in_progress")}
              className={`px-4 py-2 rounded-full border ${
                statusFilter === "in_progress" ? "bg-blue-600 border-blue-600" : "bg-white border-blue-300"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  statusFilter === "in_progress" ? "text-white" : "text-blue-700"
                }`}
              >
                In Progress ({statusCounts.in_progress})
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setStatusFilter("pending")}
              className={`px-4 py-2 rounded-full border ${
                statusFilter === "pending" ? "bg-gray-600 border-gray-600" : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  statusFilter === "pending" ? "text-white" : "text-gray-700"
                }`}
              >
                Pending ({statusCounts.pending})
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setStatusFilter("completed")}
              className={`px-4 py-2 rounded-full border ${
                statusFilter === "completed" ? "bg-green-600 border-green-600" : "bg-white border-green-300"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  statusFilter === "completed" ? "text-white" : "text-green-700"
                }`}
              >
                Completed ({statusCounts.completed})
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      )}

      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={contentContainerStyle}>
        {/* Render tasks based on active tab */}
        {activeTab === "my" ? (
          // My Tasks - grouped by status or filtered by status
          <>
            {statusFilter === "all" ? (
              // Show all tasks grouped by status
              <>
                {(groupedTasks as any).overdue?.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-sm font-bold text-red-700 mb-3 uppercase">
                      Overdue ({(groupedTasks as any).overdue.length})
                    </Text>
                    {(groupedTasks as any).overdue.map((task: Task) => renderTaskCard(task))}
                  </View>
                )}

                {(groupedTasks as any).in_progress?.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-sm font-bold text-blue-700 mb-3 uppercase">
                      In Progress ({(groupedTasks as any).in_progress.length})
                    </Text>
                    {(groupedTasks as any).in_progress.map((task: Task) => renderTaskCard(task))}
                  </View>
                )}

                {(groupedTasks as any).pending?.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-sm font-bold text-gray-700 mb-3 uppercase">
                      Pending ({(groupedTasks as any).pending.length})
                    </Text>
                    {(groupedTasks as any).pending.map((task: Task) => renderTaskCard(task))}
                  </View>
                )}

                {(groupedTasks as any).completed?.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-sm font-bold text-green-700 mb-3 uppercase">
                      Completed ({(groupedTasks as any).completed.length})
                    </Text>
                    {(groupedTasks as any).completed.map((task: Task) => renderTaskCard(task))}
                  </View>
                )}

                {filteredTasks.length === 0 && (
                  <View className="items-center justify-center py-12">
                    <Ionicons name="checkbox-outline" size={64} color="#D1D5DB" />
                    <Text className="text-gray-500 text-base mt-4">No tasks assigned to you</Text>
                  </View>
                )}
              </>
            ) : (
              // Show only tasks of the selected status
              <>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task: Task) => renderTaskCard(task))
                ) : (
                  <View className="items-center justify-center py-12">
                    <Ionicons name="checkbox-outline" size={64} color="#D1D5DB" />
                    <Text className="text-gray-500 text-base mt-4">
                      No {getStatusLabel(statusFilter).toLowerCase()} tasks
                    </Text>
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          // Tasks I Assigned & All Tasks - grouped by assignee
          <>
            {Object.keys(groupedTasks).length > 0 ? (
              Object.entries(groupedTasks)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([assigneeName, tasks]) => (
                  <View key={assigneeName} className="mb-6">
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="person" size={20} color="#4B5563" />
                      <Text className="text-base font-bold text-gray-900 ml-2">
                        {assigneeName}
                      </Text>
                      <View className="ml-2 bg-gray-100 rounded-full px-2 py-0.5">
                        <Text className="text-gray-700 text-xs font-semibold">
                          {(tasks as Task[]).length}
                        </Text>
                      </View>
                    </View>
                    {(tasks as Task[]).map((task) => renderTaskCard(task, false))}
                  </View>
                ))
            ) : (
              <View className="items-center justify-center py-12">
                <Ionicons name="checkbox-outline" size={64} color="#D1D5DB" />
                <Text className="text-gray-500 text-base mt-4">
                  {activeTab === "assigned" ? "No tasks assigned by you" : "No tasks found"}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Create Task Button - Only show on "My Tasks" and "Tasks I Assigned" tabs */}
      {(activeTab === "my" || activeTab === "assigned") && (
        <View className="absolute bottom-6 right-6">
          <Pressable
            onPress={() => navigation.navigate("AdminTaskManagement")}
            className="bg-gray-600 rounded-full w-14 h-14 items-center justify-center active:opacity-80"
            style={{
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            <Ionicons name="add" size={32} color="white" />
          </Pressable>
        </View>
      )}

      {/* Impersonation Banner */}
      {isImpersonating && originalAdmin && (
        <View className="absolute bottom-0 left-0 right-0 bg-amber-500 px-6 py-4 border-t-2 border-amber-600">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-white text-sm font-semibold">
                Viewing as {currentUser?.role?.replace("_", " ")}
              </Text>
              <Text className="text-amber-100 text-xs">Admin: {originalAdmin.name}</Text>
            </View>
            <Pressable
              onPress={handleReturnToAdmin}
              className="bg-white rounded-lg px-4 py-3 active:opacity-80"
            >
              <Text className="text-amber-700 text-sm font-bold">Return to Admin</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
