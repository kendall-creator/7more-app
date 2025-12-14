import React from "react";
import { Phone, Clock, Mail } from "lucide-react";
import { useDataStore } from "../store/dataStore";

export default function BridgeTeamDashboardView() {
  const allParticipants = useDataStore((s) => s.participants);

  // Filter bridge team participants
  const participants = React.useMemo(
    () =>
      allParticipants.filter((p) =>
        ["pending_bridge", "bridge_attempted", "bridge_contacted", "bridge_unable"].includes(p.status)
      ),
    [allParticipants]
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_bridge":
        return { text: "New", color: "bg-gray-200 text-gray-900" };
      case "bridge_attempted":
        return { text: "Attempted", color: "bg-amber-100 text-amber-700" };
      case "bridge_contacted":
        return { text: "Contacted", color: "bg-yellow-100 text-gray-900" };
      case "bridge_unable":
        return { text: "Unable", color: "bg-gray-100 text-gray-700" };
      default:
        return { text: "Unknown", color: "bg-gray-100 text-gray-700" };
    }
  };

  const getTimeSinceSubmission = (createdAt?: string, submittedAt?: string) => {
    const dateStr = createdAt || submittedAt;
    if (!dateStr) return "Unknown";

    const now = new Date();
    const submitted = new Date(dateStr);
    const diffMs = now.getTime() - submitted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return "Just now";
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">Bridge Team Dashboard</h1>
        <p className="text-secondary">{participants.length} participants in queue</p>
      </div>

      <div className="space-y-3">
        {participants.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-border text-center">
            <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-secondary">No participants in Bridge Team queue</p>
          </div>
        ) : (
          participants.map((participant) => {
            const badge = getStatusBadge(participant.status);
            return (
              <div
                key={participant.id}
                className="bg-white rounded-xl p-4 border border-border hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text mb-1">
                      {participant.firstName} {participant.lastName}
                    </h3>
                    <p className="text-sm text-secondary">#{participant.participantNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                    {badge.text}
                  </span>
                </div>

                {/* Intake Type Icon */}
                {(participant.intakeType === "missed_call_no_voicemail" ||
                  participant.intakeType === "missed_call_voicemail") && (
                  <div className="flex items-center gap-2 mb-2">
                    {participant.intakeType === "missed_call_voicemail" ? (
                      <>
                        <Mail className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-700 font-semibold">Voicemail</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-700 font-semibold">Missed Call</span>
                      </>
                    )}
                  </div>
                )}

                {/* Info Row */}
                <div className="flex items-center gap-4 text-xs text-secondary mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeSinceSubmission(participant.createdAt, participant.submittedAt)}
                  </div>
                  {participant.releasedFrom && (
                    <div className="flex items-center gap-1">
                      <span>📍</span>
                      {participant.releasedFrom}
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex gap-2">
                  {participant.phoneNumber && (
                    <a
                      href={`tel:${participant.phoneNumber}`}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg py-2 px-3 text-sm font-semibold text-center transition-colors"
                    >
                      Call
                    </a>
                  )}
                  {participant.email && (
                    <a
                      href={`mailto:${participant.email}`}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg py-2 px-3 text-sm font-semibold text-center transition-colors"
                    >
                      Email
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
