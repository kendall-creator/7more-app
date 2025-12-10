import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const loginError = useAuthStore((s) => s.loginError);
  const clearError = useAuthStore((s) => s.clearError);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      navigate("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#405b69] animate-spin" />
          <p className="text-[#99896c]">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#405b69] rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">7+</span>
          </div>
          <h1 className="text-3xl font-bold text-[#3c3832]">Welcome to 7more</h1>
          <p className="text-[#99896c] mt-2">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#d7d7d6]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{loginError}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-[#3c3832] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#99896c]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[#d7d7d6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#405b69] focus:border-transparent text-[#3c3832] placeholder:text-[#99896c]/60"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-[#3c3832] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#99896c]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[#d7d7d6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#405b69] focus:border-transparent text-[#3c3832] placeholder:text-[#99896c]/60"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#405b69] text-white py-3 rounded-xl font-semibold hover:bg-[#405b69]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[#99896c] text-sm mt-6">
          Contact your administrator if you need access
        </p>
      </div>
    </div>
  );
}
