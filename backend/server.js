/**
 * Secure Email Sending Backend for 7more App
 *
 * This Express server handles email sending using Gmail SMTP.
 * All credentials are stored server-side and never exposed to the client.
 */

// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

const WORKSPACE_DIR = "/home/user/workspace/";

// Middleware
app.use(cors()); // Allow requests from any origin (can be restricted later)
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "7more Email Backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "7more Email Backend",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Email sending endpoint
 * POST /api/send-email
 */
app.post("/api/send-email", async (req, res) => {
  try {
    // Validate authorization
    const authHeader = req.headers.authorization;
    const expectedApiKey = process.env.EMAIL_API_KEY || process.env.API_SECRET_KEY;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized. Missing or invalid authorization header.",
      });
    }

    const providedKey = authHeader.replace("Bearer ", "");
    if (providedKey !== expectedApiKey) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized. Invalid API key.",
      });
    }

    // Get request body
    const { to, subject, body } = req.body;

    // Validate required fields
    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, subject, body",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address format",
      });
    }

    // Get Gmail SMTP credentials from server environment (NEVER exposed to client)
    const gmailEmail = process.env.BRIDGE_TEAM_EMAIL;
    const gmailPassword = process.env.BRIDGE_TEAM_EMAIL_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpSecure = process.env.SMTP_SECURE === "true";

    if (!gmailEmail || !gmailPassword) {
      console.error("SMTP credentials not configured");
      return res.status(500).json({
        success: false,
        error: "Email service not configured on server. Please configure BRIDGE_TEAM_EMAIL and BRIDGE_TEAM_EMAIL_PASSWORD.",
      });
    }

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure, // true for 465, false for other ports
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

    console.log("✅ Email sent successfully:", {
      messageId: info.messageId,
      to: to,
      subject: subject,
      timestamp: new Date().toISOString(),
    });

    // Return success response
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send email",
    });
  }
});

// =============================================
// FILE MANAGEMENT ENDPOINTS
// =============================================

/**
 * List files in workspace
 * GET /api/files/list
 */
app.get("/api/files/list", (req, res) => {
  try {
    const files = fs.readdirSync(WORKSPACE_DIR);

    const filesWithInfo = files.map((fileName) => {
      const filePath = path.join(WORKSPACE_DIR, fileName);
      try {
        const stats = fs.statSync(filePath);
        return {
          name: fileName,
          path: filePath,
          size: stats.size,
          isDirectory: stats.isDirectory(),
          modifiedTime: Math.floor(stats.mtimeMs / 1000), // Convert to seconds
        };
      } catch (error) {
        return {
          name: fileName,
          path: filePath,
          size: 0,
          isDirectory: false,
          modifiedTime: 0,
        };
      }
    });

    // Sort: directories first, then by name
    filesWithInfo.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json({ success: true, files: filesWithInfo });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ success: false, error: "Failed to list files" });
  }
});

/**
 * Download a specific file
 * GET /api/files/download/:filename
 */
app.get("/api/files/download/:filename", (req, res) => {
  try {
    const fileName = req.params.filename;
    const filePath = path.join(WORKSPACE_DIR, fileName);

    // Security check: ensure file is within workspace
    const resolvedPath = path.resolve(filePath);
    const resolvedWorkspace = path.resolve(WORKSPACE_DIR);
    if (!resolvedPath.startsWith(resolvedWorkspace)) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    // Check if it is a file (not directory)
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot download directories" });
    }

    // Get mime type
    const getMimeType = (fileName) => {
      const ext = path.extname(fileName).toLowerCase();
      const mimeTypes = {
        ".zip": "application/zip",
        ".pdf": "application/pdf",
        ".json": "application/json",
        ".txt": "text/plain",
        ".md": "text/markdown",
        ".html": "text/html",
        ".js": "text/javascript",
        ".ts": "text/typescript",
        ".tsx": "text/typescript",
        ".jsx": "text/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
      };
      return mimeTypes[ext] || "application/octet-stream";
    };

    // Set appropriate headers
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", getMimeType(fileName));
    res.setHeader("Content-Length", stats.size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ success: false, error: "Failed to download file" });
  }
});

// Start server on all interfaces (0.0.0.0) to allow access from mobile devices
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 7more Email Backend running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.BRIDGE_TEAM_EMAIL || "Not configured"}`);
  console.log(`🔐 API Key configured: ${process.env.EMAIL_API_KEY ? "Yes" : "No"}`);
  console.log(`🌐 Accessible at:`);
  console.log(`   - http://localhost:${PORT}`);
  console.log(`   - http://172.17.0.2:${PORT}`);
  console.log(`   - http://0.0.0.0:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});
