import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '@/features/auth/api/logout';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';
import clearSessionState from '@/features/auth/lib/clearSessionState';

const useLogout = () => {
    const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            useAuth.getState().cancelRequests();
            await queryClient.cancelQueries();
            const refreshToken = await tokenStorage.getRefreshToken();
            if (refreshToken) {
                await logout(refreshToken);
            }
        },
        onSettled: () => clearSessionState(queryClient),
    });

    return { isPending, logoutUser: mutate };
};

export default useLogout;
