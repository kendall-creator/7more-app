import React, { useState } from "react";
import { Mail } from "lucide-react";

interface MissedCallVoicemailProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function MissedCallVoicemail({ onSubmit, onCancel }: MissedCallVoicemailProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [callbackWindow, setCallbackWindow] = useState("");
  const [notes, setNotes] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      alert("Phone number is required.");
      return;
    }

    if (!notes.trim()) {
      alert("Summary of voicemail is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        phoneNumber: phoneNumber.trim(),
        name: name.trim() || "Unknown",
        callbackWindow: callbackWindow.trim(),
        notes: notes.trim(),
        comments: comments.trim(),
        intakeType: "missed_call_voicemail",
      });
    } catch (error) {
      alert("Failed to add voicemail entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">Missed Call – Voicemail Received</h1>
        <p className="text-secondary">
          Add information from the voicemail. A full intake will be completed when contact is made.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name - Optional */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Name (Optional)
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="If provided in voicemail"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Callback Window - Optional */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Callback Window (Optional)
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., After 3pm, Weekday mornings"
              value={callbackWindow}
              onChange={(e) => setCallbackWindow(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Preferred time for callback if mentioned in voicemail
            </p>
          </div>

          {/* Notes - Required */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Summary of Voicemail <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Key information from voicemail..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Required: Document what the caller said (needs, concerns, etc.)
            </p>
          </div>

          {/* Comments - Optional */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Comments (Optional)
            </label>
            <textarea
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Additional comments about this voicemail..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          {/* Phone Number - Required */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-500 text-white rounded-lg py-3 px-4 font-semibold hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              {isSubmitting ? "Adding..." : "Add to Callback Queue"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 bg-gray-100 text-gray-700 rounded-lg py-3 font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
