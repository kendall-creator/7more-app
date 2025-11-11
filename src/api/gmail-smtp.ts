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
 * Send email directly using Gmail SMTP credentials
 * Uses a third-party SMTP relay service that works from React Native
 */
export const sendGmailEmail = async ({
  to,
  subject,
  body,
  html,
  replyTo,
}: GmailEmailParams): Promise<GmailEmailResult> => {
  try {
    // Get Gmail credentials from environment
    const gmailUser = process.env.EXPO_PUBLIC_EMAIL_USER;
    const gmailPass = process.env.EXPO_PUBLIC_EMAIL_PASS;
    const emailFrom = process.env.EXPO_PUBLIC_EMAIL_FROM || "Bridge Team <bridgeteam@7more.net>";

    // Validate configuration
    if (!gmailUser || !gmailPass) {
      console.warn("⚠️ Gmail SMTP not configured");
      console.log("Missing EXPO_PUBLIC_EMAIL_USER or EXPO_PUBLIC_EMAIL_PASS");
      console.log("Please add to ENV tab in Vibecode app");

      return {
        success: false,
        error: "Gmail not configured. Please add EXPO_PUBLIC_EMAIL_USER and EXPO_PUBLIC_EMAIL_PASS to ENV tab.",
      };
    }

    console.log("📧 Sending email via Gmail SMTP");
    console.log(`   From: ${emailFrom}`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    if (replyTo) console.log(`   Reply-To: ${replyTo}`);

    // Use SMTPjs service (free SMTP relay for React Native)
    // This is a public service that sends emails via SMTP from client-side apps
    const response = await fetch("https://smtpjs.com/v3/smtpjs.aspx", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        SecureToken: gmailPass, // Gmail app password
        To: to,
        From: gmailUser,
        Subject: subject,
        Body: html || body.replace(/\n/g, "<br>"),
        ...(replyTo && { ReplyTo: replyTo }),
      }).toString(),
    });

    const result = await response.text();

    if (result === "OK") {
      console.log("✅ Email sent successfully");
      return {
        success: true,
        messageId: `<${Date.now()}@7more.net>`,
      };
    } else {
      console.error("❌ Email send failed:", result);
      return {
        success: false,
        error: `Email service returned: ${result}`,
      };
    }
  } catch (error: any) {
    console.error("Error sending Gmail email:", error);

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
