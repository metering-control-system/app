import { useMutation } from '@tanstack/react-query';
import { login } from '@/features/auth/api/login';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';
import { queryClient } from '@/shared/api/queryClient';

export const useLogin = () => {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: login,
        onSuccess: async ({ access, refresh }, credentials) => {
            if (!access || !refresh) {
                throw new Error('Unable to receive tokens');
            }
            try {
                await tokenStorage.setTokens({ refresh, access });
            } catch (error) {
                await tokenStorage.clearTokens();
                throw error;
            }
            queryClient.clear();
            useAuth
                .getState()
                .setSession({ login: credentials.login, accessToken: access });
        },
    });

    const userLogin = async ({ password, login }) => {
        if (!login || !password || isPending) {
            return;
        }
        await mutateAsync({ password, login });
    };

    return { isPending, userLogin };
};
