import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";
import { useUsersStore } from "../state/usersStore";
import { useParticipantStore } from "../state/participantStore";
import { useMentorshipStore } from "../state/mentorshipStore";
import { User } from "../types";
import { formatNumber } from "../utils/formatNumber";

export default function MentorshipScreen({ navigation }: any) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const invitedUsers = useUsersStore((s) => s.invitedUsers);
  const participants = useParticipantStore((s) => s.participants);
  const assignments = useMentorshipStore((s) => s.assignments);
  const assignMentee = useMentorshipStore((s) => s.assignMentee);
  const removeAssignment = useMentorshipStore((s) => s.removeAssignment);
  const reassignMentee = useMentorshipStore((s) => s.reassignMentee);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<any>(null);
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [searchMentee, setSearchMentee] = useState("");
  const [searchMentor, setSearchMentor] = useState("");
  const [notes, setNotes] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Get mentors (includes mentor leaders and can assign to themselves)
  const mentors = useMemo(() => {
    return invitedUsers.filter(
      (user) => user.role === "mentor" || user.role === "mentorship_leader" || user.role === "admin"
    );
  }, [invitedUsers]);

  // Get participants who are ready for mentorship
  const availableMentees = useMemo(() => {
    return participants.filter((p) =>
      ["pending_mentor", "assigned_mentor", "initial_contact_pending", "active_mentorship"].includes(p.status)
    );
  }, [participants]);

  // Get active assignments
  const activeAssignments = useMemo(() => {
    return assignments.filter((a) => a.status === "active");
  }, [assignments]);

  // Filter mentees by search
  const filteredMentees = useMemo(() => {
    if (!searchMentee) return availableMentees;
    const query = searchMentee.toLowerCase();
    return availableMentees.filter(
      (p) =>
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.participantNumber.toLowerCase().includes(query)
    );
  }, [availableMentees, searchMentee]);

  // Filter mentors by search
  const filteredMentors = useMemo(() => {
    if (!searchMentor) return mentors;
    const query = searchMentor.toLowerCase();
    return mentors.filter(
      (m) => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query)
    );
  }, [mentors, searchMentor]);

  const handleOpenAssignModal = (mentee: any) => {
    setSelectedMentee(mentee);
    setSelectedMentor(null);
    setSearchMentor("");
    setNotes("");
    setShowAssignModal(true);
  };

  const handleAssignMentee = () => {
    if (!selectedMentee || !selectedMentor || !currentUser) return;

    assignMentee(
      selectedMentor.id,
      selectedMentor.name,
      selectedMentee.id,
      `${selectedMentee.firstName} ${selectedMentee.lastName}`,
      currentUser.id,
      currentUser.name,
      notes
    );

    setSuccessMessage(`${selectedMentee.firstName} ${selectedMentee.lastName} assigned to ${selectedMentor.name}`);
    setShowSuccessModal(true);
    setShowAssignModal(false);
  };

  const handleOpenReassignModal = (assignment: any) => {
    setSelectedAssignment(assignment);
    setSelectedMentor(null);
    setSearchMentor("");
    setShowReassignModal(true);
  };

  const handleReassign = () => {
    if (!selectedAssignment || !selectedMentor || !currentUser) return;

    reassignMentee(
      selectedAssignment.id,
      selectedMentor.id,
      selectedMentor.name,
      currentUser.id,
      currentUser.name
    );

    setSuccessMessage(`${selectedAssignment.menteeName} reassigned to ${selectedMentor.name}`);
    setShowSuccessModal(true);
    setShowReassignModal(false);
  };

  const handleRemoveAssignment = (assignment: any) => {
    removeAssignment(assignment.id);
    setSuccessMessage(`${assignment.menteeName} removed from ${assignment.mentorName}`);
    setShowSuccessModal(true);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-8 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-3xl font-bold text-white mb-2">Mentorship</Text>
        <Text className="text-yellow-100 text-base">Assign mentees to mentors</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Stats */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <Text className="text-yellow-600 text-2xl font-bold">{formatNumber(activeAssignments.length)}</Text>
              <Text className="text-yellow-700 text-sm font-medium">Active Assignments</Text>
            </View>
            <View className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <Text className="text-gray-600 text-2xl font-bold">{formatNumber(availableMentees.length)}</Text>
              <Text className="text-gray-700 text-sm font-medium">Available Mentees</Text>
            </View>
          </View>
        </View>

        {/* Active Assignments */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Active Assignments</Text>
          {activeAssignments.length === 0 ? (
            <View className="bg-gray-50 rounded-xl p-6 items-center">
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-2">No active assignments yet</Text>
            </View>
          ) : (
            <View className="gap-3">
              {activeAssignments.map((assignment) => (
                <View key={assignment.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">{assignment.menteeName}</Text>
                      <Text className="text-sm text-gray-600 mt-1">Mentor: {assignment.mentorName}</Text>
                      <Text className="text-xs text-gray-400 mt-1">
                        Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row gap-2 mt-3">
                    <Pressable
                      onPress={() => handleOpenReassignModal(assignment)}
                      className="flex-1 bg-yellow-50 border border-yellow-600 rounded-lg py-2 items-center"
                    >
                      <Text className="text-yellow-700 text-xs font-semibold">Reassign</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleRemoveAssignment(assignment)}
                      className="flex-1 bg-red-50 border border-red-600 rounded-lg py-2 items-center"
                    >
                      <Text className="text-red-700 text-xs font-semibold">Remove</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Available Mentees */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Available Mentees</Text>
          {availableMentees.length === 0 ? (
            <View className="bg-gray-50 rounded-xl p-6 items-center">
              <Ionicons name="checkmark-circle-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-2">All mentees assigned</Text>
            </View>
          ) : (
            <View className="gap-3">
              {availableMentees.map((mentee) => {
                const hasAssignment = activeAssignments.some((a) => a.menteeId === mentee.id);
                const assignment = activeAssignments.find((a) => a.menteeId === mentee.id);

                return (
                  <View key={mentee.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900">
                          {mentee.firstName} {mentee.lastName}
                        </Text>
                        <Text className="text-sm text-gray-600 mt-1">TDJC: {mentee.participantNumber}</Text>
                        {hasAssignment && (
                          <View className="flex-row items-center mt-2">
                            <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                            <Text className="text-xs text-green-600 ml-1">Assigned to {assignment?.mentorName}</Text>
                          </View>
                        )}
                      </View>
                      <Pressable
                        onPress={() => handleOpenAssignModal(mentee)}
                        className="bg-gray-600 rounded-lg px-4 py-2"
                      >
                        <Text className="text-white text-xs font-semibold">
                          {hasAssignment ? "Reassign" : "Assign"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Assign Modal */}
      <Modal
        visible={showAssignModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6 max-h-[85%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Assign Mentee</Text>
              <Pressable onPress={() => setShowAssignModal(false)} className="w-8 h-8 items-center justify-center">
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            {selectedMentee && (
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-sm text-gray-500 mb-1">Mentee</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {selectedMentee.firstName} {selectedMentee.lastName}
                </Text>
              </View>
            )}

            <Text className="text-sm font-semibold text-gray-700 mb-2">Select Mentor</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-3"
              placeholder="Search mentors..."
              value={searchMentor}
              onChangeText={setSearchMentor}
            />

            <ScrollView className="mb-4" style={{ maxHeight: 250 }}>
              {filteredMentors.map((mentor) => (
                <Pressable
                  key={mentor.id}
                  onPress={() => setSelectedMentor(mentor)}
                  className={`border-2 rounded-xl p-4 mb-2 ${
                    selectedMentor?.id === mentor.id
                      ? "bg-yellow-50 border-yellow-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedMentor?.id === mentor.id ? "text-yellow-900" : "text-gray-900"
                    }`}
                  >
                    {mentor.name}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">{mentor.email}</Text>
                  <Text className="text-xs text-gray-400 mt-1 capitalize">{mentor.role.replace("_", " ")}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text className="text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
              placeholder="Add any notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Pressable
              onPress={handleAssignMentee}
              disabled={!selectedMentor}
              className={`rounded-xl py-4 items-center ${
                selectedMentor ? "bg-gray-600" : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-base font-bold">Assign Mentee</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Reassign Modal */}
      <Modal
        visible={showReassignModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReassignModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6 max-h-[85%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Reassign Mentee</Text>
              <Pressable onPress={() => setShowReassignModal(false)} className="w-8 h-8 items-center justify-center">
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            {selectedAssignment && (
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-sm text-gray-500 mb-1">Mentee</Text>
                <Text className="text-base font-semibold text-gray-900">{selectedAssignment.menteeName}</Text>
                <Text className="text-sm text-gray-500 mt-2">Current Mentor</Text>
                <Text className="text-base text-gray-700">{selectedAssignment.mentorName}</Text>
              </View>
            )}

            <Text className="text-sm font-semibold text-gray-700 mb-2">Select New Mentor</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-3"
              placeholder="Search mentors..."
              value={searchMentor}
              onChangeText={setSearchMentor}
            />

            <ScrollView className="mb-4" style={{ maxHeight: 250 }}>
              {filteredMentors.map((mentor) => (
                <Pressable
                  key={mentor.id}
                  onPress={() => setSelectedMentor(mentor)}
                  className={`border-2 rounded-xl p-4 mb-2 ${
                    selectedMentor?.id === mentor.id
                      ? "bg-yellow-50 border-yellow-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedMentor?.id === mentor.id ? "text-yellow-900" : "text-gray-900"
                    }`}
                  >
                    {mentor.name}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">{mentor.email}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              onPress={handleReassign}
              disabled={!selectedMentor}
              className={`rounded-xl py-4 items-center ${
                selectedMentor ? "bg-gray-600" : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-base font-bold">Reassign</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="checkmark-circle" size={40} color="#16A34A" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Success</Text>
              <Text className="text-center text-gray-600">{successMessage}</Text>
            </View>
            <Pressable
              onPress={() => setShowSuccessModal(false)}
              className="bg-gray-600 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-semibold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
