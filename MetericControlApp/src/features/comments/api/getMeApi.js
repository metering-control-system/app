import { baseApi } from '@/shared/api/baseApi';

export const getMe = () => {
    return baseApi.get('/user/me/').then((response) => response.data);
};
