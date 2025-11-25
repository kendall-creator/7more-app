import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
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
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { logCrash, logError } from "./src/utils/crashLogger";

// Type declaration for React Native's ErrorUtils global
declare const ErrorUtils: {
  getGlobalHandler: () => ((error: Error, isFatal?: boolean) => void) | undefined;
  setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
};

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
  // Force cache bust - changes every time the code is updated
  const BUILD_TIMESTAMP = "2025-01-22T00:05:00Z";
  console.log(`📱 App version: ${BUILD_TIMESTAMP}`);

  const initializeDefaultAdmin = useUsersStore((s) => s.initializeDefaultAdmin);
  const initUsersListener = useUsersStore((s) => s.initializeFirebaseListener);
  const initParticipantsListener = useParticipantStore((s) => s.initializeFirebaseListener);
  const initSchedulerListener = useSchedulerStore((s) => s.initializeFirebaseListener);
  const initResourcesListener = useResourceStore((s) => s.initializeFirebaseListener);
  const initTransitionalHomesListener = useTransitionalHomeStore ((s) => s.initializeFirebaseListener);
  const initDefaultHomes = useTransitionalHomeStore((s) => s.initializeDefaultHomes);
  const initMentorshipListener = useMentorshipStore((s) => s.initializeFirebaseListener);
  const initGuidanceListener = useGuidanceStore((s) => s.initializeFirebaseListener);
  const initTasksListener = useTaskStore((s) => s.initializeFirebaseListener);
  const initReportingListener = useReportingStore((s) => s.initializeFirebaseListener);
  const initVolunteerListener = useVolunteerStore((s) => s.initializeFirebaseListener);

  useEffect(() => {
    console.log("🚀 App.tsx: Initializing all Firebase listeners and stores...");

    // Set up global error handlers for unhandled errors and promise rejections
    let originalErrorHandler: ((error: Error, isFatal?: boolean) => void) | undefined;

    if (typeof ErrorUtils !== "undefined") {
      originalErrorHandler = ErrorUtils.getGlobalHandler();

      ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        // Log the crash
        logCrash(error, { errorBoundary: false }).catch((logError) => {
          console.error("Failed to log crash:", logError);
        });

        // Call original handler if it exists
        if (originalErrorHandler) {
          originalErrorHandler(error, isFatal);
        } else {
          console.error("Unhandled error:", error);
        }
      });
    } else {
      console.warn("⚠️ ErrorUtils not available, global error handler not set");
    }

    // Handle unhandled promise rejections
    const rejectionHandler = (reason: any) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      logError(error, "Unhandled Promise Rejection").catch((logError) => {
        console.error("Failed to log promise rejection:", logError);
      });
      console.error("Unhandled promise rejection:", reason);
    };

    // Set up promise rejection handler
    if (typeof global !== "undefined" && (global as any).HermesInternal) {
      // React Native with Hermes
      const originalHandler: ((this: Window, ev: PromiseRejectionEvent) => any) | null = global.onunhandledrejection;
      global.onunhandledrejection = (event: any) => {
        rejectionHandler(event.reason);
        if (originalHandler) {
          originalHandler.call(window, event);
        }
      };
    } else {
      // Fallback for other environments
      if (typeof window !== "undefined") {
        window.addEventListener("unhandledrejection", (event) => {
          rejectionHandler(event.reason);
        });
      }
    }

    // Wrap all initialization in try-catch to prevent crashes
    try {
      // Initialize users first (async function)
      Promise.resolve(initUsersListener()).catch((err: any) => {
        console.error("Users listener error:", err);
        logError(err, "Users listener initialization").catch(() => {});
      });

      // Initialize other Firebase listeners
      initParticipantsListener();
      initSchedulerListener();
      initResourcesListener();
      initTransitionalHomesListener();
      initMentorshipListener();
      initGuidanceListener();
      initTasksListener();
      initReportingListener();
      initVolunteerListener();

      // DO NOT call initialization functions that write to Firebase during startup
      // This can cause crashes on some devices
      // initializeDefaultAdmin();
      // initDefaultHomes();
      // fixAdminPasswordFlag();
      // fixMenteeStatusesOnce();

      console.log("✅ App.tsx: All initialization complete");
    } catch (error) {
      console.error("❌ Critical error during app initialization:", error);
      console.log("⚠️ App will continue with limited functionality");
      if (error instanceof Error) {
        logError(error, "App initialization").catch(() => {});
      }
    }

    // Cleanup function
    return () => {
      // Restore original error handler on unmount
      if (typeof ErrorUtils !== "undefined" && originalErrorHandler) {
        ErrorUtils.setGlobalHandler(originalErrorHandler);
      }
    };
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
