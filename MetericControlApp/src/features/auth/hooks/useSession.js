import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';
import refreshToken from '@/features/auth/lib/refreshToken';
import { useState } from 'react';
import {
    getAccessTokenLocally,
    getRefreshTokenLocally,
} from '@/features/auth/lib/getTokensLocally';

const useSession = () => {
    const clearSession = useAuth((state) => state.clearSession);
    const setAuthChecked = useAuth((state) => state.setAuthChecked);
    const [isPending, setIsPending] = useState(false);

    const refreshSession = async ({ offline }) => {
        try {
            setIsPending(true);
            if (offline) {
                await getRefreshTokenLocally();
                const access = await getAccessTokenLocally();
                useAuth.getState().setToken(access);
            } else {
                await refreshToken();
            }
        } catch {
            await tokenStorage.clearTokens();
            clearSession();
        } finally {
            setAuthChecked();
            setIsPending(false);
        }
    };

    return { isPending, refreshSession };
};

export default useSession;
