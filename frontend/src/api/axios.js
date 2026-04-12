// src/api/axios.jsx
import axios from "axios";

const normalizeApiBase = (raw) => {
  const value = String(raw || "").trim();
  if (!value) return "http://localhost:8000/api";
  if (value === "/api" || value.endsWith("/api")) return value.replace(/\/+$/, "");
  return `${value.replace(/\/+$/, "")}/api`;
};

/**
 * Axios instance
 * - Cookie-based auth (JWT in cookies)
 * - Centralized config
 */
const api = axios.create({
  baseURL: normalizeApiBase(import.meta.env.VITE_API_URL),
  withCredentials: true, // 🍪 allow cookies
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("smart-ses-token") || localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Optional: Response interceptor
 * Catch global errors (401, 403, etc.)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("Unauthorized – please login");
      // future: redirect to /login
    }

    if (status === 403) {
      console.warn("Forbidden – no permission");
    }

    return Promise.reject(error);
  }
);

export default api;
