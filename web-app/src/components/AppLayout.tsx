import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  LogOut,
  Home,
  Users,
  CheckSquare,
  Calendar,
  BarChart3,
  FileText,
  PlusCircle,
  UserCircle,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Define navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const role = currentUser?.role;

    // Admin navigation
    if (role === "admin" || role === "bridge_team_leader") {
      return [
        { label: "Homepage", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
        { label: "Users", path: "/users", icon: <Users className="w-5 h-5" /> },
        { label: "Tasks", path: "/tasks", icon: <CheckSquare className="w-5 h-5" /> },
        { label: "Volunteers", path: "/volunteers", icon: <UserCircle className="w-5 h-5" /> },
        { label: "Scheduler", path: "/scheduler", icon: <Calendar className="w-5 h-5" /> },
        { label: "Reporting", path: "/reporting", icon: <BarChart3 className="w-5 h-5" /> },
        { label: "Resources", path: "/resources", icon: <FileText className="w-5 h-5" /> },
      ];
    }

    // Bridge Team navigation
    if (role === "bridge_team") {
      return [
        { label: "Queue", path: "/dashboard", icon: <Users className="w-5 h-5" /> },
        { label: "Scheduler", path: "/scheduler", icon: <Calendar className="w-5 h-5" /> },
        { label: "My Tasks", path: "/my-tasks", icon: <CheckSquare className="w-5 h-5" /> },
        { label: "Resources", path: "/resources", icon: <FileText className="w-5 h-5" /> },
      ];
    }

    // Board Member navigation
    if (role === "board_member") {
      return [
        { label: "Home", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
        { label: "Scheduler", path: "/scheduler", icon: <Calendar className="w-5 h-5" /> },
        { label: "My Tasks", path: "/my-tasks", icon: <CheckSquare className="w-5 h-5" /> },
        { label: "Reporting", path: "/reporting", icon: <BarChart3 className="w-5 h-5" /> },
        { label: "Resources", path: "/resources", icon: <FileText className="w-5 h-5" /> },
      ];
    }

    // Volunteer navigation
    if (role === "volunteer" || role === "volunteer_support") {
      return [
        { label: "Homepage", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
        { label: "My Tasks", path: "/my-tasks", icon: <CheckSquare className="w-5 h-5" /> },
        { label: "Volunteers", path: "/volunteers", icon: <UserCircle className="w-5 h-5" /> },
        { label: "Resources", path: "/resources", icon: <FileText className="w-5 h-5" /> },
      ];
    }

    // Mentor navigation
    if (role === "mentor") {
      return [
        { label: "Homepage", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
        { label: "My Mentees", path: "/my-mentees", icon: <Users className="w-5 h-5" /> },
        { label: "My Tasks", path: "/my-tasks", icon: <CheckSquare className="w-5 h-5" /> },
        { label: "Volunteers", path: "/volunteers", icon: <UserCircle className="w-5 h-5" /> },
        { label: "Resources", path: "/resources", icon: <FileText className="w-5 h-5" /> },
      ];
    }

    // Mentorship Leader navigation
    if (role === "mentorship_leader") {
      return [
        { label: "Homepage", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
        { label: "My Mentees", path: "/my-mentees", icon: <Users className="w-5 h-5" /> },
        { label: "Volunteers", path: "/volunteers", icon: <UserCircle className="w-5 h-5" /> },
        { label: "My Tasks", path: "/my-tasks", icon: <CheckSquare className="w-5 h-5" /> },
        { label: "Assign Tasks", path: "/assign-tasks", icon: <PlusCircle className="w-5 h-5" /> },
        { label: "Reporting", path: "/reporting", icon: <BarChart3 className="w-5 h-5" /> },
        { label: "Resources", path: "/resources", icon: <FileText className="w-5 h-5" /> },
      ];
    }

    // Supporter navigation
    if (role === "supporter") {
      return [
        { label: "Schedule", path: "/scheduler", icon: <Calendar className="w-5 h-5" /> },
        { label: "Tasks", path: "/my-tasks", icon: <CheckSquare className="w-5 h-5" /> },
      ];
    }

    // Default fallback
    return [
      { label: "Dashboard", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
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

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-text hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-border">
          <div className="mb-3 px-4">
            <p className="text-sm font-semibold text-text truncate">
              {currentUser?.name}
            </p>
            <p className="text-xs text-secondary truncate">{currentUser?.email}</p>
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

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
