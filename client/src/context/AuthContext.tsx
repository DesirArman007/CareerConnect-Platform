import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/auth.api";
import { userApi } from "../services/users.api";
import { jobApi } from "../services/jobs.api";
import { ApiResponse } from "../services/api";
import { User, Job } from "../types";

type UpdateProfilePayload = {
  name?: string;
  email?: string;
};

interface AuthContextType {
  user: User | null;
  savedJobs: string[];
  isLoading: boolean;

  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;

  updateProfile: (data: UpdateProfilePayload) => Promise<void>;

  toggleSaveJob: (jobId: string) => Promise<void>;
  isJobSaved: (jobId: string) => boolean;
  markJobAsApplied: (jobId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------- PROVIDER ---------- */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------- FETCH USER ---------- */

  /* ---------- FETCH USER ---------- */

  const fetchUserData = async (): Promise<boolean> => {
    try {
      const response = (await userApi.getUser()) as ApiResponse<User>;

      if (response.success && response.data) {
        setUser(response.data);
        setSavedJobs(response.data.savedJobs ?? []);
        return true;
      }

      return false;
    } catch {
      setUser(null);
      setSavedJobs([]);
      return false;
    }
  };

  /* ---------- INIT AUTH ---------- */

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      if (localStorage.getItem("hasSession")) {
        const ok = await fetchUserData();
        if (!ok) localStorage.removeItem("hasSession");
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  /* ---------- AUTH ACTIONS ---------- */

  const login = async (credentials: { email: string; password: string }) => {
    const response = await authApi.login(credentials);
    if (!response.success) throw new Error(response.message || "Login failed");

    localStorage.setItem("hasSession", "true");
    const sessionActive = await fetchUserData();
    if (!sessionActive) {
      throw new Error("Login succeeded but session failed to establish. Please check your cookies.");
    }
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    const response = await authApi.register(data);
    if (!response.success) throw new Error(response.message || "Registration failed");
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem("hasSession");
      setUser(null);
      setSavedJobs([]);
    }
  };

  const googleLogin = async (idToken: string) => {
    const response = await authApi.googleAuth(idToken);
    if (!response.success) throw new Error(response.message || "Google login failed");

    localStorage.setItem("hasSession", "true");
    const sessionActive = await fetchUserData();
    if (!sessionActive) {
      throw new Error("Google login succeeded but session failed to establish.");
    }
  };

  /* ---------- PROFILE ---------- */

  const updateProfile = async (data: UpdateProfilePayload) => {
    if (!user) return;

    const response = (await userApi.updateUser(data)) as ApiResponse<User>;
    if (response.success && response.data) {
      setUser(response.data);
    }
  };

  /* ---------- SAVED JOBS (API INTEGRATION) ---------- */

  const toggleSaveJob = async (jobId: string) => {
    if (!user) return;

    const isSaved = savedJobs.includes(jobId);

    try {
      if (isSaved) {
        await jobApi.removeSavedJob(jobId);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        await jobApi.saveJob(jobId);
        setSavedJobs(prev => [...prev, jobId]);
      }
    } catch (error) {
      console.error("Failed to toggle save job", error);
      // Optional: Show toast error here
    }
  };

  const isJobSaved = (jobId: string) => savedJobs.includes(jobId);

  /* ---------- APPLIED JOBS (API INTEGRATION) ---------- */

  const markJobAsApplied = async (jobId: string) => {
    if (!user) return;

    // Optimistic check to avoid duplicate calls
    const applied = user.appliedJobs ?? [];
    if (applied.some(j => j.jobId === jobId)) return;

    try {
      await jobApi.applyJob(jobId);

      // Update local state after successful API call
      setUser({
        ...user,
        appliedJobs: [...applied, { jobId, appliedAt: new Date().toISOString() }]
      });
    } catch (error) {
      console.error("Failed to mark job as applied", error);
      // Optional: Show toast error here
    }
  };

  /* ---------- CONTEXT ---------- */

  return (
    <AuthContext.Provider
      value={{
        user,
        savedJobs,
        isLoading,
        login,
        register,
        logout,
        googleLogin,
        updateProfile,
        toggleSaveJob,
        isJobSaved,
        markJobAsApplied
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ---------- HOOK ---------- */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
