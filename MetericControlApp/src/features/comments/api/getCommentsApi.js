import { baseApi } from '@/shared/api/baseApi';
import axios from 'axios';
import { nanoid } from 'nanoid/non-secure';

export const getComments = ({ params, id }) => {
    return baseApi
        .get(`reports/${id}/comments/`, {
            params,
            transformResponse: [
                ...(axios.defaults.transformResponse || []),
                (data) => {
                    if (!data || typeof data !== 'object')
                        return { comments: [] };

                    const dataCopy = { ...data };
                    dataCopy.comments = dataCopy.results ?? [];
                    for (const key in dataCopy.comments) {
                        const localId = nanoid();
                        dataCopy.comments[key].localId = localId;
                    }
                    delete dataCopy.results;
                    return dataCopy;
                },
            ],
        })
        .then((response) => response.data);
};
