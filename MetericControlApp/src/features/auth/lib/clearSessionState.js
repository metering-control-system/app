import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';

const clearSessionState = async (queryClient) => {
    await tokenStorage.clearTokens();
    useAuth.getState().clearSession();
    queryClient.removeQueries();
};

export default clearSessionState;
