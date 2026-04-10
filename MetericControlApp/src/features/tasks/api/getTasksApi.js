import { baseApi } from '@/shared/api/baseApi';

export const getTasks = () => {
    return baseApi.get('/tasks').then((response) => response.data);
};

export const getTaskById = (id) => {
    return baseApi.get(`/tasks/${id}`).then((response) => response.data);
};
