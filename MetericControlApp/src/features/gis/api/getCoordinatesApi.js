import { baseApi } from '@/shared/api/baseApi';

export const getCoordinates = async (addr) => {
    return await baseApi
        .get('/geocoder/coordinates/', { params: { q: addr } })
        .then((response) => {
            return response.data;
        });
};
