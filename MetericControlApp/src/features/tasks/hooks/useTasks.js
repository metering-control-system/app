import { getTasks } from '@/features/tasks/api/getTasksApi';
import { useInfiniteQuery } from '@tanstack/react-query';
import useTasksSyncStore from '@/features/tasks/store/useTasksSyncStore';
import { useEffect, useState } from 'react';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import { concatenateFields } from '@/shared/lib/collections/concatenateFields';

const useTasks = () => {
    const { isChecked, isOnline } = useNetwork();
    const setListSnapshotAt = useTasksSyncStore(
        (state) => state.setListSnapshotAt
    );
    const setLastSyncAt = useTasksSyncStore((state) => state.setLastSyncAt);
    const setUpdatedTasks = useTasksStore((state) => state.setUpdatedTasks);
    const [error, setError] = useState(null);

    const {
        data,
        fetchNextPage,
        isPending,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
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
        enabled: isOnline,
    });

    useEffect(() => {
        if (data) {
            const allTasks = data.pages.flatMap((page) => page.tasks ?? []);
            setUpdatedTasks(allTasks);
        }
    }, [data, setUpdatedTasks]);

    useEffect(() => {
        if (!isChecked || isOnline) {
            return;
        }

        useTasksStore.persist
            .rehydrate()
            .then(() => {
                const tasks = useTasksStore.getState().tasks ?? [];
                for (const task of tasks) {
                    task.search = concatenateFields(task);
                }
                setError(`${useTasksStore.persist.hasHydrated()}`);
            })
            .catch((error) => setError(`ERROR: ${error.message}}`));
    }, [isChecked, isOnline]);

    return {
        fetchNextPage,
        error,
        isPending: !isChecked || (isOnline && isPending),
        isFetching,
        isFetchingNextPage,
        hasNextPage: isOnline && hasNextPage,
    };
};

export default useTasks;
