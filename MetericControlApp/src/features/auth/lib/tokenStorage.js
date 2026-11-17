import * as SecureStore from 'expo-secure-store';

let pendingTokenWrite = Promise.resolve();

const tokenStorage = {
    getAccessToken: () => SecureStore.getItemAsync('access_token'),
    getRefreshToken: () => SecureStore.getItemAsync('refresh_token'),
    setAccessToken: (token) => {
        pendingTokenWrite = pendingTokenWrite
            .catch(() => {})
            .then(() => SecureStore.setItemAsync('access_token', token));
        return pendingTokenWrite;
    },
    setTokens: ({ refresh, access }) => {
        pendingTokenWrite = pendingTokenWrite
            .catch(() => {})
            .then(async () => {
                await SecureStore.setItemAsync('refresh_token', refresh);
                await SecureStore.setItemAsync('access_token', access);
            });
        return pendingTokenWrite;
    },
    clearTokens: async () => {
        await pendingTokenWrite.catch(() => {});
        await Promise.all([
            SecureStore.deleteItemAsync('refresh_token'),
            SecureStore.deleteItemAsync('access_token'),
        ]);
    },
};

export default tokenStorage;
