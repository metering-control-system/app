import { useEffect } from 'react';

export const requests = [];

export const baseApi = {
    get: (url, { signal, params } = {}) =>
        new Promise((resolve) => {
            requests.push({
                url,
                signal,
                params,
                respond: (data) => resolve({ data }),
            });
        }),
};

export const useFocusEffect = (effect) => useEffect(() => effect(), [effect]);
