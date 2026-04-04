import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { authApi } from "../services/auth.api";
import { userApi } from "../services/users.api";
import { jobApi } from "../services/jobs.api";
import { User, SavedJobEntry, AppliedJobEntry } from "../types";

type UpdateProfilePayload = {
  name?: string;
  email?: string;
};

interface AuthContextType {
  user: User | null;
  savedJobs: string[];
  isLoading: boolean;

  savedJobsData: SavedJobEntry[];
  appliedJobsData: AppliedJobEntry[];
  jobsDataLoading: boolean;

  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;

  updateProfile: (data: UpdateProfilePayload) => Promise<void>;

  toggleSaveJob: (jobId: string) => Promise<void>;
  isJobSaved: (jobId: string) => boolean;
  markJobAsApplied: (jobId: string) => Promise<void>;

  fetchJobsData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ===================================================== */
/* ==================== PROVIDER ======================= */
/* ===================================================== */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [savedJobsData, setSavedJobsData] = useState<SavedJobEntry[]>([]);
  const [appliedJobsData, setAppliedJobsData] = useState<AppliedJobEntry[]>([]);
  const [jobsDataLoading, setJobsDataLoading] = useState(false);

  const jobsDataLoadedRef = useRef(false);

  /* ================= FETCH USER ================= */

  const fetchUserData = async (): Promise<boolean> => {
    try {
      const response = await userApi.getUser();

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

  /* ================= FETCH JOBS DATA ================= */

  const extractJobIds = (entries: SavedJobEntry[]): string[] =>
    entries
      .map(entry => entry.job?.id ?? entry.job?._id ?? entry.jobId)
      .filter((id): id is string => Boolean(id));

  const fetchJobsData = useCallback(async () => {
    if (jobsDataLoadedRef.current) return;

    setJobsDataLoading(true);

    try {
      const [savedRes, appliedRes] = await Promise.all([
        jobApi.getSavedJobs(),
        jobApi.getAppliedJobs(),
      ]);

      if (savedRes.success) {
        const savedEntries = savedRes.data;
        setSavedJobsData(savedEntries);
        setSavedJobs(extractJobIds(savedEntries));
      }

      if (appliedRes.success) {
        setAppliedJobsData(appliedRes.data);
      }

      jobsDataLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to fetch jobs data", error);
    } finally {
      setJobsDataLoading(false);
    }
  }, []);

  /* ================= INIT AUTH ================= */

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

  /* ================= AUTH ACTIONS ================= */

  const login = async (credentials: {
    email: string;
    password: string;
  }) => {
    const response = await authApi.login(credentials);

    if (!response.success)
      throw new Error(response.message || "Login failed");

    localStorage.setItem("hasSession", "true");
    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }

    const sessionActive = await fetchUserData();
    if (!sessionActive) {
      throw new Error(
        "Login succeeded but session failed to establish."
      );
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await authApi.register(data);
    if (!response.success)
      throw new Error(response.message || "Registration failed");
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem("hasSession");
      localStorage.removeItem("accessToken");
      setUser(null);
      setSavedJobs([]);
      setSavedJobsData([]);
      setAppliedJobsData([]);
      jobsDataLoadedRef.current = false;
    }
  };

  const googleLogin = async (idToken: string) => {
    const response = await authApi.googleAuth(idToken);

    if (!response.success)
      throw new Error(response.message || "Google login failed");

    localStorage.setItem("hasSession", "true");
    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }

    const sessionActive = await fetchUserData();
    if (!sessionActive) {
      throw new Error(
        "Google login succeeded but session failed to establish."
      );
    }
  };

  /* ================= PROFILE ================= */

  const updateProfile = async (data: UpdateProfilePayload) => {
    if (!user) return;

    const response = await userApi.updateUser(data);

    if (response.success && response.data) {
      setUser(response.data);
    }
  };

  /* ================= SAVED JOBS ================= */

  const toggleSaveJob = async (jobId: string) => {
    if (!user) return;

    const isSaved = savedJobs.includes(jobId);

    try {
      if (isSaved) {
        setSavedJobs(prev => prev.filter(id => id !== jobId));
        setSavedJobsData(prev =>
          prev.filter(
            entry =>
              entry.job?._id !== jobId &&
              entry.jobId !== jobId
          )
        );

        await jobApi.removeSavedJob(jobId);
      } else {
        await jobApi.saveJob(jobId);
        setSavedJobs(prev => [...prev, jobId]);
        jobsDataLoadedRef.current = false;
      }
    } catch (error) {
      console.error("Failed to toggle save job", error);

      if (isSaved) {
        setSavedJobs(prev => [...prev, jobId]);
        jobsDataLoadedRef.current = false;
      } else {
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      }
    }
  };

  const isJobSaved = (jobId: string) => savedJobs.includes(jobId);

  /* ================= APPLIED JOBS ================= */

  const markJobAsApplied = async (jobId: string) => {
    if (!user) return;

    const applied = user.appliedJobs ?? [];
    if (applied.some(j => j.jobId === jobId)) return;

    try {
      await jobApi.applyJob(jobId);

      setUser({
        ...user,
        appliedJobs: [
          ...applied,
          { jobId, appliedAt: new Date().toISOString() },
        ],
      });

      jobsDataLoadedRef.current = false;
    } catch (error) {
      console.error("Failed to mark job as applied", error);
    }
  };

  /* ================= CONTEXT ================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        savedJobs,
        isLoading,
        savedJobsData,
        appliedJobsData,
        jobsDataLoading,
        login,
        register,
        logout,
        googleLogin,
        updateProfile,
        toggleSaveJob,
        isJobSaved,
        markJobAsApplied,
        fetchJobsData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};