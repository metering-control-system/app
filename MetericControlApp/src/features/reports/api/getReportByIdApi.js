import { baseApi } from '@/shared/api/baseApi';

export const getReportById = (id) => {
    return baseApi.get(`reports/${id}`).then((response) => response.data);
};
