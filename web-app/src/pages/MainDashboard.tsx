import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LogOut, User, Mail, Shield, CheckCircle2 } from "lucide-react";

export default function MainDashboard() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">7+</span>
              </div>
              <span className="text-xl font-bold text-text">7more</span>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-text">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-secondary">{currentUser?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
          <p className="text-secondary">Welcome to your admin dashboard</p>
        </div>

        {/* User Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {/* Card Header */}
          <div className="bg-primary px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              User Information
            </h2>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-6">
            {/* Success Message */}
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-700 font-medium">
                Web App Connected!
              </p>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-secondary text-sm font-medium">
                  <User className="w-4 h-4" />
                  <label>Name</label>
                </div>
                <p className="text-text text-lg font-semibold pl-6">
                  {currentUser?.name || "N/A"}
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-secondary text-sm font-medium">
                  <Mail className="w-4 h-4" />
                  <label>Email Address</label>
                </div>
                <p className="text-text text-lg font-semibold pl-6">
                  {currentUser?.email || "N/A"}
                </p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-secondary text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  <label>Role</label>
                </div>
                <div className="pl-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                    {currentUser?.role
                      ? currentUser.role
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
