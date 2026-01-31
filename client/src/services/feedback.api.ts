import api, { ApiResponse } from './api';
import { Feedback } from '../types';

export const feedbackApi = {
    create: (data: Omit<Feedback, "id">) =>
        api
            .post<ApiResponse<{ feedback: Feedback }>>("/feedback/create", data)
            .then((r) => r.data),

    getAll: (params?: { page?: number; limit?: number }) =>
        api
            .get<
                ApiResponse<{
                    feedbacks: Feedback[];
                    pagination: any;
                }>
            >("/feedback", { params })
            .then((r) => r.data),

    getById: (id: string) =>
        api
            .get<ApiResponse<{ feedback: Feedback }>>(`/feedback/${id}`)
            .then((r) => r.data),

    delete: (id: string) =>
        api
            .delete<ApiResponse<null>>(`/feedback/${id}`)
            .then((r) => r.data),
};
