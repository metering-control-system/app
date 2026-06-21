import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';

export const syncOfflineTaskStatuses = async (statusHistory, changeStatus) => {
    let unsynchronizedTasks = 0;
    for (const [id, status] of Object.entries(statusHistory)) {
        if (id) {
            try {
                await changeStatus({ id, status });
                useTaskOfflineMutationStore.getState().clearTaskStatus(id);
            } catch {
                unsynchronizedTasks++;
            }
        }
    }
    return unsynchronizedTasks;
};
