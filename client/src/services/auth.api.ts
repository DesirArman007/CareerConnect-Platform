import api, { ApiResponse } from './api';
import { User } from '../types';

export const authApi = {
    register: (data: any) =>
        api
            .post<ApiResponse<User>>("/users/register", data)
            .then((r) => r.data),

    registerEmployer: (data: {
        name: string;
        email: string;
        password: string;
        companyName: string;
        website: string;
        industry: string;
        size: string;
        location: string;
    }) =>
        api
            .post<ApiResponse<{ user: User; company: any }>>("/users/employer/register", data)
            .then((r) => r.data),

    login: (data: any) =>
        api
            .post<ApiResponse<{ user: User; accessToken: string }>>("/users/login", data)
            .then((r) => r.data),

    logout: () =>
        api
            .post<ApiResponse<null>>("/users/logout")
            .then((r) => r.data),

    googleAuth: (idToken: string) =>
        api
            .post<ApiResponse<{ user: User; accessToken: string }>>("/users/googleAuth", { idToken })
            .then((r) => r.data),
};
