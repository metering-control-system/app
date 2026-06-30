import { useQuery } from '@tanstack/react-query';
import useCommentsSyncStore from '@/features/comments/store/useCommentsSyncStore';
import { getComments } from '@/features/comments/api/getCommentsApi';
import { useEffect, useRef, useState } from 'react';
import useCommentsStore from '@/features/comments/store/useCommentsStore';
import useNetwork from '@/shared/hooks/offline/useNetwork';

export const usePullNewComments = (id, requestEnabled) => {
    const setLastSyncAt = useCommentsSyncStore((state) => state.setLastSyncAt);
    const setUpdatedComments = useCommentsStore(
        (state) => state.setUpdatedComments
    );
    const { isOnline } = useNetwork();
    const newCommentsIds = useRef(new Set()).current;
    const [newCommentsNumber, setNewCommentsNumber] = useState(0);

    const { data, error, isFetching } = useQuery({
        queryKey: ['comments', 'poll', id],
        queryFn: async () => {
            const currentSyncAt =
                useCommentsSyncStore.getState().lastSyncAt[id];

            return getComments({
                // eslint-disable-next-line camelcase
                params: { updated_since: currentSyncAt },
                id,
            });
        },
        enabled: !!(!requestEnabled && id && isOnline),
        refetchInterval: 10 * 1000,
        retry: 5,
    });

    useEffect(() => {
        if (data && id) {
            for (const comment of data.comments) {
                newCommentsIds.add(comment.id);
            }
            setNewCommentsNumber(newCommentsIds.size);

            const newComments = data.comments ?? [];
            if (newComments.length > 0) {
                setUpdatedComments(newComments, id);
            }
            if (data.snapshot_at) {
                setLastSyncAt(data.snapshot_at, id);
            }
        }
    }, [data, id, setUpdatedComments, setLastSyncAt]);

    return {
        error,
        isFetching,
        newCommentsNumber,
        setNewCommentsNumber,
        newCommentsIds,
    };
};
