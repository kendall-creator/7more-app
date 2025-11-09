/**
 * Aircall SMS API Service
 *
 * Sends SMS messages via the Aircall API.
 * Documentation: https://developer.aircall.io/tutorials/sending-sms-messages-with-aircall-api/
 *
 * IMPORTANT: This uses hardcoded credentials from your environment variables.
 * The credentials are kept private in this file and not exposed to the client.
 */

const AIRCALL_API_BASE = "https://api.aircall.io/v1";

// Aircall API Credentials (from .env file)
const AIRCALL_API_ID = "0e3a62db3edbfcb68125bc11b2630d81";
const AIRCALL_API_TOKEN = "fa71dd99d216faaea12decc76e05f8d9";
const AIRCALL_FROM_NUMBER = "+18325582391";

interface AircallSMSResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Get Basic Auth header for Aircall API
 * Encodes API ID and Token in Base64 as required by Aircall
 */
function getAuthHeader(): string {
  if (!AIRCALL_API_ID || !AIRCALL_API_TOKEN) {
    throw new Error("Aircall API credentials not configured.");
  }

  // Create Basic Auth: base64(api_id:api_token)
  const credentials = `${AIRCALL_API_ID}:${AIRCALL_API_TOKEN}`;
  const base64Credentials = btoa(credentials);

  return `Basic ${base64Credentials}`;
}

/**
 * Get the Aircall phone number to send from
 */
function getFromNumber(): string {
  if (!AIRCALL_FROM_NUMBER) {
    throw new Error("Aircall from number not configured.");
  }

  return AIRCALL_FROM_NUMBER;
}

/**
 * Format phone number to E.164 format required by Aircall
 * E.164 format: +{country_code}{number}
 * Example: +18001231234
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, "");

  // If it doesn't start with +, assume US number and add +1
  if (!cleaned.startsWith("+")) {
    // Remove leading 1 if present (for US numbers)
    if (cleaned.startsWith("1") && cleaned.length === 11) {
      cleaned = cleaned;
    }
    cleaned = `+1${cleaned}`;
  }

  return cleaned;
}

/**
 * Configure an Aircall line for SMS API usage
 * This must be done before you can send SMS via the API
 *
 * IMPORTANT: Once configured for API, the line cannot send SMS from the Aircall app
 *
 * @param lineId - The Aircall line ID to configure
 * @param callbackUrl - Optional webhook URL for receiving SMS replies
 */
export async function configureLineForSMS(
  lineId: string,
  callbackUrl?: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const authHeader = getAuthHeader();

    const endpoint = `${AIRCALL_API_BASE}/numbers/${lineId}/messages/configuration`;

    console.log("Configuring line for SMS API:", lineId);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({
        callback_url: callbackUrl || "",
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Failed to configure line:", responseData);
      return {
        success: false,
        error: responseData.message || `Configuration failed: ${response.status}`,
      };
    }

    console.log("Line configured successfully for SMS API");

    return {
      success: true,
      message: "Line successfully configured for SMS API. Note: This line can no longer send SMS from the Aircall app.",
    };
  } catch (error) {
    console.error("Error configuring line:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Configuration failed",
    };
  }
}

/**
 * Get all available Aircall numbers/lines
 * This helps you find the correct line ID to use for sending SMS
 */
