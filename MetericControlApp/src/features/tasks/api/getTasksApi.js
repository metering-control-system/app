import { baseApi } from '@/shared/api/baseApi';

export const getTasks = (params) => {
    return baseApi.get('tasks', { params }).then((response) => response.data);
};
