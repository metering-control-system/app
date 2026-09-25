import { baseApi } from '@/shared/api/baseApi';

export const createReport = (payload) =>
    baseApi.post('/reports/', payload).then((response) => response.data);

export const updateReport = (reportId, payload) =>
    baseApi
        .patch(`/reports/${reportId}/`, payload)
        .then((response) => response.data);

export const getReportByTaskId = async (taskId) => {
    try {
        const response = await baseApi.get(`/reports/by-task/${taskId}/`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
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

export const deleteReportImage = (reportId, clientImageId) =>
    baseApi.delete(`/reports/${reportId}/images/${clientImageId}/`);
