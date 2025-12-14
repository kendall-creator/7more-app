import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDataStore } from "../store/dataStore";
import {
  LogOut,
  UserPlus,
  Users,
  Phone,
  CheckSquare,
  Calendar,
  ChevronRight,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  UserCircle,
  PlusCircle,
  Search,
  X,
  Trash2,
  Edit,
  Copy,
} from "lucide-react";
import AddParticipantForm from "./AddParticipantForm";
import IntakeTypeSelection from "./IntakeTypeSelection";
import MissedCallNoVoicemail from "./MissedCallNoVoicemail";
import MissedCallVoicemail from "./MissedCallVoicemail";
import AdminHomepageView from "./AdminHomepageView";
import BridgeTeamDashboardView from "./BridgeTeamDashboardView";
import MentorDashboardView from "./MentorDashboardView";

// NavButton component
function NavButton({
  icon,
  label,
  active = false,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? "bg-primary text-white"
          : "text-text hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

export default function MainDashboard() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const participants = useDataStore((s) => s.participants);
  const tasks = useDataStore((s) => s.tasks);
  const shifts = useDataStore((s) => s.shifts);
  const allUsers = useAuthStore((s) => s.users || []);
  const addParticipant = useDataStore((s) => s.addParticipant);

  // Active view state
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedIntakeType, setSelectedIntakeType] = useState<string | null>(null);

  // Debug: Log user role on mount
  console.log("MainDashboard - User:", currentUser?.email, "Role:", currentUser?.role, "Active View:", activeView);

  // Search states for various views
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [volunteerSearch, setVolunteerSearch] = useState("");

  // Form state for Add Participant - mirrors mobile app
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    phoneNumber: "",
    email: "",
    address: "",
    participantNumber: "",
    tdcjNotAvailable: false,
    dateOfBirth: "",
    dobNotAvailable: false,
    gender: "",
    releaseDate: "",
    releasedFrom: "",
    otherReleaseLocation: "",
    referralSource: "",
    otherReferralSource: "",
    legalStatus: [] as string[],
    criticalNeeds: [] as string[],
  });

  const LEGAL_STATUS_OPTIONS = [
    "The participant is on parole",
    "The participant is on probation",
    "The participant is on an ankle monitor",
    "The participant has an SA conviction",
    "The participant has an SA–Minor conviction",
    "The participant has barriers that prevent them from working right now",
    "None of these apply",
  ];

  const RELEASE_LOCATION_OPTIONS = [
    "Pam Lychner",
    "Huntsville",
    "Plane",
    "Hawaii",
    "Other",
  ];

  const REFERRAL_SOURCE_OPTIONS = [
    "I met them in person",
    "Family/friend",
    "Online",
    "Other",
  ];

  const CRITICAL_NEEDS_OPTIONS = [
    "Needs help getting a phone",
    "Employment needed",
    "Housing needed",
    "Clothing needed",
    "Food needed",
    "Building",
    "Healthy relationships",
    "Managing finances",
  ];

  const isMentor =
    currentUser?.role === "mentor" || currentUser?.role === "mentorship_leader";
  const isBridgeTeam = currentUser?.role === "bridge_team";
  const isAdmin = currentUser?.role === "admin";

  // Get assigned participants
  const assignedParticipants = useMemo(
    () =>
      currentUser
        ? participants.filter((p) => p.assignedMentor === currentUser.id)
        : [],
    [participants, currentUser]
  );


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const toggleLegalStatus = (option: string) => {
    if (formData.legalStatus.includes(option)) {
      setFormData({
        ...formData,
        legalStatus: formData.legalStatus.filter((s) => s !== option),
      });
    } else {
      setFormData({
        ...formData,
        legalStatus: [...formData.legalStatus, option],
      });
    }
  };

  const toggleCriticalNeed = (option: string) => {
    if (formData.criticalNeeds.includes(option)) {
      setFormData({
        ...formData,
        criticalNeeds: formData.criticalNeeds.filter((n) => n !== option),
      });
    } else {
      setFormData({
        ...formData,
        criticalNeeds: [...formData.criticalNeeds, option],
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation matching mobile app
    if ((!formData.tdcjNotAvailable && !formData.participantNumber) ||
        !formData.firstName ||
        !formData.lastName ||
        !formData.gender ||
        !formData.releasedFrom ||
        (!formData.dobNotAvailable && !formData.dateOfBirth) ||
        !formData.releaseDate) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!formData.phoneNumber?.trim() && !formData.email?.trim()) {
      alert("Please provide at least one contact method (email or phone number).");
      return;
    }

    if (formData.releasedFrom === "Other" && !formData.otherReleaseLocation.trim()) {
      alert("Please specify the release location.");
      return;
    }

    if (formData.referralSource === "Other" && !formData.otherReferralSource.trim()) {
      alert("Please specify how the participant heard about 7more.");
      return;
    }

    try {
      // Parse dates
      const parseDate = (dateStr: string): Date | null => {
        const parts = dateStr.split("/");
        if (parts.length !== 3) return null;
        const month = parseInt(parts[0], 10);
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
        return new Date(year, month - 1, day);
      };

      const dobDate = formData.dobNotAvailable ? null : parseDate(formData.dateOfBirth);
      const relDate = parseDate(formData.releaseDate);

      if (!formData.dobNotAvailable && !dobDate) {
        alert("Please enter a valid date of birth in MM/DD/YYYY format.");
        return;
      }

      if (!relDate) {
        alert("Please enter a valid release date in MM/DD/YYYY format.");
        return;
      }

      const calculateAge = (dob: Date) => {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return age;
      };

      const calculateTimeOut = (release: Date) => {
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - release.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      };

      const age = dobDate ? calculateAge(dobDate) : 0;
      const timeOut = calculateTimeOut(relDate);

      // Save to Firebase
      await addParticipant({
        participantNumber: formData.tdcjNotAvailable ? "Not Available" : formData.participantNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        nickname: formData.nickname,
        dateOfBirth: dobDate ? dobDate.toISOString() : "Not Available",
        age,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        releaseDate: relDate.toISOString(),
        timeOut,
        releasedFrom: formData.releasedFrom === "Other" ? formData.otherReleaseLocation : formData.releasedFrom,
        referralSource: formData.referralSource,
        otherReferralSource: formData.otherReferralSource,
        legalStatus: formData.legalStatus,
        criticalNeeds: formData.criticalNeeds,
        status: "pending_bridge",
        intakeType: selectedIntakeType as any,
        completedGraduationSteps: [],
      });

      alert("Participant added successfully!");

      // Reset form and go back
      setFormData({
        firstName: "",
        lastName: "",
        nickname: "",
        phoneNumber: "",
        email: "",
        address: "",
        participantNumber: "",
        tdcjNotAvailable: false,
        dateOfBirth: "",
        dobNotAvailable: false,
        gender: "",
        releaseDate: "",
        releasedFrom: "",
        otherReleaseLocation: "",
        referralSource: "",
        otherReferralSource: "",
        legalStatus: [],
        criticalNeeds: [],
      });
      setSelectedIntakeType(null);
      setActiveView("dashboard");
    } catch (error) {
      console.error("Error adding participant:", error);
      alert("Failed to add participant. Please try again.");
    }
  };

  const handleMissedCallSubmit = async (data: any) => {
    try {
      await addParticipant({
        phoneNumber: data.phoneNumber,
        firstName: data.name || "Unknown",
        lastName: data.intakeType === "missed_call_voicemail" ? "(Voicemail)" : "(Missed Call)",
        participantNumber: `TEMP-${Date.now()}`,
        dateOfBirth: "1990-01-01",
        age: 0,
        gender: "Unknown",
        releaseDate: new Date().toISOString(),
        timeOut: 0,
        releasedFrom: "Unknown",
        status: "pending_bridge",
        intakeType: data.intakeType,
        completedGraduationSteps: [],
      });

      alert(`${data.intakeType === "missed_call_voicemail" ? "Voicemail" : "Missed call"} entry added to Bridge Team callback queue!`);

      // Reset and go back
      setSelectedIntakeType(null);
      setActiveView("dashboard");
    } catch (error) {
      console.error("Error adding missed call:", error);
      alert("Failed to add entry. Please try again.");
    }
  };

  const handleIntakeTypeSelect = (type: string) => {
    setSelectedIntakeType(type);
  };

  const handleIntakeCancel = () => {
    setSelectedIntakeType(null);
    setActiveView("dashboard");
  };

  // Filter data based on search
  const filteredParticipants = participants.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.firstName?.toLowerCase().includes(query) ||
      p.lastName?.toLowerCase().includes(query) ||
      p.participantNumber?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query)
    );
  });

  const filteredUsers = allUsers.filter((u: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.role?.toLowerCase().includes(query)
    );
  });

  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.title?.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.assignedToUserName?.toLowerCase().includes(query)
    );
  });

  // Mock resources data (would come from Firebase in real app)
  const mockResources = [
    {
      id: "1",
      title: "Employment Resources",
      category: "Employment",
      content: "List of employment agencies and job training programs available for recently released individuals. Contact WorkForce Solutions at (555) 123-4567 for more information.",
      description: "Job search and career development resources"
    },
    {
      id: "2",
      title: "Housing Assistance",
      category: "Housing",
      content: "Transitional housing programs and rental assistance contacts. Call Housing Authority at (555) 987-6543 or visit their office at 123 Main St.",
      description: "Emergency and transitional housing options"
    },
    {
      id: "3",
      title: "Mental Health Services",
      category: "Healthcare",
      content: "Free and low-cost mental health services available through Community Health Center. Crisis hotline: 1-800-273-8255",
      description: "Mental health support and counseling"
    }
  ];

  const filteredResources = mockResources.filter((r) => {
    if (!resourceSearch) return true;
    const query = resourceSearch.toLowerCase();
    return (
      r.title.toLowerCase().includes(query) ||
      r.content.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query)
    );
  });

  // Mock volunteers data
  const mockVolunteers = [
    { id: "1", firstName: "John", lastName: "Smith", email: "john@example.com", phoneNumber: "(555) 111-2222", interests: ["Bridge Team", "Mentoring"] },
    { id: "2", firstName: "Sarah", lastName: "Johnson", email: "sarah@example.com", phoneNumber: "(555) 333-4444", interests: ["Administrative Work"] },
    { id: "3", firstName: "Mike", lastName: "Davis", email: "mike@example.com", phoneNumber: "(555) 555-6666", interests: ["Clothing Donation", "General Volunteer"] }
  ];

  const filteredVolunteers = mockVolunteers.filter((v) => {
    if (!volunteerSearch) return true;
    const query = volunteerSearch.toLowerCase();
    return (
      v.firstName.toLowerCase().includes(query) ||
      v.lastName.toLowerCase().includes(query) ||
      v.email.toLowerCase().includes(query)
    );
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">7+</span>
            </div>
            <span className="text-xl font-bold text-text">7more</span>
          </div>
        </div>

        {/* Navigation based on role */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Admin & Bridge Team Leader Navigation */}
          {(currentUser?.role === "admin" || currentUser?.role === "bridge_team_leader") && (
            <>
              <NavButton
                icon={<Users className="w-5 h-5" />}
                label="All Participants"
                active={activeView === "participants"}
                onClick={() => setActiveView("participants")}
              />
              <NavButton
                icon={<UserPlus className="w-5 h-5" />}
                label="Add Participant"
                active={activeView === "add-participant"}
                onClick={() => setActiveView("add-participant")}
              />
              <NavButton
                icon={<Users className="w-5 h-5" />}
                label="Manage Users"
                active={activeView === "users"}
                onClick={() => setActiveView("users")}
              />
              <NavButton
                icon={<CheckSquare className="w-5 h-5" />}
                label="Task Management"
                active={activeView === "tasks"}
                onClick={() => setActiveView("tasks")}
              />
              <NavButton
                icon={<UserCircle className="w-5 h-5" />}
                label="Volunteers"
                active={activeView === "volunteers"}
                onClick={() => setActiveView("volunteers")}
              />
              <NavButton
                icon={<Calendar className="w-5 h-5" />}
                label="Scheduler"
                active={activeView === "scheduler"}
                onClick={() => setActiveView("scheduler")}
              />
              <NavButton
                icon={<BarChart3 className="w-5 h-5" />}
                label="Monthly Reporting"
                active={activeView === "reporting"}
                onClick={() => setActiveView("reporting")}
              />
              <NavButton
                icon={<FileText className="w-5 h-5" />}
                label="Resources"
                active={activeView === "resources"}
                onClick={() => setActiveView("resources")}
              />
            </>
          )}

          {/* Bridge Team Navigation */}
          {currentUser?.role === "bridge_team" && (
            <>
              <NavButton
                icon={<Users className="w-5 h-5" />}
                label="My Queue"
                active={activeView === "dashboard"}
                onClick={() => setActiveView("dashboard")}
              />
              <NavButton
                icon={<Calendar className="w-5 h-5" />}
                label="Scheduler"
                active={activeView === "scheduler"}
                onClick={() => setActiveView("scheduler")}
              />
              <NavButton
                icon={<CheckSquare className="w-5 h-5" />}
                label="My Tasks"
                active={activeView === "my-tasks"}
                onClick={() => setActiveView("my-tasks")}
              />
              <NavButton
                icon={<FileText className="w-5 h-5" />}
                label="Resources"
                active={activeView === "resources"}
                onClick={() => setActiveView("resources")}
              />
            </>
          )}

          {/* Mentor Navigation */}
          {currentUser?.role === "mentor" && (
            <>
              <NavButton
                icon={<Users className="w-5 h-5" />}
                label="My Mentees"
                active={activeView === "my-mentees"}
                onClick={() => setActiveView("my-mentees")}
              />
              <NavButton
                icon={<CheckSquare className="w-5 h-5" />}
                label="My Tasks"
                active={activeView === "my-tasks"}
                onClick={() => setActiveView("my-tasks")}
              />
              <NavButton
                icon={<UserCircle className="w-5 h-5" />}
                label="Volunteers"
                active={activeView === "volunteers"}
                onClick={() => setActiveView("volunteers")}
              />
              <NavButton
                icon={<FileText className="w-5 h-5" />}
                label="Resources"
                active={activeView === "resources"}
                onClick={() => setActiveView("resources")}
              />
            </>
          )}

          {/* Mentorship Leader Navigation */}
          {currentUser?.role === "mentorship_leader" && (
            <>
              <NavButton
                icon={<Users className="w-5 h-5" />}
                label="My Mentees"
                active={activeView === "my-mentees"}
                onClick={() => setActiveView("my-mentees")}
              />
              <NavButton
                icon={<UserCircle className="w-5 h-5" />}
                label="Volunteers"
                active={activeView === "volunteers"}
                onClick={() => setActiveView("volunteers")}
              />
              <NavButton
                icon={<CheckSquare className="w-5 h-5" />}
                label="My Tasks"
                active={activeView === "my-tasks"}
                onClick={() => setActiveView("my-tasks")}
              />
              <NavButton
                icon={<PlusCircle className="w-5 h-5" />}
                label="Assign Tasks"
                active={activeView === "assign-tasks"}
                onClick={() => setActiveView("assign-tasks")}
              />
              <NavButton
                icon={<BarChart3 className="w-5 h-5" />}
                label="Reporting"
                active={activeView === "reporting"}
                onClick={() => setActiveView("reporting")}
              />
              <NavButton
                icon={<FileText className="w-5 h-5" />}
                label="Resources"
                active={activeView === "resources"}
                onClick={() => setActiveView("resources")}
              />
            </>
          )}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-border">
          <div className="mb-3 px-4">
            <p className="text-sm font-semibold text-text truncate">
              {currentUser?.name}
            </p>
            <p className="text-xs text-secondary truncate">{currentUser?.email}</p>
            <p className="text-xs text-accent mt-1 font-medium">
              {currentUser?.role?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* All Participants View */}
          {activeView === "participants" && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-text mb-2">All Participants</h1>
                <p className="text-secondary">View and manage all participants in the system</p>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    placeholder="Search by name, number, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-5 h-5 text-secondary" />
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <div className="space-y-4">
                  {filteredParticipants.length === 0 ? (
                    <p className="text-secondary text-center py-8">
                      {searchQuery ? "No participants match your search" : "No participants found"}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredParticipants.map((p) => (
                        <div
                          key={p.id}
                          className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-text">
                                {p.firstName} {p.lastName}
                              </h3>
                              <p className="text-sm text-secondary mt-1">
                                #{p.participantNumber} • Status: {p.status?.replace(/_/g, " ")}
                              </p>
                              {p.email && (
                                <p className="text-sm text-secondary mt-1">
                                  Email: {p.email}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-secondary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Add Participant - Multi-step Intake Flow */}
          {activeView === "add-participant" && (
            <>
              {!selectedIntakeType ? (
                <IntakeTypeSelection
                  onSelect={handleIntakeTypeSelect}
                  onCancel={handleIntakeCancel}
                />
              ) : selectedIntakeType === "full_form_entry" || selectedIntakeType === "live_call_intake" ? (
                <>
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-text mb-2">
                      {selectedIntakeType === "live_call_intake" ? "Live Call Intake" : "Full Form Entry"}
                    </h1>
                    <p className="text-secondary">
                      {selectedIntakeType === "live_call_intake"
                        ? "Complete intake for participant on the phone now"
                        : "Manually add a new participant to the system"}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                    <AddParticipantForm
                      formData={formData}
                      setFormData={setFormData}
                      handleFormSubmit={handleFormSubmit}
                      LEGAL_STATUS_OPTIONS={LEGAL_STATUS_OPTIONS}
                      RELEASE_LOCATION_OPTIONS={RELEASE_LOCATION_OPTIONS}
                      REFERRAL_SOURCE_OPTIONS={REFERRAL_SOURCE_OPTIONS}
                      CRITICAL_NEEDS_OPTIONS={CRITICAL_NEEDS_OPTIONS}
                      toggleLegalStatus={toggleLegalStatus}
                      toggleCriticalNeed={toggleCriticalNeed}
                    />
                  </div>
                </>
              ) : selectedIntakeType === "missed_call_no_voicemail" ? (
                <MissedCallNoVoicemail
                  onSubmit={handleMissedCallSubmit}
                  onCancel={handleIntakeCancel}
                />
              ) : selectedIntakeType === "missed_call_voicemail" ? (
                <MissedCallVoicemail
                  onSubmit={handleMissedCallSubmit}
                  onCancel={handleIntakeCancel}
                />
              ) : null}
            </>
          )}

          {/* Manage Users View */}
          {activeView === "users" && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-text mb-2">Manage Users</h1>
                <p className="text-secondary">View and manage system users and their roles</p>
              </div>
              <div className="mb-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="w-5 h-5 text-secondary" />
                      </button>
                    )}
                  </div>
                  <button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 font-medium flex items-center gap-2 transition-colors">
                    <UserPlus className="w-5 h-5" />
                    Add User
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <p className="text-secondary text-center py-8">
                      {searchQuery ? "No users match your search" : "No users found"}
                    </p>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <div
                        key={user.id}
                        className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-text">{user.name}</h3>
                              {user.id === currentUser?.id && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-secondary mt-1">{user.email}</p>
                            <div className="mt-2">
                              <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded">
                                {user.role?.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                              </span>
                            </div>
                          </div>
                          {user.id !== currentUser?.id && (
                            <div className="flex gap-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* Task Management View */}
          {activeView === "tasks" && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-text mb-2">Task Management</h1>
                <p className="text-secondary">View, create, and manage tasks across the organization</p>
              </div>
              <div className="mb-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="w-5 h-5 text-secondary" />
                      </button>
                    )}
                  </div>
                  <button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 font-medium flex items-center gap-2 transition-colors">
                    <PlusCircle className="w-5 h-5" />
                    Create Task
                  </button>
                </div>
              </div>

              {/* Tabs for task views */}
              <div className="bg-white border-b border-border mb-4 rounded-t-xl">
                <div className="flex gap-4 px-6 pt-4">
                  <button className="pb-2 border-b-2 border-primary text-primary font-semibold">
                    All Tasks
                  </button>
                  <button className="pb-2 border-b-2 border-transparent text-secondary hover:text-text">
                    My Tasks
                  </button>
                  <button className="pb-2 border-b-2 border-transparent text-secondary hover:text-text">
                    Tasks I Assigned
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {["overdue", "in_progress", "pending"].map((status) => {
                  const statusTasks = filteredTasks.filter((t) => t.status === status);
                  if (statusTasks.length === 0) return null;

                  const statusColors = {
                    overdue: "bg-red-50 border-red-200 text-red-700",
                    in_progress: "bg-blue-50 border-blue-200 text-blue-700",
                    pending: "bg-gray-50 border-gray-200 text-gray-700"
                  };

                  const statusLabels = {
                    overdue: "Overdue",
                    in_progress: "In Progress",
                    pending: "Pending"
                  };

                  return (
                    <div key={status}>
                      <h3 className="text-sm font-bold text-text mb-3 uppercase">
                        {statusLabels[status as keyof typeof statusLabels]} ({statusTasks.length})
                      </h3>
                      <div className="space-y-3">
                        {statusTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`rounded-lg p-4 border-2 cursor-pointer hover:opacity-80 transition-opacity ${statusColors[status as keyof typeof statusColors]}`}
                          >
                            <h4 className="font-semibold text-text">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-secondary mt-2">{task.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span className="text-secondary">
                                Assigned to: {task.assignedToUserName || "Unassigned"}
                              </span>
                              <span className="text-secondary">
                                Priority: {task.priority}
                              </span>
                              {task.dueDate && (
                                <span className="text-secondary">
                                  Due: {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {filteredTasks.length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-border mx-auto mb-4" />
                    <p className="text-secondary">
                      {searchQuery ? "No tasks match your search" : "No tasks found"}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Volunteers View */}
          {activeView === "volunteers" && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-text mb-2">Volunteer Management</h1>
                <p className="text-secondary">View and manage volunteer database</p>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    placeholder="Search volunteers..."
                    value={volunteerSearch}
                    onChange={(e) => setVolunteerSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {volunteerSearch && (
                    <button
                      onClick={() => setVolunteerSearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-5 h-5 text-secondary" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {filteredVolunteers.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
                    <Users className="w-16 h-16 text-border mx-auto mb-4" />
                    <p className="text-secondary">
                      {volunteerSearch ? "No volunteers match your search" : "No volunteers found"}
                    </p>
                  </div>
                ) : (
                  filteredVolunteers.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className="bg-white rounded-lg border border-border p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-text">
                            {volunteer.firstName} {volunteer.lastName}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-sm text-secondary">
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {volunteer.phoneNumber}
                            </span>
                            <span>{volunteer.email}</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {volunteer.interests.map((interest) => (
                              <span
                                key={interest}
                                className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                          Convert to User
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Monthly Reporting View */}
          {activeView === "reporting" && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-text mb-2">Monthly Reporting</h1>
                <p className="text-secondary">View reports and analytics for program metrics</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-text">{participants.length}</h3>
                      <p className="text-sm text-secondary">Total Participants</p>
                    </div>
                  </div>
                  <p className="text-xs text-secondary">All time</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckSquare className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-text">
                        {tasks.filter(t => t.status === "completed").length}
                      </h3>
                      <p className="text-sm text-secondary">Completed Tasks</p>
                    </div>
                  </div>
                  <p className="text-xs text-secondary">This month</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-text">{shifts.length}</h3>
                      <p className="text-sm text-secondary">Total Shifts</p>
                    </div>
                  </div>
                  <p className="text-xs text-secondary">This month</p>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-text mb-4">Report Options</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveView("view-reporting")}
                    className="w-full bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-text">View Monthly Reports</h4>
                        <p className="text-sm text-secondary mt-1">
                          Access detailed monthly analytics and metrics
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-secondary" />
                    </div>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setActiveView("manage-reporting")}
                      className="w-full bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-left transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-text">Manage Reports</h4>
                          <p className="text-sm text-secondary mt-1">
                            Enter and edit monthly report data (Admin only)
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-secondary" />
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* View Reporting View */}
          {activeView === "view-reporting" && (
            <>
              <div className="mb-6">
                <button
                  onClick={() => setActiveView("reporting")}
                  className="flex items-center gap-2 text-secondary hover:text-text mb-4 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  <span className="text-sm font-medium">Back to Monthly Reporting</span>
                </button>
                <h1 className="text-3xl font-bold text-text mb-2">View Reports</h1>
                <p className="text-secondary">View monthly reports with filtering and comparisons</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <p className="text-secondary text-center py-12">
                  Report viewing interface coming soon - filter by date range, view aggregations, and compare months
                </p>
              </div>
            </>
          )}

          {/* Manage Reporting View */}
          {activeView === "manage-reporting" && (
            <>
              <div className="mb-6">
                <button
                  onClick={() => setActiveView("reporting")}
                  className="flex items-center gap-2 text-secondary hover:text-text mb-4 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  <span className="text-sm font-medium">Back to Monthly Reporting</span>
                </button>
                <h1 className="text-3xl font-bold text-text mb-2">Manage Reports</h1>
                <p className="text-secondary">Enter and edit monthly report data</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <p className="text-secondary text-center py-12">
                  Report management interface coming soon - enter data for all categories
                </p>
              </div>
            </>
          )}

          {/* Resources View */}
          {activeView === "resources" && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-text mb-2">Resources</h1>
                    <p className="text-secondary">Quick access to participant resources</p>
                  </div>
                  {isAdmin && (
                    <button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 font-medium flex items-center gap-2 transition-colors">
                      <PlusCircle className="w-5 h-5" />
                      Add New
                    </button>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {resourceSearch && (
                    <button
                      onClick={() => setResourceSearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-5 h-5 text-secondary" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {filteredResources.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
                    <FileText className="w-16 h-16 text-border mx-auto mb-4" />
                    <p className="text-secondary">
                      {resourceSearch ? "No resources match your search" : "No resources found"}
                    </p>
                  </div>
                ) : (
                  filteredResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="bg-white rounded-xl shadow-sm border border-border p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-text mb-1">{resource.title}</h3>
                          {resource.description && (
                            <p className="text-sm text-secondary">{resource.description}</p>
                          )}
                        </div>
                        <span className="bg-accent/20 text-accent text-xs font-semibold px-3 py-1 rounded-full">
                          {resource.category}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-text leading-relaxed">{resource.content}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(resource.content)}
                          className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Text
                        </button>
                        {isAdmin && (
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors">
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* My Mentees View */}
          {activeView === "my-mentees" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">My Mentees</h1>
                <p className="text-secondary">View and manage your assigned mentees</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <div className="space-y-4">
                  {assignedParticipants.length === 0 ? (
                    <p className="text-secondary text-center py-8">No mentees assigned yet</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {assignedParticipants.map((p) => (
                        <div
                          key={p.id}
                          className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-text">
                                {p.firstName} {p.lastName}
                              </h3>
                              <p className="text-sm text-secondary mt-1">
                                #{p.participantNumber} • Status: {p.status?.replace(/_/g, " ")}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-secondary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* My Tasks View */}
          {activeView === "my-tasks" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">My Tasks</h1>
                <p className="text-secondary">View and manage your assigned tasks</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-border mx-auto mb-4" />
                  <p className="text-secondary">No active tasks</p>
                </div>
              </div>
            </>
          )}

          {/* Scheduler View */}
          {activeView === "scheduler" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">Scheduler</h1>
                <p className="text-secondary">View and manage shifts and schedules</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-border mx-auto mb-4" />
                  <p className="text-secondary">Nothing scheduled at this time</p>
                </div>
              </div>
            </>
          )}

          {/* Assign Tasks View */}
          {activeView === "assign-tasks" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">Assign Tasks</h1>
                <p className="text-secondary">Create and assign tasks to team members</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <p className="text-secondary text-center py-12">
                  Task assignment interface - Create new tasks and assign them to users
                </p>
              </div>
            </>
          )}

          {/* Dashboard/Overview View (default) - Role-based */}
          {(activeView === "dashboard" || !activeView) && (
            <>
              {/* Admin Homepage */}
              {isAdmin && <AdminHomepageView onNavigate={setActiveView} />}

              {/* Bridge Team Dashboard */}
              {isBridgeTeam && <BridgeTeamDashboardView />}

              {/* Mentor Dashboard */}
              {isMentor && <MentorDashboardView />}

              {/* Fallback for other roles */}
              {!isAdmin && !isBridgeTeam && !isMentor && (
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-text mb-2">
                    Welcome back, {currentUser?.name?.split(" ")[0]}!
                  </h1>
                  <p className="text-secondary">Select an option from the sidebar</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
