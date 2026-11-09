import React, { useState } from "react";
import { X, Lock, Mail, User, Mic2, Headphones } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export default function AuthModal({ isOpen, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // "user" or "artist"
  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLoading(true);

    if (isRegister) {
      if (!username || !email || !password) {
        setLocalError("Please fill in all fields");
        setLoading(false);
        return;
      }
      const res = await register({ username, email, password, role });
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setLocalError(res.message);
      }
    } else {
      if (!username && !email) {
        setLocalError("Please enter your username or email");
        setLoading(false);
        return;
      }
      const res = await login(username || email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setLocalError(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#161822] border border-white/10 rounded-3xl p-7 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isRegister ? "Join RuVibe" : "Welcome Back"}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isRegister
              ? "Discover millions of tracks or upload your own music"
              : "Sign in to access your library, playlists, and favorites"}
          </p>
        </div>

        {/* Error message */}
        {localError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <User
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1e202e] text-sm text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-blue-500 transition-colors"
              required={isRegister}
            />
          </div>

          {/* Email (only on Register) */}
          {isRegister && (
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1e202e] text-sm text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          )}

          {/* Password */}
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1e202e] text-sm text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {/* Role Selection (Listener vs Artist) on Register */}
          {isRegister && (
            <div className="pt-2">
              <label className="text-[11px] font-semibold uppercase text-gray-400 block mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    role === "user"
                      ? "bg-blue-600/20 border-blue-500 text-blue-400"
                      : "bg-[#1e202e] border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <Headphones size={16} />
                  <span>Listener</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("artist")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    role === "artist"
                      ? "bg-blue-600/20 border-blue-500 text-blue-400"
                      : "bg-[#1e202e] border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <Mic2 size={16} />
                  <span>Artist</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-98 disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading
              ? "Please wait..."
              : isRegister
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="text-center mt-6 pt-4 border-t border-white/5 text-xs text-gray-400">
          {isRegister ? (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setLocalError("");
                }}
                className="text-blue-400 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setLocalError("");
                }}
                className="text-blue-400 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}