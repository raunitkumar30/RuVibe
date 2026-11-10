import { create } from "zustand";
import api from "../api/axios";

export const useAuthStore = create((set) => ({
  user: null,              // Holds { id, username, email, role }
  isAuthenticated: false,
  isLoading: true,         // Checks auth on first page load
  error: null,

  // 1. Check if user already has an active session cookie on page load
  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/auth/me");
      set({
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // 2. Login user
  login: async (usernameOrEmail, password) => {
    set({ error: null });
    try {
      const isEmail = usernameOrEmail.includes("@");
      const payload = isEmail
        ? { email: usernameOrEmail, password }
        : { username: usernameOrEmail, password };

      const res = await api.post("/auth/login", payload);
      set({
        user: res.data.user,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      set({ error: message });
      return { success: false, message };
    }
  },

  // 3. Register user (user or artist)
  register: async ({ username, email, password, role }) => {
    set({ error: null });
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
        role: role || "user",
      });
      set({
        user: res.data.user,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      set({ error: message });
      return { success: false, message };
    }
  },

  // 4. Logout
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      try {
        await api.post("/music/logout");
      } catch {
        // ignore
      }
    }
    set({ user: null, isAuthenticated: false });
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("ruvibe:unauthorized", () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });
}