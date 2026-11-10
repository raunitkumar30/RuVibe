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

export default api;