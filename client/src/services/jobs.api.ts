import api, { ApiResponse } from './api';
import { Job } from '../types';

export interface CreateJobData {
    title: string;
    description: string;
    location: string;
    employment_type: string;
    department: string;
    experience_min_years: number;
    experience_max_years: number;
}

export const jobApi = {
    getAll: (params: any) =>
        api
            .get<ApiResponse<{ jobs: Job[]; pagination: any }>>("/job", { params })
            .then((r) => r.data),

    getOne: (id: string) =>
        api
            .get<ApiResponse<{ job: Job }>>(`/job/${id}`)
            .then((r) => r.data),

    search: (params: any) =>
        api
            .get<ApiResponse<{ jobs: Job[]; pagination: any }>>(
                "/job/search/query",
                { params }
            )
            .then((r) => r.data),

    getSimilar: (id: string) =>
        api
            .get<ApiResponse<{ similarJobs: Job[] }>>(`/job/${id}/similar`)
            .then((r) => r.data),

    getStats: () =>
        api
            .get<ApiResponse<any>>("/job/stats")
            .then((r) => r.data),

    getCompanies: () =>
        api
            .get<ApiResponse<{ companies: { name: string; jobs: number }[] }>>(
                "/job/companies"
            )
            .then((r) => r.data),

    getNew: (params: { page?: number; limit?: number; days?: number }) =>
        api
            .get<ApiResponse<{ jobs: Job[]; pagination: any }>>('/job/new/recent', { params })
            .then(r => r.data),

    // User Actions
    saveJob: (jobId: string) =>
        api
            .post<ApiResponse<any>>(`/user-actions/save-jobs/${jobId}`)
            .then((r) => r.data),

    removeSavedJob: (jobId: string) =>
        api
            .delete<ApiResponse<null>>(`/user-actions/remove-saved-jobs/${jobId}`)
            .then((r) => r.data),

    getSavedJobs: () =>
        api
            .get<ApiResponse<Job[]>>('/user-actions/get-saved-jobs')
            .then(r => r.data),

    applyJob: (jobId: string) =>
        api
            .post<ApiResponse<any>>(`/user-actions/apply-job/${jobId}`)
            .then((r) => r.data),

    getAppliedJobs: () =>
        api
            .get<ApiResponse<Job[]>>('/user-actions/get-applied-jobs')
            .then(r => r.data),
};
