import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { database } from "../config/firebase";

export default function DiagnosticsScreen({ navigation }: any) {
  const [diagnostics, setDiagnostics] = useState<any>({
    firebaseInitialized: false,
    canConnectToFirebase: false,
    error: null,
    databaseUrl: "",
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {
        firebaseInitialized: database !== null,
        canConnectToFirebase: false,
        error: null,
        databaseUrl: database ? "Configured" : "Not configured",
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        online: navigator.onLine
      };

      if (database) {
        try {
          const { ref, get } = await import("firebase/database");
          const testRef = ref(database, "users");
          const snapshot = await get(testRef);
          results.canConnectToFirebase = true;
          results.usersFound = snapshot.exists() ? Object.keys(snapshot.val() || {}).length : 0;
        } catch (error: any) {
          results.canConnectToFirebase = false;
          results.error = error.message;
        }
      }

      setDiagnostics(results);
    };

    runDiagnostics();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="px-6 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Firebase Diagnostics</Text>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-lg font-bold mb-3">Connection Status</Text>

            <View className="mb-2">
              <Text className="font-semibold">Device Online:</Text>
              <Text className={diagnostics.online ? "text-green-600" : "text-red-600"}>
                {diagnostics.online ? "✅ Yes" : "❌ No"}
              </Text>
            </View>

            <View className="mb-2">
              <Text className="font-semibold">Firebase Initialized:</Text>
              <Text className={diagnostics.firebaseInitialized ? "text-green-600" : "text-red-600"}>
                {diagnostics.firebaseInitialized ? "✅ Yes" : "❌ No"}
              </Text>
            </View>

            <View className="mb-2">
              <Text className="font-semibold">Can Connect to Firebase:</Text>
              <Text className={diagnostics.canConnectToFirebase ? "text-green-600" : "text-red-600"}>
                {diagnostics.canConnectToFirebase ? "✅ Yes" : "❌ No"}
              </Text>
            </View>

            {diagnostics.usersFound !== undefined && (
              <View className="mb-2">
                <Text className="font-semibold">Users Found:</Text>
                <Text className="text-green-600">{diagnostics.usersFound}</Text>
              </View>
            )}

            {diagnostics.error && (
              <View className="mb-2">
                <Text className="font-semibold">Error:</Text>
                <Text className="text-red-600 text-xs">{diagnostics.error}</Text>
              </View>
            )}
          </View>

          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-lg font-bold mb-3">Device Information</Text>

            <View className="mb-2">
              <Text className="font-semibold">Browser:</Text>
              <Text className="text-xs text-gray-700">{diagnostics.userAgent}</Text>
            </View>

            <View className="mb-2">
              <Text className="font-semibold">Timestamp:</Text>
              <Text className="text-gray-700">{diagnostics.timestamp}</Text>
            </View>
          </View>

          {!diagnostics.canConnectToFirebase && (
            <View className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
              <Text className="text-red-800 font-bold mb-2">⚠️ Connection Failed</Text>
              <Text className="text-red-700 text-sm mb-3">
                Your device cannot connect to the server. This could be due to:
              </Text>
              <Text className="text-red-700 text-sm">
                • Browser blocking Firebase connections{"\n"}
                • Corrupted browser cache{"\n"}
                • Network firewall or proxy{"\n"}
                • Private browsing restrictions
              </Text>
              <Text className="text-red-700 text-sm mt-3 font-semibold">
                Recommended fixes:{"\n"}
                1. Try a different browser{"\n"}
                2. Clear browser cache completely{"\n"}
                3. Try incognito/private mode{"\n"}
                4. Contact your IT department
              </Text>
            </View>
          )}
        </ScrollView>

        <View className="px-6 py-4 border-t border-gray-200">
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-gray-800 rounded-xl py-4 items-center"
          >
            <Text className="text-white text-base font-semibold">Close</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
