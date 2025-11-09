import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useFormConfig } from "../state/intakeFormStore";
import { formatFormConfigForWeb } from "../api/form-config-endpoint";

export default function EmbeddableFormScreen({ navigation }: any) {
  const formConfig = useFormConfig();
  const [iframeWidth, setIframeWidth] = useState("100%");
  const [iframeHeight, setIframeHeight] = useState("1200");
  const [vercelUrl, setVercelUrl] = useState("your-project.vercel.app");

  // Generate the embeddable form URL using user's Vercel deployment
  const formUrl = `https://${vercelUrl}/embedded-form.html`;

  // Generate iframe code
  const iframeCode = `<iframe
  src="${formUrl}"
  width="${iframeWidth}"
  height="${iframeHeight}px"
  frameborder="0"
  style="border: none; border-radius: 8px;">
</iframe>`;

  // Generate HTML snippet with styling
  const htmlSnippet = `<!-- Participant Intake Form -->
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
  <iframe
    src="${formUrl}"
    width="${iframeWidth}"
    height="${iframeHeight}px"
    frameborder="0"
    style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  </iframe>
</div>`;

  // Generate script embed code (alternative method)
  const scriptEmbed = `<div id="vibecode-intake-form"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${formUrl}';
    iframe.width = '${iframeWidth}';
    iframe.height = '${iframeHeight}';
    iframe.frameBorder = '0';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    document.getElementById('vibecode-intake-form').appendChild(iframe);
  })();
</script>`;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert("Copied!", `${label} copied to clipboard`);
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  const exportFormConfig = () => {
    const webConfig = formatFormConfigForWeb(formConfig);
    const jsonString = JSON.stringify(webConfig, null, 2);

    Share.share({
      message: jsonString,
      title: "Participant Form Configuration",
    });
  };

  const openDeploymentGuide = () => {
    Alert.alert(
      "Deployment Guide",
      "The complete deployment guide is available in DEPLOYMENT_GUIDE.md in your workspace. It includes:\n\n• Step-by-step Vercel setup\n• Firebase configuration\n• Wix embedding instructions\n• Auto-sync configuration\n• Troubleshooting tips",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 flex-1">Embeddable Form</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>
        <Text className="text-sm text-gray-600">
          Generate code to embed the participant intake form on your website
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Form Status */}
        <View className="bg-white mx-4 mt-4 rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Current Form Status</Text>
          <View className="bg-gray-50 rounded-lg p-3 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-semibold text-gray-700">Form Title:</Text>
              <Text className="text-sm text-gray-900">{formConfig.title}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-semibold text-gray-700">Enabled Fields:</Text>
              <Text className="text-sm text-gray-900">
                {formConfig.fields.filter((f) => f.enabled).length}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-gray-700">Last Updated:</Text>
              <Text className="text-sm text-gray-900">
                {new Date(formConfig.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => navigation.navigate("EditIntakeForm")}
            className="bg-gray-100 rounded-lg py-2 px-3 flex-row items-center justify-center"
          >
            <Ionicons name="create-outline" size={18} color="#4b5563" />
            <Text className="text-sm font-semibold text-gray-700 ml-2">Edit Form Fields</Text>
          </Pressable>
        </View>

        {/* Deployment Setup */}
        <View className="bg-white mx-4 mt-4 rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Deployment Setup</Text>

          <Pressable
            onPress={openDeploymentGuide}
            className="bg-gray-600 rounded-lg py-3 px-4 mb-3 flex-row items-center active:opacity-80"
          >
            <Ionicons name="book-outline" size={20} color="#ffffff" />
            <Text className="text-white font-semibold text-sm ml-2 flex-1">
              View Complete Deployment Guide
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#ffffff" />
          </Pressable>

          <Pressable
            onPress={exportFormConfig}
            className="bg-white border border-gray-300 rounded-lg py-3 px-4 flex-row items-center active:opacity-80"
          >
            <Ionicons name="download-outline" size={20} color="#4b5563" />
            <Text className="text-gray-700 font-semibold text-sm ml-2 flex-1">
              Export Form Configuration
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#4b5563" />
          </Pressable>
        </View>

        {/* Vercel URL Configuration */}
        <View className="bg-white mx-4 mt-4 rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Your Vercel URL</Text>
          <Text className="text-xs text-gray-600 mb-2">
            Enter your Vercel project URL after deployment
          </Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-2">
            <Text className="text-sm text-gray-600">https://</Text>
            <TextInput
              className="flex-1 text-sm text-gray-900 px-2"
              placeholder="your-project.vercel.app"
              value={vercelUrl}
              onChangeText={setVercelUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text className="text-xs text-gray-500">
            Example: my-participant-form.vercel.app
          </Text>
        </View>

        {/* Settings */}
        <View className="bg-white mx-4 mt-4 rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Embed Settings</Text>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Width</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="100%"
              value={iframeWidth}
              onChangeText={setIframeWidth}
            />
            <Text className="text-xs text-gray-500 mt-1">
              Use percentage (e.g., 100%) or pixels (e.g., 600)
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Height (pixels)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="800"
              value={iframeHeight}
              onChangeText={setIframeHeight}
              keyboardType="number-pad"
            />
            <Text className="text-xs text-gray-500 mt-1">
              Recommended: 1000-1200px for full form display
            </Text>
          </View>
        </View>

        {/* Important Info */}
        <View className="bg-blue-50 mx-4 mt-4 rounded-lg border border-blue-200 p-4">
          <View className="flex-row items-start mb-2">
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-blue-900 mb-1">
                Auto-Sync with Firebase
              </Text>
              <Text className="text-sm text-blue-800">
                Submissions from the embedded form will save directly to your Firebase database. All data appears instantly in your app dashboard with the same structure and validation as the in-app form.
              </Text>
            </View>
          </View>
        </View>

        {/* iframe Code */}
        <View className="bg-white mx-4 mt-4 rounded-lg border border-gray-200 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Basic iframe</Text>
            <Pressable
              onPress={() => copyToClipboard(iframeCode, "iframe code")}
              className="bg-indigo-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold text-sm">Copy</Text>
            </Pressable>
          </View>
          <Text className="text-xs text-gray-600 mb-2">
            Simple iframe embed for Wix - paste into HTML iframe element
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="bg-gray-900 rounded-lg p-4">
              <Text className="text-green-400 font-mono text-xs">{iframeCode}</Text>
            </View>
          </ScrollView>
        </View>

        {/* HTML Snippet */}
        <View className="bg-white mx-4 mt-4 rounded-lg border border-gray-200 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Styled HTML</Text>
            <Pressable
              onPress={() => copyToClipboard(htmlSnippet, "HTML snippet")}
              className="bg-indigo-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold text-sm">Copy</Text>
            </Pressable>
          </View>
          <Text className="text-xs text-gray-600 mb-2">
            iframe with container styling and shadow
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="bg-gray-900 rounded-lg p-4">
              <Text className="text-green-400 font-mono text-xs">{htmlSnippet}</Text>
            </View>
          </ScrollView>
        </View>

        {/* Script Embed */}
        <View className="bg-white mx-4 mt-4 rounded-lg border border-gray-200 p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Script Embed</Text>
            <Pressable
              onPress={() => copyToClipboard(scriptEmbed, "Script embed")}
              className="bg-indigo-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold text-sm">Copy</Text>
            </Pressable>
          </View>
          <Text className="text-xs text-gray-600 mb-2">
            JavaScript embed for dynamic loading
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="bg-gray-900 rounded-lg p-4">
              <Text className="text-green-400 font-mono text-xs">{scriptEmbed}</Text>
            </View>
          </ScrollView>
        </View>

        {/* Instructions */}
        <View className="bg-white mx-4 mt-4 rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">How to Use</Text>

          <View className="mb-4">
            <View className="flex-row items-start mb-2">
              <View className="w-6 h-6 bg-indigo-600 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold text-xs">1</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700">
                Choose your preferred embed method (iframe, styled HTML, or script)
              </Text>
            </View>

            <View className="flex-row items-start mb-2">
              <View className="w-6 h-6 bg-indigo-600 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold text-xs">2</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700">
                Copy the code using the Copy button
              </Text>
            </View>

            <View className="flex-row items-start mb-2">
              <View className="w-6 h-6 bg-indigo-600 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold text-xs">3</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700">
                Paste the code into your website&apos;s HTML where you want the form to appear
              </Text>
            </View>

            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-indigo-600 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold text-xs">4</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700">
                All form submissions will automatically appear in your admin dashboard
              </Text>
            </View>
          </View>

          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <Text className="text-xs font-semibold text-yellow-900 mb-1">Setup Required</Text>
            <Text className="text-xs text-yellow-800">
              Before embedding, you must deploy the serverless functions to Vercel and configure Firebase credentials. See the Deployment Guide above for complete setup instructions.
            </Text>
          </View>
        </View>

        {/* Test Form Button */}
        <View className="mx-4 mt-4">
          <Pressable
            onPress={() => navigation.navigate("IntakeForm")}
            className="bg-gray-600 rounded-xl py-4 items-center"
          >
            <Text className="text-white text-base font-bold">Preview Form</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
