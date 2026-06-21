import { useMutation } from '@tanstack/react-query';
import { login } from '@/features/auth/api/login';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';

export const useLogin = () => {
    const setToken = useAuth((state) => state.setToken);
    const setLogin = useAuth((state) => state.setLogin);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: login,
        onSuccess: async (data, variables) => {
            const access = data.access;
            const refresh = data.refresh;
            try {
                await tokenStorage.setTokens({ refresh, access });
                await tokenStorage.setLogin(variables.login);
                setToken(access);
                setLogin(variables.login);
            } catch {
                /* empty */
            }
        },
    });

    const userLogin = async ({ password, login }) => {
        if (!login || !password) {
            return;
        }
        await mutateAsync({ password, login });
    };

    return { isPending, userLogin };
};
