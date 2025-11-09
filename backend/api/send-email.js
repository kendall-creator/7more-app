/**
 * Secure Email Sending API
 *
 * This serverless function sends emails using Gmail SMTP.
 * All credentials are stored server-side and never exposed to the client.
 *
 * Deploy to Vercel for free serverless hosting.
 */

const nodemailer = require("nodemailer");

/**
 * CORS headers for allowing requests from your app
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // In production, replace with your app domain
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Serverless function handler
 */
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Use POST."
    });
  }

  try {
    // Validate authorization (simple API key check)
    const authHeader = req.headers.authorization;
    const expectedApiKey = process.env.API_SECRET_KEY;

    if (!authHeader || authHeader !== `Bearer ${expectedApiKey}`) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized. Invalid API key."
      });
    }

    // Get request body
    const { to, subject, body, participantName } = req.body;

    // Validate required fields
    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, subject, body"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address format"
      });
    }

    // Get Gmail SMTP credentials from server environment variables (NEVER exposed to client)
    const gmailEmail = process.env.BRIDGE_TEAM_EMAIL;
    const gmailPassword = process.env.BRIDGE_TEAM_EMAIL_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");

    if (!gmailEmail || !gmailPassword) {
      console.error("SMTP credentials not configured");
      return res.status(500).json({
        success: false,
        error: "Email service not configured on server"
      });
    }

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // Use STARTTLS
      auth: {
        user: gmailEmail,
        pass: gmailPassword,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Bridge Team - 7more" <${gmailEmail}>`,
      to: to,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, "<br>"), // Simple HTML conversion
    });

    console.log("Email sent successfully:", info.messageId);

    // Return success response
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
    });

  } catch (error) {
    console.error("Error sending email:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send email"
    });
  }
};
