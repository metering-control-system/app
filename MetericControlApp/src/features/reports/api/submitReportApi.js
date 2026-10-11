import { baseApi } from '@/shared/api/baseApi';
import { ensureUploadFileExists } from '@/shared/lib/media/ensureUploadFileExists';

export const createReport = (payload) =>
    baseApi.post('/reports/', payload).then((response) => response.data);

export const submitReport = (reportId) =>
    baseApi
        .post(`/reports/${reportId}/submit/`)
        .then((response) => response.data);

export const updateReport = (reportId, payload) =>
    baseApi
        .patch(`/reports/${reportId}/`, payload)
        .then((response) => response.data);

export const getReportByTaskId = async (taskId, { signal } = {}) => {
    try {
        const response = await baseApi.get(`/reports/by-task/${taskId}/`, {
            signal,
        });
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
        ensureUploadFileExists(
            file.uri,
            'Файл фотографии не найден на устройстве. Добавьте фотографию заново и повторите отправку.'
        );
        formData.append(fileKey, file);
    });
    return baseApi
        .post(`/reports/${reportId}/images/`, formData, {
            timeout: 60000,
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((response) => response.data);
};

export const uploadReportPdfAct = (reportId, payload) => {
    ensureUploadFileExists(
        payload.uri,
        'Файл акта не найден. Сгенерируйте акт заново.'
    );
    const formData = new FormData();
    const { ['client_act_id']: id, ...other } = payload;

    formData.append('client_act_id', String(id));
    formData.append('file', other);

    return baseApi
        .post(`/report/${reportId}/act`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((response) => response.data);
};

export const updateReportPdfAct = (reportId, payload, serverActId) => {
    ensureUploadFileExists(
        payload.uri,
        'Файл акта не найден. Сгенерируйте акт заново.'
    );
    const formData = new FormData();
    const { ['client_act_id']: _clientActId, ...file } = payload;
    formData.append('file', file);
    return baseApi
        .patch(`/report/${reportId}/act/${serverActId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((response) => response.data);
};

export const deleteReportImage = (reportId, clientImageId) =>
    baseApi.delete(`/reports/${reportId}/images/${clientImageId}/`);
