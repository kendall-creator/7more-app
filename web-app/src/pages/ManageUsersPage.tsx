import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useInvitedUsers, useUsersStore } from "../store/usersStore";
import { useAuthStore } from "../store/authStore";
import { UserRole, InvitedUser } from "../types";
import {
  Search,
  X,
  UserPlus,
  Edit,
  Key,
  LogIn,
  Trash2,
  Copy,
  Mail,
  AlertCircle,
  CheckCircle2,
  Users as UsersIcon,
  ArrowLeft,
  Download,
} from "lucide-react";

interface InvitedUserDisplay {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  role: UserRole;
}

export default function ManageUsersPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const userRole = currentUser?.role;
  const invitedUsers = useInvitedUsers();
  const removeUser = useUsersStore((s) => s.removeUser);
  const resetPassword = useUsersStore((s) => s.resetPassword);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InvitedUserDisplay | null>(null);
  const [newTemporaryPassword, setNewTemporaryPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleBackupUsers = async () => {
    try {
      const backup = JSON.stringify(invitedUsers, null, 2);
      await navigator.clipboard.writeText(backup);
      
      const stats = {
        total: invitedUsers.length,
        admin: invitedUsers.filter((u) => u.role === "admin").length,
        bridge_team: invitedUsers.filter((u) => u.role === "bridge_team").length,
        mentorship_leader: invitedUsers.filter((u) => u.role === "mentorship_leader").length,
        mentor: invitedUsers.filter((u) => u.role === "mentor").length,
      };

      alert(
        `Backup Created!\n\nUser data copied to clipboard!\n\nTotal users: ${stats.total}\n- Admins: ${stats.admin}\n- Bridge Team: ${stats.bridge_team}\n- Mentorship Leaders: ${stats.mentorship_leader}\n- Mentors: ${stats.mentor}\n\nSave this backup somewhere safe.`
      );
    } catch (error) {
      alert("Error: Failed to create backup. Please try again.");
    }
  };

  // Convert invited users to display format
  const allUsers: InvitedUserDisplay[] = invitedUsers.map((u) => ({
    id: u.id,
    name: u.name,
    nickname: u.nickname,
    email: u.email,
    role: u.role,
  }));

  // Filter users based on role - Bridge Team Leaders only see Bridge Team members
  const visibleUsers = useMemo(() => {
    if (userRole === "bridge_team_leader") {
      return allUsers.filter((u) => u.role === "bridge_team" || u.role === "bridge_team_leader");
    }
    return allUsers;
  }, [allUsers, userRole]);

  const roleOptions: { value: UserRole | "all"; label: string; color: string }[] = [
    { value: "all", label: "All", color: "bg-gray-100 text-gray-700" },
    { value: "admin", label: "Admin", color: "bg-gray-100 text-yellow-700" },
    { value: "bridge_team", label: "Bridge Team", color: "bg-gray-200 text-gray-900" },
    { value: "bridge_team_leader", label: "Bridge Team Leader", color: "bg-yellow-100 text-yellow-700" },
    { value: "mentorship_leader", label: "Mentorship Leader", color: "bg-yellow-100 text-gray-700" },
    { value: "mentor", label: "Mentor", color: "bg-yellow-100 text-gray-900" },
  ];

  const filteredUsers = visibleUsers.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.nickname && user.nickname.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    const option = roleOptions.find((opt) => opt.value === role);
    return option || { label: role, color: "bg-gray-100 text-gray-700" };
  };

  const handleDeleteUser = (user: InvitedUserDisplay) => {
    if (user.id === currentUser?.id) {
      return; // Can't delete yourself
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await removeUser(selectedUser.id);
        setShowDeleteModal(false);
        setSelectedUser(null);
      } catch (error) {
        alert("Error deleting user. Please try again.");
      }
    }
  };

  const handleImpersonate = (user: InvitedUserDisplay) => {
    if (!currentUser) return;
    setSelectedUser(user);
    setShowImpersonateModal(true);
  };

  const confirmImpersonate = () => {
    if (selectedUser && currentUser) {
      // Note: Impersonation feature would need to be added to authStore
      alert("Impersonation feature coming soon");
      setShowImpersonateModal(false);
      setSelectedUser(null);
    }
  };

  const handleResetPassword = (user: InvitedUserDisplay) => {
    if (user.id === currentUser?.id) {
      alert("Cannot Reset", "You cannot reset your own password.");
      return;
    }
    setSelectedUser(user);
    setShowResetPasswordModal(true);
  };

  const generatePasswordFromName = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length < 2) return name.toLowerCase() + "123";
    const firstInitial = parts[0][0].toLowerCase();
    const lastName = parts[parts.length - 1].toLowerCase();
    return firstInitial + lastName;
  };

  const confirmResetPassword = async () => {
    if (!selectedUser) return;

    setIsResettingPassword(true);

    try {
      // Generate new password from user's name (first initial + last name)
      const newPassword = generatePasswordFromName(selectedUser.name);

      const result = await resetPassword(selectedUser.id, newPassword);

      if (result.success) {
        setNewTemporaryPassword(result.password);
        // Email sending would be handled by backend - for now just show password
        setResetEmailSent(false);
      }
    } catch (error) {
      alert("Error: Failed to reset password. Please try again.");
      setShowResetPasswordModal(false);
      setSelectedUser(null);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setSelectedUser(null);
    setNewTemporaryPassword("");
    setResetEmailSent(false);
  };

  const copyResetPasswordToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(newTemporaryPassword);
      alert("Copied! Temporary password copied to clipboard.");
    } catch (error) {
      alert("Failed to copy to clipboard.");
    }
  };

  const renderUserCard = (user: InvitedUserDisplay) => {
    const badge = getRoleBadge(user.role);
    const isCurrentUser = user.id === currentUser?.id;

    return (
      <div
        key={user.id}
        className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-gray-900">
                {user.name}
                {user.nickname && (
                  <span className="text-gray-500 font-normal"> ({user.nickname})</span>
                )}
              </span>
              {isCurrentUser && (
                <span className="bg-yellow-100 px-2 py-0.5 rounded text-xs font-semibold text-gray-900">
                  You
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">{user.email}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {!isCurrentUser && (
          <div className="gap-2 mt-2">
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/users/${user.id}/edit`)}
                className="flex-1 bg-green-50 border border-green-200 rounded-xl py-2 flex items-center justify-center hover:bg-green-100 transition-colors"
              >
                <Edit className="w-4 h-4 text-green-600" />
                <span className="text-green-600 text-sm font-semibold ml-1">Edit</span>
              </button>
              <button
                onClick={() => handleResetPassword(user)}
                className="flex-1 bg-blue-50 border border-blue-200 rounded-xl py-2 flex items-center justify-center hover:bg-blue-100 transition-colors"
              >
                <Key className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600 text-sm font-semibold ml-1">Reset PW</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleImpersonate(user)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <LogIn className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600 text-sm font-semibold ml-1">Login As</span>
              </button>
              <button
                onClick={() => handleDeleteUser(user)}
                className="flex-1 bg-red-50 border border-red-200 rounded-xl py-2 flex items-center justify-center hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span className="text-red-600 text-sm font-semibold ml-1">Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-600 pt-16 pb-6 px-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/dashboard")} className="text-white hover:opacity-80">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleBackupUsers}
            className="bg-yellow-600 rounded-xl px-4 py-2 flex items-center hover:bg-yellow-700 transition-colors"
          >
            <Download className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold ml-2">Backup Users</span>
          </button>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Manage Users</h1>
        <p className="text-yellow-100 text-sm">
          {filteredUsers.length} of {allUsers.length} user{allUsers.length !== 1 ? "s" : ""}
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
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery.length > 0 && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => navigate("/users/add")}
            className="bg-gray-600 rounded-xl px-4 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <UserPlus className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Role Filter */}
      <div className="px-6 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto">
          {roleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterRole(option.value)}
              className={`px-4 py-2 rounded-full border whitespace-nowrap ${
                filterRole === option.value
                  ? "bg-gray-600 border-gray-600 text-white"
                  : "bg-white border-gray-200 text-gray-700"
              }`}
            >
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="px-6 py-4">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-300" />
            <p className="text-gray-500 text-base mt-4">No users found</p>
            <p className="text-gray-400 text-sm mt-1 text-center">
              {searchQuery || filterRole !== "all"
                ? "Try adjusting your search or filters"
                : "Add a new user to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">{filteredUsers.map(renderUserCard)}</div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete User</h2>
              <p className="text-center text-gray-600">
                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={confirmDelete}
                className="bg-red-600 rounded-xl py-3 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-100 rounded-xl py-3 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Impersonate Confirmation Modal */}
      {showImpersonateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                <LogIn className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Login As User</h2>
              <p className="text-center text-gray-600">
                You will be logged in as {selectedUser?.name} ({selectedUser?.role}). You can return to your admin account at any time.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={confirmImpersonate}
                className="bg-gray-600 rounded-xl py-3 text-white font-semibold hover:bg-gray-700 transition-colors"
              >
                Login As This User
              </button>
              <button
                onClick={() => setShowImpersonateModal(false)}
                className="bg-gray-100 rounded-xl py-3 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            {!newTemporaryPassword ? (
              // Confirmation Screen
              <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Key className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
                <p className="text-center text-gray-600 mb-4">
                  A new password will be generated for {selectedUser?.name} based on their name (first initial + last name).
                </p>
                {isResettingPassword ? (
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={confirmResetPassword}
                      className="bg-blue-600 rounded-xl py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={closeResetPasswordModal}
                      className="bg-gray-100 rounded-xl py-3 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Success Screen with new password
              <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
                <p className="text-center text-gray-600 mb-4">
                  New password generated for {selectedUser?.name}.
                </p>

                {/* Email Status */}
                {resetEmailSent ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 w-full">
                    <div className="flex items-center mb-1">
                      <Mail className="w-4 h-4 text-green-600" />
                      <span className="text-green-800 font-semibold ml-2">Email Sent</span>
                    </div>
                    <p className="text-green-700 text-xs">
                      Reset email sent to {selectedUser?.email}
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 w-full">
                    <div className="flex items-center mb-1">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-800 font-semibold ml-2">Email Not Configured</span>
                    </div>
                    <p className="text-yellow-700 text-xs">
                      Share this password with the user manually.
                    </p>
                  </div>
                )}

                {/* Password Display */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 w-full">
                  <p className="text-gray-700 font-semibold mb-2 text-center">
                    New Password
                  </p>
                  <div className="bg-white border border-gray-300 rounded-lg p-3 mb-3">
                    <p className="text-gray-900 font-mono text-center select-all">
                      {newTemporaryPassword}
                    </p>
                  </div>
                  <button
                    onClick={copyResetPasswordToClipboard}
                    className="bg-gray-600 rounded-lg py-2 w-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <Copy className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-semibold ml-2">Copy Password</span>
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mb-4">
                  The user can change their password anytime from their account settings.
                </p>

                <button
                  onClick={closeResetPasswordModal}
                  className="bg-gray-600 rounded-xl py-3 w-full text-white font-semibold hover:bg-gray-700 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

