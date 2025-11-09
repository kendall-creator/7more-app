import { Linking, Platform, Alert } from "react-native";

/**
 * AirCall Integration Utility
 *
 * This utility provides integration with the AirCall mobile app for making calls and sending SMS.
 * It will attempt to use AirCall if installed, otherwise falls back to native phone/SMS apps.
 *
 * Configuration:
 * - To update the AirCall URL scheme, modify the AIRCALL_SMS_SCHEME and AIRCALL_CALL_SCHEME constants
 * - Common patterns for third-party calling apps:
 *   - "aircall://sms?number={number}&body={message}"
 *   - "aircall://call?number={number}"
 *
 * Note: If you have the exact AirCall URL scheme from their documentation,
 * update the constants below accordingly.
 */

// AirCall URL schemes - Testing different possible schemes
// Common AirCall schemes: aircall://, aircallapp://, com.aircall.phone://
const AIRCALL_SMS_SCHEME = "aircall"; // Just the base scheme for detection
const AIRCALL_CALL_SCHEME = "aircall"; // Just the base scheme for detection

// Fallback to native SMS/phone apps
const NATIVE_SMS_SCHEME = Platform.OS === "ios" ? "sms:" : "sms:";
const NATIVE_CALL_SCHEME = "tel:";

/**
 * Check if AirCall app is installed on the device
 */
export const isAirCallInstalled = async (): Promise<boolean> => {
  try {
    const canOpen = await Linking.canOpenURL(AIRCALL_SMS_SCHEME);
    return canOpen;
  } catch (error) {
    console.log("Error checking AirCall installation:", error);
    return false;
  }
};

/**
 * Send SMS via AirCall if installed, otherwise use native SMS app
 *
 * @param phoneNumber - The recipient's phone number
 * @param message - The SMS message body
 * @param forceNative - If true, skip AirCall and use native SMS (useful for testing)
 */
export const sendSMSViaAirCall = async (
  phoneNumber: string,
  message: string,
  forceNative: boolean = false
): Promise<{ success: boolean; method: "aircall" | "native"; error?: string }> => {
  try {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

    if (!cleanNumber) {
      return { success: false, method: "native", error: "Invalid phone number" };
    }

    // Check if we should try AirCall
    if (!forceNative) {
      // Try different AirCall URL schemes
      const aircallSchemes = [
        // Standard schemes
        `aircall://send_sms?phone_number=${encodeURIComponent(cleanNumber)}&message=${encodeURIComponent(message)}`,
        `aircall://sms/${encodeURIComponent(cleanNumber)}?body=${encodeURIComponent(message)}`,
        `aircall://compose?to=${encodeURIComponent(cleanNumber)}&body=${encodeURIComponent(message)}`,
        // Try without the "://" part
        `aircall:sms?phone=${encodeURIComponent(cleanNumber)}&text=${encodeURIComponent(message)}`,
        // Try with different parameter names
        `aircall://new_message?phone=${encodeURIComponent(cleanNumber)}&body=${encodeURIComponent(message)}`,
        `aircall://message/${encodeURIComponent(cleanNumber)}?text=${encodeURIComponent(message)}`,
      ];

      for (const aircallUrl of aircallSchemes) {
        try {
          const canOpen = await Linking.canOpenURL(aircallUrl);
          if (canOpen) {
            await Linking.openURL(aircallUrl);
            console.log("✅ Opened AirCall with URL:", aircallUrl);
            return { success: true, method: "aircall" };
          }
        } catch (error) {
          console.log("❌ Failed scheme:", aircallUrl, error);
          // Continue to next scheme
        }
      }

      console.log("⚠️ AirCall not available, falling back to native SMS");
    }

    // Fallback to native SMS
    const smsUrl = `${NATIVE_SMS_SCHEME}${cleanNumber}${Platform.OS === "ios" ? "&" : "?"}body=${encodeURIComponent(message)}`;

    const canOpen = await Linking.canOpenURL(smsUrl);
    if (canOpen) {
      await Linking.openURL(smsUrl);
      return { success: true, method: "native" };
    }

    return { success: false, method: "native", error: "Could not open SMS app" };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return { success: false, method: "native", error: String(error) };
  }
};

/**
 * Make a phone call via AirCall if installed, otherwise use native phone app
 *
 * @param phoneNumber - The phone number to call
 * @param forceNative - If true, skip AirCall and use native phone app
 */
export const makeCallViaAirCall = async (
  phoneNumber: string,
  forceNative: boolean = false
): Promise<{ success: boolean; method: "aircall" | "native"; error?: string }> => {
  try {
    // Clean phone number
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

    if (!cleanNumber) {
      return { success: false, method: "native", error: "Invalid phone number" };
    }

    // Check if we should try AirCall
    if (!forceNative) {
      const hasAirCall = await isAirCallInstalled();

      if (hasAirCall) {
        try {
          // Construct AirCall call URL
          // NOTE: This is a placeholder format. Update based on actual AirCall documentation
          const aircallUrl = `${AIRCALL_CALL_SCHEME}?number=${encodeURIComponent(cleanNumber)}`;

          const canOpen = await Linking.canOpenURL(aircallUrl);
          if (canOpen) {
            await Linking.openURL(aircallUrl);
            return { success: true, method: "aircall" };
          }
        } catch (aircallError) {
          console.log("AirCall failed, falling back to native phone:", aircallError);
          // Fall through to native phone
        }
      }
    }

    // Fallback to native phone app
    const callUrl = `${NATIVE_CALL_SCHEME}${cleanNumber}`;

    const canOpen = await Linking.canOpenURL(callUrl);
    if (canOpen) {
      await Linking.openURL(callUrl);
      return { success: true, method: "native" };
    }

    return { success: false, method: "native", error: "Could not open phone app" };
  } catch (error) {
    console.error("Error making call:", error);
    return { success: false, method: "native", error: String(error) };
  }
};

/**
 * Show alert prompting user to choose between AirCall and native app
 * Useful if you want to give users explicit control
 */
export const promptSMSMethod = (
  phoneNumber: string,
  message: string,
  onComplete?: (result: { success: boolean; method: "aircall" | "native" }) => void
) => {
  Alert.alert(
    "Send SMS",
    "Choose how to send the message:",
    [
      {
        text: "AirCall",
        onPress: async () => {
          const result = await sendSMSViaAirCall(phoneNumber, message, false);
          if (!result.success) {
            Alert.alert("Error", result.error || "Could not send SMS via AirCall");
          }
          onComplete?.(result);
        },
      },
      {
        text: "Native SMS",
        onPress: async () => {
          const result = await sendSMSViaAirCall(phoneNumber, message, true);
          if (!result.success) {
            Alert.alert("Error", result.error || "Could not open SMS app");
          }
          onComplete?.(result);
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]
  );
};

/**
 * Show alert prompting user to choose between AirCall and native phone app
 */
export const promptCallMethod = (
  phoneNumber: string,
  onComplete?: (result: { success: boolean; method: "aircall" | "native" }) => void
) => {
  Alert.alert(
    "Make Call",
    "Choose how to make the call:",
    [
      {
        text: "AirCall",
        onPress: async () => {
          const result = await makeCallViaAirCall(phoneNumber, false);
          if (!result.success) {
            Alert.alert("Error", result.error || "Could not make call via AirCall");
          }
          onComplete?.(result);
        },
      },
      {
        text: "Native Phone",
        onPress: async () => {
          const result = await makeCallViaAirCall(phoneNumber, true);
          if (!result.success) {
            Alert.alert("Error", result.error || "Could not open phone app");
          }
          onComplete?.(result);
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]
  );
};
