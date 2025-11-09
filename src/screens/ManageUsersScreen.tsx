import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInvitedUsers, useUsersStore } from "../state/usersStore";
import { useCurrentUser, useAuthStore } from "../state/authStore";
import { UserRole } from "../types";
import { Ionicons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import { backupUsers, getUserStats } from "../utils/userBackup";
import { sendPasswordResetEmail, generatePasswordFromName } from "../services/emailService";

interface InvitedUserDisplay {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export default function ManageUsersScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const invitedUsers = useInvitedUsers();
  const removeUser = useUsersStore((s) => s.removeUser);
  const resetPassword = useUsersStore((s) => s.resetPassword);
  const impersonateUser = useAuthStore((s) => s.impersonateUser);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InvitedUserDisplay | null>(null);
  const [newTemporaryPassword, setNewTemporaryPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleBackupUsers = async () => {
    try {
      const backup = await backupUsers();
      Clipboard.setString(backup);
      const stats = getUserStats();
      Alert.alert(
        "Backup Created",
        `User data copied to clipboard!\n\nTotal users: ${stats.total}\n- Admins: ${stats.admin}\n- Bridge Team: ${stats.bridge_team}\n- Mentorship Leaders: ${stats.mentorship_leader}\n- Mentors: ${stats.mentor}\n\nSave this backup somewhere safe (email it to yourself or save in notes). You can restore from this backup if data is ever lost.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create backup. Please try again.");
    }
  };

  // Convert invited users to display format
  const allUsers: InvitedUserDisplay[] = invitedUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));

  const roleOptions: { value: UserRole | "all"; label: string; color: string }[] = [
    { value: "all", label: "All", color: "bg-gray-100 text-gray-700" },
    { value: "admin", label: "Admin", color: "bg-gray-100 text-yellow-700" },
    { value: "bridge_team", label: "Bridge Team", color: "bg-gray-200 text-gray-900" },
    { value: "mentorship_leader", label: "Mentorship Leader", color: "bg-yellow-100 text-gray-700" },
    { value: "mentor", label: "Mentor", color: "bg-yellow-100 text-gray-900" },
  ];

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    const option = roleOptions.find((opt) => opt.value === role);
    return option || { label: role, color: "bg-gray-100 text-gray-700" };
  };

  const handleDeleteUser = (user: InvitedUserDisplay) => {
    if (user.id === currentUser?.id) {
      return; // Can't delete yourself
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      removeUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  const handleImpersonate = (user: InvitedUserDisplay) => {
    if (!currentUser) return;
    setSelectedUser(user);
    setShowImpersonateModal(true);
  };

  const confirmImpersonate = () => {
    if (selectedUser && currentUser) {
      // Convert to User type for impersonation
      const userToImpersonate = {
        id: selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
      };
      impersonateUser(userToImpersonate, currentUser);
      setShowImpersonateModal(false);
      setSelectedUser(null);
      navigation.navigate("MainTabs");
    }
  };

  const handleResetPassword = (user: InvitedUserDisplay) => {
    if (user.id === currentUser?.id) {
      Alert.alert("Cannot Reset", "You cannot reset your own password.");
      return;
    }
    setSelectedUser(user);
    setShowResetPasswordModal(true);
  };

  const confirmResetPassword = async () => {
    if (!selectedUser) return;

    setIsResettingPassword(true);

    try {
      // Generate new password from user's name (first initial + last name)
      const newPassword = generatePasswordFromName(selectedUser.name);

      const result = await resetPassword(selectedUser.id, newPassword);

      if (result.success) {
        setNewTemporaryPassword(result.password);

        // Try to send password reset email
        const emailResult = await sendPasswordResetEmail(
          selectedUser.email,
          selectedUser.name,
          result.password,
          "7more"
        );

        setResetEmailSent(emailResult.success);
        // Keep modal open to show the new password
      }
    } catch (error) {
      Alert.alert("Error", "Failed to reset password. Please try again.");
      setShowResetPasswordModal(false);
      setSelectedUser(null);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setSelectedUser(null);
    setNewTemporaryPassword("");
    setResetEmailSent(false);
  };

  const copyResetPasswordToClipboard = () => {
    Clipboard.setString(newTemporaryPassword);
    Alert.alert("Copied!", "Temporary password copied to clipboard.");
  };

  const renderUserCard = (user: InvitedUserDisplay) => {
    const badge = getRoleBadge(user.role);
    const isCurrentUser = user.id === currentUser?.id;

    return (
      <View
        key={user.id}
        className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-lg font-bold text-gray-900">{user.name}</Text>
              {isCurrentUser && (
                <View className="bg-yellow-100 px-2 py-0.5 rounded">
                  <Text className="text-xs font-semibold text-gray-900">You</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-gray-500 mb-2">{user.email}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${badge.color}`}>
            <Text className={`text-xs font-semibold ${badge.color}`}>{badge.label}</Text>
          </View>
        </View>

        {!isCurrentUser && (
          <View className="gap-2 mt-2">
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => navigation.navigate("EditUser", { userId: user.id })}
                className="flex-1 bg-green-50 border border-green-200 rounded-xl py-2 flex-row items-center justify-center active:opacity-70"
              >
                <Ionicons name="create-outline" size={16} color="#10B981" />
                <Text className="text-green-600 text-sm font-semibold ml-1">Edit</Text>
              </Pressable>
              <Pressable
                onPress={() => handleResetPassword(user)}
                className="flex-1 bg-blue-50 border border-blue-200 rounded-xl py-2 flex-row items-center justify-center active:opacity-70"
              >
                <Ionicons name="key-outline" size={16} color="#2563EB" />
                <Text className="text-blue-600 text-sm font-semibold ml-1">Reset PW</Text>
              </Pressable>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleImpersonate(user)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2 flex-row items-center justify-center active:opacity-70"
              >
                <Ionicons name="log-in-outline" size={16} color="#374151" />
                <Text className="text-yellow-600 text-sm font-semibold ml-1">Login As</Text>
              </Pressable>
              <Pressable
                onPress={() => handleDeleteUser(user)}
                className="flex-1 bg-red-50 border border-red-200 rounded-xl py-2 flex-row items-center justify-center active:opacity-70"
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
                <Text className="text-red-600 text-sm font-semibold ml-1">Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Pressable
            onPress={handleBackupUsers}
            className="bg-yellow-600 rounded-xl px-4 py-2 flex-row items-center active:opacity-80"
          >
            <Ionicons name="cloud-download" size={18} color="white" />
            <Text className="text-white text-sm font-semibold ml-2">Backup Users</Text>
          </Pressable>
        </View>
        <Text className="text-2xl font-bold text-white mb-1">Manage Users</Text>
        <Text className="text-yellow-100 text-sm">
          {filteredUsers.length} of {allUsers.length} user{allUsers.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Search and Add */}
      <View className="px-6 pt-4 pb-2 bg-white border-b border-gray-100">
        <View className="flex-row gap-2 mb-3">
          <View className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-sm"
              placeholder="Search by name or email..."
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
          <Pressable
            onPress={() => navigation.navigate("AddUser")}
            className="bg-gray-600 rounded-xl px-4 items-center justify-center active:opacity-80"
          >
            <Ionicons name="person-add" size={24} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Role Filter */}
      <View className="px-6 py-3 bg-white border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {roleOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setFilterRole(option.value)}
                className={`px-4 py-2 rounded-full border ${
                  filterRole === option.value
                    ? "bg-gray-600 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filterRole === option.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Users List */}
      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {filteredUsers.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-base mt-4">No users found</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">
              {searchQuery || filterRole !== "all"
                ? "Try adjusting your search or filters"
                : "Add a new user to get started"}
            </Text>
          </View>
        ) : (
          filteredUsers.map(renderUserCard)
        )}
      </ScrollView>

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
                <Ionicons name="trash" size={32} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Delete User</Text>
              <Text className="text-center text-gray-600">
                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              </Text>
            </View>
            <View className="gap-2">
              <Pressable
                onPress={confirmDelete}
                className="bg-red-600 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white font-semibold">Delete User</Text>
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

      {/* Impersonate Confirmation Modal */}
      <Modal
        visible={showImpersonateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImpersonateModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-yellow-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="log-in" size={32} color="#F59E0B" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Login As User</Text>
              <Text className="text-center text-gray-600">
                You will be logged in as {selectedUser?.name} ({selectedUser?.role}). You can return to your admin account at any time.
              </Text>
            </View>
            <View className="gap-2">
              <Pressable
                onPress={confirmImpersonate}
                className="bg-gray-600 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white font-semibold">Login As This User</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowImpersonateModal(false)}
                className="bg-gray-100 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        visible={showResetPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={closeResetPasswordModal}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            {!newTemporaryPassword ? (
              // Confirmation Screen
              <View className="items-center mb-4">
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="key" size={32} color="#2563EB" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2">Reset Password</Text>
                <Text className="text-center text-gray-600 mb-4">
                  A new password will be generated for {selectedUser?.name} based on their name (first initial + last name).
                </Text>
                {isResettingPassword ? (
                  <ActivityIndicator size="large" color="#4B5563" />
                ) : (
                  <View className="gap-2 w-full">
                    <Pressable
                      onPress={confirmResetPassword}
                      className="bg-blue-600 rounded-xl py-3 items-center active:opacity-80"
                    >
                      <Text className="text-white font-semibold">Reset Password</Text>
                    </Pressable>
                    <Pressable
                      onPress={closeResetPasswordModal}
                      className="bg-gray-100 rounded-xl py-3 items-center active:opacity-80"
                    >
                      <Text className="text-gray-700 font-semibold">Cancel</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : (
              // Success Screen with new password
              <View className="items-center mb-4">
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="checkmark-circle" size={40} color="#10B981" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2">Password Reset!</Text>
                <Text className="text-center text-gray-600 mb-4">
                  New password generated for {selectedUser?.name}.
                </Text>

                {/* Email Status */}
                {resetEmailSent ? (
                  <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 w-full">
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="mail" size={16} color="#10B981" />
                      <Text className="text-green-800 font-semibold ml-2">Email Sent</Text>
                    </View>
                    <Text className="text-green-700 text-xs">
                      Reset email sent to {selectedUser?.email}
                    </Text>
                  </View>
                ) : (
                  <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 w-full">
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="warning" size={16} color="#F59E0B" />
                      <Text className="text-yellow-800 font-semibold ml-2">Email Not Configured</Text>
                    </View>
                    <Text className="text-yellow-700 text-xs">
                      Share this password with the user manually.
                    </Text>
                  </View>
                )}

                {/* Password Display */}
                <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 w-full">
                  <Text className="text-gray-700 font-semibold mb-2 text-center">
                    New Password
                  </Text>
                  <View className="bg-white border border-gray-300 rounded-lg p-3 mb-3">
                    <Text className="text-gray-900 font-mono text-center" selectable>
                      {newTemporaryPassword}
                    </Text>
                  </View>
                  <Pressable
                    onPress={copyResetPasswordToClipboard}
                    className="bg-gray-600 rounded-lg py-2 items-center active:opacity-80"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="copy-outline" size={16} color="white" />
                      <Text className="text-white text-sm font-semibold ml-2">Copy Password</Text>
                    </View>
                  </Pressable>
                </View>

                <Text className="text-xs text-gray-500 text-center mb-4">
                  The user can change their password anytime from their account settings.
                </Text>

                <Pressable
                  onPress={closeResetPasswordModal}
                  className="bg-gray-600 rounded-xl py-3 items-center active:opacity-80 w-full"
                >
                  <Text className="text-white font-semibold">Done</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
