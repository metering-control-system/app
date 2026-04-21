import { baseApi } from '@/shared/api/baseApi';

export const refresh = (refreshToken) => {
    return baseApi
        .post('auth/refresh/', { refresh: refreshToken })
        .then((response) => response.data);
};
