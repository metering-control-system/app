import tokenStorage from '@/features/auth/lib/tokenStorage';

export const getRefreshTokenLocally = async () => {
    const storedRefreshToken = await tokenStorage.getRefreshToken();
    if (!storedRefreshToken) {
        throw new Error('No refresh token');
    }
    return storedRefreshToken;
};

export const getAccessTokenLocally = async () => {
    const storedAccessToken = await tokenStorage.getAccessToken();
    if (!storedAccessToken) {
        throw new Error('No access token');
    }
    return storedAccessToken;
};
