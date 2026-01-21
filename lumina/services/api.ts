import axios from 'axios';
import { Job, User, AuthResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

/* ---------- SHARED API RESPONSE ---------- */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: any;
}

/* ---------- AUTH ---------- */
export const auth = {
    register: async (data: any): Promise<AuthResponse> => {
        const res = await api.post('/users/register', data);
        return res.data;
    },

    login: async (data: any): Promise<AuthResponse> => {
        const res = await api.post('/users/login', data);
        return res.data;
    },

    logout: async (): Promise<ApiResponse<null>> => {
        const res = await api.post('/users/logout');
        return res.data;
    },

    // ✅ FIXED: use api instance + correct path
    getUser: async (): Promise<ApiResponse<User>> => {
        const res = await api.get('/users/getUser');
        return res.data;
    },

    updateUser: async (data: Partial<User>): Promise<ApiResponse<User>> => {
        const res = await api.put('/users/updateUser', data);
        return res.data;
    },
};

/* ---------- JOBS ---------- */
// Helper to extract job array from various response formats
// API returns: { statusCode, data: { jobs: [...], pagination: {...} }, message, success }
const extractJobArray = (response: any): Job[] => {
    console.log('Raw API response:', response);

    // Direct array
    if (Array.isArray(response)) return response;

    // Nested: response.data.jobs (your API structure)
    if (response?.data?.jobs && Array.isArray(response.data.jobs)) {
        return response.data.jobs;
    }

    // Nested: response.data (array directly)
    if (response?.data && Array.isArray(response.data)) {
        return response.data;
    }

    // Nested: response.jobs
    if (response?.jobs && Array.isArray(response.jobs)) {
        return response.jobs;
    }

    console.warn('Could not extract job array from response:', response);
    return [];
};

const extractSingleJob = (response: any): Job => {
    console.log('Raw single job response:', response);

    // Nested: response.data.jobData (your single job API structure)
    if (response?.data?.jobData && typeof response.data.jobData === 'object') {
        return response.data.jobData;
    }

    // Nested: response.data.job
    if (response?.data?.job && typeof response.data.job === 'object') {
        return response.data.job;
    }

    // Nested: response.data (single job with _id)
    if (response?.data && typeof response.data === 'object' && response.data._id) {
        return response.data;
    }

    // Direct: response.jobData
    if (response?.jobData && typeof response.jobData === 'object') {
        return response.jobData;
    }

    // Direct: response.job
    if (response?.job && typeof response.job === 'object') {
        return response.job;
    }

    // Direct object with _id
    if (response && typeof response === 'object' && response._id) {
        return response;
    }

    return response;
};

/* ---------- PAGINATION ---------- */
export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalJobs: number;
    limit: number;
}

export interface JobsResponse {
    jobs: Job[];
    pagination: PaginationInfo;
}

// Helper to extract jobs response with pagination
const extractJobsWithPagination = (response: any): JobsResponse => {
    console.log('Raw API response:', response);

    let jobs: Job[] = [];
    let pagination: PaginationInfo = {
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        limit: 15
    };

    // Extract jobs array
    if (Array.isArray(response)) {
        jobs = response;
        pagination.totalJobs = response.length;
    } else if (response?.data?.jobs && Array.isArray(response.data.jobs)) {
        jobs = response.data.jobs;
        // Extract pagination if available
        if (response.data.pagination) {
            pagination = {
                currentPage: response.data.pagination.currentPage || response.data.pagination.page || 1,
                totalPages: response.data.pagination.totalPages || 1,
                totalJobs: response.data.pagination.totalJobs || response.data.pagination.total || jobs.length,
                limit: response.data.pagination.limit || 15
            };
        }
    } else if (response?.data && Array.isArray(response.data)) {
        jobs = response.data;
        pagination.totalJobs = response.data.length;
    } else if (response?.jobs && Array.isArray(response.jobs)) {
        jobs = response.jobs;
        if (response.pagination) {
            pagination = {
                currentPage: response.pagination.currentPage || 1,
                totalPages: response.pagination.totalPages || 1,
                totalJobs: response.pagination.totalJobs || jobs.length,
                limit: response.pagination.limit || 15
            };
        }
    }

    console.log('Extracted jobs:', jobs.length, 'Pagination:', pagination);
    return { jobs, pagination };
};

export const jobs = {
    // Get jobs with server-side pagination
    getAll: async (
        page: number,
        limit: number,
        department?: string,
        location?: string,
        signal?: AbortSignal
    ) => {
        const res = await api.get('/job', {
            params: {
                page,
                limit,
                ...(department && { department }),
                ...(location && { location }),
            },
            signal,
        });

        return extractJobsWithPagination(res.data);
    },


    getFilterOptions: async (signal?: AbortSignal) => {
        const res = await api.get('/job/filter-options', { signal });

        if (!res.data) {
            throw new Error('Failed to fetch filter options');
        }
        return res.data;
    },


    // Get all jobs (for filters - larger limit)
    getAllForFilters: async (): Promise<Job[]> => {
        // Request larger batch for filter dropdowns
        const res = await api.get('/job?page=1&limit=500');
        const { jobs } = extractJobsWithPagination(res.data);
        return jobs;
    },

    // Get ALL jobs for company aggregation (no pagination limit)
    getAllForCompanies: async (): Promise<Job[]> => {
        // Fetch all jobs with very high limit for accurate company counts
        const res = await api.get('/job?page=1&limit=5000');
        const { jobs } = extractJobsWithPagination(res.data);
        return jobs;
    },

    getRecent: async (): Promise<Job[]> => {
        const res = await api.get('/job/new/recent');
        const { jobs } = extractJobsWithPagination(res.data);
        return jobs;
    },

    search: async (
        keyword: string,
        page: number,
        limit: number,
        department?: string,
        location?: string,
        signal?: AbortSignal
    ) => {
        const res = await api.get('/job/search', {
            params: {
                keyword,
                page,
                limit,
                ...(department && { department }),
                ...(location && { location }),
            },
            signal,
        });

        return extractJobsWithPagination(res.data);
    },

    getOne: async (id: string): Promise<Job> => {
        const res = await api.get(`/job/${id}`);
        return extractSingleJob(res.data);
    },

    getSimilar: async (id: string): Promise<Job[]> => {
        const res = await api.get(`/job/${id}/similar`);
        const { jobs } = extractJobsWithPagination(res.data);
        return jobs;
    },

    getStats: async (signal?: AbortSignal) => {
        const response = await api.get('/job/stats', { signal });
        if (!response.data) throw new Error('Failed to fetch job stats');
        return response.data;
    },
};

export default api;
