import useAuth from '@/features/auth/store/useAuth';
import refreshToken from '@/features/auth/lib/refreshToken';
import clearSessionState from '@/features/auth/lib/clearSessionState';
import { useState } from 'react';
import { queryClient } from '@/shared/api/queryClient';
import {
    getAccessTokenLocally,
    getRefreshTokenLocally,
} from '@/features/auth/lib/getTokensLocally';

const useSession = () => {
    const [isPending, setIsPending] = useState(false);

    const refreshSession = async ({ offline }) => {
        try {
            setIsPending(true);
            if (!useAuth.getState().login) {
                throw new Error('No account identity');
            }
            if (offline) {
                await getRefreshTokenLocally();
                const access = await getAccessTokenLocally();
                useAuth.getState().setToken(access);
            } else {
                await refreshToken();
            }
        } catch {
            await clearSessionState(queryClient);
        } finally {
            useAuth.getState().setAuthChecked();
            setIsPending(false);
        }
    };

    return { isPending, refreshSession };
};

export default useSession;
