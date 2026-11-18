import axios, { CanceledError } from 'axios';
import clearSessionState from '@/features/auth/lib/clearSessionState';
import useAuth from '@/features/auth/store/useAuth';
import refreshToken from '@/features/auth/lib/refreshToken';
import { queryClient } from '@/shared/api/queryClient';

const hostAddr = process.env.EXPO_PUBLIC_HOST_ADDR;
const REQUEST_TIMEOUT = 5000;
let pendingTokenRefresh = null;

export const baseApi = axios.create({
    baseURL: `${hostAddr}/api/`,
    headers: { 'Content-Type': 'application/json' },
    timeout: REQUEST_TIMEOUT,
});

baseApi.interceptors.request.use(
    (config) => {
        const { accessToken, requestController } = useAuth.getState();
        config.signal ??= requestController.signal;
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        throw error;
    },
    { synchronous: true }
);

baseApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const request = error.config;
        if (
            !request ||
            error.response?.status !== 401 ||
            request.retry ||
            request.signal?.aborted
        ) {
            return Promise.reject(error);
        }
        request.retry = true;
        try {
            if (!pendingTokenRefresh) {
                pendingTokenRefresh = refreshToken().finally(() => {
                    pendingTokenRefresh = null;
                });
            }
            const accessToken = await pendingTokenRefresh;
            if (request.signal?.aborted) {
                throw new CanceledError('Session ended');
            }
            request.headers = {
                ...request.headers,
                Authorization: `Bearer ${accessToken}`,
            };
            return baseApi(request);
        } catch (refreshError) {
            if (!request.signal?.aborted) {
                await clearSessionState(queryClient);
            }
            return Promise.reject(refreshError);
        }
    }
);
