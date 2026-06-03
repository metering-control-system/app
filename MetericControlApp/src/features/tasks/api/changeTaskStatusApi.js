import { baseApi } from '@/shared/api/baseApi';
import axios from 'axios';
import { normalizeTaskResponse } from '@/features/tasks/lib/processingTaskResponse';

export const changeTaskStatus = ({ id, status }) =>
    baseApi
        .post(
            `/tasks/${id}/change_status/`,
            { status },
            {
                transformResponse: [
                    ...(axios.defaults.transformResponse || []),
                    (data) => normalizeTaskResponse(data),
                ],
            }
        )
        .then((response) => response.data);
