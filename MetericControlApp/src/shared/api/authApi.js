import Constants from 'expo-constants';
import axios from 'axios';

const hostIP =
    Constants.expoGoConfig?.debuggerHost?.split(`:`)[0] ||
    Constants.expoConfig?.hostUri?.split(`:`)[0];

const REQUEST_TIMEOUT = 5000;

export const authApi = axios.create({
    baseURL: `http://${hostIP}:8000/api/`,
    headers: { 'Content-Type': 'application/json' },
    timeout: REQUEST_TIMEOUT,
});
