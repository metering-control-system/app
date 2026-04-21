import { baseApi } from '@/shared/api/baseApi';

export const login = ({ login, password }) => {
    return baseApi
        .post('auth/login/', { username: login, password })
        .then((response) => response.data);
};
