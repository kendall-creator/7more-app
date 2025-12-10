import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { database, auth } from "../config/firebase";
import { useUsersStore } from "../state/usersStore";
import { ref, get as firebaseGet } from "firebase/database";
import { syncUsersToFirebaseAuth } from "../utils/syncUsersToFirebaseAuth";

export default function DiagnosticScreen({ navigation }: any) {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const invitedUsers = useUsersStore((s) => s.invitedUsers);

  const addLog = (message: string) => {
    setDiagnostics((prev) => [...prev, `${new Date().toISOString().split("T")[1].split(".")[0]} - ${message}`]);
    console.log(message);
  };

  const handleSyncUsers = async () => {
    setIsSyncing(true);
    setDiagnostics([]);
    addLog("🔄 Starting user sync to Firebase Auth...");

    try {
      const result = await syncUsersToFirebaseAuth();
      if (result) {
        addLog(`✅ Sync complete!`);
        addLog(`   Synced: ${result.synced} users`);
        addLog(`   Skipped: ${result.skipped} users`);
        addLog(`   Errors: ${result.errors} users`);
        addLog("");
        addLog("🎉 All existing users now have Firebase Auth accounts!");
        addLog("You can now update your Firebase rules to:");
        addLog('{ "rules": { ".read": "auth != null", ".write": "auth != null" } }');
      }
    } catch (error: any) {
      addLog(`❌ Error during sync: ${error.message}`);
    }

    setIsSyncing(false);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    addLog("🔍 Starting diagnostics...");
    addLog(`📱 Build version: 2025-01-21T23:52:00Z`);

    // Check Zustand store
    addLog(`📦 Users in Zustand store: ${invitedUsers.length}`);
    if (invitedUsers.length > 0) {
      addLog(`   First user: ${invitedUsers[0].name} (${invitedUsers[0].email})`);
    }

    // Check Firebase database instance
    addLog(`🔥 Firebase database: ${database ? "✅ Connected" : "❌ Not initialized"}`);

    if (!database) {
      addLog("❌ CRITICAL: Firebase not initialized!");
      setIsRunning(false);
      return;
    }

    // Test direct Firebase fetch
    addLog("📡 Testing direct Firebase fetch...");
    try {
      const usersRef = ref(database, "users");
      addLog("   Created reference to /users");

      const snapshot = await Promise.race([
        firebaseGet(usersRef),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout after 10 seconds")), 10000)
        )
      ]);

      addLog("   Fetch completed!");

      if ((snapshot as any).exists()) {
        const data = (snapshot as any).val();
        const usersArray = Object.values(data);
        addLog(`✅ SUCCESS: Loaded ${usersArray.length} users from Firebase`);
        addLog(`   Users: ${usersArray.map((u: any) => u.email).join(", ")}`);
      } else {
        addLog("⚠️ Firebase returned no data");
      }
    } catch (error: any) {
      addLog(`❌ Firebase fetch FAILED: ${error.message}`);
      addLog(`   Error type: ${error?.constructor?.name || "Unknown"}`);
      addLog(`   Error code: ${error?.code || "no code"}`);
    }

    // Check if user exists
    addLog(`🔑 Checking if debs@7more.net exists...`);
    const currentUsers = useUsersStore.getState().invitedUsers;
    const debs = currentUsers.find(u => u.email.toLowerCase() === "debs@7more.net");
    if (debs) {
      addLog(`✅ Found: ${debs.name} (${debs.email})`);
    } else {
      addLog(`❌ NOT FOUND: debs@7more.net`);
      addLog(`   Available emails: ${currentUsers.map(u => u.email).join(", ")}`);
    }

    addLog("✅ Diagnostics complete!");
    setIsRunning(false);
  };

  useEffect(() => {
    // Auto-run on mount
    runDiagnostics();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-12 pb-4">
        <Text className="text-2xl font-bold text-gray-900">System Diagnostics</Text>
        <Text className="text-sm text-gray-600 mt-2">
          Checking Firebase connection and user data
        </Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {diagnostics.map((log, index) => (
          <Text key={index} className="text-xs font-mono text-gray-800 mb-1">
            {log}
          </Text>
        ))}

        {isRunning && (
          <View className="flex-row items-center mt-4">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="ml-2 text-gray-600">Running tests...</Text>
          </View>
        )}
      </ScrollView>

      <View className="px-6 pb-8">
        <Pressable
          onPress={handleSyncUsers}
          disabled={isSyncing || isRunning}
          className="bg-green-500 py-4 px-6 rounded-xl active:opacity-70 mb-3"
        >
          <Text className="text-white text-center font-semibold text-base">
            {isSyncing ? "Syncing..." : "Sync Users to Firebase Auth"}
          </Text>
        </Pressable>

        <Pressable
          onPress={runDiagnostics}
          disabled={isRunning || isSyncing}
          className="bg-blue-500 py-4 px-6 rounded-xl active:opacity-70"
        >
          <Text className="text-white text-center font-semibold text-base">
            Run Diagnostics Again
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-3 py-4 px-6"
        >
          <Text className="text-blue-500 text-center font-semibold text-base">
            Back to Login
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
