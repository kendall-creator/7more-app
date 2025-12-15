import { useState } from "react";
import { Calendar, Clock, Users, Video, X, Trash2, Plus } from "lucide-react";
import { useDataStore } from "../store/dataStore";
import { useAuthStore } from "../store/authStore";

interface CreateMeetingViewProps {
  onNavigate: (view: string) => void;
}

export default function CreateMeetingView({ onNavigate }: CreateMeetingViewProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const meetings = useDataStore((s) => s.meetings);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [selectedInvitees, setSelectedInvitees] = useState<string[]>([
    "admin",
    "mentorship_leader",
    "mentor",
  ]);

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "bridge_team", label: "Bridge Team" },
    { value: "bridge_team_leader", label: "Bridge Team Leader" },
    { value: "mentorship_leader", label: "Mentor Leader" },
    { value: "mentor", label: "Mentor" },
    { value: "volunteer", label: "Lead Volunteer" },
    { value: "volunteer_support", label: "Support Volunteer" },
    { value: "board_member", label: "Board Member" },
    { value: "supporter", label: "Supporter" },
  ];

  const toggleInvitee = (role: string) => {
    if (selectedInvitees.includes(role)) {
      setSelectedInvitees(selectedInvitees.filter((r) => r !== role));
    } else {
      setSelectedInvitees([...selectedInvitees, role]);
    }
  };

  const handleCreateMeeting = async () => {
    if (!title || !date || !startTime || !endTime) {
      alert("Please fill in all required fields");
      return;
    }

    if (!currentUser) return;

    try {
      const { database } = await import("../../../src/config/firebase");
      if (!database) {
        alert("Database connection error");
        return;
      }
      const { ref, push, set } = await import("firebase/database");

      const meetingsRef = ref(database, "meetings");
      const newMeetingRef = push(meetingsRef);
      const meetingId = newMeetingRef.key;

      const meetingData = {
        id: meetingId,
        title,
        description,
        date,
        startTime,
        endTime,
        videoLink: videoLink || undefined,
        invitedRoles: selectedInvitees,
        rsvps: [],
        createdBy: currentUser.id,
        createdByName: currentUser.name || currentUser.email,
        createdAt: new Date().toISOString(),
      };

      await set(newMeetingRef, meetingData);

      // Reset form
      setTitle("");
      setDescription("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setVideoLink("");
      setSelectedInvitees(["admin", "mentorship_leader", "mentor"]);
      setShowCreateModal(false);

      alert("Meeting created successfully!");
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("Error creating meeting. Please try again.");
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    try {
      const { database } = await import("../../../src/config/firebase");
      if (!database) {
        alert("Database connection error");
        return;
      }
      const { ref, remove } = await import("firebase/database");

      const meetingRef = ref(database, `meetings/${meetingId}`);
      await remove(meetingRef);

      alert("Meeting deleted successfully!");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Error deleting meeting. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Create Meeting</h1>
          <p className="text-textAlt mt-2">Schedule and manage team meetings</p>
        </div>
        <button
          onClick={() => onNavigate("scheduler")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-4 py-2 font-medium transition-colors"
        >
          Back to Scheduler
        </button>
      </div>

      {/* Create Meeting Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Create New Meeting
      </button>

      {/* Upcoming Meetings List */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold text-text mb-4">Upcoming Meetings</h2>
        <div className="space-y-3">
          {meetings
            .filter((meeting) => new Date(meeting.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 20)
            .map((meeting) => (
              <div
                key={meeting.id}
                className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text">{meeting.title}</h3>
                    {meeting.description && (
                      <p className="text-sm text-textAlt mt-1">{meeting.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-textAlt">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(meeting.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {meeting.startTime} - {meeting.endTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {(meeting as any).rsvps?.length || 0} RSVPs
                      </div>
                      {(meeting as any).videoLink && (
                        <div className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          <a
                            href={(meeting as any).videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Join
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMeeting(meeting.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text">Create Meeting</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Meeting Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Monthly Team Sync"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Meeting agenda and details..."
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">End Time *</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Video Link */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Video Call Link (optional)</label>
                <input
                  type="url"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              {/* Invitees */}
              <div>
                <label className="block text-sm font-semibold text-text mb-3">Who should be invited? *</label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((role) => (
                    <label
                      key={role.value}
                      className="flex items-center gap-2 cursor-pointer border border-border rounded-lg px-3 py-2 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedInvitees.includes(role.value)}
                        onChange={() => toggleInvitee(role.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateMeeting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl py-3 font-semibold transition-colors"
                >
                  Create Meeting
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl py-3 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
