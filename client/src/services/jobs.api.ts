import api, { ApiResponse } from './api';
import { Job } from '../types';

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
};
