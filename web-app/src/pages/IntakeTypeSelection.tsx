import React from "react";
import { FileText, Phone, PhoneOff, Mail } from "lucide-react";

interface IntakeOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface IntakeTypeSelectionProps {
  onSelect: (type: string) => void;
  onCancel: () => void;
}

const intakeOptions: IntakeOption[] = [
  {
    id: "full_form_entry",
    title: "Full Form Entry",
    description: "Participant completed online form or entering full intake manually. Requires follow-up call.",
    icon: <FileText className="w-7 h-7" />,
    color: "bg-blue-500",
  },
  {
    id: "live_call_intake",
    title: "Live Call Intake",
    description: "Participant is on the phone now. Complete intake and follow-up in one call.",
    icon: <Phone className="w-7 h-7" />,
    color: "bg-green-500",
  },
  {
    id: "missed_call_no_voicemail",
    title: "Missed Call – No Voicemail",
    description: "Phone rang, no answer, no voicemail left. Add to callback queue.",
    icon: <PhoneOff className="w-7 h-7" />,
    color: "bg-amber-500",
  },
  {
    id: "missed_call_voicemail",
    title: "Missed Call – Voicemail Received",
    description: "Participant left a voicemail. Add to callback queue with notes.",
    icon: <Mail className="w-7 h-7" />,
    color: "bg-purple-500",
  },
];

export default function IntakeTypeSelection({ onSelect, onCancel }: IntakeTypeSelectionProps) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">Add Participant – Choose Entry Type</h1>
        <p className="text-secondary">
          Select how you are adding this participant to determine the correct workflow:
        </p>
      </div>

      <div className="space-y-4">
        {intakeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="w-full bg-white rounded-xl border border-border p-5 hover:border-primary hover:shadow-md transition-all text-left flex items-center gap-4 group"
          >
            <div className={`${option.color} rounded-full p-4 text-white group-hover:scale-110 transition-transform`}>
              {option.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text mb-1">{option.title}</h3>
              <p className="text-sm text-secondary leading-relaxed">{option.description}</p>
            </div>
            <svg
              className="w-6 h-6 text-secondary group-hover:text-primary transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={onCancel}
          className="w-full bg-gray-100 rounded-xl py-3 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </>
  );
}
