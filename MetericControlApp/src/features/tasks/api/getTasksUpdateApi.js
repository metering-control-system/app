import { baseApi } from '@/shared/api/baseApi';

export const getTasksUpdate = (params) => {
    return baseApi
        .get('tasks/update', { params })
        .then((response) => response.data);
};
