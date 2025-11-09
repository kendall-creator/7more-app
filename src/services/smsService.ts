/**
 * SMS Service for sending welcome text messages
 *
 * This service uses Twilio for sending SMS messages.
 * You can configure it in the ENV tab with:
 * - EXPO_PUBLIC_TWILIO_ACCOUNT_SID
 * - EXPO_PUBLIC_TWILIO_AUTH_TOKEN
 * - EXPO_PUBLIC_TWILIO_PHONE_NUMBER (your Twilio phone number)
 *
 * Get a free Twilio account at https://www.twilio.com/try-twilio
 */

interface SMSParams {
  to: string;
  message: string;
}

/**
 * Send a welcome SMS to a newly added user
 */
export const sendWelcomeSMS = async (
  phoneNumber: string,
  userName: string,
  password: string,
  appLink: string = "https://7more.org/app"
): Promise<{ success: boolean; error?: string }> => {
  try {
    const message = `Welcome to 7more, ${userName}!

Your login credentials:
Email: (check your email)
Password: ${password}

Download the app: ${appLink}

You can change your password anytime in account settings.`;

    const result = await sendSMS({
      to: phoneNumber,
      message,
    });

    return result;
  } catch (error) {
    console.error("Error sending welcome SMS:", error);
    return {
      success: false,
      error: String(error),
    };
  }
};

/**
 * Send a password reset SMS
 */
export const sendPasswordResetSMS = async (
  phoneNumber: string,
  userName: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const message = `Hi ${userName}, your password has been reset.

New password: ${newPassword}

You can change it anytime in account settings.

- 7more Team`;

    const result = await sendSMS({
      to: phoneNumber,
      message,
    });

    return result;
  } catch (error) {
    console.error("Error sending password reset SMS:", error);
    return {
      success: false,
      error: String(error),
    };
  }
};

/**
 * Core SMS sending function using Twilio
 */
const sendSMS = async ({ to, message }: SMSParams): Promise<{ success: boolean; error?: string }> => {
  // Check if SMS service is configured
  const accountSid = process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID;
  const authToken = process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.EXPO_PUBLIC_TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("SMS service not configured. SMS will not be sent.");
    console.log("\n=== SMS WOULD HAVE BEEN SENT ===");
    console.log("To:", to);
    console.log("Message:", message);
    console.log("=================================\n");

    return {
      success: false,
      error: "SMS service not configured. Please add Twilio credentials to ENV tab. Get a free account at https://www.twilio.com/try-twilio",
    };
  }

  // Remove all non-numeric characters from phone number
  const cleanPhone = to.replace(/[^0-9]/g, "");

  // Ensure phone number has country code (add +1 for US if needed)
  const formattedPhone = cleanPhone.startsWith("1") ? `+${cleanPhone}` : `+1${cleanPhone}`;

  try {
    // Using Twilio API
    // Create base64 auth token without Buffer (React Native compatible)
    const auth = btoa(`${accountSid}:${authToken}`);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          To: formattedPhone,
          From: fromNumber,
          Body: message,
        }).toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Twilio API returned ${response.status}: ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return {
      success: false,
      error: String(error),
    };
  }
};
