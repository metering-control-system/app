import { CanceledError } from 'axios';
import { refresh } from '@/features/auth/api/refresh';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';
import { getRefreshTokenLocally } from '@/features/auth/lib/getTokensLocally';

const refreshToken = async () => {
    const { signal } = useAuth.getState().requestController;
    const storedRefreshToken = await getRefreshTokenLocally();
    if (signal.aborted) {
        throw new CanceledError('Session ended');
    }
    const tokens = await refresh(storedRefreshToken, signal);
    if (signal.aborted) {
        throw new CanceledError('Session ended');
    }
    if (!tokens.access) {
        throw new Error('Unable to receive access token');
    }
    if (tokens.refresh) {
        await tokenStorage.setTokens(tokens);
    } else {
        await tokenStorage.setAccessToken(tokens.access);
    }
    if (signal.aborted) {
        throw new CanceledError('Session ended');
    }
    useAuth.getState().setToken(tokens.access);
    return tokens.access;
};

export default refreshToken;
