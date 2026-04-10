import { baseApi } from '@/shared/api/baseApi';

export const logout = (refreshToken) => {
    return baseApi
        .post('auth/logout/', { refresh: refreshToken })
        .then((response) => response.data);
};
