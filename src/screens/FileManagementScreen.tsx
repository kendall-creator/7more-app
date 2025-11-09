import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, Linking, Clipboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

interface FileItem {
  name: string;
  uri: string;
  size: number;
  isDirectory: boolean;
  modifiedTime: number;
}

// Backend server URL - accessible from mobile browser
// Vibecode environment: The backend server runs on port 3001
// For mobile access, use the Vibecode tunnel or the device's network connection
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://172.17.0.2:3001";

export default function FileManagementScreen() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-defined important files that we know exist
  const IMPORTANT_FILES = [
    {
      name: "vercel-project.zip",
      description: "Vercel deployment package",
      icon: "archive",
      color: "bg-purple-500",
    },
    {
      name: "README.md",
      description: "Project documentation",
      icon: "document-text",
      color: "bg-blue-500",
    },
    {
      name: "VERCEL_DEPLOYMENT_SUMMARY.md",
      description: "Vercel deployment guide",
      icon: "document",
      color: "bg-green-500",
    },
    {
      name: "embedded-form.html",
      description: "Embeddable participant form",
      icon: "code-slash",
      color: "bg-orange-500",
    },
  ];

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create a list with pre-defined important files
      const fileList: FileItem[] = IMPORTANT_FILES.map((file) => ({
        name: file.name,
        uri: `/home/user/workspace/${file.name}`,
        size: 0,
        isDirectory: false,
        modifiedTime: Date.now() / 1000,
      }));

      setFiles(fileList);
    } catch (err) {
      console.error("Error loading files:", err);
      setError("Failed to load files");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFiles();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleDownloadFile = async (file: FileItem) => {
    if (file.isDirectory) {
      Alert.alert("Cannot Download", "Directories cannot be downloaded. Please download individual files.");
      return;
    }

    const downloadUrl = `${BACKEND_URL}/api/files/download/${encodeURIComponent(file.name)}`;

    Alert.alert(
      "Download File",
      `Choose how to download ${file.name}:`,
      [
        {
          text: "Copy Link",
          onPress: () => {
            Clipboard.setString(downloadUrl);
            Alert.alert(
              "Link Copied!",
              `Download link copied to clipboard!\n\nOpen this link in your mobile browser to download:\n\n${downloadUrl}\n\nThe file will be downloaded to your device.`
            );
          },
        },
        {
          text: "Open in Browser",
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(downloadUrl);
              if (supported) {
                await Linking.openURL(downloadUrl);
              } else {
                Clipboard.setString(downloadUrl);
                Alert.alert(
                  "Link Copied",
                  "Could not open browser automatically. Link copied to clipboard - paste it in your browser to download."
                );
              }
            } catch (error) {
              Clipboard.setString(downloadUrl);
              Alert.alert(
                "Link Copied",
                "Link copied to clipboard. Paste it in your browser to download the file."
              );
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const getMimeType = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      zip: "application/zip",
      pdf: "application/pdf",
      json: "application/json",
      txt: "text/plain",
      md: "text/markdown",
      html: "text/html",
      js: "text/javascript",
      ts: "text/typescript",
      tsx: "text/typescript",
      jsx: "text/javascript",
      css: "text/css",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      svg: "image/svg+xml",
    };
    return mimeTypes[ext || ""] || "application/octet-stream";
  };

  const getUTI = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const utiTypes: { [key: string]: string } = {
      zip: "public.zip-archive",
      pdf: "com.adobe.pdf",
      json: "public.json",
      txt: "public.plain-text",
      md: "net.daringfireball.markdown",
      html: "public.html",
      png: "public.png",
      jpg: "public.jpeg",
      jpeg: "public.jpeg",
    };
    return utiTypes[ext || ""] || "public.data";
  };

  const getFileIcon = (file: FileItem): string => {
    if (file.isDirectory) return "folder";

    const ext = file.name.split(".").pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      zip: "archive",
      pdf: "document-text",
      json: "code-slash",
      txt: "document-text",
      md: "document",
      html: "code-slash",
      js: "logo-javascript",
      ts: "code-slash",
      tsx: "code-slash",
      jsx: "logo-react",
      png: "image",
      jpg: "image",
      jpeg: "image",
      gif: "image",
    };

    return iconMap[ext || ""] || "document";
  };

  const getFileColor = (file: FileItem): string => {
    if (file.isDirectory) return "bg-yellow-500";

    const ext = file.name.split(".").pop()?.toLowerCase();
    const colorMap: { [key: string]: string } = {
      zip: "bg-purple-500",
      pdf: "bg-red-500",
      json: "bg-green-500",
      txt: "bg-gray-500",
      md: "bg-blue-500",
      html: "bg-orange-500",
      js: "bg-yellow-600",
      ts: "bg-blue-600",
      tsx: "bg-blue-600",
      jsx: "bg-cyan-500",
      png: "bg-pink-500",
      jpg: "bg-pink-500",
      jpeg: "bg-pink-500",
      gif: "bg-pink-500",
    };

    return colorMap[ext || ""] || "bg-gray-600";
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <SafeAreaView edges={["top"]} className="bg-gray-600">
          <View className="pt-4 pb-6 px-6">
            <Text className="text-2xl font-bold text-white mb-1">File Management</Text>
            <Text className="text-yellow-100 text-sm">Admin Only</Text>
          </View>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4b5563" />
          <Text className="text-gray-600 mt-4">Loading files...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView edges={["top"]} className="bg-gray-600">
        <View className="pt-4 pb-6 px-6">
          <Text className="text-2xl font-bold text-white mb-1">File Management</Text>
          <Text className="text-yellow-100 text-sm">Admin Only • Workspace Directory</Text>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1">
        {/* Info Banner */}
        <View className="mx-6 mt-4 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <View className="flex-row items-start">
            <Ionicons name="download-outline" size={20} color="#059669" />
            <View className="flex-1 ml-3">
              <Text className="text-emerald-900 text-sm font-semibold mb-1">How to Download</Text>
              <Text className="text-emerald-800 text-xs leading-5">
                {"Tap any file below, then choose \"Open in Browser\" or \"Copy Link\". The file will download directly to your device. Make sure you're connected to the same network as the Vibecode server."}
              </Text>
            </View>
          </View>
        </View>

        {/* Refresh Button */}
        <View className="mx-6 mb-4">
          <Pressable
            onPress={handleRefresh}
            disabled={refreshing}
            className="bg-gray-600 rounded-xl py-3 px-4 flex-row items-center justify-center active:opacity-80"
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text className="text-white font-semibold ml-2">Refresh Files</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* File List */}
        <View className="px-6 pb-6">
          <Text className="text-gray-900 font-bold text-base mb-3">
            Files ({files.length})
          </Text>

          {files.length === 0 ? (
            <View className="bg-white rounded-xl p-8 border border-gray-100 items-center">
              <Ionicons name="folder-open-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-3">No files found</Text>
            </View>
          ) : (
            files.map((file) => (
              <Pressable
                key={file.uri}
                onPress={() => handleDownloadFile(file)}
                disabled={file.isDirectory}
                className={`bg-white rounded-xl p-4 mb-3 border border-gray-100 ${
                  !file.isDirectory ? "active:opacity-70" : "opacity-75"
                }`}
              >
                <View className="flex-row items-start">
                  <View className={`w-12 h-12 rounded-xl ${getFileColor(file)} items-center justify-center mr-3`}>
                    <Ionicons name={getFileIcon(file) as any} size={24} color="#fff" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold mb-1" numberOfLines={1}>
                      {file.name}
                    </Text>
                    <View className="flex-row items-center mb-1">
                      <Text className="text-gray-500 text-xs">
                        {file.isDirectory ? "Folder" : formatFileSize(file.size)}
                      </Text>
                      {!file.isDirectory && (
                        <>
                          <Text className="text-gray-400 text-xs mx-2">•</Text>
                          <Text className="text-gray-500 text-xs">
                            {formatDate(file.modifiedTime)}
                          </Text>
                        </>
                      )}
                    </View>
                    {!file.isDirectory && (
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="download-outline" size={14} color="#4b5563" />
                        <Text className="text-gray-600 text-xs font-medium ml-1">
                          Tap to download
                        </Text>
                      </View>
                    )}
                  </View>

                  {!file.isDirectory && (
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  )}
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
