import { baseApi } from '@/shared/api/baseApi';
import axios from 'axios';
import { processingTaskResponse } from '@/features/tasks/lib/processingTaskResponse';

export const getTasksUpdate = ({ lastSyncAt }) => {
    return baseApi

        .get('tasks', {
            // eslint-disable-next-line camelcase
            params: { update_since: lastSyncAt },
            transformResponse: [
                ...(axios.defaults.transformResponse || []),
                processingTaskResponse,
            ],
        })
        .then((response) => response.data);
};
