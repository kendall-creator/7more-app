import React from "react";
import {
  Users,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  GraduationCap,
  XCircle,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { useDataStore } from "../store/dataStore";

interface StatCardProps {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const StatCard = ({ title, value, color, icon, onClick }: StatCardProps) => (
  <button
    onClick={onClick}
    disabled={!onClick || value === 0}
    className={`w-full bg-white rounded-xl p-5 border border-border hover:shadow-md transition-all text-left flex items-center justify-between ${
      onClick && value > 0 ? "cursor-pointer" : "cursor-default"
    }`}
  >
    <div className="flex-1">
      <p className="text-secondary text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-text">{value.toLocaleString()}</p>
    </div>
    <div className="flex items-center gap-2">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white`}>
        {icon}
      </div>
      {onClick && value > 0 && <ChevronRight className="w-5 h-5 text-secondary" />}
    </div>
  </button>
);

export default function AdminDashboardView() {
  const participants = useDataStore((s) => s.participants);

  // Calculate metrics
  const metrics = React.useMemo(() => {
    const totalParticipants = participants.length;
    const pendingBridge = participants.filter((p) => p.status === "pending_bridge").length;
    const bridgeContacted = participants.filter((p) => p.status === "bridge_contacted").length;
    const bridgeAttempted = participants.filter((p) => p.status === "bridge_attempted").length;
    const bridgeUnable = participants.filter((p) => p.status === "bridge_unable").length;
    const mentorAttempted = participants.filter((p) => p.status === "mentor_attempted").length;
    const mentorUnable = participants.filter((p) => p.status === "mentor_unable").length;
    const unableToContact = participants.filter(
      (p) => p.status === "bridge_unable" || p.status === "mentor_unable"
    ).length;
    const pendingMentorAssignment = participants.filter((p) => p.status === "pending_mentor").length;
    const assignedToMentor = participants.filter(
      (p) => p.status === "assigned_mentor" || p.status === "initial_contact_pending"
    ).length;
    const activeInMentorship = participants.filter((p) => p.status === "active_mentorship").length;
    const graduated = participants.filter((p) => p.status === "graduated").length;
    const ceasedContact = participants.filter((p) => p.status === "ceased_contact").length;

    // Monthly metrics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlySubmissions = participants.filter((p) => {
      if (!p.createdAt && !p.submittedAt) return false;
      const submitted = new Date(p.createdAt || p.submittedAt!);
      return submitted >= thirtyDaysAgo;
    }).length;

    return {
      totalParticipants,
      pendingBridge,
      bridgeContacted,
      bridgeAttempted,
      bridgeUnable,
      mentorAttempted,
      mentorUnable,
      unableToContact,
      pendingMentorAssignment,
      assignedToMentor,
      activeInMentorship,
      graduated,
      ceasedContact,
      monthlySubmissions,
    };
  }, [participants]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">Admin Dashboard</h1>
        <p className="text-secondary">Complete program overview</p>
      </div>

      <div className="space-y-6">
        {/* Overview Section */}
        <div>
          <h2 className="text-lg font-bold text-text mb-3">Overview</h2>
          <StatCard
            title="Total Participants"
            value={metrics.totalParticipants}
            color="bg-gray-600"
            icon={<Users className="w-6 h-6" />}
          />
        </div>

        {/* Bridge Team Section */}
        <div>
          <h2 className="text-lg font-bold text-text mb-3">Bridge Team Queue</h2>
          <div className="space-y-3">
            <StatCard
              title="Pending Bridge Contact"
              value={metrics.pendingBridge}
              color="bg-gray-700"
              icon={<Phone className="w-6 h-6" />}
            />
            <StatCard
              title="Contacted"
              value={metrics.bridgeContacted}
              color="bg-yellow-500"
              icon={<CheckCircle className="w-6 h-6" />}
            />
            <StatCard
              title="Attempted Contact"
              value={metrics.bridgeAttempted}
              color="bg-amber-500"
              icon={<Clock className="w-6 h-6" />}
            />
            <StatCard
              title="Unable to Contact (Bridge)"
              value={metrics.bridgeUnable}
              color="bg-gray-500"
              icon={<XCircle className="w-6 h-6" />}
            />
          </div>
        </div>

        {/* Mentorship Section */}
        <div>
          <h2 className="text-lg font-bold text-text mb-3">Mentorship Program</h2>
          <div className="space-y-3">
            <StatCard
              title="Awaiting Mentor Assignment"
              value={metrics.pendingMentorAssignment}
              color="bg-yellow-500"
              icon={<Clock className="w-6 h-6" />}
            />
            <StatCard
              title="Assigned to Mentor"
              value={metrics.assignedToMentor}
              color="bg-yellow-500"
              icon={<UserPlus className="w-6 h-6" />}
            />
            <StatCard
              title="Mentor Attempted Contact"
              value={metrics.mentorAttempted}
              color="bg-amber-500"
              icon={<Clock className="w-6 h-6" />}
            />
            <StatCard
              title="Unable to Contact (Mentor)"
              value={metrics.mentorUnable}
              color="bg-gray-500"
              icon={<XCircle className="w-6 h-6" />}
            />
            <StatCard
              title="Active in Mentorship"
              value={metrics.activeInMentorship}
              color="bg-yellow-500"
              icon={<TrendingUp className="w-6 h-6" />}
            />
          </div>
        </div>

        {/* Combined Unable to Contact Section */}
        <div>
          <h2 className="text-lg font-bold text-text mb-3">Unable to Contact (All)</h2>
          <StatCard
            title="All Unable to Contact"
            value={metrics.unableToContact}
            color="bg-red-500"
            icon={<AlertCircle className="w-6 h-6" />}
          />
        </div>

        {/* Outcomes Section */}
        <div>
          <h2 className="text-lg font-bold text-text mb-3">Program Outcomes</h2>
          <div className="space-y-3">
            <StatCard
              title="Graduated"
              value={metrics.graduated}
              color="bg-yellow-600"
              icon={<GraduationCap className="w-6 h-6" />}
            />
            <StatCard
              title="Ceased Contact"
              value={metrics.ceasedContact}
              color="bg-gray-700"
              icon={<XCircle className="w-6 h-6" />}
            />
          </div>
        </div>

        {/* Monthly Metrics */}
        <div>
          <h2 className="text-lg font-bold text-text mb-3">Monthly Activity (Last 30 Days)</h2>
          <div className="bg-white rounded-xl p-5 border border-border">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <p className="text-secondary text-sm">New Submissions</p>
              <p className="text-xl font-bold text-yellow-600">{metrics.monthlySubmissions}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
