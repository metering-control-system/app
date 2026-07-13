import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/features/comments/api/getMeApi';

export const useMe = () => {
    const { data } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            return getMe();
        },
        staleTime: 'static',
    });

    return data;
};
