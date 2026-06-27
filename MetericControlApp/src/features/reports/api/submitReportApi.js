import { baseApi } from '@/shared/api/baseApi';

export const createReport = (payload) =>
    baseApi.post('/reports/', payload).then((response) => response.data);
