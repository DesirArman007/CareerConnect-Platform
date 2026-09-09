/* ============================= */
/* --------- JOB TYPES --------- */
/* ============================= */

export interface Job {
  _id?: string;        // Mongo ID
  id?: string;         // Optional alternative ID

  title: string;
  company: string;
  location: string;

  employment_type?: string;
  type?: string;

  salary?: string;
  logo?: string;
  tags?: string[];

  createdAt?: string;
  postedAt?: string;
  description?: string;
  department?: string;

  apply_url?: string;
  applyUrl?: string;
  source?: string;

  experience?: string;
  joblive?: boolean;
}


/* =================================== */
/* --------- USER ACTION TYPES ------- */
/* =================================== */

export interface SavedJobEntry {
  savedId?: string;
  savedAt?: string;

  jobId?: string;       // legacy fallback
  createdAt?: string;   // legacy fallback

  job: Partial<Job> | null;
}

export interface AppliedJobEntry {
  applicationId?: string;

  jobId?: string;       // legacy fallback
  status: string;

  appliedAt?: string;
  createdAt?: string;   // legacy fallback

  job: Partial<Job> | null;
}


/* ============================= */
/* --------- USER TYPE --------- */
/* ============================= */

export interface User {
  id: string;

  name: string;
  email: string;

  role?: string;
  avatar?: string;

  savedJobs?: string[];

  appliedJobs?: {
    jobId: string;
    appliedAt: string;
  }[];

  createdAt?: string;
  status?: string;
}


/* ============================= */
/* ------- AUTH RESPONSE ------- */
/* ============================= */

export interface AuthResponse {
  user: User;
  message?: string;
}


/* ============================= */
/* -------- CHAT TYPES --------- */
/* ============================= */

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  isThinking?: boolean;
}


/* ============================= */
/* ------- FEEDBACK TYPE ------- */
/* ============================= */

export interface Feedback {
  id: string;

  firstName?: string;
  lastName?: string;
  email?: string;

  message?: string;
  createdAt?: string;
}


/* ============================= */
/* -------- API WRAPPER -------- */
/* ============================= */

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}