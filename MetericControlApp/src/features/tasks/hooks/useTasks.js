import { getTasks } from '@/features/tasks/api/getTasksApi';
import { useInfiniteQuery } from '@tanstack/react-query';
import useTasksSyncStore from '@/features/tasks/store/useTasksSyncStore';
import { useEffect } from 'react';
import useTasksStore from '@/features/tasks/store/useTasksStore';

const useTasks = () => {
    const setListSnapshotAt = useTasksSyncStore(
        (state) => state.setListSnapshotAt
    );
    const setLastSyncAt = useTasksSyncStore((state) => state.setLastSyncAt);
    const setUpdatedTasks = useTasksStore((state) => state.setUpdatedTasks);

    const {
        data,
        fetchNextPage,
        isPending,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        error,
    } = useInfiniteQuery({
        queryKey: ['tasks'],
        queryFn: async ({ pageParam }) => {
            const listSnapshotAt = useTasksSyncStore.getState().listSnapshotAt;
            const lastSyncAt = useTasksSyncStore.getState().lastSyncAt;
            const response = await getTasks({
                limit: 5,
                // eslint-disable-next-line camelcase
                snapshot_at: listSnapshotAt,
                cursor: pageParam,
            });
            if (response.snapshot_at) {
                if (!listSnapshotAt) {
                    setListSnapshotAt(response.snapshot_at);
                }
                if (!lastSyncAt) {
                    setLastSyncAt(response.snapshot_at);
                }
            }
            return response;
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    });

    useEffect(() => {
        if (data) {
            const allTasks = data.pages.flatMap((page) => page.tasks ?? []);
            setUpdatedTasks(allTasks);
        }
    }, [data]);

    return {
        fetchNextPage,
        error,
        isPending,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
    };
};

export default useTasks;
