import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser, useUserRole } from "../state/authStore";
import { Participant, ParticipantStatus } from "../types";
import { Ionicons } from "@expo/vector-icons";

export default function AllParticipantsScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const userRole = useUserRole();
  const allParticipants = useParticipantStore((s) => s.participants);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ParticipantStatus | "all">("all");

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "bridge_team_leader";

  // Filter participants based on role - Bridge Team Leaders only see Bridge Team participants
  const visibleParticipants = useMemo(() => {
    if (userRole === "bridge_team_leader") {
      return allParticipants.filter((p) =>
        ["pending_bridge", "bridge_contacted", "bridge_attempted", "bridge_unable"].includes(p.status)
      );
    }
    return allParticipants;
  }, [allParticipants, userRole]);

  const statusOptions: { value: ParticipantStatus | "all"; label: string; color: string }[] = [
    { value: "all", label: "All", color: "bg-gray-100 text-gray-700" },
    { value: "pending_bridge", label: "Pending Bridge", color: "bg-gray-200 text-gray-900" },
    { value: "bridge_attempted", label: "Bridge Attempted", color: "bg-amber-100 text-amber-700" },
    { value: "bridge_contacted", label: "Contacted", color: "bg-yellow-100 text-gray-900" },
    { value: "bridge_unable", label: "Bridge Unable", color: "bg-gray-100 text-gray-700" },
    { value: "pending_mentor", label: "Awaiting Mentor", color: "bg-yellow-100 text-gray-700" },
    { value: "initial_contact_pending", label: "Initial Contact Pending", color: "bg-orange-100 text-orange-700" },
    { value: "mentor_attempted", label: "Mentor Attempted", color: "bg-amber-100 text-amber-700" },
    { value: "mentor_unable", label: "Mentor Unable", color: "bg-gray-100 text-gray-700" },
    { value: "active_mentorship", label: "Active", color: "bg-yellow-100 text-gray-900" },
    { value: "graduated", label: "Graduated", color: "bg-yellow-100 text-gray-700" },
  ];

  const filteredParticipants = visibleParticipants.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.participantNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ParticipantStatus) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option || { label: status, color: "bg-gray-100 text-gray-700" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderParticipantCard = (participant: Participant) => {
    const badge = getStatusBadge(participant.status);

    return (
      <Pressable
        key={participant.id}
        onPress={() => navigation.navigate("ParticipantProfile", { participantId: participant.id })}
        className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 active:opacity-70"
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 flex-row items-center">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-1">
                {participant.firstName} {participant.lastName}
              </Text>
              <Text className="text-sm text-gray-500">#{participant.participantNumber}</Text>
            </View>
            {/* Show voicemail/missed call icon */}
            {(participant.intakeType === "missed_call_no_voicemail" ||
              participant.intakeType === "missed_call_voicemail") && (
              <View className="mr-2">
                <Ionicons
                  name={participant.intakeType === "missed_call_voicemail" ? "chatbox-ellipses" : "call"}
                  size={18}
                  color="#F59E0B"
                />
              </View>
            )}
          </View>
          <View className={`px-3 py-1 rounded-full ${badge.color}`}>
            <Text className={`text-xs font-semibold ${badge.color}`}>{badge.label}</Text>
          </View>
        </View>

        {/* Show comments if present */}
        {participant.missedCallComments && (
          <View className="bg-amber-50 rounded-lg px-2 py-1 mb-2">
            <Text className="text-xs text-gray-700 italic">{participant.missedCallComments}</Text>
          </View>
        )}

        <View className="flex-row items-center gap-4 flex-wrap">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {formatDate(participant.submittedAt)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {participant.age}y • {participant.gender}
            </Text>
          </View>
          {participant.phoneNumber && (
            <View className="flex-row items-center">
              <Ionicons name="call" size={14} color="#10B981" />
              <Text className="text-xs text-green-600 ml-1">{participant.phoneNumber}</Text>
            </View>
          )}
          {participant.email && (
            <View className="flex-row items-center">
              <Ionicons name="mail" size={14} color="#3B82F6" />
              <Text className="text-xs text-blue-600 ml-1" numberOfLines={1}>{participant.email}</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-6 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-1">All Participants</Text>
        <Text className="text-yellow-100 text-sm">
          {filteredParticipants.length} of {visibleParticipants.length} participant
          {visibleParticipants.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Search and Add */}
      <View className="px-6 pt-4 pb-2 bg-white border-b border-gray-100">
        <View className="flex-row gap-2 mb-3">
          <View className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-sm"
              placeholder="Search by name or ID..."
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
          {isAdmin && (
            <Pressable
              onPress={() => navigation.navigate("ManualIntakeForm")}
              className="bg-gray-600 rounded-xl px-4 items-center justify-center active:opacity-80"
            >
              <Ionicons name="add" size={24} color="white" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Status Filter */}
      <View className="px-6 py-3 bg-white border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {statusOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setFilterStatus(option.value)}
                className={`px-4 py-2 rounded-full border ${
                  filterStatus === option.value
                    ? "bg-gray-600 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filterStatus === option.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Participants List */}
      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {filteredParticipants.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-base mt-4">No participants found</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Add a new participant to get started"}
            </Text>
          </View>
        ) : (
          filteredParticipants.map(renderParticipantCard)
        )}
      </ScrollView>
    </View>
  );
}
