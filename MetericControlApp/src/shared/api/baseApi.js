import axios from 'axios';

const hostAddr = process.env.EXPO_PUBLIC_HOST_ADDR;

export const baseApi = axios.create({
    baseURL: `${hostAddr}/api/`,
    headers: { 'Content-Type': 'application/json' },
});
