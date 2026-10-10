import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '@/features/auth/api/logout';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import clearSessionState from '@/features/auth/lib/clearSessionState';

const useLogout = () => {
    const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({
        mutationFn: logout,
        onSettled: async () => {
            await clearSessionState(queryClient);
        },
    });

    const logoutUser = async () => {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
            await clearSessionState(queryClient);
            return;
        }
        mutate(refreshToken);
    };

    return { isPending, logoutUser };
};

export default useLogout;
