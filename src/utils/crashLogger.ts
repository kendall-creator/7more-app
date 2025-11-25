import { database } from "../config/firebase";
import { ref, push, set } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";

/**
 * Logs app crashes and errors to Firebase and local storage
 */
export interface CrashLog {
  timestamp: string;
  error: {
    message: string;
  };
  stack?: string;
  componentStack?: string;
  errorBoundary?: boolean;
  isFatal?: boolean;
  deviceInfo?: {
    brand?: string;
    modelName?: string;
    osName?: string;
    osVersion?: string;
  };
  appVersion?: string;
  userAgent?: string;
}

/**
 * Logs a crash/error to Firebase and AsyncStorage
 */
export const logCrash = async (error: Error, errorInfo?: { componentStack?: string; errorBoundary?: boolean }) => {
  const crashLog: CrashLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message || String(error),
    },
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
    errorBoundary: errorInfo?.errorBoundary || false,
    isFatal: true,
    deviceInfo: Device
      ? {
          brand: Device.brand || undefined,
          modelName: Device.modelName || undefined,
          osName: Device.osName || undefined,
          osVersion: Device.osVersion || undefined,
        }
      : undefined,
  };

  // Log to console for immediate visibility
  console.error("🚨 CRASH LOGGED:", {
    message: crashLog.error.message,
    timestamp: crashLog.timestamp,
    errorBoundary: crashLog.errorBoundary,
  });

  // Try to log to Firebase
  try {
    if (database) {
      const crashLogsRef = ref(database, "crashLogs");
      const newLogRef = push(crashLogsRef);
      await set(newLogRef, crashLog);
      console.log("✅ Crash logged to Firebase");
    } else {
      console.warn("⚠️ Firebase not available, skipping Firebase crash log");
    }
  } catch (firebaseError) {
    console.error("❌ Failed to log crash to Firebase:", firebaseError);
  }

  // Also save to AsyncStorage as backup
  try {
    const existingLogs = await AsyncStorage.getItem("crashLogs");
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(crashLog);
    // Keep only last 50 crash logs locally
    const recentLogs = logs.slice(-50);
    await AsyncStorage.setItem("crashLogs", JSON.stringify(recentLogs));
    console.log("✅ Crash logged to AsyncStorage");
  } catch (storageError) {
    console.error("❌ Failed to log crash to AsyncStorage:", storageError);
  }
};

/**
 * Logs a non-fatal error (warning level)
 */
export const logError = async (error: Error | string, context?: string) => {
  const errorMessage = typeof error === "string" ? error : error.message || String(error);
  const errorStack = typeof error === "string" ? undefined : error.stack;

  const errorLog: CrashLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: context ? `${context}: ${errorMessage}` : errorMessage,
    },
    stack: errorStack,
    isFatal: false,
    deviceInfo: Device
      ? {
          brand: Device.brand || undefined,
          modelName: Device.modelName || undefined,
          osName: Device.osName || undefined,
          osVersion: Device.osVersion || undefined,
        }
      : undefined,
  };

  console.warn("⚠️ ERROR LOGGED:", errorLog.error.message);

  // Try to log to Firebase (non-fatal errors go to a different path)
  try {
    if (database) {
      const errorLogsRef = ref(database, "errorLogs");
      const newLogRef = push(errorLogsRef);
      await set(newLogRef, errorLog);
    }
  } catch (firebaseError) {
    console.error("❌ Failed to log error to Firebase:", firebaseError);
  }
};

/**
 * Retrieves locally stored crash logs
 */
export const getLocalCrashLogs = async (): Promise<CrashLog[]> => {
  try {
    const logs = await AsyncStorage.getItem("crashLogs");
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error("Failed to retrieve crash logs:", error);
    return [];
  }
};

/**
 * Clears locally stored crash logs
 */
export const clearLocalCrashLogs = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("crashLogs");
    console.log("✅ Local crash logs cleared");
  } catch (error) {
    console.error("Failed to clear crash logs:", error);
  }
};

