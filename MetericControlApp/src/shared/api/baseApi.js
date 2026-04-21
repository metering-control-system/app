import axios from 'axios';
import Constants from 'expo-constants';

const hostIP =
    Constants.expoGoConfig?.debuggerHost?.split(`:`)[0] ||
    Constants.expoConfig?.hostUri?.split(`:`)[0];
//eslint-disable-next-line
const hostAddr = process.env.EXPO_PUBLIC_HOST_ADDR;
const REQUEST_TIMEOUT = 5000;

export const baseApi = axios.create({
    baseURL: `http://${hostIP}:8000/api/`,
    headers: { 'Content-Type': 'application/json' },
    timeout: REQUEST_TIMEOUT,
});
