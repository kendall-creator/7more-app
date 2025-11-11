/**
 * Test script for Gmail SMTP email service
 * This script sends a test email to verify the email configuration
 */

const testEmail = async () => {
  const backendUrl = "http://172.17.0.2:3001";
  const apiKey = "7more-secure-api-key-2024";
  const testRecipient = "KendallBlanton11@gmail.com";

  console.log("🧪 Testing Gmail SMTP Email Service");
  console.log("=" .repeat(50));
  console.log(`Backend URL: ${backendUrl}`);
  console.log(`Test Recipient: ${testRecipient}`);
  console.log("=" .repeat(50));

  try {
    console.log("\n📧 Sending test email...");

    const response = await fetch(`${backendUrl}/api/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: testRecipient,
        subject: "Test Email from Bridge Team - 7more",
        body: `
Hello,

This is a test email from the Bridge Team email system at 7more.

The Gmail SMTP configuration is now active and working correctly!

Email Details:
- Sender: Bridge Team <bridgeteam@7more.net>
- SMTP Server: smtp.gmail.com:587
- TLS: Enabled
- Sent at: ${new Date().toLocaleString()}

If you receive this email, the configuration is successful.

Best regards,
Bridge Team
7more Organization

---
This is an automated test email.
        `.trim(),
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("\n✅ TEST PASSED - Email sent successfully!");
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Recipient: ${testRecipient}`);
      console.log("\n📬 Check the inbox at KendallBlanton11@gmail.com");
      console.log("   (Also check spam/junk folder if not in inbox)");
    } else {
      console.error("\n❌ TEST FAILED - Email not sent");
      console.error(`   Error: ${result.error}`);
      console.error(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.error("\n❌ TEST FAILED - Network or server error");
    console.error(`   Error: ${error.message}`);
  }

  console.log("\n" + "=".repeat(50));
};

// Run the test
testEmail();
