import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsersStore } from "../store/usersStore";
import { useAuthStore } from "../store/authStore";
import { UserRole } from "../types";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Mail,
  MessageSquare,
} from "lucide-react";

export default function AddUserPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const addUser = useUsersStore((s) => s.addUser);
  const getUserByEmail = useUsersStore((s) => s.getUserByEmail);

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("bridge_team");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const roles: { value: UserRole; label: string; description: string }[] = [
    {
      value: "admin",
      label: "Admin",
      description: "Full access to all features and user management",
    },
    {
      value: "bridge_team",
      label: "Bridge Team",
      description: "Initial contact and participant processing",
    },
    {
      value: "bridge_team_leader",
      label: "Bridge Team Leader",
      description: "Admin capabilities but only for Bridge Team items",
    },
    {
      value: "mentorship_leader",
      label: "Mentorship Leader",
      description: "Assign participants to mentors and manage shifts",
    },
    {
      value: "mentor",
      label: "Mentor",
      description: "Direct participant engagement and updates",
    },
    {
      value: "board_member",
      label: "Board Member",
      description: "View scheduler, tasks, and monthly reporting analytics",
    },
    {
      value: "volunteer",
      label: "Lead Volunteer",
      description: "Can sign up for any available shift",
    },
    {
      value: "volunteer_support",
      label: "Support Volunteer",
      description: "Can only sign up for support volunteer shifts",
    },
    {
      value: "supporter",
      label: "Supporter",
      description: "View schedule and tasks they assigned or are assigned to",
    },
  ];

  const generatePasswordFromName = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length < 2) return name.toLowerCase() + "123";
    const firstInitial = parts[0][0].toLowerCase();
    const lastName = parts[parts.length - 1].toLowerCase();
    return firstInitial + lastName;
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim() || !email.trim()) {
      setErrorMessage("Please fill in all required fields.");
      setShowErrorModal(true);
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setShowErrorModal(true);
      return;
    }

    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      setErrorMessage("A user with this email already exists.");
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      // Generate password from name (first initial + last name)
      const generatedPassword = generatePasswordFromName(name.trim());

      const nicknameValue = nickname.trim() || undefined;
      const phoneValue = phone.trim() || undefined;

      // Add the user
      const result = await addUser(
        name.trim(),
        email.trim(),
        selectedRole,
        generatedPassword,
        currentUser?.id || "system",
        phoneValue,
        nicknameValue
      );

      if (result.success) {
        setGeneratedPassword(result.password);
        // Note: Email/SMS sending would be implemented here if backend is configured
        setEmailSent(false); // Set to true if email service is configured
        setSmsSent(false); // Set to true if SMS service is configured
        setShowSuccessModal(true);
      } else {
        setErrorMessage("Failed to create user. Please try again.");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setErrorMessage("Failed to create user. Please try again.");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    alert("Password copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-600 pt-16 pb-8 px-6">
        <button
          onClick={() => navigate("/users")}
          className="mb-4 text-white hover:opacity-80"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Add New User</h1>
        <p className="text-yellow-100 text-base">Create a new staff account</p>
      </div>

      <div className="px-6 pt-6 pb-40">
        {/* Full Name */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Nickname */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Nickname (Optional)
          </label>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
            placeholder="Johnny"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">
            If provided, will be displayed alongside full name
          </p>
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
            placeholder="john.doe@7more.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">
            A password will be automatically generated based on their name (first initial + last name).
          </p>
        </div>

        {/* Phone Number */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Phone Number
          </label>
          <input
            type="tel"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">
            Optional - for sending welcome texts and quick contact
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <label className="text-sm font-semibold text-gray-700 mb-3 block">
            User Role <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`w-full text-left border-2 rounded-xl px-4 py-4 ${
                  selectedRole === role.value
                    ? "bg-gray-50 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-base font-semibold ${
                      selectedRole === role.value ? "text-yellow-600" : "text-gray-900"
                    }`}
                  >
                    {role.label}
                  </span>
                  {selectedRole === role.value && (
                    <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">{role.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full rounded-xl py-4 mb-4 ${
            isLoading ? "bg-gray-400" : "bg-gray-600 hover:bg-gray-700"
          } text-white text-base font-bold transition-colors`}
        >
          {isLoading ? "Creating..." : "Create User Account"}
        </button>

        {/* Cancel Button */}
        <button
          onClick={() => navigate("/users")}
          className="w-full bg-gray-100 rounded-xl py-3 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3 mx-auto flex">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">User Added!</h2>
              <p className="text-center text-gray-600 mb-4">
                {name} has been successfully invited to the platform.
              </p>

              {/* Email Status */}
              {emailSent ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 w-full">
                  <div className="flex items-center mb-1">
                    <Mail className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 font-semibold ml-2">Email Sent</span>
                  </div>
                  <p className="text-green-700 text-xs">
                    Welcome email with login credentials sent to {email}
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3 w-full">
                  <div className="flex items-center mb-1">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-800 font-semibold ml-2">Email Not Configured</span>
                  </div>
                  <p className="text-yellow-700 text-xs mb-2">
                    Please share the password with the user manually.
                  </p>
                </div>
              )}

              {/* SMS Status */}
              {phone && (
                smsSent ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 w-full">
                    <div className="flex items-center mb-1">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span className="text-green-800 font-semibold ml-2">SMS Sent</span>
                    </div>
                    <p className="text-green-700 text-xs">
                      Welcome text with app link sent to {phone}
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 w-full">
                    <div className="flex items-center mb-1">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-800 font-semibold ml-2">SMS Not Configured</span>
                    </div>
                    <p className="text-yellow-700 text-xs">
                      Configure SMS service to send welcome texts.
                    </p>
                  </div>
                )
              )}

              {/* Password Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 w-full">
                <p className="text-gray-700 font-semibold mb-2 text-center">
                  Generated Password
                </p>
                <div className="bg-white border border-gray-300 rounded-lg p-3 mb-3">
                  <p className="text-gray-900 font-mono text-center select-all">
                    {generatedPassword}
                  </p>
                </div>
                <button
                  onClick={copyPasswordToClipboard}
                  className="w-full bg-gray-600 rounded-lg py-2 text-white text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Password
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mb-4">
                Users can change their password anytime from their account settings.
              </p>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setName("");
                  setNickname("");
                  setEmail("");
                  setPhone("");
                  setGeneratedPassword("");
                  setEmailSent(false);
                  setSmsSent(false);
                  navigate("/users");
                }}
                className="w-full bg-gray-600 rounded-xl py-3 text-white font-semibold hover:bg-gray-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3 mx-auto flex">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
              <p className="text-center text-gray-600">{errorMessage}</p>
            </div>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-gray-600 rounded-xl py-3 text-white font-semibold hover:bg-gray-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

