import { useMutation } from '@tanstack/react-query';
import { login } from '@/features/auth/api/login';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';

export const useLogin = () => {
    const setToken = useAuth((state) => state.setToken);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            const access = data.access;
            const refresh = data.refresh;
            tokenStorage.setTokens({ refresh, access });
            setToken(access);
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
