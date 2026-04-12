import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';
import refreshToken from '@/features/auth/lib/refreshToken';
import { useState } from 'react';

const useSession = () => {
    const clearSession = useAuth((state) => state.clearSession);
    const setAuthChecked = useAuth((state) => state.setAuthChecked);
    const [isPending, setIsPending] = useState(false);

    const refreshSession = async () => {
        try {
            setIsPending(true);
            await refreshToken();
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
