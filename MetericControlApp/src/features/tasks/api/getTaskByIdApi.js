import { baseApi } from '@/shared/api/baseApi';

export const getTaskById = (id) => {
    return baseApi.get(`tasks/${id}`).then((response) => response.data);
};
