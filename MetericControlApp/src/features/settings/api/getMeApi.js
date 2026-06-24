import { baseApi } from '@/shared/api/baseApi';

export const getMe = () =>
    baseApi.get('user/me/').then((response) => response.data);
