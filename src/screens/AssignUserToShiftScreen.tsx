import React, { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUsersStore } from "../state/usersStore";
import { useSchedulerStore } from "../state/schedulerStore";
import { UserRole } from "../types";

interface InvitedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
  invitedAt: string;
  invitedBy: string;
}

export default function AssignUserToShiftScreen({ route, navigation }: any) {
  const { shift } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const invitedUsers = useUsersStore((s) => s.invitedUsers);
  const adminAssignUserToShift = useSchedulerStore((s) => s.adminAssignUserToShift);

  const assignedUserIds = useMemo(() => {
    return new Set((shift.assignedUsers || []).map((a: any) => a.userId));
  }, [shift.assignedUsers]);

  const filteredUsers = useMemo(() => {
    return invitedUsers.filter((user: InvitedUser) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [invitedUsers, searchQuery]);

  const handleAssignUser = async (userId: string, userName: string, userRole: UserRole) => {
    setIsAssigning(true);
    try {
      const success = await adminAssignUserToShift(shift.id, userId, userName, userRole);
      if (success) {
        Alert.alert("Success", `${userName} has been assigned to this shift.`, [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("Unable to Assign", "This shift may be full or the user is already assigned.");
      }
    } catch (error) {
      console.error("Error assigning user:", error);
      Alert.alert("Error", "Failed to assign user to shift. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const formatDate = (dateStr: string) => {
    // Parse date in local timezone to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-8 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-3xl font-bold text-white mb-2">Assign User to Shift</Text>
        <Text className="text-yellow-100 text-base">{shift.title}</Text>
        <Text className="text-yellow-100 text-sm">
          {formatDate(shift.date)} • {shift.startTime} - {shift.endTime}
        </Text>
      </View>

      {/* Current Assignments */}
      {shift.assignedUsers && shift.assignedUsers.length > 0 && (
        <View className="px-6 pt-4 pb-2 border-b border-gray-200">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Currently Assigned ({shift.assignedUsers.length}
            {shift.maxVolunteers ? ` / ${shift.maxVolunteers}` : ""})
          </Text>
          <View className="gap-2">
            {shift.assignedUsers.map((assignment: any) => (
              <View
                key={assignment.userId}
                className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex-row items-center"
              >
                <Ionicons name="person" size={16} color="#16A34A" />
                <Text className="text-sm text-green-900 ml-2 flex-1">{assignment.userName}</Text>
                <Text className="text-xs text-green-600">{assignment.userRole}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Search */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* User List */}
      <ScrollView className="flex-1 px-6 pt-4">
        <Text className="text-sm font-semibold text-gray-700 mb-3">Select User to Assign</Text>

        {filteredUsers.length === 0 ? (
          <View className="bg-gray-50 rounded-xl p-8 items-center">
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-center mt-4">No users found</Text>
          </View>
        ) : (
          <View className="gap-2 pb-6">
            {filteredUsers.map((user: InvitedUser) => {
              const isAssigned = assignedUserIds.has(user.id);

              return (
                <Pressable
                  key={user.id}
                  onPress={() => {
                    if (!isAssigned && !isAssigning) {
                      handleAssignUser(user.id, user.name, user.role);
                    }
                  }}
                  disabled={isAssigned || isAssigning}
                  className={`border-2 rounded-xl p-4 ${
                    isAssigned
                      ? "bg-gray-100 border-gray-300"
                      : isAssigning
                      ? "bg-gray-50 border-gray-300"
                      : "bg-white border-gray-200 active:bg-gray-50"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className={`text-base font-semibold ${isAssigned ? "text-gray-400" : "text-gray-900"}`}>
                        {user.name}
                      </Text>
                      <Text className={`text-sm ${isAssigned ? "text-gray-400" : "text-gray-600"}`}>
                        {user.email}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <View
                          className={`px-2 py-1 rounded ${
                            isAssigned ? "bg-gray-200" : "bg-indigo-100"
                          }`}
                        >
                          <Text className={`text-xs font-semibold ${isAssigned ? "text-gray-500" : "text-indigo-700"}`}>
                            {user.role.replace("_", " ").toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {isAssigning ? (
                      <View className="w-8 h-8 items-center justify-center">
                        <ActivityIndicator size="small" color="#CA8A04" />
                      </View>
                    ) : isAssigned ? (
                      <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center">
                        <Ionicons name="checkmark" size={18} color="#6B7280" />
                      </View>
                    ) : (
                      <View className="w-8 h-8 bg-yellow-500 rounded-full items-center justify-center">
                        <Ionicons name="add" size={18} color="#111827" />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
