import React, { useState, useMemo, useEffect } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuthStore } from "../state/authStore";
import { useSchedulerStore } from "../state/schedulerStore";
import { UserRole, ShiftLocation } from "../types";

export default function ManageShiftsScreen({ navigation, route }: any) {
  const editShift = route?.params?.editShift;

  const currentUser = useAuthStore((s) => s.currentUser);
  const shifts = useSchedulerStore((s) => s.shifts);
  const createShift = useSchedulerStore((s) => s.createShift);
  const deleteShift = useSchedulerStore((s) => s.deleteShift);
  const deleteRecurringGroup = useSchedulerStore((s) => s.deleteRecurringGroup);
  const updateShift = useSchedulerStore((s) => s.updateShift);
  const copyWeek = useSchedulerStore((s) => s.copyWeek);
  const saveWeekAsTemplate = useSchedulerStore((s) => s.saveWeekAsTemplate);
  const getTemplates = useSchedulerStore((s) => s.getTemplates);
  const createShiftsFromTemplate = useSchedulerStore((s) => s.createShiftsFromTemplate);
  const deleteTemplate = useSchedulerStore((s) => s.deleteTemplate);
  const getShiftsByDateRange = useSchedulerStore((s) => s.getShiftsByDateRange);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCopyWeekModal, setShowCopyWeekModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<"shift" | "sourceWeek" | "targetWeek" | "templateWeek">("shift");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<"start" | "end">("start");
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<any>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<ShiftLocation | "">("");
  const [holiday, setHoliday] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxVolunteers, setMaxVolunteers] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [weeksToCreate, setWeeksToCreate] = useState("12");
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]); // 0=Sunday, 1=Monday, etc.
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([
    "admin",
    "mentorship_leader",
    "mentor",
  ]);

  // Copy week fields
  const [sourceWeek, setSourceWeek] = useState("");
  const [targetWeek, setTargetWeek] = useState("");

  // Template fields
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateWeekStart, setTemplateWeekStart] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const roleOptions: { role: UserRole; label: string }[] = [
    { role: "admin", label: "Admin" },
    { role: "bridge_team", label: "Bridge Team" },
    { role: "mentorship_leader", label: "Mentor Leader" },
    { role: "mentor", label: "Mentor" },
    { role: "volunteer", label: "Lead Volunteer" },
    { role: "volunteer_support", label: "Support Volunteer" },
    { role: "board_member", label: "Board Member" },
  ];

  const locationOptions: { value: ShiftLocation; label: string }[] = [
    { value: "pam_lychner", label: "Pam Lychner" },
    { value: "huntsville", label: "Huntsville" },
    { value: "plane", label: "Plane" },
    { value: "hawaii", label: "Hawaii" },
  ];

  const upcomingShifts = useMemo(() => {
    const now = new Date().toISOString().split("T")[0];
    return shifts
      .filter((shift) => shift.date >= now)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [shifts]);

  const templates = useMemo(() => getTemplates(), [shifts]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setHoliday("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setMaxVolunteers("");
    setIsRecurring(false);
    setWeeksToCreate("12");
    setSelectedDaysOfWeek([]);
    setCalendarMonth(new Date());
    setSelectedRoles(["admin", "mentorship_leader", "mentor"]);
  };

  const toggleDayOfWeek = (dayIndex: number) => {
    if (selectedDaysOfWeek.includes(dayIndex)) {
      setSelectedDaysOfWeek(selectedDaysOfWeek.filter(d => d !== dayIndex));
    } else {
      setSelectedDaysOfWeek([...selectedDaysOfWeek, dayIndex].sort());
    }
  };

  // Generate calendar days for the current month
  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0=Sunday

    const days = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        date: currentDate,
        dateString,
        dayOfWeek: currentDate.getDay(),
        isToday: currentDate.toDateString() === new Date().toDateString(),
      });
    }

    return days;
  };

  const formatMonthYear = () => {
    return calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const goToPreviousMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const selectDate = (dateString: string) => {
    setDate(dateString);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleOpenEdit = (shift: any) => {
    setSelectedShift(shift);
    setTitle(shift.title);
    setDescription(shift.description || "");
    setLocation(shift.location || "");
    setHoliday(shift.holiday || "");
    setDate(shift.date);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setMaxVolunteers(shift.maxVolunteers?.toString() || "");
    setSelectedRoles(shift.allowedRoles);
    setShowEditModal(true);
  };

  // Automatically open edit modal if editShift is provided via navigation params
  useEffect(() => {
    if (editShift) {
      handleOpenEdit(editShift);
      // Clear the param so it doesn't re-trigger
      navigation.setParams({ editShift: undefined });
    }
  }, [editShift]);

  const handleCreate = () => {
    if (!title || !startTime || !endTime || !currentUser || !location) return;
    if (!date && selectedDaysOfWeek.length === 0) return;

    // If creating shifts for multiple days in the SAME week (not recurring)
    if (!isRecurring && selectedDaysOfWeek.length > 0) {
      const baseDate = date ? new Date(date) : new Date();
      let shiftsCreated = 0;

      // Create shifts for each selected day in the same week
      for (const dayOfWeek of selectedDaysOfWeek) {
        const shiftDate = new Date(baseDate);
        shiftDate.setDate(baseDate.getDate() - baseDate.getDay() + dayOfWeek);

        const year = shiftDate.getFullYear();
        const month = String(shiftDate.getMonth() + 1).padStart(2, '0');
        const day = String(shiftDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        createShift(
          title,
          description,
          dateString,
          startTime,
          endTime,
          selectedRoles,
          currentUser.id,
          currentUser.name,
          maxVolunteers ? parseInt(maxVolunteers, 10) : undefined,
          false,
          12,
          location as ShiftLocation
        );
        shiftsCreated++;
      }

      // Also create for the originally selected date if not already included
      if (date) {
        const selectedDate = new Date(date);
        const selectedDayOfWeek = selectedDate.getDay();
        if (!selectedDaysOfWeek.includes(selectedDayOfWeek)) {
          createShift(
            title,
            description,
            date,
            startTime,
            endTime,
            selectedRoles,
            currentUser.id,
            currentUser.name,
            maxVolunteers ? parseInt(maxVolunteers, 10) : undefined,
            false,
            12,
            location as ShiftLocation
          );
          shiftsCreated++;
        }
      }

      setSuccessMessage(`Created ${shiftsCreated} shift${shiftsCreated > 1 ? 's' : ''} for this week`);
      setShowSuccessModal(true);
      setShowCreateModal(false);
      resetForm();
      return;
    }

    // If creating recurring weekly shifts with specific days
    if (isRecurring && selectedDaysOfWeek.length > 0) {
      const weeksNum = parseInt(weeksToCreate, 10) || 12;
      const baseDate = date ? new Date(date) : new Date();
      let shiftsCreated = 0;

      for (let week = 0; week < weeksNum; week++) {
        for (const dayOfWeek of selectedDaysOfWeek) {
          const shiftDate = new Date(baseDate);
          shiftDate.setDate(baseDate.getDate() - baseDate.getDay() + (week * 7) + dayOfWeek);

          const year = shiftDate.getFullYear();
          const month = String(shiftDate.getMonth() + 1).padStart(2, '0');
          const day = String(shiftDate.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;

          createShift(
            title,
            description,
            dateString,
            startTime,
            endTime,
            selectedRoles,
            currentUser.id,
            currentUser.name,
            maxVolunteers ? parseInt(maxVolunteers, 10) : undefined,
            false,
            12,
            location as ShiftLocation
          );
          shiftsCreated++;
        }
      }

      setSuccessMessage(`Created ${shiftsCreated} shifts across ${weeksNum} weeks`);
      setShowSuccessModal(true);
      setShowCreateModal(false);
      resetForm();
      return;
    }

    // Single shift or simple recurring
    if (!date) return;

    createShift(
      title,
      description,
      date,
      startTime,
      endTime,
      selectedRoles,
      currentUser.id,
      currentUser.name,
      maxVolunteers ? parseInt(maxVolunteers, 10) : undefined,
      isRecurring && !selectedDaysOfWeek.length,
      isRecurring && !selectedDaysOfWeek.length ? parseInt(weeksToCreate, 10) : undefined,
      location as ShiftLocation
    );

    setSuccessMessage(
      isRecurring && !selectedDaysOfWeek.length
        ? `Created ${weeksToCreate} recurring shifts for "${title}"`
        : `Shift "${title}" created successfully`
    );
    setShowSuccessModal(true);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedShift || !title || !date || !startTime || !endTime || !location) return;

    updateShift(selectedShift.id, {
      title,
      description,
      location: location as ShiftLocation,
      holiday,
      date,
      startTime,
      endTime,
      allowedRoles: selectedRoles,
      maxVolunteers: maxVolunteers ? parseInt(maxVolunteers, 10) : undefined,
    });

    setSuccessMessage(`Shift "${title}" updated successfully`);
    setShowSuccessModal(true);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    if (!selectedShift) return;

    if (selectedShift.recurringGroupId) {
      // Ask if they want to delete all recurring shifts
      deleteRecurringGroup(selectedShift.recurringGroupId);
      setSuccessMessage(`All recurring shifts in "${selectedShift.title}" deleted`);
    } else {
      deleteShift(selectedShift.id);
      setSuccessMessage(`Shift "${selectedShift.title}" deleted`);
    }

    setShowSuccessModal(true);
    setShowDeleteModal(false);
    setSelectedShift(null);
  };

  const handleCopyWeek = () => {
    if (!sourceWeek || !targetWeek || !currentUser) return;

    copyWeek(sourceWeek, targetWeek, currentUser.id, currentUser.name);
    setSuccessMessage("Week copied successfully");
    setShowSuccessModal(true);
    setShowCopyWeekModal(false);
    setSourceWeek("");
    setTargetWeek("");
  };

  const handleSaveTemplate = () => {
    if (!sourceWeek || !templateName || !currentUser) return;

    saveWeekAsTemplate(sourceWeek, templateName, currentUser.id, currentUser.name);
    setSuccessMessage(`Template "${templateName}" saved successfully`);
    setShowSuccessModal(true);
    setShowSaveTemplateModal(false);
    setSourceWeek("");
    setTemplateName("");
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate || !templateWeekStart) return;

    createShiftsFromTemplate(selectedTemplate, templateWeekStart);
    setSuccessMessage("Shifts created from template");
    setShowSuccessModal(true);
    setShowTemplateModal(false);
    setSelectedTemplate("");
    setTemplateWeekStart("");
  };

  const toggleRole = (role: UserRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const openDatePicker = (target: "shift" | "sourceWeek" | "targetWeek" | "templateWeek") => {
    console.log("Opening date picker for:", target);
    setDatePickerTarget(target);
    setTempDate(new Date());

    // Close other modals to prevent blocking
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowCopyWeekModal(false);
    setShowSaveTemplateModal(false);
    setShowTemplateModal(false);

    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log("Date changed:", selectedDate);
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const confirmDateSelection = () => {
    console.log("Confirming date:", tempDate);
    // Fix timezone issue - get local date string in YYYY-MM-DD format
    const year = tempDate.getFullYear();
    const month = String(tempDate.getMonth() + 1).padStart(2, '0');
    const day = String(tempDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    if (datePickerTarget === "shift") {
      setDate(dateString);
      // Reopen the appropriate modal
      if (selectedShift) {
        setShowEditModal(true);
      } else {
        setShowCreateModal(true);
      }
    } else if (datePickerTarget === "sourceWeek") {
      setSourceWeek(dateString);
      setShowCopyWeekModal(true);
    } else if (datePickerTarget === "targetWeek") {
      setTargetWeek(dateString);
      setShowCopyWeekModal(true);
    } else if (datePickerTarget === "templateWeek") {
      setTemplateWeekStart(dateString);
      setShowTemplateModal(true);
    }

    setShowDatePicker(false);
  };

  const openTimePicker = (target: "start" | "end") => {
    console.log("Opening time picker for:", target);
    setTimePickerTarget(target);
    setTempTime(new Date());

    // Close other modals to prevent blocking
    setShowCreateModal(false);
    setShowEditModal(false);

    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    console.log("Time changed:", selectedTime);
    if (selectedTime) {
      setTempTime(selectedTime);
    }
  };

  const confirmTimeSelection = () => {
    console.log("Confirming time:", tempTime);
    const hours = tempTime.getHours();
    const minutes = tempTime.getMinutes();

    // Convert to 12-hour format with AM/PM
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    const timeString = `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;

    if (timePickerTarget === "start") {
      setStartTime(timeString);
    } else {
      setEndTime(timeString);
    }

    // Reopen the appropriate modal
    if (selectedShift) {
      setShowEditModal(true);
    } else {
      setShowCreateModal(true);
    }

    setShowTimePicker(false);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-8 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white mb-2">Manage Shifts</Text>
            <Text className="text-yellow-100 text-base">Create and manage volunteer shifts</Text>
          </View>
          <Pressable
            onPress={handleOpenCreate}
            className="bg-yellow-500 rounded-full w-12 h-12 items-center justify-center"
          >
            <Ionicons name="add" size={28} color="#111827" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Action Buttons */}
        <View className="px-6 py-4 border-b border-gray-100">
          <View className="flex-row gap-2 mb-2">
            <Pressable
              onPress={() => setShowCopyWeekModal(true)}
              className="flex-1 bg-blue-50 border border-blue-600 rounded-xl py-3 items-center"
            >
              <Ionicons name="copy-outline" size={18} color="#2563EB" />
              <Text className="text-blue-700 text-xs font-semibold mt-1">Copy Week</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowSaveTemplateModal(true)}
              className="flex-1 bg-[#fcc85c]/20 border border-[#fcc85c] rounded-xl py-3 items-center"
            >
              <Ionicons name="save-outline" size={18} color="#fcc85c" />
              <Text className="text-[#d4a849] text-xs font-semibold mt-1">Save Template</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowTemplateModal(true)}
              className="flex-1 bg-green-50 border border-green-600 rounded-xl py-3 items-center"
            >
              <Ionicons name="apps-outline" size={18} color="#16A34A" />
              <Text className="text-green-700 text-xs font-semibold mt-1">Use Template</Text>
            </Pressable>
          </View>
        </View>

        {upcomingShifts.length === 0 ? (
          <View className="px-6 pt-12">
            <View className="bg-gray-50 rounded-xl p-8 items-center">
              <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-4 text-lg">No shifts created yet</Text>
              <Text className="text-gray-400 text-center mt-2">Tap the + button to create your first shift</Text>
            </View>
          </View>
        ) : (
          <View className="px-6 py-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Upcoming Shifts ({upcomingShifts.length})</Text>
            <View className="gap-3">
              {upcomingShifts.map((shift) => {
                const assignedCount = shift.assignedUsers?.length || 0;
                const isFull = shift.maxVolunteers && assignedCount >= shift.maxVolunteers;

                return (
                  <View key={shift.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-base font-bold text-gray-900">{shift.title}</Text>
                          {shift.isRecurring && (
                            <View className="bg-blue-100 px-2 py-1 rounded">
                              <Text className="text-xs text-blue-700 font-semibold">RECURRING</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm text-gray-600 mb-1">{formatDate(shift.date)}</Text>
                        <Text className="text-sm text-gray-500">
                          {shift.startTime} - {shift.endTime}
                        </Text>
                      </View>
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => {
                            setSelectedShift(shift);
                            navigation.navigate("AssignUserToShift", { shift });
                          }}
                          className="w-10 h-10 bg-yellow-50 rounded-lg items-center justify-center"
                        >
                          <Ionicons name="person-add" size={18} color="#D97706" />
                        </Pressable>
                        <Pressable
                          onPress={() => handleOpenEdit(shift)}
                          className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center"
                        >
                          <Ionicons name="pencil" size={18} color="#374151" />
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            setSelectedShift(shift);
                            setShowDeleteModal(true);
                          }}
                          className="w-10 h-10 bg-red-50 rounded-lg items-center justify-center"
                        >
                          <Ionicons name="trash-outline" size={18} color="#DC2626" />
                        </Pressable>
                      </View>
                    </View>

                    {shift.description && (
                      <Text className="text-sm text-gray-600 mb-3">{shift.description}</Text>
                    )}

                    <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                      <View className="flex-row items-center">
                        <Ionicons name="people" size={16} color="#6B7280" />
                        <Text className="text-sm text-gray-600 ml-1">
                          {assignedCount} {shift.maxVolunteers ? `/ ${shift.maxVolunteers}` : ""} signed up
                        </Text>
                        {isFull && (
                          <View className="ml-2 bg-red-100 px-2 py-1 rounded">
                            <Text className="text-xs text-red-700 font-semibold">FULL</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-gray-400">{shift.allowedRoles.length} role(s)</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Shift Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Create Shift</Text>
              <Pressable onPress={() => setShowCreateModal(false)} className="w-8 h-8 items-center justify-center">
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <ScrollView className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Title <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                placeholder="e.g., Morning Volunteer Shift"
                value={title}
                onChangeText={setTitle}
              />

              <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                placeholder="Shift details..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Holiday Placeholder (Optional) */}
              <Text className="text-sm font-semibold text-gray-700 mb-2">Holiday/Placeholder (Optional)</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                placeholder="e.g., Christmas Day, Facility Closed"
                value={holiday}
                onChangeText={setHoliday}
              />
              <Text className="text-xs text-gray-500 mb-4">
                Use this to mark days when no regular shifts are needed (holidays, closures, etc.)
              </Text>

              {/* Location Selector */}
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Location <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {locationOptions.map((loc) => (
                  <Pressable
                    key={loc.value}
                    onPress={() => setLocation(loc.value)}
                    className={`border-2 rounded-xl px-4 py-3 ${
                      location === loc.value
                        ? "bg-[#405b69] border-[#405b69]"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        location === loc.value ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {loc.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Visual Calendar */}
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Select Date
              </Text>
              <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                {/* Month Navigation */}
                <View className="flex-row items-center justify-between mb-3">
                  <Pressable onPress={goToPreviousMonth} className="p-2">
                    <Ionicons name="chevron-back" size={20} color="#374151" />
                  </Pressable>
                  <Text className="text-base font-bold text-gray-900">{formatMonthYear()}</Text>
                  <Pressable onPress={goToNextMonth} className="p-2">
                    <Ionicons name="chevron-forward" size={20} color="#374151" />
                  </Pressable>
                </View>

                {/* Day Headers */}
                <View className="flex-row mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <View key={day} className="flex-1 items-center">
                      <Text className="text-xs font-semibold text-gray-500">{day}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar Grid */}
                <View className="flex-row flex-wrap">
                  {getCalendarDays().map((day, index) => {
                    if (!day) {
                      return <View key={`empty-${index}`} className="w-[14.28%] aspect-square p-1" />;
                    }

                    const isSelected = date === day.dateString;
                    const isPast = day.date < new Date() && !day.isToday;

                    return (
                      <Pressable
                        key={day.dateString}
                        onPress={() => !isPast && selectDate(day.dateString)}
                        disabled={isPast}
                        className="w-[14.28%] aspect-square p-1"
                      >
                        <View
                          className={`flex-1 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-gray-600"
                              : day.isToday
                              ? "bg-yellow-100 border border-yellow-600"
                              : isPast
                              ? "bg-gray-100"
                              : "bg-white"
                          }`}
                        >
                          <Text
                            className={`text-sm font-semibold ${
                              isSelected
                                ? "text-white"
                                : isPast
                                ? "text-gray-300"
                                : day.isToday
                                ? "text-yellow-900"
                                : "text-gray-900"
                            }`}
                          >
                            {day.day}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Selected Date Display */}
                {date && (
                  <View className="mt-3 pt-3 border-t border-gray-200">
                    <Text className="text-xs text-gray-500 mb-1">Selected Date:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {(() => {
                        const [year, month, day] = date.split('-').map(Number);
                        const selectedDate = new Date(year, month - 1, day);
                        return selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        });
                      })()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Day-of-Week Selector for Same Week */}
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Also Create This Shift On (Same Week)
              </Text>
              <Text className="text-xs text-gray-500 mb-3">
                Select additional days this week to create the same shift
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {[
                  { index: 0, label: "Sun" },
                  { index: 1, label: "Mon" },
                  { index: 2, label: "Tue" },
                  { index: 3, label: "Wed" },
                  { index: 4, label: "Thu" },
                  { index: 5, label: "Fri" },
                  { index: 6, label: "Sat" },
                ].map((day) => (
                  <Pressable
                    key={day.index}
                    onPress={() => toggleDayOfWeek(day.index)}
                    className={`border-2 rounded-xl px-4 py-3 ${
                      selectedDaysOfWeek.includes(day.index)
                        ? "bg-gray-600 border-gray-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selectedDaysOfWeek.includes(day.index) ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {day.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {selectedDaysOfWeek.length > 0 && (
                <View className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <Text className="text-xs font-semibold text-blue-900 mb-1">
                    Will also create on:
                  </Text>
                  <Text className="text-xs text-blue-700">
                    {selectedDaysOfWeek
                      .map((i) => {
                        const baseDate = date ? new Date(date) : new Date();
                        const targetDate = new Date(baseDate);
                        targetDate.setDate(baseDate.getDate() - baseDate.getDay() + i);
                        return targetDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric"
                        });
                      })
                      .join(", ")}
                  </Text>
                </View>
              )}

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Start Time <Text className="text-red-500">*</Text>
                  </Text>
                  <Pressable
                    onPress={() => {
                      console.log("START TIME BUTTON TAPPED!");
                      openTimePicker("start");
                    }}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                  >
                    <Text className={`text-base ${startTime ? "text-gray-900" : "text-gray-400"}`}>
                      {startTime || "Select time"}
                    </Text>
                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                  </Pressable>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    End Time <Text className="text-red-500">*</Text>
                  </Text>
                  <Pressable
                    onPress={() => {
                      console.log("END TIME BUTTON TAPPED!");
                      openTimePicker("end");
                    }}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                  >
                    <Text className={`text-base ${endTime ? "text-gray-900" : "text-gray-400"}`}>
                      {endTime || "Select time"}
                    </Text>
                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                  </Pressable>
                </View>
              </View>

              <Text className="text-sm font-semibold text-gray-700 mb-2">Max Volunteers (Optional)</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                placeholder="Leave empty for unlimited"
                value={maxVolunteers}
                onChangeText={setMaxVolunteers}
                keyboardType="numeric"
              />

              {/* Recurring Option */}
              <Pressable
                onPress={() => setIsRecurring(!isRecurring)}
                className={`border-2 rounded-xl p-4 mb-4 flex-row items-center justify-between ${
                  isRecurring ? "bg-blue-50 border-blue-600" : "bg-white border-gray-200"
                }`}
              >
                <View className="flex-1">
                  <Text className={`text-sm font-semibold ${isRecurring ? "text-blue-900" : "text-gray-900"}`}>
                    Repeat Weekly
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">Create this shift for multiple weeks</Text>
                </View>
                {isRecurring && (
                  <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={14} color="white" />
                  </View>
                )}
              </Pressable>

              {isRecurring && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Number of Weeks</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                    placeholder="12"
                    value={weeksToCreate}
                    onChangeText={setWeeksToCreate}
                    keyboardType="numeric"
                  />

                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Select Days of Week
                  </Text>
                  <Text className="text-xs text-gray-500 mb-3">
                    Choose which days of the week this shift should repeat on
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {[
                      { index: 0, label: "Sun" },
                      { index: 1, label: "Mon" },
                      { index: 2, label: "Tue" },
                      { index: 3, label: "Wed" },
                      { index: 4, label: "Thu" },
                      { index: 5, label: "Fri" },
                      { index: 6, label: "Sat" },
                    ].map((day) => (
                      <Pressable
                        key={day.index}
                        onPress={() => toggleDayOfWeek(day.index)}
                        className={`border-2 rounded-xl px-4 py-3 ${
                          selectedDaysOfWeek.includes(day.index)
                            ? "bg-gray-600 border-gray-600"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            selectedDaysOfWeek.includes(day.index) ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {day.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {selectedDaysOfWeek.length > 0 && (
                    <View className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <Text className="text-xs text-blue-700">
                        Will create shifts on:{" "}
                        {selectedDaysOfWeek
                          .map((i) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i])
                          .join(", ")}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Who Can Sign Up <Text className="text-red-500">*</Text>
              </Text>
              <View className="gap-2 mb-4">
                {roleOptions.map((option) => (
                  <Pressable
                    key={option.role}
                    onPress={() => toggleRole(option.role)}
                    className={`border-2 rounded-xl p-3 flex-row items-center justify-between ${
                      selectedRoles.includes(option.role)
                        ? "bg-yellow-50 border-yellow-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        selectedRoles.includes(option.role) ? "text-yellow-900 font-semibold" : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {selectedRoles.includes(option.role) && (
                      <View className="w-6 h-6 bg-yellow-600 rounded-full items-center justify-center">
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Pressable
              onPress={handleCreate}
              disabled={!title || !date || !startTime || !endTime || selectedRoles.length === 0}
              className={`rounded-xl py-4 items-center ${
                title && date && startTime && endTime && selectedRoles.length > 0
                  ? "bg-gray-600"
                  : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-base font-bold">
                {isRecurring ? `Create ${weeksToCreate} Recurring Shifts` : "Create Shift"}
              </Text>
            </Pressable>

          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Shift Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Edit Shift</Text>
              <Pressable onPress={() => setShowEditModal(false)} className="w-8 h-8 items-center justify-center">
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <ScrollView className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Title <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                placeholder="e.g., Morning Volunteer Shift"
                value={title}
                onChangeText={setTitle}
              />

              <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                placeholder="Shift details..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Holiday Placeholder (Optional) */}
              <Text className="text-sm font-semibold text-gray-700 mb-2">Holiday/Placeholder (Optional)</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                placeholder="e.g., Christmas Day, Facility Closed"
                value={holiday}
                onChangeText={setHoliday}
              />
              <Text className="text-xs text-gray-500 mb-4">
                Use this to mark days when no regular shifts are needed (holidays, closures, etc.)
              </Text>

              {/* Location Selector */}
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Location <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {locationOptions.map((loc) => (
                  <Pressable
                    key={loc.value}
                    onPress={() => setLocation(loc.value)}
                    className={`border-2 rounded-xl px-4 py-3 ${
                      location === loc.value
                        ? "bg-[#405b69] border-[#405b69]"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        location === loc.value ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {loc.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Date <Text className="text-red-500">*</Text>
              </Text>
              <Pressable
                onPress={() => openDatePicker("shift")}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between mb-4"
              >
                <Text className={`text-base ${date ? "text-gray-900" : "text-gray-400"}`}>
                  {date || "Tap to select date"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              </Pressable>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Start Time <Text className="text-red-500">*</Text>
                  </Text>
                  <Pressable
                    onPress={() => openTimePicker("start")}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                  >
                    <Text className={`text-base ${startTime ? "text-gray-900" : "text-gray-400"}`}>
                      {startTime || "Select time"}
                    </Text>
                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                  </Pressable>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    End Time <Text className="text-red-500">*</Text>
                  </Text>
                  <Pressable
                    onPress={() => openTimePicker("end")}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                  >
                    <Text className={`text-base ${endTime ? "text-gray-900" : "text-gray-400"}`}>
                      {endTime || "Select time"}
                    </Text>
                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                  </Pressable>
                </View>
              </View>

              <Text className="text-sm font-semibold text-gray-700 mb-2">Max Volunteers (Optional)</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                placeholder="Leave empty for unlimited"
                value={maxVolunteers}
                onChangeText={setMaxVolunteers}
                keyboardType="numeric"
              />

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Who Can Sign Up <Text className="text-red-500">*</Text>
              </Text>
              <View className="gap-2 mb-4">
                {roleOptions.map((option) => (
                  <Pressable
                    key={option.role}
                    onPress={() => toggleRole(option.role)}
                    className={`border-2 rounded-xl p-3 flex-row items-center justify-between ${
                      selectedRoles.includes(option.role)
                        ? "bg-yellow-50 border-yellow-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        selectedRoles.includes(option.role) ? "text-yellow-900 font-semibold" : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {selectedRoles.includes(option.role) && (
                      <View className="w-6 h-6 bg-yellow-600 rounded-full items-center justify-center">
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Pressable
              onPress={handleUpdate}
              disabled={!title || !date || !startTime || !endTime || selectedRoles.length === 0}
              className={`rounded-xl py-4 items-center ${
                title && date && startTime && endTime && selectedRoles.length > 0
                  ? "bg-gray-600"
                  : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-base font-bold">Update Shift</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Copy Week Modal */}
      <Modal
        visible={showCopyWeekModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCopyWeekModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Copy Week</Text>
              <Pressable onPress={() => setShowCopyWeekModal(false)} className="w-8 h-8 items-center justify-center">
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <Text className="text-sm text-gray-600 mb-4">
              Copy all shifts from one week to another. Assignments will not be copied.
            </Text>

            <Text className="text-sm font-semibold text-gray-700 mb-2">Source Week (Monday)</Text>
            <Pressable
              onPress={() => openDatePicker("sourceWeek")}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between mb-4"
            >
              <Text className={`text-base ${sourceWeek ? "text-gray-900" : "text-gray-400"}`}>
                {sourceWeek || "Tap to select date"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </Pressable>

            <Text className="text-sm font-semibold text-gray-700 mb-2">Target Week (Monday)</Text>
            <Pressable
              onPress={() => openDatePicker("targetWeek")}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between mb-6"
            >
              <Text className={`text-base ${targetWeek ? "text-gray-900" : "text-gray-400"}`}>
                {targetWeek || "Tap to select date"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={handleCopyWeek}
              disabled={!sourceWeek || !targetWeek}
              className={`rounded-xl py-4 items-center ${
                sourceWeek && targetWeek ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-base font-bold">Copy Week</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Save Template Modal */}
      <Modal
        visible={showSaveTemplateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSaveTemplateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Save as Template</Text>
              <Pressable onPress={() => setShowSaveTemplateModal(false)} className="w-8 h-8 items-center justify-center">
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <Text className="text-sm text-gray-600 mb-4">
              Save a week of shifts as a reusable template. You can apply this template to any future week.
            </Text>

            <Text className="text-sm font-semibold text-gray-700 mb-2">Template Name</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
              placeholder="e.g., Standard Week Template"
              value={templateName}
              onChangeText={setTemplateName}
            />

            <Text className="text-sm font-semibold text-gray-700 mb-2">Week to Save (Monday)</Text>
            <Pressable
              onPress={() => openDatePicker("sourceWeek")}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between mb-6"
            >
              <Text className={`text-base ${sourceWeek ? "text-gray-900" : "text-gray-400"}`}>
                {sourceWeek || "Tap to select date"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={handleSaveTemplate}
              disabled={!sourceWeek || !templateName}
              className={`rounded-xl py-4 items-center ${
                sourceWeek && templateName ? "bg-[#fcc85c]" : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-base font-bold">Save Template</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Use Template Modal */}
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Use Template</Text>
              <Pressable onPress={() => setShowTemplateModal(false)} className="w-8 h-8 items-center justify-center">
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            {templates.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="folder-open-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">No templates saved yet</Text>
              </View>
            ) : (
              <>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Select Template</Text>
                <ScrollView className="mb-4" style={{ maxHeight: 200 }}>
                  {templates.map((template) => (
                    <Pressable
                      key={template.id}
                      onPress={() => setSelectedTemplate(template.id)}
                      className={`border-2 rounded-xl p-4 mb-2 ${
                        selectedTemplate === template.id
                          ? "bg-green-50 border-green-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedTemplate === template.id ? "text-green-900" : "text-gray-900"
                        }`}
                      >
                        {template.name}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        {template.shifts.length} shift(s) • Created by {template.createdByName}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text className="text-sm font-semibold text-gray-700 mb-2">Apply to Week (Monday)</Text>
                <Pressable
                  onPress={() => openDatePicker("templateWeek")}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between mb-6"
                >
                  <Text className={`text-base ${templateWeekStart ? "text-gray-900" : "text-gray-400"}`}>
                    {templateWeekStart || "Tap to select date"}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </Pressable>

                <Pressable
                  onPress={handleApplyTemplate}
                  disabled={!selectedTemplate || !templateWeekStart}
                  className={`rounded-xl py-4 items-center ${
                    selectedTemplate && templateWeekStart ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <Text className="text-white text-base font-bold">Apply Template</Text>
                </Pressable>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Modal */}
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
                <Ionicons name="trash" size={32} color="#DC2626" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Delete Shift?</Text>
              <Text className="text-center text-gray-600">
                {selectedShift?.isRecurring
                  ? `This will delete ALL recurring shifts in "${selectedShift?.title}". This cannot be undone.`
                  : `This will remove ${selectedShift?.title} and cancel all signups. This cannot be undone.`}
              </Text>
            </View>
            <View className="gap-2">
              <Pressable
                onPress={handleDelete}
                className="bg-red-600 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white font-bold">
                  {selectedShift?.isRecurring ? "Delete All Recurring" : "Delete"}
                </Text>
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

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900">Select Date</Text>
                <Pressable onPress={() => setShowDatePicker(false)} className="w-8 h-8 items-center justify-center">
                  <Ionicons name="close" size={24} color="#374151" />
                </Pressable>
              </View>

              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                textColor="#000000"
              />

              <Pressable
                onPress={confirmDateSelection}
                className="bg-gray-600 rounded-xl py-4 items-center mt-4"
              >
                <Text className="text-white text-base font-bold">Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900">
                  {timePickerTarget === "start" ? "Select Start Time" : "Select End Time"}
                </Text>
                <Pressable onPress={() => setShowTimePicker(false)} className="w-8 h-8 items-center justify-center">
                  <Ionicons name="close" size={24} color="#374151" />
                </Pressable>
              </View>

              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                textColor="#000000"
              />

              <Pressable
                onPress={confirmTimeSelection}
                className="bg-gray-600 rounded-xl py-4 items-center mt-4"
              >
                <Text className="text-white text-base font-bold">Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
