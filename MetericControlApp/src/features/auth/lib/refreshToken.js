import { refresh } from '@/features/auth/api/refresh';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';

const refreshToken = async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
        throw new Error('No refresh token');
    }

    const tokens = await refresh(refreshToken);
    const accessToken = tokens.access;

    if (!accessToken) {
        throw new Error('Unable to receive access token');
    }

    await tokenStorage.setAccessToken(accessToken);
    useAuth.getState().setToken(accessToken);

    return accessToken;
};

export default refreshToken;
