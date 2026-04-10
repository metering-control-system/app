import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '@/features/auth/api/logout';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';

const useLogout = () => {
    const queryClient = useQueryClient();
    const clearSession = useAuth((state) => state.clearSession);
    const { mutate, isPending } = useMutation({
        mutationFn: logout,
        onSettled: async () => {
            await tokenStorage.clearTokens();
            clearSession();
            queryClient.removeQueries();
        },
    });

    const logoutUser = async () => {
        const refreshToken = await tokenStorage.getRefreshToken();
        mutate(refreshToken);
    };

    return { isPending, logoutUser };
};

export default useLogout;
