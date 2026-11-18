import axios from 'axios';

const REQUEST_TIMEOUT = 5000;
const hostAddr = process.env.EXPO_PUBLIC_HOST_ADDR;

const MAX_RETRIES = 2;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = axios.create({
    baseURL: `${hostAddr}/api/`,
    headers: { 'Content-Type': 'application/json' },
    timeout: REQUEST_TIMEOUT,
});

authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        if (axios.isCancel(error) || config?.signal?.aborted) {
            return Promise.reject(error);
        }

        const shouldRetry =
            !error.response ||
            (error.response.status >= 500 && error.response.status < 600);

        if (!shouldRetry) {
            return Promise.reject(error);
        }

        config._retryCount = config._retryCount ?? 0;

        if (config._retryCount >= MAX_RETRIES) {
            return Promise.reject(error);
        }

        config._retryCount += 1;

        const backoff = 100 * 2 ** config._retryCount;
        await delay(backoff);

        return authApi(config);
    }
);
