import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '@/features/auth/api/logout';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';
import clearSessionState from '@/features/auth/lib/clearSessionState';

const useLogout = () => {
    const queryClient = useQueryClient();
    const clearSession = useAuth((state) => state.clearSession);
    const { mutate, isPending } = useMutation({
        mutationFn: logout,
        onSettled: async () => {
            await clearSessionState(queryClient);
        },
    });

    const logoutUser = async () => {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
            await tokenStorage.clearTokens();
            clearSession();
            return;
        }
        mutate(refreshToken);
    };

    return { isPending, logoutUser };
};

export default useLogout;
