import { authApi } from '@/shared/api/authApi';

export const refresh = (refreshToken, signal) => {
    return authApi
        .post('auth/refresh/', { refresh: refreshToken }, { signal })
        .then((response) => response.data);
};
