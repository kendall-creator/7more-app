import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useUsersStore } from "../state/usersStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DebugUsersScreen({ navigation }: any) {
  const users = useUsersStore((s) => s.invitedUsers);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Debug: All Users</Text>
          <Text className="text-sm text-gray-600 mt-1">Total: {users.length} users</Text>
        </View>

        {/* User List */}
        <ScrollView className="flex-1 px-6 py-4">
          {users.map((user, index) => (
            <View key={user.id} className="mb-6 p-4 bg-gray-50 rounded-xl">
              <Text className="text-lg font-bold text-gray-900 mb-2">
                {index + 1}. {user.name}
              </Text>
              <View className="space-y-1">
                <Text className="text-sm text-gray-700">
                  <Text className="font-semibold">Email:</Text> {user.email}
                </Text>
                <Text className="text-sm text-gray-700">
                  <Text className="font-semibold">Password:</Text> {user.password}
                </Text>
                <Text className="text-sm text-gray-700">
                  <Text className="font-semibold">Role:</Text> {user.role}
                </Text>
                <Text className="text-sm text-gray-700">
                  <Text className="font-semibold">ID:</Text> {user.id}
                </Text>
                {user.nickname && (
                  <Text className="text-sm text-gray-700">
                    <Text className="font-semibold">Nickname:</Text> {user.nickname}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Close Button */}
        <View className="px-6 py-4 border-t border-gray-200">
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-gray-800 rounded-xl py-4 items-center"
          >
            <Text className="text-white text-base font-semibold">Close</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
