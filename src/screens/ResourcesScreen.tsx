import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, Modal } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import Clipboard from "@react-native-clipboard/clipboard";
import { useAllResources, useResourceCategories } from "../state/resourceStore";
import { useAuthStore, useIsImpersonating, useOriginalAdmin, useCurrentUser } from "../state/authStore";
import { useInvitedUsers } from "../state/usersStore";
import { Ionicons } from "@expo/vector-icons";

export default function ResourcesScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const resources = useAllResources();
  const categories = useResourceCategories();
  const logout = useAuthStore((s) => s.logout);
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation);
  const impersonateUser = useAuthStore((s) => s.impersonateUser);
  const isImpersonating = useIsImpersonating();
  const originalAdmin = useOriginalAdmin();
  const invitedUsers = useInvitedUsers();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [mentorSearchQuery, setMentorSearchQuery] = useState("");

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyToClipboard = (content: string, title: string) => {
    Clipboard.setString(content);
    // Show a simple feedback - in production, you might want to use a toast
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => logout() },
      ]
    );
  };

  const handleReturnToAdmin = () => {
    stopImpersonation();
    // Reset navigation to Admin Dashboard
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      })
    );
  };

  const handleLoginAsMentor = (mentorUser: any) => {
    if (!currentUser) return;

    impersonateUser(mentorUser, currentUser);
    setShowMentorModal(false);
    setMentorSearchQuery("");

    // Reset navigation to mentor view
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      })
    );
  };

  const mentors = invitedUsers.filter((u) => u.role === "mentor");

  const filteredMentors = mentors.filter((mentor) => {
    if (!mentorSearchQuery) return true;
    return (
      mentor.name.toLowerCase().includes(mentorSearchQuery.toLowerCase()) ||
      mentor.email.toLowerCase().includes(mentorSearchQuery.toLowerCase())
    );
  });

  const isAdmin = currentUser?.role === "admin";
  const isMentorshipLeader = currentUser?.role === "mentorship_leader";

  // Memoize contentContainerStyle to prevent new object creation on every render
  const contentContainerStyle = React.useMemo(
    () => ({ paddingBottom: isImpersonating ? 100 : 20 }),
    [isImpersonating]
  );

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      {/* Header */}
      <View className="bg-[#405b69] pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white mb-1">Resources</Text>
            <Text className="text-white/90 text-sm">Quick access to participant resources</Text>
          </View>
          {isAdmin && (
            <Pressable
              onPress={() => navigation.navigate("EditResource", { resourceId: null })}
              className="bg-[#fcc85c] rounded-xl px-4 py-2"
            >
              <Text className="text-[#291403] text-sm font-bold">Add New</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Search */}
      <View className="px-6 pt-4 pb-2 bg-white border-b border-[#d7d7d6]">
        <View className="bg-[#f8f8f8] border border-[#d7d7d6] rounded-xl px-4 py-3 flex-row items-center">
          <Ionicons name="search" size={18} color="#99896c" />
          <TextInput
            className="flex-1 ml-2 text-sm"
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#99896c"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#99896c" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View className="px-6 py-3 bg-white border-b border-[#d7d7d6]">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full border ${
                !selectedCategory
                  ? "bg-[#405b69] border-[#405b69]"
                  : "bg-white border-[#d7d7d6]"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  !selectedCategory ? "text-white" : "text-[#99896c]"
                }`}
              >
                All
              </Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full border ${
                  selectedCategory === category
                    ? "bg-[#405b69] border-[#405b69]"
                    : "bg-white border-[#d7d7d6]"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedCategory === category ? "text-white" : "text-[#99896c]"
                  }`}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Resources List */}
      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={contentContainerStyle}>
        {filteredResources.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="folder-open-outline" size={64} color="#d7d7d6" />
            <Text className="text-[#99896c] text-base mt-4">No resources found</Text>
            <Text className="text-[#99896c] text-sm mt-1 text-center">
              {isAdmin ? "Tap 'Add New' to create your first resource" : "Try adjusting your search or filters"}
            </Text>
          </View>
        ) : (
          filteredResources.map((resource) => (
            <View
              key={resource.id}
              className="bg-white rounded-2xl p-5 mb-4 border border-[#d7d7d6]"
            >
              {/* Header */}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-3">
                  <Text className="text-lg font-bold text-[#3c3832] mb-1">{resource.title}</Text>
                  {resource.description && (
                    <Text className="text-sm text-[#99896c]">{resource.description}</Text>
                  )}
                </View>
                <View className="bg-[#fcc85c]/20 px-3 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-[#291403]">
                    {resource.category}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <View className="bg-[#f8f8f8] rounded-xl p-4 mb-4">
                <Text className="text-sm text-[#3c3832] leading-5">{resource.content}</Text>
              </View>

              {/* Copy and Edit Buttons */}
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleCopyToClipboard(resource.content, resource.title)}
                  className="flex-1 bg-[#405b69] rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
                >
                  <Ionicons name="copy-outline" size={16} color="white" />
                  <Text className="text-white text-sm font-semibold ml-2">Copy Text</Text>
                </Pressable>
                {isAdmin && (
                  <Pressable
                    onPress={() => navigation.navigate("EditResource", { resourceId: resource.id })}
                    className="bg-[#f8f8f8] border border-[#d7d7d6] rounded-xl px-4 py-3 flex-row items-center justify-center active:opacity-70"
                  >
                    <Ionicons name="create-outline" size={16} color="#99896c" />
                    <Text className="text-[#99896c] text-sm font-semibold ml-1">Edit</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}

        {/* Login As Mentor Card - For Mentorship Leaders Only */}
        {isMentorshipLeader && !isImpersonating && (
          <View className="bg-[#fcc85c]/20 border border-[#fcc85c]/30 rounded-xl p-5 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="person-circle" size={24} color="#fcc85c" />
              <Text className="text-lg font-bold text-[#d4a849] ml-2">Login As Mentor</Text>
            </View>
            <Text className="text-sm text-[#99896c] mb-4">
              View the app from any mentor{"'"}s perspective to help troubleshoot issues or provide guidance.
            </Text>
            <Pressable
              onPress={() => setShowMentorModal(true)}
              className="bg-[#fcc85c] rounded-lg py-3 flex-row items-center justify-center active:opacity-80"
            >
              <Ionicons name="log-in" size={18} color="white" />
              <Text className="text-white text-sm font-semibold ml-2">Select Mentor</Text>
            </Pressable>
          </View>
        )}

        {/* Guidance Tasks Card - For Admins and Mentorship Leaders */}
        {(currentUser?.role === "admin" || currentUser?.role === "mentorship_leader") && (
          <View className="bg-[#405b69]/10 border border-[#405b69]/20 rounded-xl p-5 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="help-circle" size={24} color="#405b69" />
              <Text className="text-lg font-bold text-[#405b69] ml-2">Mentor Guidance Tasks</Text>
            </View>
            <Text className="text-sm text-[#99896c] mb-4">
              Review and respond to guidance requests from mentors who need leadership support.
            </Text>
            <Pressable
              onPress={() => navigation.navigate("GuidanceTasks")}
              className="bg-[#405b69] rounded-lg py-3 flex-row items-center justify-center active:opacity-80"
            >
              <Ionicons name="arrow-forward" size={18} color="white" />
              <Text className="text-white text-sm font-semibold ml-2">View Guidance Tasks</Text>
            </Pressable>
          </View>
        )}

        {/* Form Management Card - For Admins Only */}
        {currentUser?.role === "admin" && (
          <View className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="document-text" size={24} color="#9333EA" />
              <Text className="text-lg font-bold text-purple-900 ml-2">Form Management</Text>
            </View>
            <Text className="text-sm text-gray-600 mb-4">
              Customize form questions, options, and settings for Initial Contact, Bridge Team Follow-Up, and other forms.
            </Text>
            <Pressable
              onPress={() => navigation.navigate("ManageForms")}
              className="bg-purple-600 rounded-lg py-3 flex-row items-center justify-center active:opacity-80"
            >
              <Ionicons name="create-outline" size={18} color="white" />
              <Text className="text-white text-sm font-semibold ml-2">Manage Forms</Text>
            </Pressable>
          </View>
        )}

        {/* Demographics Report Card - For Admins Only */}
        {currentUser?.role === "admin" && (
          <View className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="bar-chart" size={24} color="#14B8A6" />
              <Text className="text-lg font-bold text-teal-900 ml-2">Demographics Report</Text>
            </View>
            <Text className="text-sm text-teal-700 mb-4">
              View comprehensive demographic statistics including age, gender, and release location distributions.
            </Text>
            <Pressable
              onPress={() => navigation.navigate("Reporting")}
              className="bg-teal-600 rounded-lg py-3 flex-row items-center justify-center active:opacity-80"
            >
              <Ionicons name="arrow-forward" size={18} color="white" />
              <Text className="text-white text-sm font-semibold ml-2">View Report</Text>
            </Pressable>
          </View>
        )}

        {/* Logout Button */}
        <View className="mt-6 mb-4">
          <Pressable
            onPress={handleLogout}
            className="bg-red-50 border border-red-200 rounded-xl py-4 flex-row items-center justify-center active:opacity-70"
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text className="text-red-600 text-base font-semibold ml-2">Logout</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Impersonation Banner - Bottom */}
      {isImpersonating && originalAdmin && (
        <View className="absolute bottom-0 left-0 right-0 bg-[#fcc85c] px-6 py-4 border-t-2 border-[#fcc85c]">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-[#291403] text-sm font-semibold">
                Viewing as {currentUser?.role?.replace("_", " ")}
              </Text>
              <Text className="text-[#291403]/70 text-xs">
                Admin: {originalAdmin.name}
              </Text>
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

      {/* Login As Mentor Modal */}
      <Modal
        visible={showMentorModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMentorModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-8" style={{ maxHeight: "80%" }}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-[#3c3832]">Login As Mentor</Text>
              <Pressable onPress={() => setShowMentorModal(false)}>
                <Ionicons name="close" size={28} color="#99896c" />
              </Pressable>
            </View>

            {/* Search */}
            <View className="bg-[#f8f8f8] border border-[#d7d7d6] rounded-xl px-4 py-3 flex-row items-center mb-4">
              <Ionicons name="search" size={18} color="#99896c" />
              <TextInput
                className="flex-1 ml-2 text-sm"
                placeholder="Search mentors by name or email..."
                value={mentorSearchQuery}
                onChangeText={setMentorSearchQuery}
                placeholderTextColor="#99896c"
              />
              {mentorSearchQuery.length > 0 && (
                <Pressable onPress={() => setMentorSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#99896c" />
                </Pressable>
              )}
            </View>

            {/* Mentors List */}
            <ScrollView className="flex-1">
              {filteredMentors.length === 0 ? (
                <View className="items-center justify-center py-12">
                  <Ionicons name="people-outline" size={64} color="#d7d7d6" />
                  <Text className="text-[#99896c] text-base mt-4">
                    {mentorSearchQuery ? "No mentors found" : "No mentors available"}
                  </Text>
                </View>
              ) : (
                filteredMentors.map((mentor) => (
                  <Pressable
                    key={mentor.id}
                    onPress={() => handleLoginAsMentor(mentor)}
                    className="bg-white border border-[#d7d7d6] rounded-xl p-4 mb-3 active:bg-[#f8f8f8]"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-[#3c3832] mb-1">{mentor.name}</Text>
                        <Text className="text-sm text-[#99896c]">{mentor.email}</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={20} color="#9333EA" />
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
