import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect, Component, ReactNode } from "react";
import { View, Text } from "react-native";
import RootNavigator from "./src/navigation/RootNavigator";
import { useUsersStore } from "./src/state/usersStore";
import { useParticipantStore } from "./src/state/participantStore";
import { useSchedulerStore } from "./src/state/schedulerStore";
import { useResourceStore } from "./src/state/resourceStore";
import { useTransitionalHomeStore } from "./src/state/transitionalHomeStore";
import { useMentorshipStore } from "./src/state/mentorshipStore";
import { useGuidanceStore } from "./src/state/guidanceStore";
import { useTaskStore } from "./src/state/taskStore";
import { useReportingStore } from "./src/state/reportingStore";
import { useVolunteerStore } from "./src/state/volunteerStore";
import { fixAdminPasswordFlag } from "./src/utils/fixAdminPassword";
import { fixMenteeStatusesOnce } from "./src/utils/fixMenteeStatuses";

// Custom Error Boundary to catch crashes
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("🔴 FATAL APP ERROR:", error);
    console.error("   Error message:", error.message);
    console.error("   Error stack:", error.stack);
    console.error("   Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            App Error
          </Text>
          <Text style={{ fontSize: 14, textAlign: "center", marginBottom: 20 }}>
            {this.state.error.message}
          </Text>
          <Text style={{ fontSize: 12, color: "#666", textAlign: "center" }}>
            Check LOGS tab for details
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project.
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  const initializeDefaultAdmin = useUsersStore((s) => s.initializeDefaultAdmin);
  const initUsersListener = useUsersStore((s) => s.initializeFirebaseListener);
  const initParticipantsListener = useParticipantStore((s) => s.initializeFirebaseListener);
  const initSchedulerListener = useSchedulerStore((s) => s.initializeFirebaseListener);
  const initResourcesListener = useResourceStore((s) => s.initializeFirebaseListener);
  const initTransitionalHomesListener = useTransitionalHomeStore((s) => s.initializeFirebaseListener);
  const initDefaultHomes = useTransitionalHomeStore((s) => s.initializeDefaultHomes);
  const initMentorshipListener = useMentorshipStore((s) => s.initializeFirebaseListener);
  const initGuidanceListener = useGuidanceStore((s) => s.initializeFirebaseListener);
  const initTasksListener = useTaskStore((s) => s.initializeFirebaseListener);
  const initReportingListener = useReportingStore((s) => s.initializeFirebaseListener);
  const initVolunteerListener = useVolunteerStore((s) => s.initializeFirebaseListener);

  useEffect(() => {
    console.log("🚀 App.tsx: Initializing all Firebase listeners and stores...");

    // Wrap Firebase initialization in try-catch to prevent crashes
    const initializeApp = async () => {
      try {
        // Initialize Firebase listeners for all stores (non-blocking)
        initUsersListener();
        initParticipantsListener();
        initSchedulerListener();
        initResourcesListener();
        initTransitionalHomesListener();
        initMentorshipListener();
        initGuidanceListener();
        initTasksListener();
        initReportingListener();
        initVolunteerListener();

        // Initialize default admin account on first launch
        await initializeDefaultAdmin().catch(err => {
          console.warn("⚠️ Could not initialize default admin (Firebase may be unavailable):", err.message);
        });

        // Initialize default transitional homes
        await initDefaultHomes().catch(err => {
          console.warn("⚠️ Could not initialize default homes (Firebase may be unavailable):", err.message);
        });

        // Fix admin password flag (one-time fix)
        await fixAdminPasswordFlag().catch(err => {
          console.warn("⚠️ Could not fix admin password (Firebase may be unavailable):", err.message);
        });

        // Fix mentee statuses for existing participants (one-time fix)
        await fixMenteeStatusesOnce().catch(err => {
          console.warn("⚠️ Could not fix mentee statuses (Firebase may be unavailable):", err.message);
        });

        console.log("✅ App.tsx: All initialization complete");
      } catch (error: any) {
        console.error("❌ App initialization error:", error);
        console.log("⚠️ App will continue with limited functionality (Firebase may be unavailable)");
      }
    };

    initializeApp();
  }, []); // Empty dependency array - only run once on mount

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
