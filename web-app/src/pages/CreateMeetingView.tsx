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
      const { database } = await import("../config/firebase");
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
    }
