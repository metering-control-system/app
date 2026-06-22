import { baseApi } from '@/shared/api/baseApi';

export const createTaskReport = (taskId, payload) => {
    return baseApi
        .post(`/tasks/${taskId}/report/`, payload)
        .then((response) => response.data);
};

export const uploadReportImage = (reportId, payload) => {
    const formData = new FormData();

    formData.append('kind', payload.kind);
    formData.append('image', payload.file);

    return baseApi
        .post(`/reports/${reportId}/images/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((response) => response.data);
};

export const submitReport = (reportId) => {
    return baseApi
        .post(`/reports/${reportId}/submit/`)
        .then((response) => response.data);
};
