import { useMutation } from '@tanstack/react-query';
import { refresh } from '@/features/auth/api/refresh';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';

const useSession = () => {
    const setToken = useAuth((state) => state.setToken);
    const clearSession = useAuth((state) => state.clearSession);
    const setAuthChecked = useAuth((state) => state.setAuthChecked);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: refresh,
        onSuccess: async (data) => {
            const token = data.access;
            if (!token) {
                await tokenStorage.clearTokens();
                clearSession();
                return;
            }
            setToken(token);
            await tokenStorage.setAccessToken(token);
        },
        onError: async () => {
            await tokenStorage.clearTokens();
            clearSession();
        },
        onSettled: () => {
            setAuthChecked();
        },
    });

    const refreshTokens = async () => {
        const refreshToken = await tokenStorage.getRefreshToken();

        if (!refreshToken) {
            await tokenStorage.clearTokens();
            clearSession();
            setAuthChecked();
            return;
        }

        await mutateAsync(refreshToken);
    };

    return { isPending, refreshTokens };
};

export default useSession;
