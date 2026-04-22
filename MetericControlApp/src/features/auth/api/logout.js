import { authApi } from '@/shared/api/authApi';

export const logout = (refreshToken) => {
    return authApi
        .post('auth/logout/', { refresh: refreshToken })
        .then((response) => response.data);
};
