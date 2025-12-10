import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useDataStore } from "./store/dataStore";
import LoginPage from "./pages/LoginPage";
import MainDashboard from "./pages/MainDashboard";

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Public route wrapper (redirect to dashboard if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const initializeUsersListener = useAuthStore((s) => s.initializeUsersListener);
  const initializeDataListeners = useDataStore((s) => s.initializeListeners);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Initialize Firebase listeners
  useEffect(() => {
    initializeUsersListener();
  }, [initializeUsersListener]);

  // Initialize data listeners when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeDataListeners();
    }
  }, [isAuthenticated, initializeDataListeners]);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainDashboard />
          </ProtectedRoute>
        }
      />

      {/* Redirect root to dashboard (or login if not authenticated) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
