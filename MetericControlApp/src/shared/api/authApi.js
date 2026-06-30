import axios from 'axios';

const REQUEST_TIMEOUT = 5000;
const hostAddr = process.env.EXPO_PUBLIC_HOST_ADDR;

export const authApi = axios.create({
    baseURL: `${hostAddr}/api/`,
    headers: { 'Content-Type': 'application/json' },
    timeout: REQUEST_TIMEOUT,
});
