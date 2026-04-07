// src/api/axios.jsx
import axios from "axios";
import { addNotification } from "../utils/notifications";

/**
 * Axios instance
 * - Cookie-based auth (JWT in cookies)
 * - Centralized config
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true, // 🍪 allow cookies
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Optional: Response interceptor
 * Catch global errors (401, 403, etc.)
 */
api.interceptors.response.use(
  (response) => {
    const method = String(response?.config?.method || "get").toUpperCase();
    const url = String(response?.config?.url || "");
    const shouldNotifyMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const isAuthRoute = ["/auth/login", "/auth/register", "/auth/logout"].some((item) => url.includes(item));
    const isUploadRoute = url.includes("/uploads");
    const skipByConfig = response?.config?.headers?.["x-skip-notification"] === "1";
    if (shouldNotifyMethod && !isAuthRoute && !isUploadRoute && !skipByConfig) {
      const serverMessage = response?.data?.message;
      addNotification({
        title: "System Update",
        message: serverMessage || `${method} action completed successfully.`,
        type: "info",
      });
    }
    return response;
  },
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
