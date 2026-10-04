import { baseApi } from '@/shared/api/baseApi';

export const getActTemplatesApi = async (lastSyncAt) => {
    return await baseApi
        // eslint-disable-next-line camelcase
        .get('/act/templates', { params: { update_since: lastSyncAt } })
        .then((response) => response.data);
};
