/**
 * Email Service for sending emails using Resend API
 *
 * This service sends emails directly from the mobile app using Resend.
 * No custom backend required!
 *
 * Setup:
 * 1. Sign up at https://resend.com (free tier available)
 * 2. Get your API key
 * 3. Add domain or use onboarding@resend.dev for testing
 * 4. Add EXPO_PUBLIC_EMAIL_API_KEY to ENV tab in Vibecode
 * 5. (Optional) Add EXPO_PUBLIC_EMAIL_FROM for custom sender
 */

interface EmailParams {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}

/**
 * Send a welcome email to a newly added user
 */
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string,
  password: string,
  organizationName: string = "7more",
  appLink: string = "https://7more.org/app"
): Promise<{ success: boolean; error?: string }> => {
  try {
    const subject = `Welcome to ${organizationName} - Your Account Details`;
    const body = `
Hello ${userName},

Welcome to ${organizationName}! An admin has created an account for you.

Here are your login credentials:

Email: ${userEmail}
Password: ${password}

Download the app: ${appLink}

To access the app:
1. Download the ${organizationName} app from the link above
2. Log in with the credentials above
3. You can change your password anytime in your account settings

If you have any questions or need assistance, please contact your administrator.

Best regards,
${organizationName} Team

---
This is an automated message. Please do not reply to this email.
    `.trim();

    // Send the email using the configured email service
    const result = await sendEmail({
      to: userEmail,
      subject,
      body,
    });

    return result;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return {
      success: false,
      error: String(error),
    };
  }
};

/**
 * Send a password reset email
 */
export const sendPasswordResetEmail = async (
  userEmail: string,
  userName: string,
  newPassword: string,
  organizationName: string = "7more"
): Promise<{ success: boolean; error?: string }> => {
  try {
    const subject = `Password Reset - ${organizationName}`;
    const body = `
Hello ${userName},

Your administrator has reset your password.

Here is your new password:

Password: ${newPassword}

To access the app:
1. Open the ${organizationName} app
2. Log in with your email and the new password above
3. You can change your password anytime in your account settings

If you did not request this password reset, please contact your administrator immediately.

Best regards,
${organizationName} Team

---
This is an automated message. Please do not reply to this email.
    `.trim();

    const result = await sendEmail({
      to: userEmail,
      subject,
      body,
    });

    return result;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      error: String(error),
    };
  }
};

/**
 * Core email sending function using Resend API
 * Sends emails directly from the mobile app - no backend needed!
 *
 * For Bridge Team emails, this uses bridgeteam@7more.net as the sender
 */
const sendEmail = async ({ to, subject, body, replyTo }: EmailParams): Promise<{ success: boolean; error?: string }> => {
  // Check if email service is configured
  const emailApiKey = process.env.EXPO_PUBLIC_EMAIL_API_KEY;
  // Always use Bridge Team email as sender for consistency
  const emailFrom = process.env.EXPO_PUBLIC_EMAIL_FROM || "7more Bridge Team <bridgeteam@7more.net>";

  if (!emailApiKey) {
    console.warn("⚠️ Email service not configured. Email will not be sent.");
    console.log("\n=== EMAIL WOULD HAVE BEEN SENT ===");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:", body);
    console.log("===================================\n");

    return {
      success: false,
      error: "Email service not configured. Please add EXPO_PUBLIC_EMAIL_API_KEY to ENV tab. Get a free key at https://resend.com",
    };
  }

  try {
    console.log(`📧 Sending email via Resend API`);
    console.log(`   From: ${emailFrom}`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    if (replyTo) console.log(`   Reply-To: ${replyTo}`);

    // Using Resend API (free service)
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${emailApiKey}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [to],
        subject,
        text: body,
        ...(replyTo && { reply_to: replyTo }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      const errorMessage = errorData.error || errorData.message || `API returned ${response.status}`;
      console.log(`ℹ️ Email not sent: ${errorMessage}`);
      console.log("Note: Email service is optional. Configure EXPO_PUBLIC_EMAIL_API_KEY in ENV tab if needed.");
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log(`✅ Email sent successfully! ID: ${result.id}`);
    return { success: true };
  } catch (error: any) {
    console.log("ℹ️ Email service unavailable:", error.message || String(error));
    console.log("This is expected if email service is not configured. The app will continue to work normally.");
    return {
      success: false,
      error: error.message || String(error),
    };
  }
};

/**
 * Generate a password from user's name (first initial + last name)
 * Example: "John Doe" becomes "jdoe"
 */
export const generatePasswordFromName = (fullName: string): string => {
  const nameParts = fullName.trim().split(/\s+/);

  if (nameParts.length === 1) {
    // If only one name, use it in lowercase
    return nameParts[0].toLowerCase();
  }

  // First initial + last name
  const firstInitial = nameParts[0][0].toLowerCase();
  const lastName = nameParts[nameParts.length - 1].toLowerCase();

  return firstInitial + lastName;
};

/**
 * Send resources email to participant using Resend
 * Uses bridgeteam@7more.net as reply-to address
 */
export const sendResourcesEmail = async (
  participantEmail: string,
  participantName: string,
  resources: Array<{ title: string; content: string; category: string }>,
  organizationName: string = "7more"
): Promise<{ success: boolean; error?: string }> => {
  try {
    const subject = `Resources from ${organizationName}`;

    // Build the email body with all resources
    let resourcesText = "";
    resources.forEach((resource) => {
      resourcesText += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      resourcesText += `${resource.title}\n`;
      resourcesText += `Category: ${resource.category}\n`;
      resourcesText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      resourcesText += `${resource.content}\n`;
    });

    const body = `
Hello ${participantName},

We are sending you the following resources that may be helpful to you:
${resourcesText}

If you have any questions about these resources or need additional assistance, please feel free to reach out to us.

Best regards,
${organizationName} Team

---
This is an automated message. Please do not reply to this email.
    `.trim();

    // Send the email using Resend with bridgeteam@7more.net as reply-to
    const result = await sendEmail({
      to: participantEmail,
      subject,
      body,
      replyTo: "bridgeteam@7more.net",
    });

    return result;
  } catch (error) {
    console.error("Error sending resources email:", error);
    return {
      success: false,
      error: String(error),
    };
  }
};
