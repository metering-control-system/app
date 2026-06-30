import axios from 'axios';
import Constants from 'expo-constants';
import clearSessionState from '@/features/auth/lib/clearSessionState';
import useAuth from '@/features/auth/store/useAuth';
import refreshToken from '@/features/auth/lib/refreshToken';
import { queryClient } from '@/shared/api/queryClient';

const hostIP =
    Constants.expoGoConfig?.debuggerHost?.split(`:`)[0] ||
    Constants.expoConfig?.hostUri?.split(`:`)[0];

const REQUEST_TIMEOUT = 5000;

let globalRefresh = null;

export const baseApi = axios.create({
    baseURL: `http://${hostIP}:8000/api/`,
    headers: { 'Content-Type': 'application/json' },
    timeout: REQUEST_TIMEOUT,
});

baseApi.interceptors.request.use((config) => {
    const accessToken = useAuth.getState().accessToken;
    if (!accessToken) {
        return config;
    }
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

baseApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const request = error.config;

        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        if (request.retry) {
            return Promise.reject(error);
        }

        request.retry = true;

        try {
            if (!globalRefresh) {
                globalRefresh = refreshToken().finally(() => {
                    globalRefresh = null;
                });
            }
            const retryAccessToken = await globalRefresh;
            request.headers = {
                ...request.headers,
                Authorization: `Bearer ${retryAccessToken}`,
            };

            return baseApi(request);
        } catch (refreshError) {
            await clearSessionState(queryClient);
            return Promise.reject(refreshError);
        }
    }
);
