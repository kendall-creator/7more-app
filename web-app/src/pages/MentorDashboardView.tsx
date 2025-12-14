import React from "react";
import { Phone, Mail, Calendar, MapPin, AlertTriangle } from "lucide-react";
import { useDataStore } from "../store/dataStore";
import { useAuthStore } from "../store/authStore";
import { Participant } from "../types";

export default function MentorDashboardView() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const allParticipants = useDataStore((s) => s.participants);

  // Filter participants assigned to current mentor
  const participants = React.useMemo(
    () => (currentUser ? allParticipants.filter((p) => p.assignedMentor === currentUser.id) : []),
    [allParticipants, currentUser]
  );

  const getDaysSinceAssignment = (assignedAt?: string) => {
    if (!assignedAt) return 0;
    const now = new Date();
    const assigned = new Date(assignedAt);
    const diffMs = now.getTime() - assigned.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  // Separate participants by status
  const pendingInitialContact = participants.filter(
    (p) =>
      p.status === "initial_contact_pending" ||
      p.status === "bridge_attempted" ||
      p.status === "bridge_unable" ||
      p.status === "assigned_mentor"
  );

  const attemptedContact = participants.filter((p) => p.status === "mentor_attempted");
  const unableToContact = participants.filter((p) => p.status === "mentor_unable");
  const activeParticipants = participants.filter((p) => p.status === "active_mentorship");

  const renderParticipantCard = (participant: Participant, section: "initial" | "attempted" | "unable" | "active") => {
    const daysSince = getDaysSinceAssignment(participant.assignedToMentorAt);
    const isInitial = section === "initial";
    const isAttempted = section === "attempted";
    const isUnable = section === "unable";
    // const isActive = section === "active";  // Not used currently

    return (
      <div
        key={participant.id}
        className={`bg-white rounded-xl p-4 border-2 ${
          isInitial || isAttempted || isUnable ? "border-amber-300" : "border-border"
        }`}
      >
        {/* Alert Banner */}
        {(isInitial || isAttempted || isUnable) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-amber-800 text-xs font-semibold">
              {isInitial ? "Initial Contact Required" : isAttempted ? "Follow-Up Needed" : "Unable to Contact"}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text mb-1">
              {participant.firstName} {participant.lastName}
            </h3>
            <p className="text-sm text-secondary">#{participant.participantNumber}</p>
          </div>
          {(participant.intakeType === "missed_call_no_voicemail" ||
            participant.intakeType === "missed_call_voicemail") && (
            <div className="ml-2">
              {participant.intakeType === "missed_call_voicemail" ? (
                <Mail className="w-5 h-5 text-amber-500" />
              ) : (
                <Phone className="w-5 h-5 text-amber-500" />
              )}
            </div>
          )}
        </div>

        {/* Info Row */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-xs text-secondary">
            <Calendar className="w-3 h-3" />
            {daysSince} day{daysSince !== 1 ? "s" : ""} assigned
          </div>
          {participant.releasedFrom && (
            <div className="flex items-center gap-1 text-xs text-secondary">
              <MapPin className="w-3 h-3" />
              {participant.releasedFrom}
            </div>
          )}
        </div>

        {/* Contact Buttons */}
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
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">Mentor Dashboard</h1>
        <p className="text-secondary">{participants.length} assigned participants</p>
      </div>

      <div className="space-y-6">
        {/* Pending Initial Contact */}
        {pendingInitialContact.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-text mb-3">
              Pending Initial Contact ({pendingInitialContact.length})
            </h2>
            <div className="space-y-3">
              {pendingInitialContact.map((p) => renderParticipantCard(p, "initial"))}
            </div>
          </div>
        )}

        {/* Attempted Contact */}
        {attemptedContact.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-text mb-3">Attempted Contact ({attemptedContact.length})</h2>
            <div className="space-y-3">{attemptedContact.map((p) => renderParticipantCard(p, "attempted"))}</div>
          </div>
        )}

        {/* Unable to Contact */}
        {unableToContact.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-text mb-3">Unable to Contact ({unableToContact.length})</h2>
            <div className="space-y-3">{unableToContact.map((p) => renderParticipantCard(p, "unable"))}</div>
          </div>
        )}

        {/* Active Participants */}
        {activeParticipants.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-text mb-3">Active Mentorship ({activeParticipants.length})</h2>
            <div className="space-y-3">{activeParticipants.map((p) => renderParticipantCard(p, "active"))}</div>
          </div>
        )}

        {/* Empty State */}
        {participants.length === 0 && (
          <div className="bg-white rounded-xl p-8 border border-border text-center">
            <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-secondary">No participants assigned yet</p>
          </div>
        )}
      </div>
    </>
  );
}
