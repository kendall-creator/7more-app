import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal, Alert, Linking } from "react-native";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser, useUserRole } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";
import { HistoryEntry, Note } from "../types";
import { makeCallViaAirCall, sendSMSViaAirCall } from "../utils/aircall";

export default function ParticipantProfileScreen({ route, navigation }: any) {
  const { participantId } = route.params;
  const currentUser = useCurrentUser();
  const userRole = useUserRole();
  const participant = useParticipantStore((s) => s.getParticipantById(participantId));
  const addNote = useParticipantStore((s) => s.addNote);
  const deleteParticipant = useParticipantStore((s) => s.deleteParticipant);
  const updateParticipantStatus = useParticipantStore((s) => s.updateParticipantStatus);
  const updateContactInfo = useParticipantStore((s) => s.updateContactInfo);

  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [editPhone, setEditPhone] = useState(participant?.phoneNumber || "");
  const [editEmail, setEditEmail] = useState(participant?.email || "");

  if (!participant || !currentUser) {
    return null;
  }

  // Check if mentor is assigned to this participant
  const isAssignedMentor = userRole === "mentor" && participant.assignedMentor === currentUser.id;

  // Debug logging to help troubleshoot Quick Actions visibility
  console.log("=== ParticipantProfileScreen Debug ===");
  console.log("Participant:", participant.firstName, participant.lastName);
  console.log("Participant Status:", participant.status);
  console.log("User Role:", userRole);
  console.log("Current User:", currentUser.name, currentUser.role);
  console.log("Assigned Mentor:", participant.assignedMentor);
  console.log("Is Assigned Mentor:", isAssignedMentor);
  console.log("Quick Actions Should Show:", (userRole === "admin" ||
    (userRole === "bridge_team" && ["pending_bridge", "bridge_contacted", "bridge_attempted", "bridge_unable"].includes(participant.status)) ||
    (userRole === "mentorship_leader" && ["pending_mentor", "assigned_mentor"].includes(participant.status)) ||
    (isAssignedMentor && ["initial_contact_pending", "bridge_attempted", "bridge_unable", "mentor_attempted", "mentor_unable", "active_mentorship"].includes(participant.status))
  ));
  console.log("======================================");

  const handleAddNote = () => {
    if (noteText.trim()) {
      addNote(participantId, noteText.trim(), currentUser.id, currentUser.name);
      setNoteText("");
      setShowNoteInput(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    }
  };

  const handleDeleteParticipant = () => {
    deleteParticipant(participantId);
    setShowDeleteModal(false);
    navigation.goBack();
  };

  const handleUpdateContactInfo = async () => {
    try {
      await updateContactInfo(participantId, editPhone || undefined, editEmail || undefined);
      setShowEditContactModal(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to update contact information");
    }
  };

  const handlePhonePress = async () => {
    if (!participant.phoneNumber) return;

    const result = await makeCallViaAirCall(participant.phoneNumber);
    if (!result.success) {
      Alert.alert("Error", result.error || "Could not initiate call");
    }
  };

  const handleSMSPress = async () => {
    if (!participant.phoneNumber) return;

    // Open SMS with blank message so user can type
    const result = await sendSMSViaAirCall(participant.phoneNumber, "");
    if (!result.success) {
      Alert.alert("Error", result.error || "Could not open SMS");
    }
  };

  const handleEmailPress = () => {
    if (!participant.email) return;

    Linking.openURL(`mailto:${participant.email}`).catch(() => {
      Alert.alert("Error", "Could not open email app");
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusColor = () => {
    switch (participant.status) {
      case "pending_bridge":
        return "bg-gray-200 text-gray-900";
      case "bridge_contacted":
        return "bg-yellow-100 text-gray-900";
      case "bridge_attempted":
        return "bg-amber-100 text-amber-700";
      case "bridge_unable":
        return "bg-gray-100 text-gray-700";
      case "pending_mentor":
        return "bg-yellow-100 text-gray-700";
      case "initial_contact_pending":
        return "bg-orange-100 text-orange-700";
      case "mentor_attempted":
        return "bg-amber-100 text-amber-700";
      case "mentor_unable":
        return "bg-gray-100 text-gray-700";
      case "active_mentorship":
        return "bg-yellow-100 text-gray-900";
      case "graduated":
        return "bg-yellow-100 text-gray-700";
      case "ceased_contact":
        return "bg-gray-200 text-gray-900";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = () => {
    const labels: Record<string, string> = {
      pending_bridge: "Pending Bridge",
      bridge_contacted: "Bridge Contacted",
      bridge_attempted: "Bridge Attempted",
      bridge_unable: "Bridge Unable",
      pending_mentor: "Awaiting Mentor",
      initial_contact_pending: "Initial Contact Pending",
      mentor_attempted: "Mentor Attempted",
      mentor_unable: "Mentor Unable",
      active_mentorship: "Active Mentorship",
      graduated: "Graduated",
      ceased_contact: "Ceased Contact",
    };
    return labels[participant.status] || participant.status;
  };

  const renderHistoryItem = (entry: HistoryEntry) => {
    const getIconName = () => {
      switch (entry.type) {
        case "status_change":
          return "swap-horizontal";
        case "contact_attempt":
          return "call";
        case "note_added":
          return "document-text";
        case "form_submitted":
          return "checkbox";
        case "assignment_change":
          return "person-add";
        default:
          return "ellipse";
      }
    };

    return (
      <View key={entry.id} className="flex-row mb-4">
        <View className="items-center mr-3">
          <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
            <Ionicons name={getIconName() as any} size={14} color="#374151" />
          </View>
          <View className="flex-1 w-0.5 bg-gray-200 mt-1" />
        </View>
        <View className="flex-1 pb-6">
          <Text className="text-sm font-semibold text-gray-900 mb-1">{entry.description}</Text>
          {entry.details && <Text className="text-xs text-gray-600 mb-2">{entry.details}</Text>}
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-400">{formatDate(entry.createdAt)}</Text>
            {entry.createdByName && (
              <>
                <Text className="text-xs text-gray-400 mx-1">•</Text>
                <Text className="text-xs text-gray-400">{entry.createdByName}</Text>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderNote = (note: Note) => (
    <View key={note.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
      <Text className="text-sm text-gray-900 mb-2">{note.content}</Text>
      <View className="flex-row items-center">
        <Text className="text-xs text-gray-500">{formatDate(note.createdAt)}</Text>
        <Text className="text-xs text-gray-400 mx-1">•</Text>
        <Text className="text-xs text-gray-500">{note.createdByName}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-6 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-2">
          {participant.firstName} {participant.lastName}
        </Text>
        <Text className="text-yellow-100 text-sm mb-3">#{participant.participantNumber}</Text>
        <View className={`self-start px-3 py-1 rounded-full ${getStatusColor()}`}>
          <Text className={`text-xs font-semibold ${getStatusColor()}`}>{getStatusLabel()}</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Quick Actions - Show for Admins or relevant role */}
        {(userRole === "admin" ||
          (userRole === "bridge_team" && ["pending_bridge", "bridge_contacted", "bridge_attempted", "bridge_unable"].includes(participant.status)) ||
          (userRole === "mentorship_leader" && ["pending_mentor", "assigned_mentor"].includes(participant.status)) ||
          (isAssignedMentor && ["initial_contact_pending", "bridge_attempted", "bridge_unable", "mentor_attempted", "mentor_unable", "active_mentorship"].includes(participant.status))
        ) && (
          <View className="px-6 py-5 bg-white border-b border-gray-100">
            <Text className="text-sm font-bold text-gray-900 mb-4 uppercase">Quick Actions</Text>

            {/* Bridge Team Actions */}
            {(userRole === "admin" || userRole === "bridge_team") &&
             ["pending_bridge", "bridge_contacted", "bridge_attempted", "bridge_unable"].includes(participant.status) && (
              <View className="gap-2">
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => navigation.navigate("BridgeTeamFollowUpForm", {
                      participantId: participant.id,
                    })}
                    className="flex-1 bg-green-50 border border-green-200 rounded-xl py-3 items-center active:opacity-70"
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#FFC107" />
                    <Text className="text-gray-900 text-sm font-semibold mt-1">Contacted</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => navigation.navigate("MoveToMentorship", { participantId: participant.id })}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 items-center active:opacity-70"
                  >
                    <Ionicons name="arrow-forward-circle" size={20} color="#374151" />
                    <Text className="text-yellow-700 text-sm font-semibold mt-1">To Mentorship</Text>
                  </Pressable>
                </View>

                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => navigation.navigate("ContactForm", {
                      participantId: participant.id,
                      outcomeType: "attempted",
                    })}
                    className="flex-1 bg-amber-50 border border-amber-200 rounded-xl py-3 items-center active:opacity-70"
                  >
                    <Ionicons name="time" size={20} color="#F59E0B" />
                    <Text className="text-amber-700 text-sm font-semibold mt-1">Mark Attempted</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => navigation.navigate("ContactForm", {
                      participantId: participant.id,
                      outcomeType: "unable",
                    })}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 items-center active:opacity-70"
                  >
                    <Ionicons name="close-circle" size={20} color="#6B7280" />
                    <Text className="text-gray-700 text-sm font-semibold mt-1">Unable to Contact</Text>
                  </Pressable>
                </View>

                {/* Move back to Pending button - only show for attempted or unable */}
                {["bridge_attempted", "bridge_unable"].includes(participant.status) && (
                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        "Move to Pending",
                        "Move this participant back to Pending Bridge for another contact attempt?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Move to Pending",
                            style: "default",
                            onPress: async () => {
                              try {
                                await updateParticipantStatus(
                                  participant.id,
                                  "pending_bridge",
                                  currentUser.id,
                                  currentUser.name,
                                  "Moved back to Pending Bridge for another contact attempt"
                                );
                                Alert.alert("Success", "Participant moved back to Pending Bridge");
                              } catch (error) {
                                console.error("Error moving participant:", error);
                                Alert.alert("Error", "Failed to move participant. Please try again.");
                              }
                            },
                          },
                        ]
                      );
                    }}
                    className="bg-blue-50 border border-blue-200 rounded-xl py-3 items-center active:opacity-70"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="refresh" size={20} color="#3B82F6" />
                      <Text className="text-blue-700 text-sm font-semibold ml-2">Move Back to Pending</Text>
                    </View>
                  </Pressable>
                )}
              </View>
            )}

            {/* Mentorship Leader Actions */}
            {(userRole === "admin" || userRole === "mentorship_leader") &&
             participant.status === "pending_mentor" && (
              <Pressable
                onPress={() => navigation.navigate("AssignMentor", { participantId: participant.id })}
                className="bg-yellow-50 border border-yellow-200 rounded-xl py-3 items-center active:opacity-70"
              >
                <Ionicons name="person-add" size={20} color="#FFC107" />
                <Text className="text-gray-700 text-sm font-semibold mt-1">Assign Mentor</Text>
              </Pressable>
            )}

            {/* Mentor Actions for bridge_attempted or bridge_unable status (assigned but not yet contacted) */}
            {isAssignedMentor && ["bridge_attempted", "bridge_unable"].includes(participant.status) && (
              <View className="gap-2">
                <Pressable
                  onPress={() => navigation.navigate("InitialContactForm", { participantId: participant.id })}
                  className="bg-orange-50 border border-orange-200 rounded-xl py-3 items-center active:opacity-70"
                >
                  <Ionicons name="call" size={20} color="#EA580C" />
                  <Text className="text-orange-700 text-sm font-semibold mt-1">Complete Initial Contact</Text>
                </Pressable>
              </View>
            )}

            {/* Mentor Actions */}
            {(userRole === "admin" || isAssignedMentor) &&
             participant.status === "initial_contact_pending" && (
              <Pressable
                onPress={() => navigation.navigate("InitialContactForm", { participantId: participant.id })}
                className="bg-orange-50 border border-orange-200 rounded-xl py-3 items-center active:opacity-70"
              >
                <Ionicons name="call" size={20} color="#EA580C" />
                <Text className="text-orange-700 text-sm font-semibold mt-1">Complete Initial Contact</Text>
              </Pressable>
            )}

            {/* Mentor Actions for attempted/unable statuses */}
            {(userRole === "admin" || isAssignedMentor) &&
             ["mentor_attempted", "mentor_unable"].includes(participant.status) && (
              <View className="gap-2">
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => navigation.navigate("InitialContactForm", { participantId: participant.id })}
                    className="flex-1 bg-orange-50 border border-orange-200 rounded-xl py-3 items-center active:opacity-70"
                  >
                    <Ionicons name="call" size={20} color="#EA580C" />
                    <Text className="text-orange-700 text-sm font-semibold mt-1">Try Contact Again</Text>
                  </Pressable>
                </View>

                {/* Move back to Initial Contact Pending */}
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Move to Initial Contact Pending",
                      "Move this participant back to Initial Contact Pending status?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Move",
                          style: "default",
                          onPress: async () => {
                            try {
                              await updateParticipantStatus(
                                participant.id,
                                "initial_contact_pending",
                                currentUser.id,
                                currentUser.name,
                                "Moved back to Initial Contact Pending for another contact attempt"
                              );
                              Alert.alert("Success", "Participant moved back to Initial Contact Pending");
                            } catch (error) {
                              console.error("Error moving participant:", error);
                              Alert.alert("Error", "Failed to move participant. Please try again.");
                            }
                          },
                        },
                      ]
                    );
                  }}
                  className="bg-blue-50 border border-blue-200 rounded-xl py-3 items-center active:opacity-70"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="refresh" size={20} color="#3B82F6" />
                    <Text className="text-blue-700 text-sm font-semibold ml-2">Move Back to Pending</Text>
                  </View>
                </Pressable>
              </View>
            )}

            {(userRole === "admin" || isAssignedMentor) &&
             participant.status === "active_mentorship" && (
              <View className="space-y-3">
                {/* Weekly Update Button */}
                <Pressable
                  onPress={() => navigation.navigate("WeeklyUpdateForm", { participantId: participant.id })}
                  className={`rounded-xl py-3 px-4 active:opacity-70 ${
                    participant.nextWeeklyUpdateDue && new Date(participant.nextWeeklyUpdateDue) < new Date()
                      ? "bg-red-50 border-2 border-red-600"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons
                        name="document-text"
                        size={20}
                        color={participant.nextWeeklyUpdateDue && new Date(participant.nextWeeklyUpdateDue) < new Date() ? "#DC2626" : "#FFC107"}
                      />
                      <View className="ml-3 flex-1">
                        <Text className="text-gray-900 text-sm font-semibold">Submit Weekly Update</Text>
                        {participant.nextWeeklyUpdateDue && (
                          <Text className={`text-xs mt-0.5 ${
                            new Date(participant.nextWeeklyUpdateDue) < new Date()
                              ? "text-red-600 font-bold"
                              : "text-gray-500"
                          }`}>
                            {new Date(participant.nextWeeklyUpdateDue) < new Date()
                              ? `Overdue by ${Math.ceil((new Date().getTime() - new Date(participant.nextWeeklyUpdateDue).getTime()) / (1000 * 60 * 60 * 24))} day(s)`
                              : `Due in ${Math.ceil((new Date(participant.nextWeeklyUpdateDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} day(s)`
                            }
                          </Text>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </View>
                </Pressable>

                {/* Monthly Check-In Button */}
                <Pressable
                  onPress={() => navigation.navigate("MonthlyCheckInForm", { participantId: participant.id })}
                  className={`rounded-xl py-3 px-4 active:opacity-70 ${
                    participant.nextMonthlyCheckInDue && new Date(participant.nextMonthlyCheckInDue) < new Date()
                      ? "bg-red-50 border-2 border-red-600"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons
                        name="checkmark-done"
                        size={20}
                        color={participant.nextMonthlyCheckInDue && new Date(participant.nextMonthlyCheckInDue) < new Date() ? "#DC2626" : "#374151"}
                      />
                      <View className="ml-3 flex-1">
                        <Text className="text-gray-900 text-sm font-semibold">Monthly Check-In</Text>
                        {participant.nextMonthlyCheckInDue && (
                          <Text className={`text-xs mt-0.5 ${
                            new Date(participant.nextMonthlyCheckInDue) < new Date()
                              ? "text-red-600 font-bold"
                              : "text-gray-500"
                          }`}>
                            {new Date(participant.nextMonthlyCheckInDue) < new Date()
                              ? `Overdue by ${Math.ceil((new Date().getTime() - new Date(participant.nextMonthlyCheckInDue).getTime()) / (1000 * 60 * 60 * 24))} day(s)`
                              : `Due in ${Math.ceil((new Date(participant.nextMonthlyCheckInDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} day(s)`
                            }
                          </Text>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </View>
                </Pressable>

                {/* Old Monthly Update Button (kept for backwards compatibility) */}
                <Pressable
                  onPress={() => navigation.navigate("MonthlyUpdateForm", { participantId: participant.id })}
                  className="bg-gray-50 border border-gray-200 rounded-xl py-3 items-center active:opacity-70"
                >
                  <Ionicons name="calendar" size={20} color="#6B7280" />
                  <Text className="text-gray-700 text-sm font-semibold mt-1">Submit Monthly Update (Legacy)</Text>
                </Pressable>
              </View>
            )}

            {/* Admin Graduation Approval */}
            {userRole === "admin" &&
             participant.status === "active_mentorship" &&
             participant.completedGraduationSteps &&
             participant.completedGraduationSteps.length === 10 && (
              <Pressable
                onPress={() => navigation.navigate("GraduationApproval", { participantId: participant.id })}
                className="bg-green-50 border-2 border-green-600 rounded-xl py-4 px-4 active:opacity-70"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="trophy" size={24} color="#16A34A" />
                  <Text className="text-green-600 text-base font-bold ml-2">Ready for Graduation Approval</Text>
                </View>
              </Pressable>
            )}

            {/* Move Back to Bridge Team - Available for mentorship participants */}
            {(userRole === "admin" || userRole === "mentorship_leader") &&
             ["pending_mentor", "assigned_mentor", "initial_contact_pending", "active_mentorship"].includes(participant.status) && (
              <Pressable
                onPress={() => {
                  Alert.alert(
                    "Move Back to Bridge Team?",
                    "This will move the participant back to the Bridge Team queue. The mentor assignment will be removed. Continue?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Move to Bridge Team",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await updateParticipantStatus(
                              participant.id,
                              "pending_bridge",
                              currentUser.id,
                              currentUser.name,
                              "Moved back to Bridge Team from mentorship"
                            );
                            Alert.alert("Success", "Participant moved back to Bridge Team");
                          } catch (error) {
                            Alert.alert("Error", "Failed to move participant");
                          }
                        },
                      },
                    ]
                  );
                }}
                className="bg-gray-50 border border-gray-300 rounded-xl py-3 items-center active:opacity-70"
              >
                <View className="flex-row items-center">
                  <Ionicons name="arrow-back" size={20} color="#6B7280" />
                  <Text className="text-gray-700 text-sm font-semibold ml-2">Move Back to Bridge Team</Text>
                </View>
              </Pressable>
            )}
          </View>
        )}

        {/* Basic Info */}
        <View className="px-6 py-5 bg-white border-b border-gray-100">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-bold text-gray-900 uppercase">Basic Information</Text>
            <Pressable
              onPress={() => {
                setEditPhone(participant.phoneNumber || "");
                setEditEmail(participant.email || "");
                setShowEditContactModal(true);
              }}
              className="flex-row items-center"
            >
              <Ionicons name="pencil" size={16} color="#4B5563" />
              <Text className="text-gray-600 text-xs font-semibold ml-1">Edit Contact</Text>
            </Pressable>
          </View>
          <View className="gap-3">
            {/* Phone Number - Clickable to call or text */}
            {participant.phoneNumber && (
              <View className="flex-row items-start">
                <Text className="text-sm text-gray-600 w-32 pt-2">Phone:</Text>
                <View className="flex-1">
                  <Text className="text-sm text-gray-900 font-medium mb-2">{participant.phoneNumber}</Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={handlePhonePress}
                      className="flex-1 bg-green-50 border border-green-200 rounded-lg py-2 px-3 flex-row items-center justify-center active:opacity-70"
                    >
                      <Ionicons name="call" size={16} color="#10B981" />
                      <Text className="text-green-600 font-semibold text-xs ml-1">Call</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleSMSPress}
                      className="flex-1 bg-blue-50 border border-blue-200 rounded-lg py-2 px-3 flex-row items-center justify-center active:opacity-70"
                    >
                      <Ionicons name="chatbubble" size={16} color="#3B82F6" />
                      <Text className="text-blue-600 font-semibold text-xs ml-1">Text</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
            {/* Email - Clickable to compose */}
            {participant.email && (
              <View className="flex-row items-start">
                <Text className="text-sm text-gray-600 w-32 pt-2">Email:</Text>
                <View className="flex-1">
                  <Text className="text-sm text-gray-900 font-medium mb-2">{participant.email}</Text>
                  <Pressable
                    onPress={handleEmailPress}
                    className="bg-blue-50 border border-blue-200 rounded-lg py-2 px-3 flex-row items-center justify-center active:opacity-70"
                  >
                    <Ionicons name="mail" size={16} color="#3B82F6" />
                    <Text className="text-blue-600 font-semibold text-xs ml-1">Send Email</Text>
                  </Pressable>
                </View>
              </View>
            )}
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-32">Age:</Text>
              <Text className="text-sm text-gray-900 font-medium">{participant.age} years</Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-32">Gender:</Text>
              <Text className="text-sm text-gray-900 font-medium">{participant.gender}</Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-32">Released From:</Text>
              <Text className="text-sm text-gray-900 font-medium flex-1">
                {participant.releasedFrom}
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-32">Time Out:</Text>
              <Text className="text-sm text-gray-900 font-medium">
                {participant.timeOut} days
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm text-gray-600 w-32">Submitted:</Text>
              <Text className="text-sm text-gray-900 font-medium">
                {formatDate(participant.submittedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        <View className="px-6 py-5 bg-white border-b border-gray-100">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-bold text-gray-900 uppercase">Notes</Text>
            <Pressable
              onPress={() => setShowNoteInput(!showNoteInput)}
              className="flex-row items-center"
            >
              <Ionicons
                name={showNoteInput ? "close" : "add-circle"}
                size={20}
                color="#374151"
              />
              <Text className="text-yellow-600 text-sm font-semibold ml-1">
                {showNoteInput ? "Cancel" : "Add Note"}
              </Text>
            </Pressable>
          </View>

          {showNoteInput && (
            <View className="mb-4">
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm mb-2"
                placeholder="Type your note here..."
                value={noteText}
                onChangeText={setNoteText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Pressable
                onPress={handleAddNote}
                className="bg-gray-600 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white text-sm font-bold">Save Note</Text>
              </Pressable>
            </View>
          )}

          {!participant.notes || participant.notes.length === 0 ? (
            <Text className="text-gray-400 text-sm">No notes yet</Text>
          ) : (
            participant.notes.map(renderNote)
          )}
        </View>

        {/* History Timeline */}
        <View className="px-6 py-5 bg-white">
          <Text className="text-sm font-bold text-gray-900 mb-4 uppercase">History Timeline</Text>
          {!participant.history || participant.history.length === 0 ? (
            <Text className="text-gray-400 text-sm">No history yet</Text>
          ) : (
            <View>{participant.history.slice().reverse().map(renderHistoryItem)}</View>
          )}
        </View>

        {/* Admin Actions - Delete & Merge */}
        {userRole === "admin" && (
          <View className="px-6 py-5 bg-white border-t border-gray-100">
            <Text className="text-sm font-bold text-gray-900 mb-4 uppercase">Admin Actions</Text>
            <View className="gap-3">
              <Pressable
                onPress={() => navigation.navigate("MergeParticipants", { sourceParticipantId: participantId })}
                className="bg-yellow-50 border border-yellow-200 rounded-xl py-4 flex-row items-center justify-center active:opacity-80"
              >
                <Ionicons name="git-merge" size={20} color="#CA8A04" />
                <Text className="text-yellow-700 text-base font-semibold ml-2">Merge with Another Profile</Text>
              </Pressable>

              <Pressable
                onPress={() => setShowDeleteModal(true)}
                className="bg-red-50 border border-red-200 rounded-xl py-4 flex-row items-center justify-center active:opacity-80"
              >
                <Ionicons name="trash" size={20} color="#DC2626" />
                <Text className="text-red-600 text-base font-semibold ml-2">Delete Participant</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="checkmark-circle" size={40} color="#10B981" />
            </View>
            <Text className="text-lg font-bold text-gray-900">Note Added!</Text>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="trash" size={40} color="#DC2626" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Delete Participant?</Text>
              <Text className="text-center text-gray-600 mb-2">
                Are you sure you want to permanently delete this participant?
              </Text>
              <View className="w-full bg-gray-50 rounded-xl p-4 mb-2">
                <Text className="text-sm font-semibold text-gray-900 text-center">
                  {participant.firstName} {participant.lastName}
                </Text>
                <Text className="text-xs text-gray-600 text-center">
                  {participant.participantNumber}
                </Text>
              </View>
              <Text className="text-xs text-red-600 text-center font-semibold">
                This action cannot be undone. All notes and history will be permanently deleted.
              </Text>
            </View>
            <View className="gap-2">
              <Pressable
                onPress={handleDeleteParticipant}
                className="bg-red-600 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white font-semibold">Delete Permanently</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                className="bg-gray-100 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Contact Info Modal */}
      <Modal
        visible={showEditContactModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditContactModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowEditContactModal(false)}
        >
          <View className="flex-1" />
          <Pressable
            className="bg-white rounded-t-3xl"
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 24 }}
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">Edit Contact Info</Text>
                <Pressable onPress={() => setShowEditContactModal(false)}>
                  <Ionicons name="close" size={28} color="#6B7280" />
                </Pressable>
              </View>

              <View className="gap-4">
                {/* Phone Number */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Phone Number</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="(555) 123-4567"
                    value={editPhone}
                    onChangeText={setEditPhone}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>

                {/* Email */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Email Address</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="email@example.com"
                    value={editEmail}
                    onChangeText={setEditEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleUpdateContactInfo}
                  />
                </View>

                {/* Save Button */}
                <Pressable
                  onPress={handleUpdateContactInfo}
                  className="bg-gray-600 rounded-xl py-4 items-center active:opacity-80 mt-2"
                >
                  <Text className="text-white text-base font-bold">Save Changes</Text>
                </Pressable>

                {/* Cancel Button */}
                <Pressable
                  onPress={() => setShowEditContactModal(false)}
                  className="bg-gray-100 rounded-xl py-4 items-center active:opacity-80 mb-4"
                >
                  <Text className="text-gray-700 text-base font-semibold">Cancel</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
