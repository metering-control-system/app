import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getMe } from '@/features/settings/api/getMeApi';
import useProfileStore from '@/features/settings/store/useProfileStore';

const useMe = () => {
    const setProfile = useProfileStore((state) => state.setProfile);
    const cachedFullName = useProfileStore((state) => state.fullName);
    const cachedAvatar = useProfileStore((state) => state.avatar);

    const { data, isPending, error } = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (data) {
            setProfile({
                userId: data.user_id ?? null,
                fullName: data.full_name ?? null,
                avatar: data.avatar ?? null,
            });
        }
    }, [data, setProfile]);

    return {
        fullName: data?.full_name ?? cachedFullName,
        avatar: data?.avatar ?? cachedAvatar,
        isPending,
        error,
    };
};

export default useMe;
