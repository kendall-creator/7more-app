import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useCurrentUser, useIsImpersonating, useOriginalAdmin, useAuthStore } from "../state/authStore";
import { useParticipantStore } from "../state/participantStore";
import { useTaskStore } from "../state/taskStore";
import { useSchedulerStore } from "../state/schedulerStore";
import { Ionicons } from "@expo/vector-icons";

export default function HomepageScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const isImpersonating = useIsImpersonating();
  const originalAdmin = useOriginalAdmin();
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation);

  const allParticipants = useParticipantStore((s) => s.participants);
  const allTasks = useTaskStore((s) => s.tasks);
  const shifts = useSchedulerStore((s) => s.shifts);

  const isMentor = currentUser?.role === "mentor" || currentUser?.role === "mentorship_leader";
  const isMentorshipLeader = currentUser?.role === "mentorship_leader";

  // Get assigned participants
  const assignedParticipants = useMemo(
    () => (currentUser ? allParticipants.filter((p) => p.assignedMentor === currentUser.id) : []),
    [allParticipants, currentUser]
  );

  // Recently assigned (last 7 days)
  const recentlyAssigned = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return assignedParticipants.filter((p) => {
      if (!p.assignedToMentorAt) return false;
      return new Date(p.assignedToMentorAt) >= sevenDaysAgo;
    });
  }, [assignedParticipants]);

  // Needs follow-up (attempted contact)
  const needsFollowUp = useMemo(() => {
    return assignedParticipants.filter((p) => p.status === "bridge_attempted" || p.status === "initial_contact_pending");
  }, [assignedParticipants]);

  // My tasks (pending and in progress)
  const myTasks = useMemo(() => {
    return allTasks.filter(
      (t) => t.assignedToUserId === currentUser?.id && (t.status === "pending" || t.status === "in_progress" || t.status === "overdue")
    );
  }, [allTasks, currentUser]);

  // My upcoming shifts
  const myUpcomingShifts = useMemo(() => {
    if (!currentUser) return [];
    const now = new Date();

    return shifts
      .filter((shift) => {
        // Check if user is assigned to this shift
        const isAssigned = shift.assignedUsers?.some((assignment) => assignment.userId === currentUser.id) ||
                          shift.assignedUserId === currentUser.id;
        if (!isAssigned) return false;

        // Check if shift is in the future
        const shiftDate = new Date(shift.date);
        return shiftDate >= now;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3); // Show only next 3
  }, [currentUser, shifts]);

  // Mentees needing assignment (mentor leaders only)
  const menteesNeedingAssignment = useMemo(() => {
    if (!isMentorshipLeader) return [];
    return allParticipants.filter((p) => p.status === "pending_mentor");
  }, [isMentorshipLeader, allParticipants]);

  // Pam Lychner Schedule (Monday-Friday current week) - For Bridge Team
  const pamLychnerSchedule = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate start of current week (Monday)
    const startOfWeek = new Date(now);
    const daysToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek; // If Sunday, go back 6 days
    startOfWeek.setDate(now.getDate() + daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Create array for Monday through Friday
    const weekDays = [];
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);

      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, "0");
      const dayNum = String(day.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${dayNum}`;

      // Find Pam Lychner shifts for this day (using location field)
      const dayShifts = shifts.filter(
        (shift) =>
          shift.date === dateString &&
          shift.location === "pam_lychner"
      );

      weekDays.push({
        date: dateString,
        dayName: day.toLocaleDateString("en-US", { weekday: "long" }),
        dayLabel: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        shifts: dayShifts,
      });
    }

    return weekDays;
  }, [shifts]);

  const isBridgeTeam = currentUser?.role === "bridge_team";

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      {/* Header */}
      <View className="bg-[#405b69] pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white mb-1">
              Welcome back, {currentUser?.name?.split(" ")[0]}!
            </Text>
            <Text className="text-white/90 text-sm">Here is your overview for today</Text>
          </View>
          <Image
            source={require("../../assets/7more-logo.jpeg")}
            style={{ width: 60, height: 60 }}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={contentContainerStyle}>
        {/* Mentees Needing Assignment - Mentor Leaders Only */}
        {isMentorshipLeader && menteesNeedingAssignment.length > 0 && (
          <Pressable
            onPress={() => navigation.navigate("AdminMentorshipAssignment")}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-4"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <Ionicons name="alert-circle" size={24} color="#DC2626" />
                <Text className="text-lg font-bold text-red-900 ml-2">Action Required</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#DC2626" />
            </View>
            <Text className="text-red-700 text-sm mb-2">
              {menteesNeedingAssignment.length} mentee{menteesNeedingAssignment.length !== 1 ? "s" : ""} waiting for mentor assignment
            </Text>
            <Text className="text-red-600 text-xs font-semibold">Tap to assign mentors</Text>
          </Pressable>
        )}

        {/* Recently Assigned Mentees */}
        {isMentor && recentlyAssigned.length > 0 && (
          <View className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="person-add" size={20} color="#405b69" />
                <Text className="text-base font-bold text-[#3c3832] ml-2">
                  Recently Assigned ({recentlyAssigned.length})
                </Text>
              </View>
              <Pressable onPress={() => navigation.navigate("MyMentees")}>
                <Text className="text-[#405b69] text-sm font-semibold">View All</Text>
              </Pressable>
            </View>
            {recentlyAssigned.slice(0, 3).map((participant) => (
              <Pressable
                key={participant.id}
                onPress={() => navigation.navigate("ParticipantProfile", { participantId: participant.id })}
                className="bg-[#405b69]/10 rounded-xl p-3 mb-2 active:opacity-70"
              >
                <Text className="text-base font-semibold text-[#3c3832]">
                  {participant.firstName} {participant.lastName}
                </Text>
                <Text className="text-xs text-[#99896c] mt-1">#{participant.participantNumber}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Mentees Needing Follow-Up */}
        {isMentor && needsFollowUp.length > 0 && (
          <View className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="call" size={20} color="#fcc85c" />
                <Text className="text-base font-bold text-[#3c3832] ml-2">
                  Needs Follow-Up ({needsFollowUp.length})
                </Text>
              </View>
              <Pressable onPress={() => navigation.navigate("MyMentees")}>
                <Text className="text-[#405b69] text-sm font-semibold">View All</Text>
              </Pressable>
            </View>
            <Text className="text-sm text-[#99896c] mb-3">
              These mentees need to be contacted or followed up with
            </Text>
            {needsFollowUp.slice(0, 3).map((participant) => (
              <Pressable
                key={participant.id}
                onPress={() => navigation.navigate("ParticipantProfile", { participantId: participant.id })}
                className="bg-[#fcc85c]/20 border border-[#fcc85c]/40 rounded-xl p-3 mb-2 active:opacity-70"
              >
                <Text className="text-base font-semibold text-[#3c3832]">
                  {participant.firstName} {participant.lastName}
                </Text>
                <Text className="text-xs text-[#291403] mt-1">
                  {participant.status === "initial_contact_pending" ? "Initial contact required" : "Attempted contact - follow up needed"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Tasks Assigned to Me */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="checkbox" size={20} color="#99896c" />
              <Text className="text-base font-bold text-[#3c3832] ml-2">
                Tasks Assigned ({myTasks.length})
              </Text>
            </View>
            {myTasks.length > 0 && (
              <Pressable onPress={() => navigation.navigate("TaskList")}>
                <Text className="text-[#405b69] text-sm font-semibold">View All</Text>
              </Pressable>
            )}
          </View>
          {myTasks.length === 0 ? (
            <View className="items-center py-6">
              <Ionicons name="checkmark-done-circle" size={48} color="#d7d7d6" />
              <Text className="text-[#99896c] text-sm mt-2">No active tasks</Text>
            </View>
          ) : (
            myTasks.slice(0, 3).map((task) => (
              <Pressable
                key={task.id}
                onPress={() => navigation.navigate("TaskDetail", { taskId: task.id })}
                className={`rounded-xl p-3 mb-2 border active:opacity-70 ${
                  task.status === "overdue" ? "bg-red-50 border-red-200" : "bg-[#f8f8f8] border-[#d7d7d6]"
                }`}
              >
                <Text className="text-base font-semibold text-[#3c3832]">{task.title}</Text>
                <Text className="text-xs text-[#99896c] mt-1">
                  From: {task.assignedByUserName} • Priority: {task.priority}
                </Text>
                {task.status === "overdue" && (
                  <Text className="text-xs text-red-600 mt-1 font-semibold">OVERDUE</Text>
                )}
              </Pressable>
            ))
          )}
        </View>

        {/* My Schedule */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={20} color="#99896c" />
              <Text className="text-base font-bold text-[#3c3832] ml-2">My Schedule</Text>
            </View>
            {myUpcomingShifts.length > 0 && (
              <Pressable onPress={() => navigation.navigate("Scheduler")}>
                <Text className="text-[#405b69] text-sm font-semibold">View All</Text>
              </Pressable>
            )}
          </View>
          {myUpcomingShifts.length === 0 ? (
            <View className="items-center py-6">
              <Ionicons name="calendar-outline" size={48} color="#d7d7d6" />
              <Text className="text-[#99896c] text-sm mt-2">Nothing scheduled at this time</Text>
            </View>
          ) : (
            myUpcomingShifts.map((shift) => (
              <View
                key={shift.id}
                className="bg-[#405b69]/10 border border-[#405b69]/20 rounded-xl p-3 mb-2"
              >
                <Text className="text-base font-semibold text-[#3c3832]">{shift.title}</Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="calendar-outline" size={14} color="#99896c" />
                  <Text className="text-xs text-[#99896c] ml-1">
                    {formatDate(shift.date)} at {formatTime(shift.startTime)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Pam Lychner Schedule - Bridge Team Only */}
        {isBridgeTeam && (
          <View className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color="#99896c" />
                <Text className="text-base font-bold text-[#3c3832] ml-2">Pam Lychner Schedule</Text>
              </View>
              <Pressable onPress={() => navigation.navigate("Scheduler")}>
                <Text className="text-[#405b69] text-sm font-semibold">View All</Text>
              </Pressable>
            </View>
            {pamLychnerSchedule.map((day) => (
              <View key={day.date} className="mb-3">
                <Text className="text-sm font-bold text-[#3c3832] mb-1">
                  {day.dayName} - {day.dayLabel}
                </Text>
                {day.shifts.length === 0 ? (
                  <View className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <Text className="text-xs text-[#99896c]">No shifts scheduled</Text>
                  </View>
                ) : (
                  day.shifts.map((shift) => (
                    <View
                      key={shift.id}
                      className={`${
                        shift.assignedUserId || (shift.assignedUsers && shift.assignedUsers.length > 0)
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      } border rounded-xl p-3 mb-2`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-[#3c3832]">
                            {shift.startTime} - {shift.endTime}
                          </Text>
                          {shift.assignedUserId ? (
                            <View className="flex-row items-center mt-1">
                              <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color="#22c55e"
                              />
                              <Text className="text-xs text-green-700 ml-1 font-medium">
                                Covered by {shift.assignedUserName}
                              </Text>
                            </View>
                          ) : shift.assignedUsers && shift.assignedUsers.length > 0 ? (
                            <View className="mt-1">
                              <View className="flex-row items-center">
                                <Ionicons
                                  name="checkmark-circle"
                                  size={14}
                                  color="#22c55e"
                                />
                                <Text className="text-xs text-green-700 ml-1 font-medium">
                                  Covered by {shift.assignedUsers.length} volunteer{shift.assignedUsers.length > 1 ? "s" : ""}
                                </Text>
                              </View>
                              <Text className="text-xs text-green-600 ml-5 mt-0.5">
                                {shift.assignedUsers.map((u) => u.userName).join(", ")}
                              </Text>
                            </View>
                          ) : (
                            <View className="flex-row items-center mt-1">
                              <Ionicons name="alert-circle" size={14} color="#ef4444" />
                              <Text className="text-xs text-red-700 ml-1 font-medium">
                                Not covered
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            ))}
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
