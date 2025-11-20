/**
 * Resend Email Service for Bridge Team
 *
 * Sends emails directly from the app using Resend API.
 * Uses bridgeteam@7more.net as the sender address.
 *
 * Setup:
 * 1. Add EXPO_PUBLIC_RESEND_API_KEY to ENV tab in Vibecode
 * 2. Domain 7more.net should already be verified in Resend
 */

import { Resend } from "resend";

interface ResendEmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

interface BridgeTeamEmailParams {
  participantEmail: string;
  participantName: string;
  resources: Array<{ title: string; description?: string }>;
  notes?: string;
  senderName: string;
}

/**
 * Generate HTML email template for Bridge Team resources
 */
function generateResourceEmailHTML({
  participantName,
  resources,
  notes,
  senderName,
}: {
  participantName: string;
  resources: Array<{ title: string; description?: string }>;
  notes?: string;
  senderName: string;
}): string {
  const resourceList = resources
    .map(
      (r) => `
      <li style="margin-bottom: 16px;">
        <strong style="color: #1f2937;">${r.title}</strong>
        ${r.description ? `<br/><span style="color: #4b5563;">${r.description}</span>` : ""}
      </li>
    `
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; font-size: 15px; color:#222; max-width: 600px; margin: 0 auto;">
      <p style="margin-bottom: 16px;">Hello ${participantName || "there"},</p>

      <p style="margin-bottom: 16px;">Here are the resources our Bridge Team shared with you today:</p>

      <ul style="margin-bottom: 24px; padding-left: 20px;">
        ${resourceList}
      </ul>

      ${notes ? `<div style="margin-bottom: 24px; padding: 16px; background-color: #f3f4f6; border-left: 4px solid #6366f1; border-radius: 4px;"><strong style="color: #1f2937;">Additional Notes:</strong><br/><span style="color: #4b5563; margin-top: 8px; display: block;">${notes}</span></div>` : ""}

      <p style="margin-bottom: 16px;">If you need help or have questions, you can reply directly to this email.</p>

      <p style="margin-bottom: 8px;">
        Blessings,<br/>
        ${senderName}<br/>
        7more Bridge Team<br/>
        <a href="mailto:bridgeteam@7more.net" style="color: #2563eb;">bridgeteam@7more.net</a>
      </p>

      <p style="font-size: 12px; color: #777; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        You received this email because a 7more Bridge Team member shared resources with you.
      </p>
    </div>
  `;
}

/**
 * Send Bridge Team resources email using Resend
 */
export async function sendBridgeTeamResourcesEmail({
  participantEmail,
  participantName,
  resources,
  notes,
  senderName,
}: BridgeTeamEmailParams): Promise<ResendEmailResult> {
  try {
    // Get Resend API key from environment
    const resendApiKey = process.env.EXPO_PUBLIC_RESEND_API_KEY;

    if (!resendApiKey) {
      console.log("⚠️  EXPO_PUBLIC_RESEND_API_KEY not configured - email functionality disabled");
      return {
        success: false,
        error: "Email service not configured. Please add EXPO_PUBLIC_RESEND_API_KEY to ENV tab.",
      };
    }

    // Initialize Resend client
    const resend = new Resend(resendApiKey);

    // Generate HTML content
    const html = generateResourceEmailHTML({
      participantName,
      resources,
      notes,
      senderName,
    });

    console.log("📧 Sending email via Resend...");
    console.log(`   From: 7more Bridge Team <bridgeteam@7more.net>`);
    console.log(`   To: ${participantEmail}`);
    console.log(`   Subject: Resources from 7more Bridge Team`);

    // Send email using Resend
    const result = await resend.emails.send({
      from: "7more Bridge Team <bridgeteam@7more.net>",
      to: participantEmail,
      subject: "Resources from 7more Bridge Team",
      html,
    });

    // Check if send was successful
    if (result.error) {
      console.error("❌ Resend error:", result.error);
      return {
        success: false,
        error: result.error.message || "Failed to send email",
      };
    }

    console.log("✅ Email sent successfully via Resend!");
    console.log(`   Message ID: ${result.data?.id}`);

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    return {
      success: false,
      error: error.message || String(error),
    };
  }
}
