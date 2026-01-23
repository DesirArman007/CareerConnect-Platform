export interface Job {
  _id?: string;
  id?: string;
  title: string;
  company: string;
  location: string;
  type?: 'Full Time' | 'Contract' | 'Remote' | 'Part Time' | string;
  employment_type?: string; // Full-time, Part-time, Contract, etc.
  job_type?: string; // job, internship
  salary?: string;
  logo?: string;
  tags?: string[];
  postedAt?: string;
  createdAt?: string;
  description?: string;
  department?: string;
  applyUrl?: string;
  apply_url?: string;
  source?: string; // LinkedIn, Lever, etc.
  experience?: string; // e.g., "2-5 years"
  joblive?: boolean;
}


export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  savedJobs?: string[];
}

export interface AuthResponse {
  success?: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface Feedback {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  searchExperience?: 'slower_harder' | 'same' | 'faster_smoother';
  clarityFeeling?: 'no_difference' | 'bit_better' | 'much_clearer';
  message?: string;
  createdAt?: string;
}