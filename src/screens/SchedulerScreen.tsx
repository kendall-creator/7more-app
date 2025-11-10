import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";
import { useSchedulerStore } from "../state/schedulerStore";
import { formatUserDisplayName } from "../utils/displayName";

export default function SchedulerScreen({ navigation }: any) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const shifts = useSchedulerStore((s) => s.shifts);
  const meetings = useSchedulerStore((s) => s.meetings);
  const getMeetingsForUser = useSchedulerStore((s) => s.getMeetingsForUser);
  const updateMeetingRSVP = useSchedulerStore((s) => s.updateMeetingRSVP);
  const signUpForShift = useSchedulerStore((s) => s.signUpForShift);
  const cancelShiftSignup = useSchedulerStore((s) => s.cancelShiftSignup);

  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const userRole = currentUser?.role || "volunteer";
  const isAdmin = userRole === "admin";
  const isSupportVolunteer = userRole === "volunteer_support";

  // Default to "My Schedule" for non-admins, "Manage Schedule" for admins
  const [activeTab, setActiveTab] = useState<"my" | "manage">(isAdmin ? "manage" : "my");

  // Filter shifts based on active tab and user role
  const visibleShifts = useMemo(() => {
    let filtered = shifts;

    if (activeTab === "my") {
      // My Schedule: Only show shifts the user is signed up for
      if (!currentUser) return [];
      filtered = shifts.filter((shift) =>
        shift.assignedUsers?.some((assignment) => assignment.userId === currentUser.id)
      );
    } else {
      // Manage Schedule: Show all shifts based on role permissions
      if (isSupportVolunteer) {
        // Support volunteers only see shifts that include volunteer_support role
        filtered = shifts.filter((shift) => shift.allowedRoles.includes("volunteer_support"));
      } else {
        // Everyone else sees all shifts they have permission for
        filtered = shifts.filter((shift) => shift.allowedRoles.includes(userRole));
      }
    }

    return filtered;
  }, [shifts, userRole, isSupportVolunteer, activeTab, currentUser]);

  // Get the start of the current week (Monday)
  const getWeekStart = (offset: number = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Adjust so Monday is 0, Sunday is 6
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday + (offset * 7));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  // Generate week view (Monday-Sunday) with dates
  const getCurrentWeekDays = () => {
    const weekStart = getWeekStart(currentWeekOffset);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      // Create date string in local timezone (YYYY-MM-DD)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      days.push({
        date: date,
        dateString: dateString,
        dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i],
        dayShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        dayNumber: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        isToday: date.toDateString() === new Date().toDateString(),
      });
    }

    return days;
  };

  const weekDays = useMemo(() => getCurrentWeekDays(), [currentWeekOffset]);

  // Get user's signed up shifts
  const myShifts = useMemo(() => {
    if (!currentUser) return [];
    return shifts.filter((shift) =>
      (shift.assignedUsers || []).some((assignment) => assignment.userId === currentUser.id)
    );
  }, [shifts, currentUser]);

  // Get user's meetings (created by or invited to)
  const myMeetings = useMemo(() => {
    if (!currentUser) return [];
    return getMeetingsForUser(currentUser.id);
  }, [meetings, currentUser, getMeetingsForUser]);

  // Group shifts by date
  const shiftsByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};

    visibleShifts.forEach((shift) => {
      if (!grouped[shift.date]) {
        grouped[shift.date] = [];
      }
      grouped[shift.date].push(shift);
    });

    // Sort shifts within each date by start time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [visibleShifts]);

  // Group meetings by date (only for My Schedule tab)
  const meetingsByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};

    if (activeTab === "my") {
      myMeetings.forEach((meeting) => {
        if (!grouped[meeting.date]) {
          grouped[meeting.date] = [];
        }
        grouped[meeting.date].push(meeting);
      });

      // Sort meetings within each date by start time
      Object.keys(grouped).forEach((date) => {
        grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
      });
    }

    return grouped;
  }, [myMeetings, activeTab]);

  const canSignUp = (shift: any) => {
    if (!currentUser) return false;
    if (!shift.allowedRoles.includes(userRole)) return false;
    const assignedUsers = shift.assignedUsers || [];
    if (shift.maxVolunteers && assignedUsers.length >= shift.maxVolunteers) return false;
    if (assignedUsers.some((assignment: any) => assignment.userId === currentUser.id)) return false;
    return true;
  };

  const isSignedUp = (shift: any) => {
    if (!currentUser) return false;
    return (shift.assignedUsers || []).some((assignment: any) => assignment.userId === currentUser.id);
  };

  const handleShiftPress = (shift: any) => {
    setSelectedShift(shift);
    setShowShiftModal(true);
  };

  const handleSignUp = async () => {
    if (!selectedShift || !currentUser) return;

    const success = await signUpForShift(selectedShift.id, currentUser.id, currentUser.name, userRole, currentUser.nickname);

    if (success) {
      setSuccessMessage(`You are signed up for ${selectedShift.title}`);
      setShowSuccessModal(true);
      setShowShiftModal(false);
    } else {
      setErrorMessage("Unable to sign up for this shift. It may be full or not available for your role.");
      setShowErrorModal(true);
    }
  };

  const handleCancelSignup = async () => {
    if (!selectedShift || !currentUser) return;

    await cancelShiftSignup(selectedShift.id, currentUser.id);
    setSuccessMessage(`You have cancelled your signup for ${selectedShift.title}`);
    setShowSuccessModal(true);
    setShowShiftModal(false);
  };

  const handleMeetingPress = (meeting: any) => {
    setSelectedMeeting(meeting);
    setShowMeetingModal(true);
  };

  const handleRSVP = async (rsvpStatus: "yes" | "no" | "maybe") => {
    if (!selectedMeeting || !currentUser) return;

    try {
      await updateMeetingRSVP(selectedMeeting.id, currentUser.id, rsvpStatus);
      setSuccessMessage(`RSVP updated to "${rsvpStatus.toUpperCase()}" for ${selectedMeeting.title}`);
      setShowSuccessModal(true);
      setShowMeetingModal(false);
    } catch (error) {
      console.error("Error updating RSVP:", error);
      setErrorMessage("Failed to update RSVP. Please try again.");
      setShowErrorModal(true);
    }
  };

  const getWeekLabel = () => {
    if (currentWeekOffset === 0) return "This Week";
    if (currentWeekOffset === 1) return "Next Week";
    if (currentWeekOffset === -1) return "Last Week";

    const weekStart = getWeekStart(currentWeekOffset);
    return `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  const goToPreviousWeek = () => setCurrentWeekOffset(currentWeekOffset - 1);
  const goToNextWeek = () => setCurrentWeekOffset(currentWeekOffset + 1);
  const goToThisWeek = () => setCurrentWeekOffset(0);

  const renderShiftCard = (shift: any, index: number) => {
    const signedUp = isSignedUp(shift);
    const canSign = canSignUp(shift);
    const assignedUsers = shift.assignedUsers || [];
    const isFull = shift.maxVolunteers && assignedUsers.length >= shift.maxVolunteers;
    const isAdmin = userRole === "admin" || userRole === "mentorship_leader";
    const canSeeAssignments = userRole === "admin" || userRole === "mentorship_leader" || userRole === "volunteer";

    return (
      <View
        key={shift.id}
        className={`border-2 rounded-xl p-3 mb-2 ${
          signedUp
            ? "bg-yellow-50 border-yellow-600"
            : isFull
            ? "bg-gray-50 border-gray-300"
            : "bg-white border-gray-200"
        }`}
      >
        <Pressable
          onPress={() => handleShiftPress(shift)}
          className="flex-row items-start justify-between"
        >
          <View className="flex-1">
            <Text
              className={`text-sm font-semibold ${
                signedUp ? "text-yellow-900" : isFull ? "text-gray-400" : "text-gray-900"
              }`}
            >
              {shift.title}
            </Text>
            <Text
              className={`text-xs mt-1 ${
                signedUp ? "text-yellow-600" : isFull ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {shift.startTime} - {shift.endTime}
            </Text>
            {shift.maxVolunteers && (
              <Text
                className={`text-xs mt-1 ${
                  isFull ? "text-red-600" : "text-gray-500"
                }`}
              >
                {assignedUsers.length}/{shift.maxVolunteers} spots
              </Text>
            )}
          </View>
          <View className="ml-2">
            {signedUp ? (
              <View className="bg-yellow-600 rounded-lg px-2 py-1">
                <Text className="text-white text-xs font-bold">Signed Up</Text>
              </View>
            ) : isFull ? (
              <View className="bg-gray-300 rounded-lg px-2 py-1">
                <Text className="text-gray-600 text-xs font-bold">Full</Text>
              </View>
            ) : canSign ? (
              <View className="bg-gray-600 rounded-lg px-2 py-1">
                <Text className="text-white text-xs font-bold">Open</Text>
              </View>
            ) : null}
          </View>
        </Pressable>

        {/* Show assigned users for admins, mentorship leaders, and lead volunteers */}
        {canSeeAssignments && assignedUsers.length > 0 && (
          <View className="mt-3 pt-3 border-t border-gray-200">
            <Text className="text-xs font-semibold text-gray-700 mb-2">Scheduled:</Text>
            <View className="flex-row flex-wrap gap-2">
              {assignedUsers.map((user: any, idx: number) => (
                <View key={idx} className="bg-gray-100 rounded-lg px-2 py-1">
                  <Text className="text-xs text-gray-700">{formatUserDisplayName(user.userName, user.userNickname)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-200">
            <Pressable
              onPress={() => navigation.navigate("AssignUserToShift", { shift })}
              className="flex-1 bg-blue-50 border border-blue-200 rounded-lg py-2 flex-row items-center justify-center active:opacity-70"
            >
              <Ionicons name="person-add-outline" size={14} color="#2563EB" />
              <Text className="text-blue-600 text-xs font-semibold ml-1">Assign</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("ManageShifts", { editShift: shift })}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2 flex-row items-center justify-center active:opacity-70"
            >
              <Ionicons name="create-outline" size={14} color="#374151" />
              <Text className="text-gray-600 text-xs font-semibold ml-1">Edit</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderMeetingCard = (meeting: any, index: number) => {
    if (!currentUser) return null;

    const myInvite = meeting.invitees.find((inv: any) => inv.userId === currentUser.id);
    const myRSVP = myInvite?.rsvpStatus || "pending";
    const isCreator = meeting.createdBy === currentUser.id;

    return (
      <View
        key={meeting.id}
        className={`border-2 rounded-xl p-3 mb-2 ${
          myRSVP === "yes"
            ? "bg-green-50 border-green-500"
            : myRSVP === "no"
            ? "bg-red-50 border-red-300"
            : myRSVP === "maybe"
            ? "bg-blue-50 border-blue-300"
            : "bg-[#fcc85c]/20 border-[#fcc85c]/30"
        }`}
      >
        <Pressable
          onPress={() => handleMeetingPress(meeting)}
          className="flex-row items-start justify-between"
        >
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Ionicons
                name={meeting.type === "virtual" ? "videocam" : "people"}
                size={14}
                color={
                  myRSVP === "yes"
                    ? "#16A34A"
                    : myRSVP === "no"
                    ? "#DC2626"
                    : myRSVP === "maybe"
                    ? "#2563EB"
                    : "#9333EA"
                }
              />
              <Text className="text-xs font-semibold text-gray-500 ml-1 uppercase">Meeting</Text>
            </View>
            <Text className={`text-sm font-semibold ${myRSVP === "no" ? "text-gray-400" : "text-gray-900"}`}>
              {meeting.title}
            </Text>
            <Text className={`text-xs mt-1 ${myRSVP === "no" ? "text-gray-400" : "text-gray-500"}`}>
              {meeting.startTime} - {meeting.endTime}
            </Text>
            {isCreator && (
              <Text className="text-xs text-gray-500 mt-1 italic">You created this</Text>
            )}
          </View>
          <View className="ml-2">
            {myRSVP === "yes" ? (
              <View className="bg-green-600 rounded-lg px-2 py-1">
                <Text className="text-white text-xs font-bold">Going</Text>
              </View>
            ) : myRSVP === "no" ? (
              <View className="bg-red-600 rounded-lg px-2 py-1">
                <Text className="text-white text-xs font-bold">Not Going</Text>
              </View>
            ) : myRSVP === "maybe" ? (
              <View className="bg-blue-600 rounded-lg px-2 py-1">
                <Text className="text-white text-xs font-bold">Maybe</Text>
              </View>
            ) : (
              <View className="bg-[#fcc85c] rounded-lg px-2 py-1">
                <Text className="text-white text-xs font-bold">Pending</Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-4 px-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white mb-1">Scheduler</Text>
            <Text className="text-yellow-100 text-sm">
              {activeTab === "my" ? "Your Scheduled Shifts" : isSupportVolunteer ? "Support Volunteer Shifts" : "All Available Shifts"}
            </Text>
          </View>
          {activeTab === "manage" && (userRole === "admin" || userRole === "mentorship_leader") && (
            <Pressable
              onPress={() => navigation.navigate("ManageShifts")}
              className="bg-yellow-500 rounded-xl px-4 py-2"
            >
              <Text className="text-gray-900 text-sm font-bold">+ Create</Text>
            </Pressable>
          )}
          {activeTab === "my" && isAdmin && (
            <Pressable
              onPress={() => navigation.navigate("CreateMeeting")}
              className="bg-yellow-500 rounded-xl px-4 py-2"
            >
              <Text className="text-gray-900 text-sm font-bold">+ Meeting</Text>
            </Pressable>
          )}
        </View>

        {/* Tab Selector */}
        <View className="flex-row bg-gray-700 rounded-xl p-1">
          <Pressable
            onPress={() => setActiveTab("my")}
            className={`flex-1 py-2 rounded-lg ${activeTab === "my" ? "bg-white" : ""}`}
          >
            <Text className={`text-center font-semibold ${activeTab === "my" ? "text-gray-900" : "text-gray-300"}`}>
              My Schedule
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("manage")}
            className={`flex-1 py-2 rounded-lg ${activeTab === "manage" ? "bg-white" : ""}`}
          >
            <Text className={`text-center font-semibold ${activeTab === "manage" ? "text-gray-900" : "text-gray-300"}`}>
              Manage Schedule
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* My Shifts Section - Only show in Manage Schedule tab */}
        {activeTab === "manage" && myShifts.length > 0 && (
          <View className="px-6 pt-4 pb-3 bg-yellow-50 border-b-2 border-yellow-200">
            <View className="flex-row items-center mb-3">
              <Ionicons name="checkmark-circle" size={20} color="#CA8A04" />
              <Text className="text-base font-bold text-yellow-900 ml-2">
                My Upcoming Shifts ({myShifts.length})
              </Text>
            </View>

            {/* List of user's shifts */}
            <View className="gap-2">
              {myShifts.slice(0, 5).map((shift) => {
                const [year, month, day] = shift.date.split('-').map(Number);
                const shiftDate = new Date(year, month - 1, day);
                const formattedDate = shiftDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <Pressable
                    key={shift.id}
                    onPress={() => handleShiftPress(shift)}
                    className="bg-white rounded-lg p-3 border border-yellow-300 active:opacity-70"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-gray-900">{shift.title}</Text>
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                          <Text className="text-xs text-gray-600 ml-1">{formattedDate}</Text>
                          <Ionicons name="time-outline" size={12} color="#6B7280" className="ml-2" />
                          <Text className="text-xs text-gray-600 ml-1">
                            {shift.startTime} - {shift.endTime}
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#CA8A04" />
                    </View>
                  </Pressable>
                );
              })}
              {myShifts.length > 5 && (
                <Text className="text-xs text-yellow-700 text-center mt-1">
                  + {myShifts.length - 5} more shift{myShifts.length - 5 !== 1 ? "s" : ""}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Week Navigation */}
        <View className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-2">
            <Pressable onPress={goToPreviousWeek} className="p-2">
              <Ionicons name="chevron-back" size={24} color="#374151" />
            </Pressable>

            <View className="items-center">
              <Text className="text-lg font-bold text-gray-900">{getWeekLabel()}</Text>
              {currentWeekOffset !== 0 && (
                <Pressable onPress={goToThisWeek} className="mt-1">
                  <Text className="text-xs text-yellow-600 font-semibold">Back to This Week</Text>
                </Pressable>
              )}
            </View>

            <Pressable onPress={goToNextWeek} className="p-2">
              <Ionicons name="chevron-forward" size={24} color="#374151" />
            </Pressable>
          </View>
        </View>

        {/* Week Calendar View - Monday through Sunday */}
        <View className="px-6 py-4">
          {weekDays.map((day, index) => {
            const dayShifts = shiftsByDate[day.dateString] || [];
            const dayMeetings = meetingsByDate[day.dateString] || [];
            const hasShifts = dayShifts.length > 0;
            const hasMeetings = dayMeetings.length > 0;
            const hasContent = hasShifts || hasMeetings;

            return (
              <View key={day.dateString}>
                {/* Day Header */}
                <View
                  className={`flex-row items-center justify-between py-3 px-4 rounded-xl mb-3 ${
                    day.isToday ? "bg-yellow-100" : "bg-gray-100"
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className="items-center mr-3">
                      <Text
                        className={`text-xs font-semibold ${
                          day.isToday ? "text-yellow-700" : "text-gray-500"
                        }`}
                      >
                        {day.dayShort.toUpperCase()}
                      </Text>
                      <Text
                        className={`text-2xl font-bold ${
                          day.isToday ? "text-yellow-900" : "text-gray-900"
                        }`}
                      >
                        {day.dayNumber}
                      </Text>
                      <Text
                        className={`text-xs ${
                          day.isToday ? "text-yellow-700" : "text-gray-500"
                        }`}
                      >
                        {day.month}
                      </Text>
                    </View>
                    <Text
                      className={`text-base font-semibold ${
                        day.isToday ? "text-yellow-900" : "text-gray-700"
                      }`}
                    >
                      {day.dayName}
                    </Text>
                  </View>
                  {hasContent && (
                    <View className="bg-gray-600 rounded-full px-3 py-1">
                      <Text className="text-white text-xs font-bold">{dayShifts.length + dayMeetings.length}</Text>
                    </View>
                  )}
                </View>

                {/* Shifts and Meetings for this day */}
                {hasContent ? (
                  <View className="mb-4 pl-4">
                    {dayShifts.map((shift, idx) => renderShiftCard(shift, idx))}
                    {dayMeetings.map((meeting, idx) => renderMeetingCard(meeting, idx))}
                  </View>
                ) : (
                  <View className="mb-4 pl-4">
                    <Text className="text-sm text-gray-400 italic">
                      {activeTab === "my" ? "Nothing scheduled" : "No shifts scheduled"}
                    </Text>
                  </View>
                )}

                {/* Week Separator - Add line after Sunday */}
                {index === 6 && (
                  <View className="border-b-2 border-gray-300 my-4" />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Shift Details Modal */}
      <Modal
        visible={showShiftModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowShiftModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Shift Details</Text>
              <Pressable onPress={() => setShowShiftModal(false)} className="w-8 h-8 items-center justify-center">
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            {selectedShift && (
              <>
                <View className="mb-6">
                  <Text className="text-2xl font-bold text-gray-900 mb-3">{selectedShift.title}</Text>

                  <View className="flex-row items-center mb-2">
                    <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                    <Text className="text-base text-gray-700 ml-2">
                      {(() => {
                        // Parse the date string in local timezone
                        const [year, month, day] = selectedShift.date.split('-').map(Number);
                        const shiftDate = new Date(year, month - 1, day);
                        return shiftDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        });
                      })()}
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                    <Text className="text-base text-gray-700 ml-2">
                      {selectedShift.startTime} - {selectedShift.endTime}
                    </Text>
                  </View>

                  {selectedShift.description && (
                    <View className="mt-3">
                      <Text className="text-sm text-gray-500 mb-1">Description</Text>
                      <Text className="text-base text-gray-700">{selectedShift.description}</Text>
                    </View>
                  )}

                  {selectedShift.maxVolunteers && (
                    <View className="mt-3">
                      <Text className="text-sm text-gray-500">
                        Volunteers: {(selectedShift.assignedUsers || []).length}/{selectedShift.maxVolunteers}
                      </Text>
                    </View>
                  )}

                  {(selectedShift.assignedUsers || []).length > 0 && (
                    <View className="mt-4">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">Signed Up</Text>
                      {selectedShift.assignedUsers.map((assignment: any) => (
                        <View key={assignment.userId} className="flex-row items-center mb-1">
                          <Ionicons name="person" size={16} color="#6B7280" />
                          <Text className="text-sm text-gray-600 ml-2">{formatUserDisplayName(assignment.userName, assignment.userNickname)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {isSignedUp(selectedShift) ? (
                  <Pressable
                    onPress={handleCancelSignup}
                    className="bg-red-600 rounded-xl py-4 items-center active:opacity-80"
                  >
                    <Text className="text-white text-base font-bold">Cancel Signup</Text>
                  </Pressable>
                ) : canSignUp(selectedShift) ? (
                  <Pressable
                    onPress={handleSignUp}
                    className="bg-gray-600 rounded-xl py-4 items-center active:opacity-80"
                  >
                    <Text className="text-white text-base font-bold">Sign Up</Text>
                  </Pressable>
                ) : (
                  <View className="bg-gray-100 rounded-xl py-4 items-center">
                    <Text className="text-gray-500 text-base font-semibold">
                      {(selectedShift.assignedUsers || []).length >= selectedShift.maxVolunteers
                        ? "Shift is Full"
                        : "Not available for your role"}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
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

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="alert-circle" size={40} color="#DC2626" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Error</Text>
              <Text className="text-center text-gray-600">{errorMessage}</Text>
            </View>
            <Pressable
              onPress={() => setShowErrorModal(false)}
              className="bg-gray-600 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-semibold">OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Meeting Details Modal */}
      <Modal
        visible={showMeetingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMeetingModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Meeting Details</Text>
              <Pressable onPress={() => setShowMeetingModal(false)} className="w-8 h-8 items-center justify-center">
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedMeeting && currentUser && (
                <>
                  <View className="mb-6">
                    <Text className="text-2xl font-bold text-gray-900 mb-3">{selectedMeeting.title}</Text>

                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name={selectedMeeting.type === "virtual" ? "videocam" : "people"}
                        size={20}
                        color="#6B7280"
                      />
                      <Text className="text-base text-gray-700 ml-2 capitalize">
                        {selectedMeeting.type} Meeting
                      </Text>
                    </View>

                    <View className="flex-row items-center mb-2">
                      <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                      <Text className="text-base text-gray-700 ml-2">
                        {(() => {
                          const [year, month, day] = selectedMeeting.date.split("-").map(Number);
                          const meetingDate = new Date(year, month - 1, day);
                          return meetingDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          });
                        })()}
                      </Text>
                    </View>

                    <View className="flex-row items-center mb-2">
                      <Ionicons name="time-outline" size={20} color="#6B7280" />
                      <Text className="text-base text-gray-700 ml-2">
                        {selectedMeeting.startTime} - {selectedMeeting.endTime}
                      </Text>
                    </View>

                    {selectedMeeting.type === "virtual" && selectedMeeting.videoCallLink && (
                      <View className="flex-row items-start mb-2">
                        <Ionicons name="link-outline" size={20} color="#6B7280" />
                        <Text className="text-base text-blue-600 ml-2 flex-1 underline">
                          {selectedMeeting.videoCallLink}
                        </Text>
                      </View>
                    )}

                    {selectedMeeting.description && (
                      <View className="mt-3">
                        <Text className="text-sm text-gray-500 mb-1">Description</Text>
                        <Text className="text-base text-gray-700">{selectedMeeting.description}</Text>
                      </View>
                    )}

                    <View className="mt-4">
                      <Text className="text-sm text-gray-500 mb-1">Organized by</Text>
                      <Text className="text-base text-gray-700">
                        {formatUserDisplayName(selectedMeeting.createdByName, selectedMeeting.createdByNickname)}
                      </Text>
                    </View>

                    {selectedMeeting.invitees && selectedMeeting.invitees.length > 0 && (
                      <View className="mt-4">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                          Invitees ({selectedMeeting.invitees.length})
                        </Text>
                        {selectedMeeting.invitees.map((invitee: any) => (
                          <View key={invitee.userId} className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center flex-1">
                              <Ionicons name="person" size={16} color="#6B7280" />
                              <Text className="text-sm text-gray-700 ml-2 flex-1">
                                {formatUserDisplayName(invitee.userName, invitee.userNickname)}
                                {invitee.userId === currentUser.id && " (You)"}
                              </Text>
                            </View>
                            <View
                              className={`px-2 py-1 rounded ${
                                invitee.rsvpStatus === "yes"
                                  ? "bg-green-100"
                                  : invitee.rsvpStatus === "no"
                                  ? "bg-red-100"
                                  : invitee.rsvpStatus === "maybe"
                                  ? "bg-blue-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Text
                                className={`text-xs font-semibold ${
                                  invitee.rsvpStatus === "yes"
                                    ? "text-green-700"
                                    : invitee.rsvpStatus === "no"
                                    ? "text-red-700"
                                    : invitee.rsvpStatus === "maybe"
                                    ? "text-blue-700"
                                    : "text-gray-600"
                                }`}
                              >
                                {invitee.rsvpStatus === "yes"
                                  ? "Going"
                                  : invitee.rsvpStatus === "no"
                                  ? "Not Going"
                                  : invitee.rsvpStatus === "maybe"
                                  ? "Maybe"
                                  : "Pending"}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* RSVP Buttons - only show if user is an invitee */}
                  {selectedMeeting.invitees.some((inv: any) => inv.userId === currentUser.id) && (
                    <View className="gap-3">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">Your Response</Text>
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => handleRSVP("yes")}
                          className="flex-1 bg-green-600 rounded-xl py-4 items-center active:opacity-80"
                        >
                          <Ionicons name="checkmark-circle" size={20} color="white" />
                          <Text className="text-white text-sm font-bold mt-1">Yes</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleRSVP("maybe")}
                          className="flex-1 bg-blue-600 rounded-xl py-4 items-center active:opacity-80"
                        >
                          <Ionicons name="help-circle" size={20} color="white" />
                          <Text className="text-white text-sm font-bold mt-1">Maybe</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleRSVP("no")}
                          className="flex-1 bg-red-600 rounded-xl py-4 items-center active:opacity-80"
                        >
                          <Ionicons name="close-circle" size={20} color="white" />
                          <Text className="text-white text-sm font-bold mt-1">No</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
