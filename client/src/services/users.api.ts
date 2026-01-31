import api, { ApiResponse } from './api';
import { User } from '../types';

export const userApi = {
    getUser: () =>
        api
            .get<ApiResponse<User>>("/users/getUser")
            .then((r) => r.data),

    updateUser: (data: Partial<Pick<User, "name" | "email">>) =>
        api
            .put<ApiResponse<User>>("/users/updateUser", data)
            .then((r) => r.data),
};
