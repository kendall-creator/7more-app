import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser, useIsImpersonating, useOriginalAdmin, useAuthStore } from "../state/authStore";
import { Participant } from "../types";
import { Ionicons } from "@expo/vector-icons";

type MenteeStatusFilter = "all" | "needs_initial_contact" | "attempt_made" | "unable_to_contact" | "contacted_initial" | "in_mentorship_program" | "overdue";

export default function MyMenteesScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const isImpersonating = useIsImpersonating();
  const originalAdmin = useOriginalAdmin();
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation);
  const allParticipants = useParticipantStore((s) => s.participants);

  const [selectedFilter, setSelectedFilter] = useState<MenteeStatusFilter>("all");

  // Filter participants assigned to current user
  const assignedParticipants = useMemo(
    () => (currentUser ? allParticipants.filter((p) => p.assignedMentor === currentUser.id) : []),
    [allParticipants, currentUser]
  );

  // Calculate status for each mentee based on dates and attempts
  const menteesWithCalculatedStatus = useMemo(() => {
    return assignedParticipants.map((participant) => {
      const now = new Date();
      let calculatedStatus: Participant["menteeStatus"] = "needs_initial_contact";
      let isOverdue = false;

      // Check if assigned to mentor
      if (!participant.assignedToMentorAt) {
        return { ...participant, calculatedStatus, isOverdue };
      }

      const assignedDate = new Date(participant.assignedToMentorAt);
      const daysSinceAssignment = Math.floor((now.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));

      // Determine status based on data
      if (participant.menteeStatus === "in_mentorship_program") {
        calculatedStatus = "in_mentorship_program";
      } else if (participant.menteeStatus === "contacted_initial") {
        calculatedStatus = "contacted_initial";
        // Check if 7-day follow-up is overdue
        if (participant.initialContactCompletedDate) {
          const contactedDate = new Date(participant.initialContactCompletedDate);
          const daysSinceContact = Math.floor((now.getTime() - contactedDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceContact > 7) {
            isOverdue = true;
          }
        }
      } else if (participant.menteeStatus === "unable_to_contact" || (participant.numberOfContactAttempts || 0) >= 3) {
        calculatedStatus = "unable_to_contact";
      } else if ((participant.numberOfContactAttempts || 0) > 0) {
        calculatedStatus = "attempt_made";
        // Check if 30 days have passed since first attempt
        if (participant.lastAttemptDate) {
          const lastAttempt = new Date(participant.lastAttemptDate);
          const daysSinceFirstAttempt = Math.floor((now.getTime() - lastAttempt.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceFirstAttempt >= 30 && (participant.numberOfContactAttempts || 0) >= 3) {
            calculatedStatus = "unable_to_contact";
          }
        }
      } else {
        calculatedStatus = "needs_initial_contact";
        // Check if 10-day initial contact deadline is overdue
        if (daysSinceAssignment > 10) {
          isOverdue = true;
        }
      }

      return { ...participant, calculatedStatus, isOverdue };
    });
  }, [assignedParticipants]);

  // Count by status
  const statusCounts = useMemo(() => {
    const counts = {
      needs_initial_contact: 0,
      attempt_made: 0,
      unable_to_contact: 0,
      contacted_initial: 0,
      in_mentorship_program: 0,
      overdue: 0,
    };

    menteesWithCalculatedStatus.forEach((m) => {
      if (m.calculatedStatus) {
        counts[m.calculatedStatus]++;
      }
      if (m.isOverdue) {
        counts.overdue++;
      }
    });

    return counts;
  }, [menteesWithCalculatedStatus]);

  // Filter mentees based on selected filter
  const filteredMentees = useMemo(() => {
    let filtered = menteesWithCalculatedStatus;

    if (selectedFilter === "overdue") {
      filtered = filtered.filter((m) => m.isOverdue);
    } else if (selectedFilter !== "all") {
      filtered = filtered.filter((m) => m.calculatedStatus === selectedFilter);
    }

    // Sort: overdue first, then by days since assignment (oldest first)
    return filtered.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;

      const aDate = new Date(a.assignedToMentorAt || 0).getTime();
      const bDate = new Date(b.assignedToMentorAt || 0).getTime();
      return aDate - bDate;
    });
  }, [menteesWithCalculatedStatus, selectedFilter]);

  const getDaysSinceAssignment = (assignedAt?: string) => {
    if (!assignedAt) return 0;
    const now = new Date();
    const assigned = new Date(assignedAt);
    const diffMs = now.getTime() - assigned.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const getStatusBadgeColor = (status?: Participant["menteeStatus"]) => {
    switch (status) {
      case "needs_initial_contact":
        return "bg-yellow-100 border-yellow-400";
      case "attempt_made":
        return "bg-orange-100 border-orange-400";
      case "unable_to_contact":
        return "bg-red-100 border-red-400";
      case "contacted_initial":
        return "bg-blue-100 border-blue-400";
      case "in_mentorship_program":
        return "bg-green-100 border-green-400";
      default:
        return "bg-gray-100 border-gray-400";
    }
  };

  const getStatusLabel = (status?: Participant["menteeStatus"]) => {
    switch (status) {
      case "needs_initial_contact":
        return "Needs Initial Contact";
      case "attempt_made":
        return "Attempt Made";
      case "unable_to_contact":
        return "Unable to Contact";
      case "contacted_initial":
        return "Contacted (Initial)";
      case "in_mentorship_program":
        return "In Mentorship Program";
      default:
        return "Unknown";
    }
  };

  const renderStatusFilterTile = (
    filter: MenteeStatusFilter,
    label: string,
    count: number,
    icon: string,
    color: string
  ) => {
    const isSelected = selectedFilter === filter;
    return (
      <Pressable
        onPress={() => setSelectedFilter(filter)}
        className={`flex-1 rounded-xl p-3 border-2 active:opacity-70 ${
          isSelected ? `${color} border-[#405b69]` : "bg-white border-[#d7d7d6]"
        }`}
      >
        <View className="items-center">
          <Ionicons
            name={icon as any}
            size={20}
            color={isSelected ? "#405b69" : "#99896c"}
          />
          <Text
            className={`text-xl font-bold mt-1 ${
              isSelected ? "text-[#405b69]" : "text-[#3c3832]"
            }`}
          >
            {count}
          </Text>
          <Text
            className={`text-[9px] text-center mt-1 ${
              isSelected ? "text-[#405b69] font-semibold" : "text-[#99896c]"
            }`}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderParticipantCard = (participant: Participant & { calculatedStatus?: Participant["menteeStatus"]; isOverdue?: boolean }) => {
    const daysSince = getDaysSinceAssignment(participant.assignedToMentorAt);

    return (
      <Pressable
        key={participant.id}
        onPress={() => navigation.navigate("ParticipantProfile", { participantId: participant.id })}
        className={`bg-white rounded-2xl p-4 mb-3 border-2 active:opacity-70 ${
          participant.isOverdue ? "border-red-400" : "border-[#d7d7d6]"
        }`}
      >
        {/* Overdue Badge */}
        {participant.isOverdue && (
          <View className="bg-red-50 border border-red-300 rounded-lg px-3 py-2 mb-3">
            <Text className="text-red-800 text-xs font-semibold">⚠️ Past Due</Text>
          </View>
        )}

        {/* Name and ID */}
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-[#3c3832] mb-1">
              {participant.firstName} {participant.lastName}
            </Text>
            <Text className="text-sm text-[#99896c]">#{participant.participantNumber}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View className={`border rounded-lg px-3 py-1.5 mb-3 self-start ${getStatusBadgeColor(participant.calculatedStatus)}`}>
          <Text className="text-[#3c3832] text-xs font-semibold">
            {getStatusLabel(participant.calculatedStatus)}
          </Text>
        </View>

        {/* Days Since Assignment */}
        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center mr-4">
            <Ionicons name="calendar-outline" size={14} color="#99896c" />
            <Text className="text-xs text-[#99896c] ml-1">
              {daysSince} day{daysSince !== 1 ? "s" : ""} since assigned
            </Text>
          </View>
          {participant.numberOfContactAttempts !== undefined && participant.numberOfContactAttempts > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={14} color="#99896c" />
              <Text className="text-xs text-[#99896c] ml-1">
                {participant.numberOfContactAttempts} attempt{participant.numberOfContactAttempts !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        {(participant.calculatedStatus === "needs_initial_contact" || participant.calculatedStatus === "attempt_made") && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("InitialContactForm", { participantId: participant.id });
            }}
            className="bg-[#405b69] rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
          >
            <Ionicons name="call" size={16} color="white" />
            <Text className="text-white text-sm font-semibold ml-2">Complete Initial Contact</Text>
          </Pressable>
        )}
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
    <View className="flex-1 bg-[#f8f8f8]">
      {/* Header */}
      <View className="bg-[#405b69] pt-16 pb-6 px-6">
        <Text className="text-3xl font-bold text-white mb-1">My Mentees</Text>
        <Text className="text-white/90 text-sm">
          {assignedParticipants.length} mentee{assignedParticipants.length !== 1 ? "s" : ""} assigned to you
        </Text>
      </View>

      {/* Status Filter Tiles */}
      <View className="px-6 py-4">
        <View className="flex-row gap-2 mb-3">
          {renderStatusFilterTile("needs_initial_contact", "Needs Initial Contact", statusCounts.needs_initial_contact, "alert-circle", "bg-yellow-50")}
          {renderStatusFilterTile("attempt_made", "Attempt Made", statusCounts.attempt_made, "time", "bg-orange-50")}
          {renderStatusFilterTile("unable_to_contact", "Unable to Contact", statusCounts.unable_to_contact, "close-circle", "bg-red-50")}
        </View>
        <View className="flex-row gap-2">
          {renderStatusFilterTile("contacted_initial", "Contacted (Initial)", statusCounts.contacted_initial, "checkmark-circle", "bg-blue-50")}
          {renderStatusFilterTile("in_mentorship_program", "In Mentorship", statusCounts.in_mentorship_program, "people", "bg-green-50")}
          {renderStatusFilterTile("overdue", "Overdue", statusCounts.overdue, "warning", "bg-red-50")}
        </View>

        {/* All Filter Button */}
        <Pressable
          onPress={() => setSelectedFilter("all")}
          className={`mt-3 rounded-xl py-3 px-4 border-2 active:opacity-70 ${
            selectedFilter === "all"
              ? "bg-[#405b69] border-[#405b69]"
              : "bg-white border-[#d7d7d6]"
          }`}
        >
          <Text
            className={`text-center text-sm font-semibold ${
              selectedFilter === "all" ? "text-white" : "text-[#3c3832]"
            }`}
          >
            Show All ({assignedParticipants.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={contentContainerStyle}>
        {/* Filtered Mentees */}
        {filteredMentees.length > 0 ? (
          filteredMentees.map((p) => renderParticipantCard(p))
        ) : (
          <View className="items-center justify-center py-12">
            <Ionicons name="people-outline" size={64} color="#d7d7d6" />
            <Text className="text-[#99896c] text-base mt-4">
              {selectedFilter === "all" ? "No mentees assigned" : `No mentees in ${getStatusLabel(selectedFilter as any)}`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Impersonation Banner */}
      {isImpersonating && originalAdmin && (
        <View className="absolute bottom-0 left-0 right-0 bg-[#fcc85c] px-6 py-4 border-t-2 border-[#fcc85c]">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-[#291403] text-sm font-semibold">
                Viewing as {currentUser?.role?.replace("_", " ")}
              </Text>
              <Text className="text-[#291403]/70 text-xs">Admin: {originalAdmin.name}</Text>
            </View>
            <Pressable
              onPress={handleReturnToAdmin}
              className="bg-white rounded-lg px-4 py-3 active:opacity-80"
            >
              <Text className="text-[#291403] text-sm font-bold">Return to Admin</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
