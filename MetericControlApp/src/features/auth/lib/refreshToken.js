import { refresh } from '@/features/auth/api/refresh';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';
import { getRefreshTokenLocally } from '@/features/auth/lib/getTokensLocally';

const refreshToken = async () => {
    const storedRefreshToken = await getRefreshTokenLocally();

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