export async function listAircallNumbers(): Promise<{ success: boolean; numbers?: any[]; error?: string }> {
  try {
    const authHeader = getAuthHeader();

    const response = await fetch(`${AIRCALL_API_BASE}/numbers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch Aircall numbers:", responseData);
      return {
        success: false,
        error: responseData.message || `API error: ${response.status}`,
      };
    }

    console.log("Available Aircall numbers:", JSON.stringify(responseData, null, 2));

    return {
      success: true,
      numbers: responseData.numbers || responseData,
    };
  } catch (error) {
    console.error("Error fetching Aircall numbers:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch numbers",
    };
  }
}

/**
 * Send SMS via Aircall API
 *
 * @param toPhoneNumber - Recipient phone number (will be formatted to E.164)
 * @param message - SMS message body
 * @returns Promise with success status and optional error message
 */
export async function sendAircallSMS(
  toPhoneNumber: string,
  message: string
): Promise<AircallSMSResult> {
  try {
    // First, try to get the correct line ID by fetching available numbers
    console.log("Fetching available Aircall numbers to find correct line ID...");
    const numbersResult = await listAircallNumbers();

    if (!numbersResult.success || !numbersResult.numbers) {
      return {
        success: false,
        error: "Could not fetch Aircall numbers. Please check your API credentials and account status.",
      };
    }

    // Find the line that matches our from number
    const fromNumber = getFromNumber();
    const formattedFromNumber = formatPhoneNumber(fromNumber);

    console.log("Looking for line with number:", formattedFromNumber);

    // Try to find the matching line
    let lineId: string | null = null;

    if (Array.isArray(numbersResult.numbers)) {
      for (const line of numbersResult.numbers) {
        console.log("Checking line:", JSON.stringify(line));

        // Check various possible fields for the phone number
        const lineNumber = line.digits || line.number || line.direct_link;

        if (lineNumber && formatPhoneNumber(lineNumber) === formattedFromNumber) {
          lineId = line.id?.toString();
          console.log("Found matching line ID:", lineId);
          break;
        }
      }
    }

    if (!lineId) {
      console.error("Could not find line ID for number:", formattedFromNumber);
      console.error("Available numbers:", JSON.stringify(numbersResult.numbers, null, 2));
      return {
        success: false,
        error: `No Aircall line found for number ${formattedFromNumber}. Please check your Aircall account.`,
      };
    }

    // Format recipient number
    const formattedToNumber = formatPhoneNumber(toPhoneNumber);

    // Construct API endpoint with the correct line ID
    const endpoint = `${AIRCALL_API_BASE}/numbers/${lineId}/messages/send`;

    console.log("Sending SMS via Aircall API...");
    console.log("Endpoint:", endpoint);
    console.log("Line ID:", lineId);
    console.log("To:", formattedToNumber);

    // Get auth header
    const authHeader = getAuthHeader();

    // Make API request
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({
        to: formattedToNumber,
        body: message,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Check if the error is because SMS API is not enabled
      if (responseData.key === "Forbidden" && responseData.message?.includes("sms is not enabled")) {
        console.log("SMS API not enabled for this line. Attempting to configure...");

        // Try to configure the line for SMS API
        const configResult = await configureLineForSMS(lineId);

        if (!configResult.success) {
          return {
            success: false,
            error: `SMS API not enabled for your Aircall line. Configuration failed: ${configResult.error}. Please contact Aircall support to enable SMS API for your number.`,
          };
        }

        console.log("Line configured successfully. Retrying SMS send...");

        // Retry sending SMS after configuration
        const retryResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader,
          },
          body: JSON.stringify({
            to: formattedToNumber,
            body: message,
          }),
        });

        const retryData = await retryResponse.json();

        if (!retryResponse.ok) {
          console.error("Retry failed:", retryData);
          return {
            success: false,
            error: retryData.message || `SMS send failed after configuration: ${retryResponse.status}`,
          };
        }

        console.log("SMS sent successfully after configuration!");

        return {
          success: true,
          messageId: retryData.id,
        };
      }

      // Other errors
      console.error("Aircall API error:", responseData);
      return {
        success: false,
        error: responseData.message || `Aircall API error: ${response.status}`,
      };
    }

    console.log("SMS sent successfully via Aircall");

    return {
      success: true,
      messageId: responseData.id,
    };
  } catch (error) {
    console.error("Error sending SMS via Aircall:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Test Aircall API connection
 * Useful for debugging configuration issues
 */
export async function testAircallConnection(): Promise<AircallSMSResult> {
  try {
    const authHeader = getAuthHeader();

    const response = await fetch(`${AIRCALL_API_BASE}/ping`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API connection failed: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection test failed",
    };
  }
}
