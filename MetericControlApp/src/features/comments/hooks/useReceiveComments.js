import { useInfiniteQuery } from '@tanstack/react-query';
import { getComments } from '@/features/comments/api/getCommentsApi';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import { useEffect, useState } from 'react';
import useCommentsStore from '@/features/comments/store/useCommentsStore';
import useCommentsSyncStore from '@/features/comments/store/useCommentsSyncStore';
import { COMMENTS_PER_PAGE } from '@/features/comments/constants/comments';

export const useReceiveComments = (id) => {
    const [rehydrateError, setRehydrateError] = useState(null);

    const { isChecked, isOnline } = useNetwork();
    const setLastSyncAt = useCommentsSyncStore((state) => state.setLastSyncAt);
    const setUpdatedComments = useCommentsStore(
        (state) => state.setUpdatedComments
    );

    const {
        data,
        error,
        isPending,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['comments', id],
        queryFn: async ({ pageParam }) => {
            const lastSyncAt = useCommentsSyncStore.getState().lastSyncAt?.id;
            const response = await getComments({
                params: { limit: COMMENTS_PER_PAGE, cursor: pageParam },
                id,
            });
            if (response.snapshot_at) {
                if (!lastSyncAt) {
                    setLastSyncAt(response.snapshot_at, id);
                }
            }
            return response;
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.next_cursor,
        enabled: !!(isOnline && id),
        retry: 3,
    });

    useEffect(() => {
        if (data && id) {
            const allComments = data.pages.flatMap(
                (page) => page.comments ?? []
            );
            setUpdatedComments(allComments, id);
        }
    }, [data, id]);

    const rehydrateLocaleComments = () => {
        if (useCommentsStore.persist.hasHydrated()) return;

        void useCommentsStore.persist
            .rehydrate()
            .then(() => setRehydrateError(null))
            .catch((error) => setRehydrateError(error?.message));
    };

    useEffect(() => {
        rehydrateLocaleComments();
    }, [isChecked, isOnline]);

    return {
        fetchNextPage,
        error,
        rehydrateError,
        rehydrateLocaleComments,
        isPending: !isChecked || (isOnline && isPending),
        isFetching,
        isFetchingNextPage,
        hasNextPage: isOnline && hasNextPage,
    };
};
