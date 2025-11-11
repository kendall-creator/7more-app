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

## Bridge Team Email Integration

### Overview
The app sends emails from **bridgeteam@7more.net** using the Resend email API service. This provides reliable email delivery with professional branding.

### How It Works
- **Sender Address**: All emails appear to come from "7more Bridge Team <bridgeteam@7more.net>"
- **Reply-To**: Set to bridgeteam@7more.net so recipients can reply directly
- **Service**: Resend API (modern email delivery service)
- **No Backend Needed**: Emails are sent directly from the mobile app

### Configuration Steps

1. **Verify Domain in Resend**
   - Go to [Resend Dashboard](https://resend.com/domains)
   - Add and verify the 7more.net domain
   - This allows sending emails from bridgeteam@7more.net

2. **Configure Environment Variables**
   - Open the Vibecode app
   - Go to the **ENV** tab
   - Ensure these variables are set:

```
EXPO_PUBLIC_EMAIL_API_KEY=your-resend-api-key
EXPO_PUBLIC_EMAIL_FROM=7more Bridge Team <bridgeteam@7more.net>
```

3. **The email service is now ready!**

### Prerequisites

1. **Resend Account**: Sign up at https://resend.com (free tier available)
2. **Domain Verification**: Verify 7more.net domain in Resend dashboard
3. **API Key**: Get your API key from Resend dashboard

### How to Use Email Integration

#### For Bridge Team Members:

1. Open Bridge Team Follow-Up Form
2. Go to Section 5 (Resources Sent)
3. Select resources to send
4. Click **Email** button
5. Resources will be automatically emailed from bridgeteam@7more.net to the participant's email

#### For Mentors:

1. Open Initial Contact Form
2. Scroll to Resources section
3. Select resources
4. Click **Email** button
5. Resources sent from bridgeteam@7more.net

### Email Format

Emails are automatically formatted with bridgeteam@7more.net as the sender:

```
From: 7more Bridge Team <bridgeteam@7more.net>
Reply-To: bridgeteam@7more.net
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
1. Verify you have Resend API key configured
2. Check that 7more.net domain is verified in Resend dashboard (https://resend.com/domains)
3. Verify environment variables are set correctly in ENV tab:
   - EXPO_PUBLIC_EMAIL_API_KEY=[your-resend-api-key]
   - EXPO_PUBLIC_EMAIL_FROM=7more Bridge Team <bridgeteam@7more.net>
4. Check participant has valid email address in their profile
5. View logs in expo.log file for detailed error messages

**Emails Going to Spam?**
1. Ensure domain is properly verified in Resend
2. Add SPF and DKIM records to your domain (provided by Resend)
3. Start with small volumes to build sender reputation

**AirCall Not Opening?**
1. Verify AirCall app is installed on device
2. Check URL scheme is correctly configured in `/src/utils/aircall.ts`
3. Test with native SMS first (it should fallback automatically)
4. Check participant has valid phone number

### Security Best Practices

1. ✅ **Always use Environment Variables** for credentials
2. ✅ **Keep Resend API keys secure** - never commit to version control
3. ✅ **Verify your domain** in Resend for best deliverability
4. ✅ **Monitor usage** in Resend dashboard
5. ❌ **Never commit credentials** to version control
6. ❌ **Never share API keys** in screenshots or documentation

---

## Testing

### Test AirCall Integration:
1. Have AirCall installed on device
2. Go to Bridge Team Follow-Up Form
3. Add participant phone number
4. Select resources
5. Click SMS button
6. Verify AirCall opens (or native SMS as fallback)

### Test Email Integration:
1. Configure Resend API key and sender address in ENV tab
2. Verify 7more.net domain in Resend dashboard
3. Go to Bridge Team Follow-Up Form
4. Add participant email address
5. Select resources
6. Click Email button
7. Check participant's email inbox (emails will appear from bridgeteam@7more.net)

---

## Support

For AirCall URL scheme documentation, contact AirCall support at: https://aircall.io/support/

For Resend API help: https://resend.com/docs

For domain verification: https://resend.com/domains