import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/features/settings/api/getMeApi';

const useMe = () => {
    const { data, isPending, error } = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        staleTime: 5 * 60 * 1000,
    });

    return {
        fullName: data?.full_name ?? null,
        avatar: data?.avatar ?? null,
        isPending,
        error,
    };
};

export default useMe;
