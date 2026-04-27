import { baseApi } from '@/shared/api/baseApi';
import axios from 'axios';

export const getTasks = (params) => {
    return baseApi
        .get('tasks', {
            params,
            transformResponse: [
                ...(axios.defaults.transformResponse || []),
                (data) => {
                    return {
                        ...data,
                        tasks: (data.results ?? []).map((task) => ({
                            ...task,
                            address: {
                                ...task.address,
                                // eslint-disable-next-line camelcase
                                display_address: [
                                    task.address?.locality,
                                    task.address?.street,
                                    task.address?.house,
                                    task.address?.building,
                                    task.address?.apartment,
                                ]
                                    .filter(
                                        (value) =>
                                            value !== null &&
                                            value !== undefined &&
                                            value !== ''
                                    )
                                    .join(', '),
                            },
                        })),
                    };
                },
            ],
        })
        .then((response) => response.data);
};
