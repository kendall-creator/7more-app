/**
 * Test script to send email using Resend API
 * Run with: RESEND_API_KEY=re_xxx node test-resend-email.js
 */

const { Resend } = require('resend');

async function testEmail() {
  console.log('🧪 Testing Resend Email Service...\n');

  // Use the API key directly
  const resendApiKey = 're_Qy3mKgtN_DJC97ndnTw1WVxdTBWNw1iLj';

  console.log('✅ RESEND_API_KEY found');
  console.log(`   Key starts with: ${resendApiKey.substring(0, 8)}...`);

  // Initialize Resend
  const resend = new Resend(resendApiKey);

  // Test email content
  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 15px; color:#222; max-width: 600px; margin: 0 auto;">
      <p style="margin-bottom: 16px;">Hello Kendall,</p>

      <p style="margin-bottom: 16px;">This is a test email from the bulk selection feature! Here are some example resources:</p>

      <ul style="margin-bottom: 24px; padding-left: 20px;">
        <li style="margin-bottom: 16px;">
          <strong style="color: #1f2937;">Employment Resources</strong>
          <br/><span style="color: #4b5563;">Job training and placement services</span>
        </li>
        <li style="margin-bottom: 16px;">
          <strong style="color: #1f2937;">Housing Assistance</strong>
          <br/><span style="color: #4b5563;">Transitional housing and support</span>
        </li>
        <li style="margin-bottom: 16px;">
          <strong style="color: #1f2937;">Clothing Donation</strong>
          <br/><span style="color: #4b5563;">Professional attire for interviews</span>
        </li>
      </ul>

      <div style="margin-bottom: 24px; padding: 16px; background-color: #f3f4f6; border-left: 4px solid #6366f1; border-radius: 4px;">
        <strong style="color: #1f2937;">Additional Notes:</strong>
        <br/><span style="color: #4b5563; margin-top: 8px; display: block;">
          Testing the bulk selection feature with email integration. The mentor filtering has been fixed to show all mentors, mentorship leaders, and admins!
        </span>
      </div>

      <p style="margin-bottom: 16px;">If you need help or have questions, you can reply directly to this email.</p>

      <p style="margin-bottom: 8px;">
        Blessings,<br/>
        Claude (Testing)<br/>
        7more Bridge Team<br/>
        <a href="mailto:bridgeteam@7more.net" style="color: #2563eb;">bridgeteam@7more.net</a>
      </p>

      <p style="font-size: 12px; color: #777; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        This is a test email from the bulk selection feature implementation.
      </p>
    </div>
  `;

  try {
    console.log('\n📧 Sending test email...');
    console.log('   From: 7more Bridge Team <bridgeteam@7more.net>');
    console.log('   To: kendall@7more.net');
    console.log('   Subject: Test - Bulk Selection Feature Email');

    const result = await resend.emails.send({
      from: '7more Bridge Team <bridgeteam@7more.net>',
      to: 'kendall@7more.net',
      subject: 'Test - Bulk Selection Feature Email',
      html,
    });

    if (result.error) {
      console.error('\n❌ Resend API Error:');
      console.error(JSON.stringify(result.error, null, 2));
      process.exit(1);
    }

    console.log('\n✅ Email sent successfully!');
    console.log(`   Message ID: ${result.data?.id}`);
    console.log('\n📬 Check kendall@7more.net inbox for the test email!');

  } catch (error) {
    console.error('\n❌ Error sending email:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testEmail();
