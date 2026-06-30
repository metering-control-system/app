import { baseApi } from '@/shared/api/baseApi';

export const createReport = (payload) =>
    baseApi.post('/reports/', payload).then((response) => response.data);

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
