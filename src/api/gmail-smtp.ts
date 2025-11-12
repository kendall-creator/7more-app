/**
 * Gmail SMTP Email Service
 *
 * Sends emails via Gmail SMTP using the backend server.
 * This service is specifically for Bridge Team emails.
 *
 * Environment Variables Required (Backend .env):
 * - BRIDGE_TEAM_EMAIL: bridgeteam@7more.net
 * - BRIDGE_TEAM_EMAIL_PASSWORD: Gmail app password (without spaces)
 * - SMTP_HOST: smtp.gmail.com
 * - SMTP_PORT: 587
 * - SMTP_SECURE: false
 * - EMAIL_API_KEY: Secret key for backend authentication
 *
 * Environment Variables Required (App .env):
 * - EXPO_PUBLIC_BACKEND_URL: Backend server URL (http://172.17.0.1:3001)
 * - EXPO_PUBLIC_BACKEND_API_KEY: API key for backend authentication (must match EMAIL_API_KEY on backend)
 *
 * The backend server is automatically started and runs on port 3001.
 */

import Constants from "expo-constants";

interface GmailEmailParams {
  to: string;
  subject: string;
  body: string;
  html?: string;
  replyTo?: string;
}

interface GmailEmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Send email using backend server Gmail SMTP
 * This uses your backend server to securely send emails via Gmail
 */
export const sendGmailEmail = async ({
  to,
  subject,
  body,
  html,
  replyTo,
}: GmailEmailParams): Promise<GmailEmailResult> => {
  try {
    // Get backend configuration - try both methods
    let backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
    let backendApiKey = process.env.EXPO_PUBLIC_BACKEND_API_KEY;

    // Fallback to Constants.expoConfig if process.env doesn't work
    if (!backendUrl || !backendApiKey) {
      const extra = Constants.expoConfig?.extra;
      backendUrl = backendUrl || extra?.EXPO_PUBLIC_BACKEND_URL;
      backendApiKey = backendApiKey || extra?.EXPO_PUBLIC_BACKEND_API_KEY;
    }

    // Hardcoded fallback for Vibecode environment
    if (!backendUrl) {
      // For Expo Go / React Native in Vibecode environment:
      // The backend server is running on the same host at port 3001
      // We need to use the Expo bundler's host
      const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
      if (expoHost) {
        backendUrl = `http://${expoHost}:3001`;
        console.log("⚠️ Using Expo host for backend URL:", backendUrl);
      } else {
        // Fallback to Docker bridge IP
        backendUrl = "http://172.17.0.2:3001";
        console.log("⚠️ Using Docker bridge IP for backend URL:", backendUrl);
      }
    }
    if (!backendApiKey) {
      backendApiKey = "bridge-email-v1-7more-secure-2025";
      console.log("⚠️ Using hardcoded backend API key");
    }

    // Debug logging
    console.log("🔍 Debug - Email configuration:");
    console.log("   Backend URL:", backendUrl);
    console.log("   API Key:", backendApiKey ? "SET" : "NOT SET");

    // Validate configuration
    if (!backendUrl || !backendApiKey) {
      console.warn("⚠️ Backend not configured");
      return {
        success: false,
        error: "Backend not configured. Please add EXPO_PUBLIC_BACKEND_URL and EXPO_PUBLIC_BACKEND_API_KEY to ENV tab.",
      };
    }

    console.log("📧 Sending email via backend server");
    console.log(`   Backend: ${backendUrl}`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    if (replyTo) console.log(`   Reply-To: ${replyTo}`);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout (Gmail SMTP can be slow)

    try {
      // Send email via backend API
      const response = await fetch(`${backendUrl}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${backendApiKey}`,
        },
        body: JSON.stringify({
          to,
          subject,
          body: html || body,
          replyTo,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("✅ Email sent successfully via backend");
        return {
          success: true,
          messageId: result.messageId,
        };
      } else {
        console.error("❌ Email send failed:", result.error);

        // Provide helpful error message for Gmail authentication issues
        let userFriendlyError = result.error || "Failed to send email via backend";
        if (result.error && result.error.includes("Invalid login")) {
          userFriendlyError = "Gmail authentication failed. The app password needs to be regenerated. Please contact your administrator to update the Gmail credentials.";
        }

        return {
          success: false,
          error: userFriendlyError,
        };
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Error sending email via backend:", error);

    return {
      success: false,
      error: error.message || String(error),
    };
  }
};

/**
 * Check if Bridge Team user has permission to send emails
 * Bridge Team users, Bridge Team leaders, and admins can send emails
 */
export const canSendBridgeTeamEmail = (userRole: string): boolean => {
  const allowedRoles = ["admin", "bridge_team", "bridge_team_leader"];
  return allowedRoles.includes(userRole);
};

/**
 * Send a Bridge Team email to a participant
 * This is specifically for Bridge Team follow-up communications
 */
export const sendBridgeTeamEmail = async (
  participantEmail: string,
  participantName: string,
  message: string,
  senderName: string = "Bridge Team"
): Promise<GmailEmailResult> => {
  const emailFrom = process.env.EXPO_PUBLIC_EMAIL_FROM || "Bridge Team <bridgeteam@7more.net>";

  const subject = `Message from ${senderName} - 7more`;

  const body = `
Hello ${participantName},

${message}

If you have any questions or need assistance, please feel free to reach out to us.

Best regards,
${senderName}
7more Organization

---
This email was sent from Bridge Team at bridgeteam@7more.net
  `.trim();

  return sendGmailEmail({
    to: participantEmail,
    subject,
    body,
    replyTo: "bridgeteam@7more.net",
  });
};

/**
 * Send resources email to participant via Gmail SMTP
 * This replaces the Resend email service for Bridge Team communications
 */
export const sendBridgeTeamResourcesEmail = async (
  participantEmail: string,
  participantName: string,
  resources: Array<{ title: string; content: string; category: string }>,
  senderName: string = "Bridge Team"
): Promise<GmailEmailResult> => {
  const subject = `Resources from ${senderName} - 7more`;

  // Build the email body with all resources
  let resourcesText = "";
  resources.forEach((resource) => {
    resourcesText += "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    resourcesText += `${resource.title}\n`;
    resourcesText += `Category: ${resource.category}\n`;
    resourcesText += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    resourcesText += `${resource.content}\n`;
  });

  const body = `
Hello ${participantName},

We are sending you the following resources that may be helpful to you:
${resourcesText}

If you have any questions about these resources or need additional assistance, please feel free to reach out to us.

Best regards,
${senderName}
7more Organization

---
This email was sent from Bridge Team at bridgeteam@7more.net
  `.trim();

  return sendGmailEmail({
    to: participantEmail,
    subject,
    body,
    replyTo: "bridgeteam@7more.net",
  });
};
