import { useState } from "react";
import { Calendar, Clock, Users, MapPin, X, Trash2, Plus } from "lucide-react";
import { useDataStore } from "../store/dataStore";
import { useAuthStore } from "../store/authStore";

interface ManageShiftsViewProps {
  onNavigate: (view: string) => void;
}

export default function ManageShiftsView({ onNavigate }: ManageShiftsViewProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const shifts = useDataStore((s) => s.shifts);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxVolunteers, setMaxVolunteers] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [weeksToCreate, setWeeksToCreate] = useState("12");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([
    "admin",
    "mentorship_leader",
    "mentor",
  ]);

  const locationOptions = [
    { value: "pam_lychner", label: "Pam Lychner" },
    { value: "huntsville", label: "Huntsville" },
    { value: "plane", label: "Plane" },
    { value: "hawaii", label: "Hawaii" },
  ];

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

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleCreateShift = async () => {
    if (!title || !date || !startTime || !endTime) {
      alert("Please fill in all required fields");
      return;
    }

    if (!currentUser) return;

    try {
      // Call Firebase to create shift
      const { database } = await import("../config/firebase");
      if (!database) {
        alert("Database connection error");
        return;
      }
      const { ref, push, set } = await import("firebase/database");

      const shiftsRef = ref(database, "shifts");

      const createShiftForDate = async (shiftDate: string) => {
        const newShiftRef = push(shiftsRef);
        const shiftId = newShiftRef.key;

        const shiftData = {
          id: shiftId,
          title,
          description,
          date: shiftDate,
          startTime,
          endTime,
          location: location || undefined,
          maxVolunteers: maxVolunteers ? parseInt(maxVolunteers) : undefined,
          allowedRoles: selectedRoles,
          assignedUsers: [],
          createdBy: currentUser.id,
          createdByName: currentUser.name || currentUser.email,
          createdAt: new Date().toISOString(),
        };

        await set(newShiftRef, shiftData);
      };

      if (isRecurring) {
        const weeks = parseInt(weeksToCreate);
        const startDate = new Date(date);

        for (let i = 0; i < weeks; i++) {
          const shiftDate = new Date(startDate);
          shiftDate.setDate(startDate.getDate() + i * 7);
          const dateString = shiftDate.toISOString().split("T")[0];
          await createShiftForDate(dateString);
        }
      } else {
        await createShiftForDate(date);
      }

      // Reset form
      setTitle("");
      setDescription("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setMaxVolunteers("");
      setIsRecurring(false);
      setWeeksToCreate("12");
      setShowCreateModal(false);

      alert("Shift(s) created successfully!");
    } catch (error) {
      console.error("Error creating shift:", error);
      alert("Error creating shift. Please try again.");
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!confirm("Are you sure you want to delete this shift?")) return;

    try {
      const { database } = await import("../config/firebase");
      if (!database) {
        alert("Database connection error");
        return;
      }
      const { ref, remove } = await import("firebase/database");

      const shiftRef = ref(database, `shifts/${shiftId}`);
      await remove(shiftRef);

      alert("Shift deleted successfully!");
    } catch (error) {
      console.error("Error deleting shift:", error);
      alert("Error deleting shift. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Manage Shifts</h1>
          <p className="text-textAlt mt-2">Create and manage volunteer shifts</p>
        </div>
        <button
          onClick={() => onNavigate("scheduler")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-4 py-2 font-medium transition-colors"
        >
          Back to Scheduler
        </button>
      </div>

      {/* Create Shift Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Create New Shift
      </button>

      {/* Upcoming Shifts List */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold text-text mb-4">Upcoming Shifts</h2>
        <div className="space-y-3">
          {shifts
            .filter((shift) => new Date(shift.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 20)
            .map((shift) => (
              <div
                key={shift.id}
                className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text">{shift.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-textAlt">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(shift.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {shift.startTime} - {shift.endTime}
                      </div>
                      {shift.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {locationOptions.find((l) => l.value === shift.location)?.label ||
                            shift.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {shift.assignedUsers?.length || 0}
                        {shift.maxVolunteers ? `/${shift.maxVolunteers}` : ""} assigned
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteShift(shift.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Create Shift Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text">Create Shift</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Shift Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Pam Lychner Morning Shift"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Shift details..."
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Date *
                </label>
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
                  <label className="block text-sm font-semibold text-text mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select location...</option>
                  {locationOptions.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Volunteers */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Max Volunteers (optional)
                </label>
                <input
                  type="number"
                  value={maxVolunteers}
                  onChange={(e) => setMaxVolunteers(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>

              {/* Recurring */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-5 h-5 text-primary"
                  />
                  <span className="text-sm font-semibold text-text">
                    Recurring Shift
                  </span>
                </label>
                {isRecurring && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-text mb-2">
                      Number of Weeks
                    </label>
                    <input
                      type="number"
                      value={weeksToCreate}
                      onChange={(e) => setWeeksToCreate(e.target.value)}
                      className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                      max="52"
                    />
                  </div>
                )}
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-semibold text-text mb-3">
                  Who can sign up? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((role) => (
                    <label
                      key={role.value}
                      className="flex items-center gap-2 cursor-pointer border border-border rounded-lg px-3 py-2 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.value)}
                        onChange={() => toggleRole(role.value)}
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
                  onClick={handleCreateShift}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl py-3 font-semibold transition-colors"
                >
                  Create Shift
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
