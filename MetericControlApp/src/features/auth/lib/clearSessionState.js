import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';

const clearSessionState = async (queryClient) => {
    useAuth.getState().cancelRequests();
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
        await tokenStorage.clearTokens();
    } finally {
        useAuth.getState().clearSession();
    }
};

export default clearSessionState;
