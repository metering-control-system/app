import { authApi } from '@/shared/api/authApi';

export const refresh = (refreshToken) => {
    return authApi
        .post('auth/refresh/', { refresh: refreshToken })
        .then((response) => response.data);
};
