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
 * - EXPO_PUBLIC_BACKEND_URL: Backend server URL (default: http://172.17.0.2:3001)
 * - EXPO_PUBLIC_BACKEND_API_KEY: API key for backend authentication
 */

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
 * Send email via Gmail SMTP using the backend server
 */
export const sendGmailEmail = async ({
  to,
  subject,
  body,
  html,
  replyTo,
}: GmailEmailParams): Promise<GmailEmailResult> => {
  try {
    // Get backend configuration
    // Default to Docker host IP (172.17.0.1) so mobile device can connect
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://172.17.0.1:3001";
    const apiKey = process.env.EXPO_PUBLIC_BACKEND_API_KEY;

    // Validate configuration
    if (!apiKey) {
      console.warn("⚠️ Gmail SMTP backend not configured");
      console.log("Missing EXPO_PUBLIC_BACKEND_API_KEY environment variable");
      console.log("Please add to ENV tab in Vibecode app");

      return {
        success: false,
        error: "Gmail SMTP backend not configured. Please add EXPO_PUBLIC_BACKEND_API_KEY to ENV tab.",
      };
    }

    console.log("📧 Sending email via Gmail SMTP backend");
    console.log(`   Backend: ${backendUrl}`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    if (replyTo) console.log(`   Reply-To: ${replyTo}`);

    // Send request to backend email endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${backendUrl}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
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

      if (!response.ok) {
        console.error("❌ Backend email service error:", result.error);
        return {
          success: false,
          error: result.error || `Backend returned ${response.status}`,
        };
      }

      console.log("✅ Email sent successfully via Gmail SMTP");
      if (result.messageId) {
        console.log(`   Message ID: ${result.messageId}`);
      }

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Error sending Gmail SMTP email:", error);

    // Provide more helpful error messages
    let errorMessage = error.message || String(error);
    if (error.name === "AbortError" || errorMessage.includes("timeout")) {
      errorMessage = "Backend server not responding. Please ensure the backend is running on port 3001.";
      console.log("💡 Tip: Try restarting the backend server");
    } else if (errorMessage.includes("Network request failed")) {
      errorMessage = "Cannot connect to backend server. Trying alternate connection methods...";
      console.log("💡 Backend URL:", process.env.EXPO_PUBLIC_BACKEND_URL || "http://172.17.0.1:3001");
      console.log("💡 Tip: The mobile device may not be able to reach the backend server.");
      console.log("💡 Make sure EXPO_PUBLIC_BACKEND_URL and EXPO_PUBLIC_BACKEND_API_KEY are set in ENV tab");
    }

    return {
      success: false,
      error: errorMessage,
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
