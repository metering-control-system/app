import useChangeTaskStatus from '@/features/tasks/hooks/useChangeTaskStatus';
import { useEffect, useRef } from 'react';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';
import { syncOfflineTaskStatuses } from '@/features/tasks/lib/syncOfflineTaskStatuses';

export const useOfflineTasksSync = () => {
    const { changeStatus } = useChangeTaskStatus();
    const isSyncing = useRef(false);
    const { isChecked, isOnline } = useNetwork();
    const tasksStatuses = useTaskOfflineMutationStore(
        (state) => state.tasksStatuses
    );

    const syncTasksStatuses = async () => {
        if (isSyncing.current || !isChecked || !isOnline) return;
        isSyncing.current = true;
        const latestTasksStatuses =
            useTaskOfflineMutationStore.getState().tasksStatuses;
        if (!latestTasksStatuses) return;
        const failedSyncCount = await syncOfflineTaskStatuses(
            latestTasksStatuses,
            changeStatus
        ).finally(() => (isSyncing.current = false));
        return failedSyncCount;
    };

    useEffect(() => {
        if (!isChecked || !isOnline || !tasksStatuses || isSyncing.current)
            return;
        void syncTasksStatuses();
    }, [changeStatus, isChecked, isOnline, tasksStatuses]);

    return syncTasksStatuses;
};
