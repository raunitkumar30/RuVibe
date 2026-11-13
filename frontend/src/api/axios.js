import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL && import.meta.env.DEV) {
  console.warn("VITE_API_BASE_URL not found in .env; falling back to http://localhost:3000/api");
}

const api = axios.create({
  baseURL: baseURL || "http://localhost:3000/api",
  withCredentials: true,
  timeout: 15000,
});

// 1. Centralized Request Interceptor (Dual-Auth fallback for Safari / blocked cookies)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("ruvibe_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Centralized Response Interceptor (Handles unauthorized session drops)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If receiving 401 on non-login/non-check requests, broadcast or clear state
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login") &&
      !error.config?.url?.includes("/auth/me")
    ) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ruvibe:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;