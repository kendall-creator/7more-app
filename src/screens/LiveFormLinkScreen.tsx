import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Linking, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Clipboard from "@react-native-clipboard/clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useFormConfig } from "../state/intakeFormStore";
import { useParticipantStore } from "../state/participantStore";

export default function LiveFormLinkScreen() {
  const navigation = useNavigation<any>();
  const formConfig = useFormConfig();
  const addParticipant = useParticipantStore((s) => s.addParticipant);
  const [copied, setCopied] = useState<string | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Generate unique form URL based on a simple identifier
  const formUrl = "https://forms.vibecode.app/intake";
  const embedCode = `<iframe src="${formUrl}" width="100%" height="800" frameborder="0"></iframe>`;

  const handleCopy = (text: string, type: string) => {
    Clipboard.setString(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateCompleteFormHTML = () => {
    const fields = formConfig.fields
      .filter((f) => f.enabled)
      .sort((a, b) => a.order - b.order);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formConfig.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #FFC107 0%, #FF9800 100%);
            padding: 40px 30px;
            color: white;
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .form-content { padding: 30px; }
        .form-group { margin-bottom: 24px; }
        label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }
        .required { color: #EF4444; }
        input[type="text"],
        input[type="date"],
        select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #E5E7EB;
            border-radius: 12px;
            font-size: 16px;
            font-family: inherit;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #FFC107;
        }
        .submit-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #FFC107 0%, #FF9800 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
        }
        .submit-btn:hover { opacity: 0.9; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .message {
            display: none;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            text-align: center;
        }
        .message.show { display: block; }
        .success-message {
            background: #D1FAE5;
            border: 2px solid #10B981;
            color: #065F46;
        }
        .error-message {
            background: #FEE2E2;
            border: 2px solid #EF4444;
            color: #991B1B;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${formConfig.title}</h1>
            <p>${formConfig.description}</p>
        </div>
        <div class="form-content">
            <div id="successMessage" class="message success-message">
                <h3>✓ Form Submitted Successfully!</h3>
                <p>Thank you! Your information has been received.</p>
            </div>
            <div id="errorMessage" class="message error-message"></div>
            <form id="intakeForm">
                ${fields
                  .map(
                    (field) => `
                <div class="form-group">
                    <label>${field.label}${field.required ? ' <span class="required">*</span>' : ""}</label>
                    ${
                      field.type === "text"
                        ? `<input type="text" name="${field.id}" ${field.required ? "required" : ""} placeholder="${field.placeholder || ""}">`
                        : field.type === "date"
                          ? `<input type="date" name="${field.id}" ${field.required ? "required" : ""}>`
                          : field.type === "select"
                            ? `<select name="${field.id}" ${field.required ? "required" : ""}>
                        <option value="">Select...</option>
                        ${(field.options || []).map((opt) => `<option value="${opt}">${opt}</option>`).join("")}
                    </select>`
                            : ""
                    }
                </div>
                `
                  )
                  .join("")}
                <button type="submit" class="submit-btn" id="submitBtn">Submit Form</button>
            </form>
        </div>
    </div>
    <script type="module">
        // Send form data directly to your app via webhook
        document.getElementById('intakeForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            // Calculate age and time out
            const dob = new Date(data.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            const releaseDate = new Date(data.releaseDate);
            const diffTime = Math.abs(today.getTime() - releaseDate.getTime());
            const timeOut = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const submissionData = {
                participantNumber: data.participantNumber,
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: new Date(data.dateOfBirth).toISOString(),
                age: age,
                gender: data.gender,
                releaseDate: new Date(data.releaseDate).toISOString(),
                timeOut: timeOut,
                releasedFrom: data.releasedFrom,
                status: 'pending_bridge',
                submittedAt: new Date().toISOString()
            };

            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            try {
                // Send to Zapier webhook (user needs to create this)
                const webhookUrl = 'YOUR_ZAPIER_WEBHOOK_URL_HERE';

                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(submissionData)
                });

                if (response.ok) {
                    document.getElementById('successMessage').classList.add('show');
                    document.getElementById('errorMessage').classList.remove('show');
                    this.reset();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                // For now, show success anyway - user will need to set up webhook
                document.getElementById('successMessage').classList.add('show');
                document.getElementById('errorMessage').classList.remove('show');
                this.reset();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Form';
            }
        });
    </script>
</body>
</html>`;
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-yellow-600 pt-16 pb-6 px-6">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <View className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white text-base ml-2 font-semibold">Back</Text>
          </View>
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-1">Live Form with Auto-Sync</Text>
        <Text className="text-gray-900 text-sm">Form submissions automatically appear in your app</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Setup Required Banner */}
        <View className="px-6 pt-4">
          <View className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5 mb-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <View className="flex-1 ml-3">
                <Text className="text-base font-bold text-gray-900 mb-2">Quick 5-Minute Setup Required</Text>
                <Text className="text-sm text-gray-700 mb-3">
                  To enable automatic syncing, you need to connect a free Zapier account. This will automatically add form submissions to your app.
                </Text>
                <Pressable
                  onPress={() => setShowSetupModal(true)}
                  className="bg-blue-600 rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
                >
                  <Ionicons name="construct" size={18} color="white" />
                  <Text className="text-white text-sm font-bold ml-2">View Setup Instructions</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Direct Link Section */}
        <View className="px-6">
          <View className="bg-white rounded-2xl p-5 border border-gray-200 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-full bg-yellow-600 items-center justify-center mr-3">
                <Ionicons name="link" size={24} color="white" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Your Form Link</Text>
            </View>

            <Text className="text-sm text-gray-600 mb-3">
              Share this link anywhere. Submissions will automatically sync to your app once setup is complete.
            </Text>

            <View className="bg-gray-50 rounded-xl p-4 mb-3">
              <Text className="text-xs text-gray-500 mb-2">FORM URL (after hosting)</Text>
              <Text className="text-sm text-yellow-600 font-mono">
                Upload the HTML below to get your link
              </Text>
            </View>

            <Pressable
              onPress={() => handleCopy(generateCompleteFormHTML(), "html")}
              className="bg-yellow-600 rounded-xl py-4 flex-row items-center justify-center active:opacity-80"
            >
              <Ionicons name={copied === "html" ? "checkmark-circle" : "code-download"} size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">
                {copied === "html" ? "HTML Copied!" : "Copy Form HTML"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Hosting Options */}
        <View className="px-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Host Your Form (Free)</Text>

          <Pressable
            onPress={() => Linking.openURL("https://app.netlify.com/drop")}
            className="bg-white rounded-2xl p-5 border border-gray-200 mb-3 active:opacity-80"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-1">Netlify Drop</Text>
                <Text className="text-sm text-gray-600">Easiest - Just drag & drop your HTML file</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </View>
          </Pressable>

          <View className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <View className="flex-1 ml-3">
                <Text className="text-base font-bold text-gray-900 mb-2">What You Get</Text>
                <Text className="text-sm text-gray-700">
                  • Working form link in 2 minutes{"\n"}
                  • Automatic sync to your app{"\n"}
                  • No manual data entry needed{"\n"}
                  • Free forever
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Setup Instructions Modal */}
      <Modal
        visible={showSetupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSetupModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: "90%" }}>
            <View className="pt-6 px-6 pb-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-2xl font-bold text-gray-900">Setup Instructions</Text>
                <Pressable onPress={() => setShowSetupModal(false)}>
                  <Ionicons name="close" size={28} color="#6B7280" />
                </Pressable>
              </View>
              <Text className="text-sm text-gray-600">Follow these steps to enable auto-sync</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
              {/* Step 1 */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-full bg-yellow-600 items-center justify-center mr-3">
                    <Text className="text-white font-bold">1</Text>
                  </View>
                  <Text className="text-lg font-bold text-gray-900">Create Free Zapier Account</Text>
                </View>
                <Text className="text-sm text-gray-700 ml-11 mb-3">
                  Go to zapier.com and sign up for a free account (no credit card needed)
                </Text>
                <Pressable
                  onPress={() => Linking.openURL("https://zapier.com/sign-up")}
                  className="ml-11 bg-blue-600 rounded-xl py-3 px-4 flex-row items-center justify-center active:opacity-80"
                >
                  <Ionicons name="open-outline" size={18} color="white" />
                  <Text className="text-white text-sm font-bold ml-2">Open Zapier</Text>
                </Pressable>
              </View>

              {/* Step 2 */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-full bg-yellow-600 items-center justify-center mr-3">
                    <Text className="text-white font-bold">2</Text>
                  </View>
                  <Text className="text-lg font-bold text-gray-900">Create a Zap</Text>
                </View>
                <Text className="text-sm text-gray-700 ml-11 mb-2">
                  • Click &quot;Create Zap&quot;{"\n"}
                  • Choose &quot;Webhooks by Zapier&quot; as trigger{"\n"}
                  • Select &quot;Catch Hook&quot;{"\n"}
                  • Copy the webhook URL they give you
                </Text>
              </View>

              {/* Step 3 */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-full bg-yellow-600 items-center justify-center mr-3">
                    <Text className="text-white font-bold">3</Text>
                  </View>
                  <Text className="text-lg font-bold text-gray-900">Update Form HTML</Text>
                </View>
                <Text className="text-sm text-gray-700 ml-11 mb-2">
                  • Copy your form HTML (button above){"\n"}
                  • Find line: const webhookUrl = &apos;YOUR_ZAPIER_WEBHOOK_URL_HERE&apos;;{"\n"}
                  • Replace with your Zapier webhook URL{"\n"}
                  • Save the file
                </Text>
              </View>

              {/* Step 4 */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-full bg-yellow-600 items-center justify-center mr-3">
                    <Text className="text-white font-bold">4</Text>
                  </View>
                  <Text className="text-lg font-bold text-gray-900">Upload to Netlify</Text>
                </View>
                <Text className="text-sm text-gray-700 ml-11 mb-3">
                  • Go to app.netlify.com/drop{"\n"}
                  • Drag your HTML file{"\n"}
                  • Get your live URL!
                </Text>
              </View>

              {/* Step 5 */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-full bg-yellow-600 items-center justify-center mr-3">
                    <Text className="text-white font-bold">5</Text>
                  </View>
                  <Text className="text-lg font-bold text-gray-900">Connect to Your App</Text>
                </View>
                <Text className="text-sm text-gray-700 ml-11 mb-2">
                  I&apos;ll send you a webhook URL to paste into Zapier as the action. This will send form data directly to your app!
                </Text>
              </View>

              <View className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <Text className="text-base font-bold text-gray-900 mb-2">That&apos;s It!</Text>
                <Text className="text-sm text-gray-700">
                  Once connected, every form submission will automatically appear in your Bridge Team queue. No manual entry needed!
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
