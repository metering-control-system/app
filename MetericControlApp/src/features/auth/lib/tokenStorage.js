import * as SecureStore from 'expo-secure-store';

const tokenStorage = {
    getAccessToken: async () =>
        SecureStore.getItemAsync('access_token').catch(() => {
            throw new Error('Access token is deprecated. Please refresh token');
        }),
    getRefreshToken: async () =>
        SecureStore.getItemAsync('refresh_token').catch(() => {
            throw new Error(
                'Refresh token is deprecated. Please refresh token'
            );
        }),
    setAccessToken: async (token) =>
        SecureStore.setItemAsync('access_token', token),
    setTokens: async ({ refresh, access }) => {
        await SecureStore.setItemAsync('refresh_token', refresh);
        await SecureStore.setItemAsync('access_token', access);
    },
    clearTokens: async () => {
        await SecureStore.deleteItemAsync('refresh_token');
        await SecureStore.deleteItemAsync('access_token');
    },
    getLogin: async () =>
        SecureStore.getItemAsync('user_login').catch(() => null),
    setLogin: async (login) => SecureStore.setItemAsync('user_login', login),
    clearLogin: async () => SecureStore.deleteItemAsync('user_login'),
};

export default tokenStorage;
