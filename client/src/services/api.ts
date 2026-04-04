import axios from "axios";
import { Job, User, Feedback } from "../types";

/* ---------- AXIOS INSTANCE ---------- */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------- AUTO TOKEN REFRESH ---------- */
let isRefreshing = false;
let failedQueue: { resolve: (v?: unknown) => void; reject: (e?: unknown) => void }[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and not on the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/users/refreshToken') &&
      !originalRequest.url?.includes('/users/login')
    ) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/users/refreshToken');
        processQueue();
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — clear session
        localStorage.removeItem("hasSession");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ---------- SHARED RESPONSE TYPE ---------- */
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}



export default api;
