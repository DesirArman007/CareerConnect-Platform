export interface Job {
  id: string;

  title: string;
  company: string;
  location: string;

  employment_type?: string;

  salary?: string;
  logo?: string;
  tags?: string[];

  createdAt?: string;
  description?: string;
  department?: string;

  apply_url?: string;   // backend field
  source?: string;

  experience?: string;
  joblive?: boolean;
}



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
}

export interface AuthResponse {
  user: User;
  message?: string;
}


export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface Feedback {
  id: string;

  firstName?: string;
  lastName?: string;
  email?: string;

  message?: string;
  createdAt?: string;
}
