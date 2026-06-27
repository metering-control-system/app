import axios from 'axios';
import { getApiBaseUrl } from '@/shared/api/getApiBaseUrl';

const REQUEST_TIMEOUT = 5000;

export const authApi = axios.create({
    baseURL: getApiBaseUrl(),
    headers: { 'Content-Type': 'application/json' },
    timeout: REQUEST_TIMEOUT,
});
