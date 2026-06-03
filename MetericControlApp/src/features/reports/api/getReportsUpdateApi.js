import { baseApi } from '@/shared/api/baseApi';
import axios from 'axios';
import { processingReportResponse } from '@/features/reports/lib/processingTaskResponse';

export const getReportsUpdate = ({ lastSyncAt }) => {
    return baseApi
        .get('reports', {
            // eslint-disable-next-line camelcase
            params: { update_since: lastSyncAt },
            transformResponse: [
                ...(axios.defaults.transformResponse || []),
                processingReportResponse,
            ],
        })
        .then((response) => response.data);
};
