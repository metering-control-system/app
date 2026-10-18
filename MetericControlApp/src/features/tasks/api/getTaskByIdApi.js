import { baseApi } from '@/shared/api/baseApi';
import { normalizeTaskResponse } from '@/features/tasks/lib/processingTaskResponse';

export const getTaskById = (id) => {
    return baseApi
        .get(`tasks/${id}`)
        .then((response) => normalizeTaskResponse(response.data));
};
