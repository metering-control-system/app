import useChangeTaskStatus from '@/features/tasks/hooks/useChangeTaskStatus';
import { useEffect } from 'react';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';
import { syncOfflineTaskStatuses } from '@/features/tasks/lib/syncOfflineTaskStatuses';

export const useOfflineTasksSync = () => {
    const { changeStatus } = useChangeTaskStatus();
    const { isChecked, isOnline } = useNetwork();
    const tasksStatuses = useTaskOfflineMutationStore(
        (state) => state.tasksStatuses
    );

    useEffect(() => {
        if (!isChecked || !isOnline || !tasksStatuses) return;
        void syncOfflineTaskStatuses(tasksStatuses, changeStatus);
    }, [changeStatus, isChecked, isOnline, tasksStatuses]);
};
