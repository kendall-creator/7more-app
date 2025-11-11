/**
 * Test Gmail SMTP from app - simulates what the Bridge Team form does
 */

// Simulate the environment
process.env.EXPO_PUBLIC_BACKEND_URL = "http://172.17.0.2:3001";
process.env.EXPO_PUBLIC_EMAIL_API_KEY = "7more-secure-api-key-2024";

// Import the function
const { sendBridgeTeamResourcesEmail } = require("./src/api/gmail-smtp");

const testFromApp = async () => {
  console.log("🧪 Testing Gmail SMTP from App Context");
  console.log("=" + "=".repeat(50));
  console.log("Environment:");
  console.log(`  EXPO_PUBLIC_BACKEND_URL: ${process.env.EXPO_PUBLIC_BACKEND_URL}`);
  console.log(`  EXPO_PUBLIC_EMAIL_API_KEY: ${process.env.EXPO_PUBLIC_EMAIL_API_KEY ? "Set" : "NOT SET"}`);
  console.log("=" + "=".repeat(50));

  const testRecipient = "KendallBlanton11@gmail.com";
  const participantName = "Test Participant";

  const testResources = [
    {
      title: "Test Resource 1",
      content: "This is a test resource with helpful information.",
      category: "Employment",
    },
    {
      title: "Test Resource 2",
      content: "This is another test resource for housing assistance.",
      category: "Housing",
    },
  ];

  try {
    console.log("\n📧 Sending test email from Bridge Team context...");
    console.log(`   To: ${testRecipient}`);
    console.log(`   Participant: ${participantName}`);
    console.log(`   Resources: ${testResources.length} items`);

    const result = await sendBridgeTeamResourcesEmail(
      testRecipient,
      participantName,
      testResources,
      "Bridge Team"
    );

    if (result.success) {
      console.log("\n✅ TEST PASSED - Email sent successfully!");
      console.log(`   Message ID: ${result.messageId}`);
      console.log("\n📬 Check the inbox at KendallBlanton11@gmail.com");
    } else {
      console.error("\n❌ TEST FAILED - Email not sent");
      console.error(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.error("\n❌ TEST FAILED - Exception thrown");
    console.error(`   Error: ${error.message}`);
    console.error(error);
  }

  console.log("\n" + "=".repeat(50));
};

// Run the test
testFromApp();
