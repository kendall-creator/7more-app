import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Keyboard,
} from "react-native";
import { useResourceStore } from "../state/resourceStore";
import { Ionicons } from "@expo/vector-icons";

const PREDEFINED_CATEGORIES = [
  "Employment",
  "Clothing",
  "Cell Phone",
  "Halfway House",
  "Food",
  "Education",
];

export default function EditResourceScreen({ route, navigation }: any) {
  const { resourceId } = route.params;
  const resource = useResourceStore((s) => s.resources.find((r) => r.id === resourceId));
  const updateResource = useResourceStore((s) => s.updateResource);
  const addResource = useResourceStore((s) => s.addResource);
  const deleteResource = useResourceStore((s) => s.deleteResource);

  const isNewResource = !resourceId;

  const [title, setTitle] = useState(resource?.title || "");
  const [category, setCategory] = useState(resource?.category || "");
  const [content, setContent] = useState(resource?.content || "");
  const [description, setDescription] = useState(resource?.description || "");
  const [resourceLink, setResourceLink] = useState(resource?.resourceLink || "");
  const [trainingLink, setTrainingLink] = useState(resource?.trainingLink || "");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const handleSelectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
    setShowCustomCategoryInput(false);
    setCustomCategory("");
  };

  const handleCustomCategory = () => {
    if (customCategory.trim()) {
      setCategory(customCategory.trim());
      setShowCategoryModal(false);
      setShowCustomCategoryInput(false);
      setCustomCategory("");
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !category.trim() || !content.trim()) {
      Alert.alert("Missing Information", "Please fill in title, category, and content.");
      return;
    }

    try {
      const resourceData = {
        title: title.trim(),
        category: category.trim(),
        content: content.trim(),
        description: description.trim() ? description.trim() : "",
        resourceLink: resourceLink.trim() ? resourceLink.trim() : "",
        trainingLink: trainingLink.trim() ? trainingLink.trim() : "",
      };

      if (isNewResource) {
        await addResource(resourceData);
        Alert.alert("Success", "Resource created successfully.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        await updateResource(resourceId, resourceData);
        Alert.alert("Success", "Resource updated successfully.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Error saving resource:", error);
      Alert.alert("Error", error?.message || "Failed to save resource. Please try again.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Resource",
      `Are you sure you want to delete "${title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteResource(resourceId);
              Alert.alert("Deleted", "Resource deleted successfully.", [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error: any) {
              console.error("Error deleting resource:", error);
              Alert.alert("Error", error?.message || "Failed to delete resource. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="bg-gray-600 pt-16 pb-8 px-6">
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-3xl font-bold text-white mb-2">
            {isNewResource ? "Add Resource" : "Edit Resource"}
          </Text>
          <Text className="text-yellow-100 text-base">
            {isNewResource ? "Create a new resource for participants" : "Update resource information"}
          </Text>
        </View>

        <View className="px-6 pt-6">
          {/* Title */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Title <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Resource title"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Category Dropdown */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Category <Text className="text-red-500">*</Text>
            </Text>
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setShowCategoryModal(true);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 flex-row items-center justify-between"
            >
              <Text className={`text-base ${category ? "text-gray-900" : "text-gray-400"}`}>
                {category || "Select a category"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Short description (optional)"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Content */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Content <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="The actual text to share with participants..."
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
          </View>

          {/* Resource Link */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Resource Link (Optional)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="https://example.com/job-resource"
              value={resourceLink}
              onChangeText={setResourceLink}
              autoCapitalize="none"
              keyboardType="url"
            />
            <Text className="text-xs text-gray-500 mt-1">
              Main clickable link for the resource (e.g., job application page)
            </Text>
          </View>

          {/* Training Link */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Training Link (Optional)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="https://example.com/training"
              value={trainingLink}
              onChangeText={setTrainingLink}
              autoCapitalize="none"
              keyboardType="url"
            />
            <Text className="text-xs text-gray-500 mt-1">
              Optional training or tutorial link related to this resource
            </Text>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            className="bg-gray-600 rounded-xl py-4 items-center mb-4 active:opacity-80"
          >
            <Text className="text-white text-base font-bold">
              {isNewResource ? "Create Resource" : "Save Changes"}
            </Text>
          </Pressable>

          {/* Delete Button - Only for existing resources */}
          {!isNewResource && (
            <Pressable
              onPress={handleDelete}
              className="bg-red-50 border border-red-200 rounded-xl py-3 items-center mb-4 active:opacity-70"
            >
              <View className="flex-row items-center">
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
                <Text className="text-red-600 text-sm font-semibold ml-2">Delete Resource</Text>
              </View>
            </Pressable>
          )}

          {/* Cancel Button */}
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-gray-100 rounded-xl py-3 items-center active:opacity-80"
          >
            <Text className="text-gray-700 text-sm font-semibold">Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Select Category</Text>
              <Pressable
                onPress={() => {
                  setShowCategoryModal(false);
                  setShowCustomCategoryInput(false);
                  setCustomCategory("");
                }}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </Pressable>
            </View>

            <ScrollView>
              {/* Predefined Categories */}
              {PREDEFINED_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => handleSelectCategory(cat)}
                  className={`border-2 rounded-xl px-4 py-4 mb-3 ${
                    category === cat
                      ? "bg-gray-50 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`text-base font-semibold ${
                        category === cat ? "text-yellow-600" : "text-gray-900"
                      }`}
                    >
                      {cat}
                    </Text>
                    {category === cat && (
                      <Ionicons name="checkmark-circle" size={24} color="#CA8A04" />
                    )}
                  </View>
                </Pressable>
              ))}

              {/* Custom Category Option */}
              {!showCustomCategoryInput ? (
                <Pressable
                  onPress={() => setShowCustomCategoryInput(true)}
                  className="border-2 border-dashed border-gray-300 rounded-xl px-4 py-4 mb-3 bg-gray-50"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="add-circle-outline" size={20} color="#6B7280" />
                    <Text className="text-base font-semibold text-gray-600 ml-2">
                      Add Custom Category
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <View className="border-2 border-gray-400 rounded-xl p-4 mb-3 bg-gray-50">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Custom Category Name
                  </Text>
                  <TextInput
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base mb-3"
                    placeholder="Enter category name"
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    autoFocus
                  />
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={handleCustomCategory}
                      disabled={!customCategory.trim()}
                      className={`flex-1 rounded-xl py-3 items-center ${
                        customCategory.trim()
                          ? "bg-gray-600 active:opacity-80"
                          : "bg-gray-300"
                      }`}
                    >
                      <Text className="text-white text-sm font-bold">Add Category</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setShowCustomCategoryInput(false);
                        setCustomCategory("");
                      }}
                      className="flex-1 bg-gray-100 rounded-xl py-3 items-center active:opacity-70"
                    >
                      <Text className="text-gray-700 text-sm font-semibold">Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
