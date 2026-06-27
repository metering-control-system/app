import Constants from 'expo-constants';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = '8000';

const metroHost =
    Constants.expoGoConfig?.debuggerHost?.split(':')[0] ||
    Constants.expoConfig?.hostUri?.split(':')[0] ||
    DEFAULT_HOST;

const hostAddr = process.env.EXPO_PUBLIC_HOST_ADDR?.trim();

const buildConfiguredHostUrl = (value) => {
    if (!value) {
        return null;
    }

    if (!value.includes('://')) {
        return `http://${value}:${DEFAULT_PORT}/api/`;
    }

    const parsedUrl = new URL(value);
    const normalizedPath =
        parsedUrl.pathname && parsedUrl.pathname !== '/'
            ? parsedUrl.pathname.replace(/\/$/, '')
            : '';
    const normalizedPort = parsedUrl.port || DEFAULT_PORT;

    return `${parsedUrl.protocol}//${parsedUrl.hostname}:${normalizedPort}${normalizedPath}/api/`;
};

export const getApiBaseUrl = () => {
    return (
        buildConfiguredHostUrl(hostAddr) ||
        `http://${metroHost}:${DEFAULT_PORT}/api/`
    );
};
