import { refresh } from '@/features/auth/api/refresh';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';

const refreshToken = async () => {
    const storedRefreshToken = await tokenStorage.getRefreshToken();
    if (!storedRefreshToken) {
        throw new Error('No refresh token');
    }

    const tokens = await refresh(storedRefreshToken);
    const accessToken = tokens.access;
    const nextRefreshToken = tokens.refresh;

    if (!accessToken) {
        throw new Error('Unable to receive access token');
    }

    if (nextRefreshToken) {
        await tokenStorage.setTokens({
            refresh: nextRefreshToken,
            access: accessToken,
        });
    } else {
        await tokenStorage.setAccessToken(accessToken);
    }
    useAuth.getState().setToken(accessToken);

    return accessToken;
};

export default refreshToken;
