import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Clipboard from "@react-native-clipboard/clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useFormConfig } from "../state/intakeFormStore";
import { generateStandaloneIntakeForm, getDeploymentInstructions } from "../utils/generateStandaloneForm";

export default function IntakeFormLinkScreen() {
  const navigation = useNavigation<any>();
  const formConfig = useFormConfig();
  const [copied, setCopied] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleCopy = (text: string, type: string) => {
    Clipboard.setString(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyFormHTML = () => {
    const html = generateStandaloneIntakeForm(formConfig);
    handleCopy(html, "html");
    setShowSuccessModal(true);
  };

  const handleCopyDeploymentInstructions = () => {
    const instructions = getDeploymentInstructions();
    handleCopy(instructions, "deploy");
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-6 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <View className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white text-base ml-2 font-semibold">Back</Text>
          </View>
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-1">Shareable Intake Form</Text>
        <Text className="text-yellow-100 text-sm">Create a public form link to share with participants</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Quick Start */}
        <View className="px-6 py-4">
          <View className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-5 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-full bg-yellow-600 items-center justify-center mr-3">
                <Ionicons name="rocket" size={24} color="white" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Quick Start</Text>
            </View>

            <Text className="text-sm text-gray-700 mb-4">
              Get your intake form online in 2 easy steps. No coding or technical skills required!
            </Text>

            <Pressable
              onPress={handleCopyFormHTML}
              className="bg-yellow-600 rounded-xl py-4 flex-row items-center justify-center mb-2 active:opacity-80"
            >
              <Ionicons name={copied === "html" ? "checkmark-circle" : "code-download"} size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">
                {copied === "html" ? "Form HTML Copied!" : "Copy Form HTML"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Hosting Options */}
        <View className="px-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Free Hosting Options</Text>

          {/* Netlify Drop */}
          <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-3">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                <Text className="text-2xl">🚀</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">Netlify Drop (Easiest)</Text>
                <Text className="text-xs text-green-600 font-semibold">RECOMMENDED</Text>
              </View>
            </View>
            <View className="bg-gray-50 rounded-xl p-4 mb-3">
              <Text className="text-sm text-gray-700 mb-2">
                1. Copy the form HTML above{"\n"}
                2. Go to{" "}
                <Text className="text-yellow-600 font-semibold">app.netlify.com/drop</Text>
                {"\n"}
                3. Paste HTML into a text file, save as{" "}
                <Text className="font-semibold">index.html</Text>
                {"\n"}
                4. Drag and drop the file{"\n"}
                5. Get instant live URL!
              </Text>
            </View>
            <Text className="text-xs text-gray-500">
              Free forever • Custom domain available • Takes 2 minutes
            </Text>
          </View>

          {/* GitHub Pages */}
          <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-3">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-[#fcc85c]/20 items-center justify-center mr-3">
                <Text className="text-2xl">📄</Text>
              </View>
              <Text className="text-base font-bold text-gray-900">GitHub Pages</Text>
            </View>
            <View className="bg-gray-50 rounded-xl p-4 mb-3">
              <Text className="text-sm text-gray-700 mb-2">
                1. Create free GitHub account{"\n"}
                2. Create new repository{"\n"}
                3. Upload HTML as{" "}
                <Text className="font-semibold">index.html</Text>
                {"\n"}
                4. Enable Pages in Settings{"\n"}
                5. Your URL:{" "}
                <Text className="font-semibold">username.github.io/repo-name</Text>
              </Text>
            </View>
            <Text className="text-xs text-gray-500">
              Free forever • Professional • Version control
            </Text>
          </View>

          {/* Vercel */}
          <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Text className="text-2xl">⚡</Text>
              </View>
              <Text className="text-base font-bold text-gray-900">Vercel</Text>
            </View>
            <View className="bg-gray-50 rounded-xl p-4 mb-3">
              <Text className="text-sm text-gray-700 mb-2">
                1. Sign up at{" "}
                <Text className="text-yellow-600 font-semibold">vercel.com</Text>
                {"\n"}
                2. Click &quot;New Project&quot;{"\n"}
                3. Upload HTML file{"\n"}
                4. Get instant deployment
              </Text>
            </View>
            <Text className="text-xs text-gray-500">
              Free forever • Custom domains • Professional
            </Text>
          </View>

          <Pressable
            onPress={handleCopyDeploymentInstructions}
            className="bg-gray-600 rounded-xl py-4 flex-row items-center justify-center mb-4 active:opacity-80"
          >
            <Ionicons name={copied === "deploy" ? "checkmark-circle" : "document-text"} size={20} color="white" />
            <Text className="text-white text-base font-bold ml-2">
              {copied === "deploy" ? "Instructions Copied!" : "Copy Full Instructions"}
            </Text>
          </Pressable>
        </View>

        {/* What Happens Next */}
        <View className="px-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">What Happens Next?</Text>
          <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
            <View className="flex-row items-start mb-4">
              <View className="w-8 h-8 rounded-full bg-yellow-600 items-center justify-center mr-3 mt-1">
                <Text className="text-white text-sm font-bold">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-1">Form Goes Live</Text>
                <Text className="text-sm text-gray-600">
                  Your form will be accessible via a public URL that you can share anywhere
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-4">
              <View className="w-8 h-8 rounded-full bg-yellow-600 items-center justify-center mr-3 mt-1">
                <Text className="text-white text-sm font-bold">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-1">Participants Fill It Out</Text>
                <Text className="text-sm text-gray-600">
                  Share the link via text, email, social media, or your website
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-yellow-600 items-center justify-center mr-3 mt-1">
                <Text className="text-white text-sm font-bold">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-1">Connect Your Backend</Text>
                <Text className="text-sm text-gray-600">
                  Currently shows a placeholder. Update the API endpoint in the HTML to receive submissions.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form Management */}
        <View className="px-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Form Management</Text>
          <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
            <Pressable
              onPress={() => navigation.navigate("EditIntakeForm")}
              className="bg-yellow-600 rounded-xl py-4 flex-row items-center justify-center mb-3 active:opacity-80"
            >
              <Ionicons name="settings" size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">Edit Form Fields</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("IntakeForm")}
              className="bg-gray-600 rounded-xl py-4 flex-row items-center justify-center active:opacity-80"
            >
              <Ionicons name="eye" size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">Preview Form</Text>
            </Pressable>
          </View>
        </View>

        {/* Important Note */}
        <View className="px-6">
          <View className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <View className="flex-1 ml-3">
                <Text className="text-base font-bold text-gray-900 mb-2">About API Setup</Text>
                <Text className="text-sm text-gray-700 mb-2">
                  The form is currently configured to send data to a placeholder API endpoint. To receive actual submissions, you will need to:
                </Text>
                <Text className="text-sm text-gray-700">
                  • Create an API endpoint to receive form data{"\n"}
                  • Update the{" "}
                  <Text className="font-semibold">apiEndpoint</Text>
                  {" "}variable in the HTML{"\n"}
                  • Or use services like Zapier, Make.com, or Google Forms
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

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
                <Ionicons name="checkmark-circle" size={40} color="#10B981" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Form HTML Copied!</Text>
              <Text className="text-center text-gray-600 mb-4">
                Your form HTML is ready to deploy. Check out the free hosting options above to get started!
              </Text>
            </View>
            <Pressable
              onPress={() => setShowSuccessModal(false)}
              className="bg-gray-600 rounded-xl py-3 items-center active:opacity-80"
            >
              <Text className="text-white font-semibold">Got It</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
