import { baseApi } from '@/shared/api/baseApi';
import axios from 'axios';
import { processingTaskResponse } from '@/features/tasks/lib/processingTaskResponse';

export const getTasks = (params) => {
    return baseApi
        .get('tasks', {
            params,
            transformResponse: [
                ...(axios.defaults.transformResponse || []),
                processingTaskResponse,
            ],
        })
        .then((response) => response.data);
};
