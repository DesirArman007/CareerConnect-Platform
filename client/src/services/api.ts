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

/* ---------- GLOBAL RESPONSE HANDLER ---------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return the error so the calling function can handle it
    // Removed automatic redirect to /login on 401 to prevent login loops
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
