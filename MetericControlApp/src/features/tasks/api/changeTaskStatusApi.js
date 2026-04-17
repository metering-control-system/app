import { baseApi } from '@/shared/api/baseApi';

export const changeTaskStatus = ({ id, status }) =>
    baseApi
        .post(`/tasks/${id}/change_status`, { status })
        .then((response) => response.data);
