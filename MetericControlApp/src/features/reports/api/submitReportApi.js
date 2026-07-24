import { baseApi } from '@/shared/api/baseApi';
import { selectReportForTask } from '@/features/reports/lib/reportUpsert';
import { registerReportPaginationCursor } from '@/features/reports/lib/reportPaginationGuard';

const REPORT_LOOKUP_PAGE_LIMIT = 100;

export const createReport = (payload) =>
    baseApi.post('/reports/', payload).then((response) => response.data);

export const updateReport = (reportId, payload) =>
    baseApi
        .patch(`/reports/${reportId}/`, payload)
        .then((response) => response.data);

export const getReportByTaskId = async (taskId) => {
    const reports = [];
    const seenCursors = new Set();
    let cursor;

    do {
        const response = await baseApi.get('/reports/', {
            params: {
                limit: REPORT_LOOKUP_PAGE_LIMIT,
                ...(cursor ? { cursor } : {}),
            },
        });
        const responseData = response.data;

        reports.push(...(responseData?.results ?? []));
        cursor = responseData?.['next_cursor'] ?? null;
        registerReportPaginationCursor(seenCursors, cursor);
    } while (cursor);

    return selectReportForTask(reports, taskId);
};

export const addReportComment = (reportId, payload) =>
    baseApi
        .post(`/reports/${reportId}/comments/`, payload)
        .then((response) => response.data);

export const uploadReportImage = (reportId, payload) => {
    const formData = new FormData();

    formData.append('images', JSON.stringify(payload.images));

    payload.files.forEach(({ fileKey, file }) => {
        formData.append(fileKey, file);
    });

    return baseApi
        .post(`/reports/${reportId}/images/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((response) => response.data);
};
