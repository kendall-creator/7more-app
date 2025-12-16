import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDataStore } from "../store/dataStore";
import { useAuthStore } from "../store/authStore";
import { Participant, ParticipantStatus } from "../types";
import {
  Search,
  X,
  Plus,
  Calendar,
  User,
  Phone,
  Mail,
  ArrowLeft,
  Users as UsersIcon,
  MessageSquare,
  PhoneCall,
} from "lucide-react";

export default function AllParticipantsPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const userRole = currentUser?.role;
  const allParticipants = useDataStore((s) => s.participants);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ParticipantStatus | "all">("all");

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "bridge_team_leader";

  // Filter participants based on role - Bridge Team Leaders only see Bridge Team participants
  const visibleParticipants = useMemo(() => {
    if (userRole === "bridge_team_leader") {
      return allParticipants.filter((p) =>
        ["pending_bridge", "bridge_contacted", "bridge_attempted", "bridge_unable"].includes(p.status)
      );
    }
    return allParticipants;
  }, [allParticipants, userRole]);

  const statusOptions: { value: ParticipantStatus | "all"; label: string; color: string }[] = [
    { value: "all", label: "All", color: "bg-gray-100 text-gray-700" },
    { value: "pending_bridge", label: "Pending Bridge", color: "bg-gray-200 text-gray-900" },
    { value: "bridge_attempted", label: "Bridge Attempted", color: "bg-amber-100 text-amber-700" },
    { value: "bridge_contacted", label: "Contacted", color: "bg-yellow-100 text-gray-900" },
    { value: "bridge_unable", label: "Bridge Unable", color: "bg-gray-100 text-gray-700" },
    { value: "pending_mentor", label: "Awaiting Mentor", color: "bg-yellow-100 text-gray-700" },
    { value: "initial_contact_pending", label: "Initial Contact Pending", color: "bg-orange-100 text-orange-700" },
    { value: "mentor_attempted", label: "Mentor Attempted", color: "bg-amber-100 text-amber-700" },
    { value: "mentor_unable", label: "Mentor Unable", color: "bg-gray-100 text-gray-700" },
    { value: "active_mentorship", label: "Active", color: "bg-yellow-100 text-gray-900" },
    { value: "graduated", label: "Graduated", color: "bg-yellow-100 text-gray-700" },
  ];

  const filteredParticipants = visibleParticipants.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.participantNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ParticipantStatus) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option || { label: status, color: "bg-gray-100 text-gray-700" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderParticipantCard = (participant: Participant) => {
    const badge = getStatusBadge(participant.status);

    return (
      <button
        key={participant.id}
        onClick={() => navigate(`/participants/${participant.id}`)}
        className="w-full bg-white rounded-2xl p-4 mb-3 border border-gray-100 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {participant.firstName} {participant.lastName}
              </h3>
              <p className="text-sm text-gray-500">#{participant.participantNumber}</p>
            </div>
            {/* Show voicemail/missed call icon */}
            {(participant.intakeType === "missed_call_no_voicemail" ||
              participant.intakeType === "missed_call_voicemail") && (
              <div className="mr-2">
                {participant.intakeType === "missed_call_voicemail" ? (
                  <MessageSquare className="w-4 h-4 text-yellow-600" />
                ) : (
                  <PhoneCall className="w-4 h-4 text-yellow-600" />
                )}
              </div>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* Show comments if present */}
        {(participant as any).missedCallComments && (
          <div className="bg-amber-50 rounded-lg px-2 py-1 mb-2">
            <p className="text-xs text-gray-700 italic">{(participant as any).missedCallComments}</p>
          </div>
        )}

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-600 ml-1">
              {formatDate(participant.submittedAt || participant.createdAt || new Date().toISOString())}
            </span>
          </div>
          <div className="flex items-center">
            <User className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-600 ml-1">
              {participant.age}y • {participant.gender}
            </span>
          </div>
          {participant.phoneNumber && (
            <div className="flex items-center">
              <Phone className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-green-600 ml-1">{participant.phoneNumber}</span>
            </div>
          )}
          {participant.email && (
            <div className="flex items-center">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs text-blue-600 ml-1 truncate max-w-[150px]">{participant.email}</span>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-600 pt-16 pb-6 px-6">
        <button onClick={() => navigate("/dashboard")} className="mb-4 text-white hover:opacity-80">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white mb-1">All Participants</h1>
        <p className="text-yellow-100 text-sm">
          {filteredParticipants.length} of {visibleParticipants.length} participant
          {visibleParticipants.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search and Add */}
      <div className="px-6 pt-4 pb-2 bg-white border-b border-gray-100">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="flex-1 ml-2 text-sm bg-transparent outline-none"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery.length > 0 && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => navigate("/participants/add")}
              className="bg-gray-600 rounded-xl px-4 flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="px-6 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value)}
              className={`px-4 py-2 rounded-full border whitespace-nowrap ${
                filterStatus === option.value
                  ? "bg-gray-600 border-gray-600 text-white"
                  : "bg-white border-gray-200 text-gray-700"
              }`}
            >
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Participants List */}
      <div className="px-6 py-4">
        {filteredParticipants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-300" />
            <p className="text-gray-500 text-base mt-4">No participants found</p>
            <p className="text-gray-400 text-sm mt-1 text-center">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Add a new participant to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">{filteredParticipants.map(renderParticipantCard)}</div>
        )}
      </div>
    </div>
  );
}

