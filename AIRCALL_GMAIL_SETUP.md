# AirCall & Gmail Integration Configuration

This document explains how to configure AirCall for automatic calling/texting and Bridge Team Gmail for automatic emailing.

## AirCall Integration

### Overview
The app automatically uses AirCall for calls and SMS if it's installed on the device, with seamless fallback to native phone/SMS apps.

### Configuration Steps

1. **Get AirCall URL Scheme**
   - Contact AirCall support or check their developer documentation for the exact URL scheme
   - Common patterns include:
     - SMS: `aircall://sms?number={number}&body={message}`
     - Call: `aircall://call?number={number}`

2. **Update Configuration**
   - Open `/src/utils/aircall.ts`
   - Update the URL scheme constants at the top of the file:

```typescript
// UPDATE THESE with the correct AirCall URL schemes
const AIRCALL_SMS_SCHEME = "aircall://sms"; // Replace with actual scheme
const AIRCALL_CALL_SCHEME = "aircall://call"; // Replace with actual scheme
```

3. **Test the Integration**
   - Ensure AirCall app is installed on your device
   - Go to Bridge Team Follow-Up Form
   - Select resources and click the SMS button
   - The app should automatically open AirCall instead of native SMS

### How It Works

- **Automatic Detection**: The app checks if AirCall is installed before attempting to use it
- **Seamless Fallback**: If AirCall isn't installed, it automatically uses native SMS/phone apps
- **No User Action Required**: Users don't need to manually choose - it just works!

### Locations Using AirCall Integration

1. **Bridge Team Follow-Up Form** (`/src/screens/BridgeTeamFollowUpFormScreen.tsx`)
   - SMS button in Section 5 (Resources Sent)
   - Automatically uses AirCall when participant has phone number

2. **Initial Contact Form** (`/src/screens/InitialContactFormScreen.tsx`)
   - SMS button in Resources section
   - Available when participant has phone number

---

## Bridge Team Gmail Integration

### Overview
Configure automatic emailing from the Bridge Team's Gmail account to participants.

### Prerequisites

1. **Gmail Account**: Have the Bridge Team Gmail address ready
2. **App Password**: Gmail requires an "App Password" for third-party apps
   - Go to Google Account Settings > Security > 2-Step Verification > App Passwords
   - Generate a new app password for "Mail"

### Configuration Steps

#### Option 1: Using Environment Variables (Recommended)

1. Open the Vibecode app
2. Go to the **ENV** tab
3. Add these environment variables:

```
EXPO_PUBLIC_BRIDGE_TEAM_EMAIL=bridgeteam@7more.net
EXPO_PUBLIC_BRIDGE_TEAM_EMAIL_PASSWORD=your-app-password-here
EXPO_PUBLIC_SMTP_HOST=smtp.gmail.com
EXPO_PUBLIC_SMTP_PORT=587
EXPO_PUBLIC_EMAIL_API_KEY=your-resend-api-key (get free at https://resend.com)
```

4. The email service will automatically use these credentials

#### Option 2: Direct Code Configuration (Not Recommended for Production)

1. Open `/src/services/emailService.ts`
2. Update the email configuration:

```typescript
const BRIDGE_TEAM_EMAIL = "your-bridge-team@gmail.com";
const BRIDGE_TEAM_PASSWORD = "your-app-password-here";
```

**⚠️ Security Warning**: Never commit actual credentials to version control!

### How to Use Gmail Integration

#### For Bridge Team Members:

1. Open Bridge Team Follow-Up Form
2. Go to Section 5 (Resources Sent)
3. Select resources to send
4. Click **Email** button
5. Resources will be automatically emailed from the Bridge Team Gmail to the participant's email

#### For Mentors:

1. Open Initial Contact Form
2. Scroll to Resources section
3. Select resources
4. Click **Email** button (when implemented)
5. Resources sent from Bridge Team Gmail

### Email Format

Emails are automatically formatted with the Bridge Team Gmail as the sender:

```
From: Bridge Team <bridgeteam@7more.net>
To: participant@email.com
Subject: Resources from 7more

Hello [Participant Name],

We are sending you the following resources that may be helpful to you:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Resource Title]
Category: [Category]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Resource Content]

If you have any questions about these resources or need additional assistance, please feel free to reach out to us.

Best regards,
7more Team

---
This is an automated message. Please do not reply to this email.
```

### Troubleshooting

**Email Not Sending?**
1. Verify you have both Gmail App Password AND Resend API key configured
2. Check that 2-Step Verification is enabled on Gmail account (bridgeteam@7more.net)
3. Verify environment variables are set correctly in ENV tab:
   - EXPO_PUBLIC_BRIDGE_TEAM_EMAIL=bridgeteam@7more.net
   - EXPO_PUBLIC_BRIDGE_TEAM_EMAIL_PASSWORD=[your-app-password]
   - EXPO_PUBLIC_EMAIL_API_KEY=[your-resend-api-key]
4. Check participant has valid email address in their profile
5. View logs in expo.log file for detailed error messages

**AirCall Not Opening?**
1. Verify AirCall app is installed on device
2. Check URL scheme is correctly configured in `/src/utils/aircall.ts`
3. Test with native SMS first (it should fallback automatically)
4. Check participant has valid phone number

### Security Best Practices

1. ✅ **Always use Environment Variables** for credentials
2. ✅ **Use Gmail App Passwords**, never your actual Gmail password
3. ✅ **Rotate App Passwords** periodically
4. ❌ **Never commit credentials** to version control
5. ❌ **Never share credentials** in screenshots or documentation

---

## Testing

### Test AirCall Integration:
1. Have AirCall installed on device
2. Go to Bridge Team Follow-Up Form
3. Add participant phone number
4. Select resources
5. Click SMS button
6. Verify AirCall opens (or native SMS as fallback)

### Test Gmail Integration:
1. Configure Gmail credentials in ENV tab
2. Go to Bridge Team Follow-Up Form
3. Add participant email address
4. Select resources
5. Click Email button
6. Check participant's email inbox

---

## Support

For AirCall URL scheme documentation, contact AirCall support at: https://aircall.io/support/

For Gmail App Password help: https://support.google.com/accounts/answer/185833
