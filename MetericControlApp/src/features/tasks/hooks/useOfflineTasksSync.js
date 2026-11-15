import useChangeTaskStatus from '@/features/tasks/hooks/useChangeTaskStatus';
import { useCallback, useEffect, useRef } from 'react';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';

export const useOfflineTasksSync = () => {
    const { changeStatus } = useChangeTaskStatus();
    const isSyncing = useRef(false);
    const { isChecked, isOnline } = useNetwork();
    const tasksStatuses = useTaskOfflineMutationStore(
        (state) => state.tasksStatuses
    );

    const syncOfflineTaskStatuses = useCallback(
        async (statusHistory) => {
            let failedSyncCount = 0;
            for (const [id, status] of Object.entries(statusHistory)) {
                if (!id) continue;
                try {
                    await changeStatus({ id, status });
                    useTaskOfflineMutationStore.getState().clearTaskStatus(id);
                } catch {
                    failedSyncCount++;
                }
            }
            return failedSyncCount;
        },
        [changeStatus]
    );

    const syncTasksStatuses = useCallback(async () => {
        if (isSyncing.current || !isChecked || !isOnline) return;
        const latestTasksStatuses =
            useTaskOfflineMutationStore.getState().tasksStatuses;
        if (!latestTasksStatuses) return;
        isSyncing.current = true;
        try {
            return await syncOfflineTaskStatuses(latestTasksStatuses);
        } finally {
            isSyncing.current = false;
        }
    }, [syncOfflineTaskStatuses, isChecked, isOnline]);

    useEffect(() => {
        if (!isChecked || !isOnline || !tasksStatuses || isSyncing.current)
            return;
        void syncTasksStatuses();
    }, [syncTasksStatuses, isChecked, isOnline, tasksStatuses]);

    return syncTasksStatuses;
};
