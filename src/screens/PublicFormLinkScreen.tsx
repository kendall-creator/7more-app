import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Clipboard from "@react-native-clipboard/clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useFormConfig } from "../state/intakeFormStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PublicFormLinkScreen() {
  const navigation = useNavigation<any>();
  const formConfig = useFormConfig();
  const [copied, setCopied] = useState<string | null>(null);
  const [formId, setFormId] = useState<string>("");
  const [publicUrl, setPublicUrl] = useState<string>("");
  const [embedCode, setEmbedCode] = useState<string>("");

  useEffect(() => {
    generateFormId();
  }, []);

  const generateFormId = async () => {
    // Get or create a unique form ID for this app instance
    let storedFormId = await AsyncStorage.getItem("public_form_id");
    if (!storedFormId) {
      storedFormId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem("public_form_id", storedFormId);
    }
    setFormId(storedFormId);

    // Generate URLs using a free form hosting service
    // We'll use Formspree as an intermediary
    const url = `https://formspree.io/f/${storedFormId}`;
    setPublicUrl(url);

    // Generate embed code
    const embed = `<iframe src="${url}" width="100%" height="800" frameborder="0"></iframe>`;
    setEmbedCode(embed);
  };

  const handleCopy = (text: string, type: string) => {
    Clipboard.setString(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateFormHTML = () => {
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
        input[type="email"],
        textarea,
        select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #E5E7EB;
            border-radius: 12px;
            font-size: 16px;
            font-family: inherit;
        }
        input:focus, textarea:focus, select:focus {
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
        .success-message {
            display: none;
            background: #D1FAE5;
            border: 2px solid #10B981;
            color: #065F46;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            text-align: center;
        }
        .success-message.show { display: block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${formConfig.title}</h1>
            <p>${formConfig.description}</p>
        </div>
        <div class="form-content">
            <div id="successMessage" class="success-message">
                <h3>✓ Form Submitted Successfully!</h3>
                <p>Thank you! Your information has been received.</p>
            </div>
            <form id="intakeForm" action="https://formspree.io/f/${formId}" method="POST">
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
                <button type="submit" class="submit-btn">Submit Form</button>
            </form>
        </div>
    </div>
    <script>
        document.getElementById('intakeForm').addEventListener('submit', function(e) {
            setTimeout(() => {
                document.getElementById('successMessage').classList.add('show');
                this.reset();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1000);
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
        <Text className="text-2xl font-bold text-white mb-1">Public Form Links</Text>
        <Text className="text-gray-900 text-sm">Share your intake form with participants</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Direct Link Section */}
        <View className="px-6 py-4">
          <View className="bg-white rounded-2xl p-5 border border-gray-200 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-full bg-yellow-600 items-center justify-center mr-3">
                <Ionicons name="link" size={24} color="white" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Direct Link</Text>
            </View>

            <Text className="text-sm text-gray-600 mb-3">
              Share this link via text, email, or social media. Participants can fill out the form directly.
            </Text>

            <View className="bg-gray-50 rounded-xl p-4 mb-3">
              <Text className="text-xs text-gray-500 mb-2">YOUR FORM URL</Text>
              <Text className="text-sm text-yellow-600 font-mono" numberOfLines={2}>
                {publicUrl || "Generating..."}
              </Text>
            </View>

            <Pressable
              onPress={() => handleCopy(publicUrl, "url")}
              disabled={!publicUrl}
              className={`rounded-xl py-4 flex-row items-center justify-center ${
                publicUrl ? "bg-yellow-600 active:opacity-80" : "bg-gray-300"
              }`}
            >
              <Ionicons name={copied === "url" ? "checkmark-circle" : "copy"} size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">
                {copied === "url" ? "Link Copied!" : "Copy Link"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Embed Code Section */}
        <View className="px-6">
          <View className="bg-white rounded-2xl p-5 border border-gray-200 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-full bg-yellow-600 items-center justify-center mr-3">
                <Ionicons name="code-slash" size={24} color="white" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Embed Code</Text>
            </View>

            <Text className="text-sm text-gray-600 mb-3">
              Paste this code on your website to embed the form directly on your page.
            </Text>

            <View className="bg-gray-50 rounded-xl p-4 mb-3">
              <Text className="text-xs font-mono text-gray-700" numberOfLines={3}>
                {embedCode || "Generating..."}
              </Text>
            </View>

            <Pressable
              onPress={() => handleCopy(embedCode, "embed")}
              disabled={!embedCode}
              className={`rounded-xl py-4 flex-row items-center justify-center ${
                embedCode ? "bg-yellow-600 active:opacity-80" : "bg-gray-300"
              }`}
            >
              <Ionicons name={copied === "embed" ? "checkmark-circle" : "copy"} size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">
                {copied === "embed" ? "Code Copied!" : "Copy Embed Code"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Standalone HTML Section */}
        <View className="px-6">
          <View className="bg-white rounded-2xl p-5 border border-gray-200 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-full bg-yellow-600 items-center justify-center mr-3">
                <Ionicons name="document-text" size={24} color="white" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Standalone HTML</Text>
            </View>

            <Text className="text-sm text-gray-600 mb-3">
              Download a complete HTML file you can upload to any web host.
            </Text>

            <Pressable
              onPress={() => handleCopy(generateFormHTML(), "html")}
              className="bg-yellow-600 rounded-xl py-4 flex-row items-center justify-center active:opacity-80"
            >
              <Ionicons name={copied === "html" ? "checkmark-circle" : "code-download"} size={20} color="white" />
              <Text className="text-white text-base font-bold ml-2">
                {copied === "html" ? "HTML Copied!" : "Copy HTML File"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* How It Works */}
        <View className="px-6">
          <View className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <View className="flex-1 ml-3">
                <Text className="text-base font-bold text-gray-900 mb-2">How It Works</Text>
                <Text className="text-sm text-gray-700 mb-2">
                  This form uses Formspree, a free form backend service. Submissions will be sent to your email and can be manually added to the app.
                </Text>
                <Text className="text-sm text-gray-700">
                  For automatic syncing, you would need to set up a webhook or API integration.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
