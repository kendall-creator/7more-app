import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal, Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTaskStore } from "../state/taskStore";
import { useUsersStore } from "../state/usersStore";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";
import { Task, TaskPriority, TaskFormField, TaskFieldType } from "../types";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AdminTaskManagementScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const allTasks = useTaskStore((s) => s.tasks);
  const createTask = useTaskStore((s) => s.createTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const users = useUsersStore((s) => s.invitedUsers);
  const participants = useParticipantStore((s) => s.participants);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [customFormFields, setCustomFormFields] = useState<TaskFormField[]>([]);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [participantSearchQuery, setParticipantSearchQuery] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Debug modal states
  React.useEffect(() => {
    console.log("Modal states - AddField:", showAddFieldModal, "Participant:", showParticipantModal);
  }, [showAddFieldModal, showParticipantModal]);

  // Stats
  const taskStats = useMemo(() => {
    return {
      total: allTasks.length,
      pending: allTasks.filter((t) => t.status === "pending").length,
      inProgress: allTasks.filter((t) => t.status === "in_progress").length,
      completed: allTasks.filter((t) => t.status === "completed").length,
      overdue: allTasks.filter((t) => t.status === "overdue").length,
    };
  }, [allTasks]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedUserId("");
    setSelectedParticipantId("");
    setPriority("medium");
    setDueDate("");
    setIsRecurring(false);
    setRecurringFrequency("weekly");
    setCustomFormFields([]);
    setParticipantSearchQuery("");
  };

  const filteredParticipants = useMemo(() => {
    console.log("Total participants:", participants.length);
    if (!participantSearchQuery.trim()) return participants;
    const query = participantSearchQuery.toLowerCase();
    return participants.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(query) ||
      p.participantNumber.toLowerCase().includes(query)
    );
  }, [participants, participantSearchQuery]);

  const handleDateChange = (event: any, date?: Date) => {
    console.log("Date changed:", date, "Event type:", event?.type);
    if (date) {
      setSelectedDate(date);
    }
  };

  const confirmDateSelection = (date: Date = selectedDate) => {
    try {
      console.log("Confirming date:", date);
      // Fix timezone issue - get local date string in YYYY-MM-DD format (same as scheduler)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      setDueDate(dateString);
      setShowDatePicker(false);
      setShowCreateModal(true); // Reopen the modal
    } catch (error) {
      console.error("Error confirming date:", error);
      setShowDatePicker(false);
      setShowCreateModal(true);
    }
  };

  const handleSelectParticipant = (participantId: string) => {
    console.log("Selected participant:", participantId);
    setSelectedParticipantId(participantId);
    setShowParticipantModal(false);
    setParticipantSearchQuery("");
    setTimeout(() => setShowCreateModal(true), 100); // Reopen create modal
  };

  const handleCreateTask = async () => {
    if (!title.trim() || !selectedUserId || !currentUser) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Require due date if recurring is enabled
    if (isRecurring && !dueDate) {
      Alert.alert("Error", "Due date is required for recurring tasks");
      return;
    }

    const selectedUser = users.find((u) => u.id === selectedUserId);
    if (!selectedUser) return;

    const selectedParticipant = selectedParticipantId
      ? participants.find((p) => p.id === selectedParticipantId)
      : null;

    try {
      // Build task object with only defined values (Firebase doesn't accept undefined)
      const taskData: any = {
        title,
        description,
        assignedToUserId: selectedUserId,
        assignedToUserName: selectedUser.name,
        assignedToUserRole: selectedUser.role,
        assignedByUserId: currentUser.id,
        assignedByUserName: currentUser.name,
        priority,
      };

      // Only add optional fields if they have values
      if (dueDate) {
        taskData.dueDate = dueDate;
      }

      if (customFormFields.length > 0) {
        taskData.customForm = customFormFields;
      }

      if (selectedParticipant) {
        taskData.relatedParticipantId = selectedParticipant.id;
        taskData.relatedParticipantName = `${selectedParticipant.firstName} ${selectedParticipant.lastName}`;
      }

      // Add recurring fields if enabled
      if (isRecurring) {
        taskData.isRecurring = true;
        taskData.recurringFrequency = recurringFrequency;
      }

      await createTask(taskData);

      resetForm();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Failed to create task. Please try again.");
    }
  };

  const handleAddFormField = (field: Omit<TaskFormField, "id">) => {
    const newField: TaskFormField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Remove undefined properties to avoid Firebase errors
    if (newField.options === undefined) {
      delete (newField as any).options;
    }
    if (newField.placeholder === undefined) {
      delete (newField as any).placeholder;
    }

    console.log("Adding field:", newField);
    setCustomFormFields([...customFormFields, newField]);
    setShowAddFieldModal(false);
    setTimeout(() => setShowCreateModal(true), 100); // Reopen create modal
  };

  const handleRemoveFormField = (fieldId: string) => {
    setCustomFormFields(customFormFields.filter((f) => f.id !== fieldId));
  };

  const renderTask = (task: Task) => {
    const priorityColors: Record<TaskPriority, string> = {
      urgent: "border-red-500 bg-red-50",
      high: "border-orange-500 bg-orange-50",
      medium: "border-yellow-500 bg-yellow-50",
      low: "border-gray-500 bg-gray-50",
    };

    const statusIcons: Record<string, string> = {
      pending: "time-outline",
      in_progress: "hourglass-outline",
      completed: "checkmark-circle",
      overdue: "alert-circle",
    };

    return (
      <View
        key={task.id}
        className={`bg-white rounded-2xl p-4 mb-3 border-2 ${priorityColors[task.priority]}`}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-base font-bold text-[#3c3832] mb-1">{task.title}</Text>
            <Text className="text-xs text-[#99896c]">
              Assigned to: {task.assignedToUserName} ({task.assignedToUserRole.replace("_", " ")})
            </Text>
          </View>
          <Pressable
            onPress={() => {
              Alert.alert(
                "Delete Task",
                "Are you sure you want to delete this task?",
                [
                  {
                    text: "Cancel",
                    style: "cancel"
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteTask(task.id)
                  }
                ]
              );
            }}
            className="p-2 active:opacity-70"
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </Pressable>
        </View>

        <View className="flex-row items-center gap-3 mt-2">
          <View className="flex-row items-center">
            <Ionicons name={statusIcons[task.status] as any} size={14} color="#99896c" />
            <Text className="text-xs text-[#99896c] ml-1">{task.status.replace("_", " ")}</Text>
          </View>
          {task.isRecurring && (
            <View className="flex-row items-center bg-blue-100 px-2 py-1 rounded-md">
              <Ionicons name="repeat" size={12} color="#2563EB" />
              <Text className="text-xs text-blue-700 ml-1 font-semibold">
                {task.recurringFrequency}
              </Text>
            </View>
          )}
          {task.dueDate && (
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#99896c" />
              <Text className="text-xs text-[#99896c] ml-1">
                {(() => {
                  try {
                    const parts = task.dueDate.split("-");
                    if (parts.length !== 3) return "Invalid date";
                    const [year, month, day] = parts.map(Number);
                    if (isNaN(year) || isNaN(month) || isNaN(day)) return "Invalid date";
                    const date = new Date(year, month - 1, day);
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  } catch (error) {
                    return "Invalid date";
                  }
                })()}
              </Text>
            </View>
          )}
          {task.customForm && (
            <View className="flex-row items-center">
              <Ionicons name="clipboard-outline" size={14} color="#99896c" />
              <Text className="text-xs text-[#99896c] ml-1">{task.customForm.length} fields</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      {/* Header */}
      <View className="bg-[#405b69] pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-between mb-3">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="bg-[#fcc85c] rounded-xl px-4 py-2"
          >
            <Text className="text-[#291403] text-sm font-bold">Create Task</Text>
          </Pressable>
        </View>
        <Text className="text-2xl font-bold text-white mb-1">Task Management</Text>
        <Text className="text-white/80 text-sm">{allTasks.length} total tasks</Text>
      </View>

      {/* Stats */}
      <View className="px-6 py-4 flex-row gap-2">
        <View className="flex-1 bg-white rounded-xl p-3 border border-[#d7d7d6]">
          <Text className="text-xl font-bold text-[#3c3832]">{taskStats.pending}</Text>
          <Text className="text-xs text-[#99896c]">Pending</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-3 border border-[#d7d7d6]">
          <Text className="text-xl font-bold text-blue-600">{taskStats.inProgress}</Text>
          <Text className="text-xs text-[#99896c]">In Progress</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-3 border border-[#d7d7d6]">
          <Text className="text-xl font-bold text-green-600">{taskStats.completed}</Text>
          <Text className="text-xs text-[#99896c]">Completed</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-3 border border-[#d7d7d6]">
          <Text className="text-xl font-bold text-red-600">{taskStats.overdue}</Text>
          <Text className="text-xs text-[#99896c]">Overdue</Text>
        </View>
      </View>

      {/* Task List */}
      <ScrollView className="flex-1 px-6">
        {allTasks.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="clipboard-outline" size={64} color="#d7d7d6" />
            <Text className="text-[#99896c] text-base mt-4">No tasks created yet</Text>
            <Text className="text-[#99896c] text-sm mt-1 text-center">
              Tap &quot;Create Task&quot; to assign work to your team
            </Text>
          </View>
        ) : (
          allTasks.map(renderTask)
        )}
      </ScrollView>

      {/* Create Task Modal */}
      <Modal visible={showCreateModal} animationType="slide">
        <View className="flex-1 bg-[#f8f8f8]">
          <View className="bg-[#405b69] pt-16 pb-6 px-6">
            <View className="flex-row items-center justify-between mb-3">
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
              <Pressable
                onPress={handleCreateTask}
                className="bg-[#fcc85c] rounded-xl px-4 py-2"
              >
                <Text className="text-[#291403] text-sm font-bold">Create</Text>
              </Pressable>
            </View>
            <Text className="text-2xl font-bold text-white">New Task</Text>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {/* Title */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#3c3832] mb-2">
                Task Title <Text className="text-red-600">*</Text>
              </Text>
              <TextInput
                className="bg-white border border-[#d7d7d6] rounded-xl px-4 py-3 text-base"
                placeholder="Enter task title"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#3c3832] mb-2">
                Description <Text className="text-red-600">*</Text>
              </Text>
              <TextInput
                className="bg-white border border-[#d7d7d6] rounded-xl px-4 py-3 text-base"
                placeholder="Describe what needs to be done"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Assign To */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#3c3832] mb-2">
                Assign To <Text className="text-red-600">*</Text>
              </Text>
              <View className="bg-white border border-[#d7d7d6] rounded-xl overflow-hidden">
                {users.map((user, index) => (
                  <Pressable
                    key={user.id}
                    onPress={() => setSelectedUserId(user.id)}
                    className={`px-4 py-3 ${index !== 0 ? "border-t border-[#d7d7d6]" : ""} ${
                      selectedUserId === user.id ? "bg-[#fcc85c]/20" : ""
                    } active:opacity-70`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-base font-semibold text-[#3c3832]">{user.name}</Text>
                        <Text className="text-sm text-[#99896c]">{user.role.replace("_", " ")}</Text>
                      </View>
                      {selectedUserId === user.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#fcc85c" />
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Priority */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#3c3832] mb-2">Priority</Text>
              <View className="flex-row gap-2">
                {(["low", "medium", "high", "urgent"] as TaskPriority[]).map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPriority(p)}
                    className={`flex-1 px-3 py-2 rounded-xl border-2 ${
                      priority === p ? "border-[#fcc85c] bg-[#fcc85c]/20" : "border-[#d7d7d6] bg-white"
                    } active:opacity-70`}
                  >
                    <Text
                      className={`text-xs font-semibold text-center ${
                        priority === p ? "text-[#291403]" : "text-[#99896c]"
                      }`}
                    >
                      {p.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Due Date */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#3c3832] mb-2">Due Date (Optional)</Text>
              <Pressable
                onPress={() => {
                  console.log("Opening date picker");
                  setShowCreateModal(false); // Close modal first (like scheduler)
                  setShowDatePicker(true);
                }}
                className="bg-white border border-[#d7d7d6] rounded-xl px-4 py-3 flex-row items-center justify-between"
              >
                <Text className={`text-base ${dueDate ? "text-[#3c3832]" : "text-[#99896c]"}`}>
                  {dueDate ? (() => {
                    try {
                      const parts = dueDate.split("-");
                      if (parts.length !== 3) return "Invalid date";
                      const [year, month, day] = parts.map(Number);
                      if (isNaN(year) || isNaN(month) || isNaN(day)) return "Invalid date";
                      const date = new Date(year, month - 1, day);
                      return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      });
                    } catch (error) {
                      return "Invalid date";
                    }
                  })() : "Select due date"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#99896c" />
              </Pressable>
              {dueDate && (
                <Pressable
                  onPress={() => setDueDate("")}
                  className="mt-2"
                >
                  <Text className="text-sm text-red-600 text-center">Clear date</Text>
                </Pressable>
              )}
            </View>

            {/* Recurring Task Options */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-semibold text-[#3c3832]">Recurring Task</Text>
                <Pressable
                  onPress={() => setIsRecurring(!isRecurring)}
                  className="flex-row items-center"
                >
                  <View
                    className={`w-12 h-6 rounded-full ${isRecurring ? "bg-[#fcc85c]" : "bg-[#d7d7d6]"}`}
                  >
                    <View
                      className={`w-5 h-5 bg-white rounded-full m-0.5 ${
                        isRecurring ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </View>
                </Pressable>
              </View>

              {isRecurring && (
                <View>
                  <Text className="text-sm text-[#99896c] mb-3">
                    This task will automatically create a new instance when completed
                  </Text>
                  <Text className="text-xs font-semibold text-[#3c3832] mb-2 uppercase">
                    Frequency
                  </Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setRecurringFrequency("daily")}
                      className={`flex-1 px-3 py-3 rounded-xl border-2 ${
                        recurringFrequency === "daily"
                          ? "border-[#fcc85c] bg-[#fcc85c]/20"
                          : "border-[#d7d7d6] bg-white"
                      }`}
                    >
                      <View className="items-center">
                        <Ionicons
                          name="sunny-outline"
                          size={20}
                          color={recurringFrequency === "daily" ? "#fcc85c" : "#99896c"}
                        />
                        <Text
                          className={`text-sm font-semibold mt-1 ${
                            recurringFrequency === "daily" ? "text-[#291403]" : "text-[#99896c]"
                          }`}
                        >
                          Daily
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => setRecurringFrequency("weekly")}
                      className={`flex-1 px-3 py-3 rounded-xl border-2 ${
                        recurringFrequency === "weekly"
                          ? "border-[#fcc85c] bg-[#fcc85c]/20"
                          : "border-[#d7d7d6] bg-white"
                      }`}
                    >
                      <View className="items-center">
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color={recurringFrequency === "weekly" ? "#fcc85c" : "#99896c"}
                        />
                        <Text
                          className={`text-sm font-semibold mt-1 ${
                            recurringFrequency === "weekly" ? "text-[#291403]" : "text-[#99896c]"
                          }`}
                        >
                          Weekly
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => setRecurringFrequency("monthly")}
                      className={`flex-1 px-3 py-3 rounded-xl border-2 ${
                        recurringFrequency === "monthly"
                          ? "border-[#fcc85c] bg-[#fcc85c]/20"
                          : "border-[#d7d7d6] bg-white"
                      }`}
                    >
                      <View className="items-center">
                        <Ionicons
                          name="calendar"
                          size={20}
                          color={recurringFrequency === "monthly" ? "#fcc85c" : "#99896c"}
                        />
                        <Text
                          className={`text-sm font-semibold mt-1 ${
                            recurringFrequency === "monthly" ? "text-[#291403]" : "text-[#99896c]"
                          }`}
                        >
                          Monthly
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                  {!dueDate && (
                    <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
                      <View className="flex-row">
                        <Ionicons name="information-circle" size={18} color="#F59E0B" />
                        <Text className="text-xs text-amber-800 ml-2 flex-1">
                          A due date is required for recurring tasks
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Related Participant (Optional) */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#3c3832] mb-2">
                Related Participant (Optional)
              </Text>
              <Pressable
                onPress={() => {
                  console.log("Opening participant modal, participants:", participants.length);
                  setShowCreateModal(false); // Close create modal first
                  setTimeout(() => setShowParticipantModal(true), 100); // Open participant modal after a delay
                }}
                className="bg-white border border-[#d7d7d6] rounded-xl px-4 py-3 flex-row items-center justify-between"
              >
                <Text className={`text-base ${selectedParticipantId ? "text-[#3c3832]" : "text-[#99896c]"}`}>
                  {selectedParticipantId
                    ? (() => {
                        const participant = participants.find((p) => p.id === selectedParticipantId);
                        return participant
                          ? `${participant.firstName} ${participant.lastName} (#${participant.participantNumber})`
                          : "Select participant";
                      })()
                    : "Select participant"}
                </Text>
                <Ionicons name="person-outline" size={20} color="#99896c" />
              </Pressable>
              {selectedParticipantId && (
                <Pressable
                  onPress={() => setSelectedParticipantId("")}
                  className="mt-2"
                >
                  <Text className="text-sm text-red-600 text-center">Clear participant</Text>
                </Pressable>
              )}
            </View>

            {/* Custom Form Fields */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-[#3c3832]">Custom Form (Optional)</Text>
                <Pressable
                  onPress={() => {
                    console.log("Add Field button pressed");
                    setShowCreateModal(false); // Close create modal first
                    setTimeout(() => setShowAddFieldModal(true), 100); // Open add field modal after delay
                  }}
                  className="bg-[#fcc85c] rounded-lg px-3 py-1"
                >
                  <Text className="text-[#291403] text-xs font-bold">Add Field</Text>
                </Pressable>
              </View>

              {customFormFields.length === 0 ? (
                <View className="bg-[#f8f8f8] rounded-xl p-4 border border-[#d7d7d6]">
                  <Text className="text-sm text-[#99896c] text-center">
                    No custom fields added. Tap &quot;Add Field&quot; to create a form for this task.
                  </Text>
                </View>
              ) : (
                customFormFields.map((field, index) => (
                  <View
                    key={field.id}
                    className="bg-white rounded-xl p-4 mb-2 border border-[#d7d7d6] flex-row items-center justify-between"
                  >
                    <View className="flex-1 mr-2">
                      <Text className="text-base font-semibold text-[#3c3832]">{field.label}</Text>
                      <Text className="text-sm text-[#99896c]">
                        Type: {field.type} {field.required && "• Required"}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleRemoveFormField(field.id)}>
                      <Ionicons name="trash-outline" size={20} color="#DC2626" />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Participant Selection Modal */}
      <Modal
        visible={showParticipantModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowParticipantModal(false);
          setParticipantSearchQuery("");
          setTimeout(() => setShowCreateModal(true), 100); // Reopen create modal
        }}
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/50 justify-end" style={{ zIndex: 9998 }}>
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-8" style={{ height: "80%" }}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-[#3c3832]">Select Participant</Text>
              <Pressable onPress={() => {
                setShowParticipantModal(false);
                setParticipantSearchQuery("");
                setTimeout(() => setShowCreateModal(true), 100); // Reopen create modal
              }}>
                <Ionicons name="close" size={28} color="#99896c" />
              </Pressable>
            </View>

            {/* Search */}
            <View className="bg-[#f8f8f8] border border-[#d7d7d6] rounded-xl px-4 py-3 flex-row items-center mb-4">
              <Ionicons name="search" size={18} color="#99896c" />
              <TextInput
                className="flex-1 ml-2 text-sm"
                placeholder="Search by name or participant number..."
                value={participantSearchQuery}
                onChangeText={setParticipantSearchQuery}
                placeholderTextColor="#99896c"
              />
              {participantSearchQuery.length > 0 && (
                <Pressable onPress={() => setParticipantSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#99896c" />
                </Pressable>
              )}
            </View>

            {/* Debug info */}
            <Text className="text-xs text-gray-500 mb-2">
              Found {filteredParticipants.length} participants
            </Text>

            {/* Participants List */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
              {filteredParticipants.length === 0 ? (
                <View className="items-center justify-center py-12">
                  <Ionicons name="people-outline" size={64} color="#d7d7d6" />
                  <Text className="text-[#99896c] text-base mt-4">
                    {participantSearchQuery ? "No participants found" : "No participants available"}
                  </Text>
                </View>
              ) : (
                filteredParticipants.map((participant) => (
                  <Pressable
                    key={participant.id}
                    onPress={() => {
                      console.log("Selecting participant:", participant.firstName, participant.lastName);
                      handleSelectParticipant(participant.id);
                    }}
                    className="bg-white border border-[#d7d7d6] rounded-xl p-4 mb-3 active:bg-[#f8f8f8]"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-[#3c3832] mb-1">
                          {participant.firstName} {participant.lastName}
                        </Text>
                        <Text className="text-sm text-[#99896c]">#{participant.participantNumber}</Text>
                      </View>
                      {selectedParticipantId === participant.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#fcc85c" />
                      )}
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Field Modal */}
      <AddFieldModal
        visible={showAddFieldModal}
        onClose={() => {
          setShowAddFieldModal(false);
          setTimeout(() => setShowCreateModal(true), 100); // Reopen create modal
        }}
        onAdd={handleAddFormField}
      />

      {/* Date Picker - Outside modals so it can be displayed properly */}
      {showDatePicker && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center" style={{ zIndex: 9999 }}>
          <View className="bg-white rounded-2xl p-6 mx-6" style={{ width: 350 }}>
            <Text className="text-xl font-bold text-[#3c3832] mb-2 text-center">Select Due Date</Text>

            {/* Display selected date with day of week */}
            <View className="bg-[#fcc85c]/20 rounded-xl p-3 mb-4">
              <Text className="text-base font-semibold text-[#3c3832] text-center">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </Text>
            </View>

            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              minimumDate={new Date()}
              textColor="#3c3832"
            />
            <View className="flex-row gap-2 mt-4">
              <Pressable
                onPress={() => {
                  setShowDatePicker(false);
                  setShowCreateModal(true);
                }}
                className="flex-1 bg-[#d7d7d6] rounded-xl py-3 items-center active:opacity-70"
              >
                <Text className="text-[#3c3832] font-bold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => confirmDateSelection()}
                className="flex-1 bg-[#fcc85c] rounded-xl py-3 items-center active:opacity-70"
              >
                <Text className="text-[#291403] font-bold">Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// Helper component for adding form fields
function AddFieldModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (field: Omit<TaskFormField, "id">) => void;
}) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<TaskFieldType>("text");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState("");

  // Reset form when modal closes
  React.useEffect(() => {
    if (!visible) {
      setLabel("");
      setType("text");
      setRequired(false);
      setOptions("");
    }
  }, [visible]);

  const handleAdd = () => {
    if (!label.trim()) {
      Alert.alert("Error", "Please enter a field label");
      return;
    }

    const fieldData: any = {
      label,
      type,
      required,
      placeholder: `Enter ${label.toLowerCase()}`,
    };

    // Only add options if it's a select field and has options
    if (type === "select" && options.trim()) {
      fieldData.options = options.split(",").map((o) => o.trim());
    }

    onAdd(fieldData);

    // Close modal - parent will handle closing
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50" style={{ zIndex: 10000 }}>
        <View className="bg-white rounded-2xl p-6 mx-6 w-80">
          <Text className="text-xl font-bold text-[#3c3832] mb-4">Add Form Field</Text>

          <TextInput
            className="bg-[#f8f8f8] border border-[#d7d7d6] rounded-xl px-4 py-3 mb-3"
            placeholder="Field label"
            value={label}
            onChangeText={setLabel}
          />

          <View className="mb-3">
            <Text className="text-sm font-semibold text-[#3c3832] mb-2">Field Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {(["text", "textarea", "number", "date", "select", "checkbox"] as TaskFieldType[]).map(
                (t) => (
                  <Pressable
                    key={t}
                    onPress={() => setType(t)}
                    className={`px-3 py-2 rounded-lg border ${
                      type === t ? "border-[#fcc85c] bg-[#fcc85c]/20" : "border-[#d7d7d6] bg-white"
                    }`}
                  >
                    <Text className="text-xs font-semibold text-[#3c3832]">{t}</Text>
                  </Pressable>
                )
              )}
            </View>
          </View>

          {type === "select" && (
            <TextInput
              className="bg-[#f8f8f8] border border-[#d7d7d6] rounded-xl px-4 py-3 mb-3"
              placeholder="Options (comma separated)"
              value={options}
              onChangeText={setOptions}
            />
          )}

          <Pressable
            onPress={() => setRequired(!required)}
            className="flex-row items-center justify-between mb-4"
          >
            <Text className="text-sm font-semibold text-[#3c3832]">Required field</Text>
            <View
              className={`w-12 h-6 rounded-full ${required ? "bg-[#fcc85c]" : "bg-[#d7d7d6]"}`}
            >
              <View
                className={`w-5 h-5 bg-white rounded-full m-0.5 ${
                  required ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </View>
          </Pressable>

          <View className="flex-row gap-2">
            <Pressable
              onPress={onClose}
              className="flex-1 bg-[#d7d7d6] rounded-xl py-3 items-center"
            >
              <Text className="text-[#3c3832] font-bold">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleAdd}
              className="flex-1 bg-[#fcc85c] rounded-xl py-3 items-center"
            >
              <Text className="text-[#291403] font-bold">Add</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
