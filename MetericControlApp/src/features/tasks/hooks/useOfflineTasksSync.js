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

    useEffect(() => {
        if (!isChecked || !isOnline || !tasksStatuses || isSyncing.current)
            return;
        isSyncing.current = true;
        syncOfflineTaskStatuses(tasksStatuses, changeStatus).finally(
            () => (isSyncing.current = false)
        );
    }, [changeStatus, isChecked, isOnline, tasksStatuses]);
};
