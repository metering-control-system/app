import { authApi } from '@/shared/api/authApi';

export const login = ({ login, password }) => {
    return authApi
        .post('auth/login/', { username: login, password })
        .then((response) => response.data);
};
