import { baseApi } from '@/shared/api/baseApi';
import axios from 'axios';
import { processingReportResponse } from '@/features/reports/lib/processingTaskResponse';

export const getReports = (params, { signal } = {}) => {
    return baseApi
        .get('reports', {
            params,
            signal,
            transformResponse: [
                ...(axios.defaults.transformResponse || []),
                processingReportResponse,
            ],
        })
        .then((response) => response.data);
};
