import React, { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { useParticipantStore } from "../state/participantStore";
import { useUsersStore } from "../state/usersStore";
import { useCurrentUser } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";

export default function AssignMentorScreen({ route, navigation }: any) {
  const { participantId } = route.params;
  const currentUser = useCurrentUser();
  const participant = useParticipantStore((s) => s.getParticipantById(participantId));
  const assignToMentor = useParticipantStore((s) => s.assignToMentor);
  const allUsers = useUsersStore((s) => s.invitedUsers);

  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get admins, mentorship leaders, and mentors
  const availableAssignees = useMemo(() => {
    return allUsers.filter((u) =>
      u.role === "admin" ||
      u.role === "mentorship_leader" ||
      u.role === "mentor"
    );
  }, [allUsers]);

  const filteredAssignees = useMemo(() => {
    if (!searchQuery.trim()) return availableAssignees;
    const query = searchQuery.toLowerCase();
    return availableAssignees.filter((user) =>
      user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    );
  }, [availableAssignees, searchQuery]);

  if (!participant || !currentUser) {
    return null;
  }

  const handleAssign = () => {
    if (!selectedMentor) {
      Alert.alert("Error", "Please select a mentor, mentorship leader, or admin");
      return;
    }

    const assignee = availableAssignees.find((u) => u.id === selectedMentor);
    if (assignee) {
      assignToMentor(participantId, selectedMentor, currentUser.id, currentUser.name);
      Alert.alert("Success", `Assigned to ${assignee.name} successfully.`, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-yellow-600 pt-16 pb-6 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-2">Review & Assign Mentor</Text>
        <Text className="text-white opacity-90 text-sm">
          {participant.firstName} {participant.lastName} • #{participant.participantNumber}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Participant Information */}
        <View className="bg-white border-b border-gray-200 px-6 py-5">
          <Text className="text-sm font-bold text-gray-900 mb-4 uppercase">Participant Information</Text>
          <View className="gap-3">
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-36">Full Name:</Text>
              <Text className="text-sm text-gray-900 font-medium flex-1">
                {participant.firstName} {participant.lastName}
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-36">Age:</Text>
              <Text className="text-sm text-gray-900 font-medium">{participant.age} years</Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-36">Gender:</Text>
              <Text className="text-sm text-gray-900 font-medium">{participant.gender}</Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-36">Date of Birth:</Text>
              <Text className="text-sm text-gray-900 font-medium">
                {formatDate(participant.dateOfBirth)}
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-36">Released From:</Text>
              <Text className="text-sm text-gray-900 font-medium flex-1">
                {participant.releasedFrom}
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-36">Release Date:</Text>
              <Text className="text-sm text-gray-900 font-medium">
                {formatDate(participant.releaseDate)}
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-36">Time Out:</Text>
              <Text className="text-sm text-gray-900 font-medium">
                {participant.timeOut} days
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-36">Submitted:</Text>
              <Text className="text-sm text-gray-900 font-medium">
                {formatDate(participant.submittedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Bridge Team Notes */}
        {participant.history.length > 0 && (
          <View className="bg-white border-b border-gray-200 px-6 py-5">
            <Text className="text-sm font-bold text-gray-900 mb-4 uppercase">Contact History & Notes</Text>
            {participant.history
              .slice()
              .reverse()
              .slice(0, 5)
              .map((entry) => (
                <View key={entry.id} className="mb-4 pb-4 border-b border-gray-100 last:border-b-0">
                  <Text className="text-sm font-semibold text-gray-900 mb-1">
                    {entry.description}
                  </Text>
                  {entry.details && (
                    <Text className="text-sm text-gray-700 mb-2">{entry.details}</Text>
                  )}
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-400">
                      {formatDate(entry.createdAt)}
                    </Text>
                    {entry.createdByName && (
                      <>
                        <Text className="text-xs text-gray-400 mx-1">•</Text>
                        <Text className="text-xs text-gray-400">{entry.createdByName}</Text>
                      </>
                    )}
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Select Mentor/Admin */}
        <View className="px-6 pt-5">
          <Text className="text-sm font-bold text-gray-900 mb-3 uppercase">
            Assign to Mentor or Admin
          </Text>

          {/* Search */}
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center mb-4">
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-sm"
              placeholder="Search mentors and admins..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {/* Assignee List */}
          {filteredAssignees.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center border border-gray-100">
              <Ionicons name="people-outline" size={40} color="#D1D5DB" />
              <Text className="text-gray-500 text-sm mt-3">
                {searchQuery ? "No users found" : "No mentors or admins available"}
              </Text>
            </View>
          ) : (
            filteredAssignees.map((user) => (
              <Pressable
                key={user.id}
                onPress={() => setSelectedMentor(user.id)}
                className={`bg-white rounded-xl p-4 mb-3 border-2 active:opacity-70 ${
                  selectedMentor === user.id ? "border-yellow-600 bg-yellow-50" : "border-gray-100"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text
                      className={`text-base font-bold mb-1 ${
                        selectedMentor === user.id ? "text-gray-900" : "text-gray-900"
                      }`}
                    >
                      {user.name}
                    </Text>
                    <Text className="text-xs text-gray-500 mb-1">{user.email}</Text>
                    <View
                      className={`self-start px-2 py-0.5 rounded-full ${
                        user.role === "admin" ? "bg-gray-100" : "bg-yellow-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          user.role === "admin" ? "text-yellow-700" : "text-gray-700"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "Mentor"}
                      </Text>
                    </View>
                  </View>
                  {selectedMentor === user.id && (
                    <View className="w-6 h-6 bg-yellow-600 rounded-full items-center justify-center">
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                  )}
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-4 bg-white border-t border-gray-100">
        <Pressable
          onPress={handleAssign}
          disabled={!selectedMentor}
          className={`rounded-xl py-4 items-center mb-3 ${
            selectedMentor ? "bg-yellow-600 active:opacity-80" : "bg-gray-300"
          }`}
        >
          <Text className="text-white text-base font-bold">
            {selectedMentor ? "Assign to Selected User" : "Select a Mentor or Admin"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          className="bg-gray-100 rounded-xl py-3 items-center active:opacity-80"
        >
          <Text className="text-gray-700 text-sm font-semibold">Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
