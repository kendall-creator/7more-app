import React, { useState } from "react";
import { Phone } from "lucide-react";

interface MissedCallNoVoicemailProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function MissedCallNoVoicemail({ onSubmit, onCancel }: MissedCallNoVoicemailProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      alert("Phone number is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        phoneNumber: phoneNumber.trim(),
        name: name.trim() || "Unknown",
        notes: notes.trim(),
        comments: comments.trim(),
        intakeType: "missed_call_no_voicemail",
      });
    } catch (error) {
      alert("Failed to add missed call entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">Missed Call – No Voicemail</h1>
        <p className="text-secondary">
          Add basic information for this missed call. A full intake will be completed when contact is made.
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
              placeholder="If known from caller ID"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Notes - Optional */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Notes (Optional)
            </label>
            <textarea
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Any additional context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Comments - Optional */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Comments (Optional)
            </label>
            <textarea
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Additional comments about this missed call..."
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
              className="flex-1 bg-amber-500 text-white rounded-lg py-3 px-4 font-semibold hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
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
