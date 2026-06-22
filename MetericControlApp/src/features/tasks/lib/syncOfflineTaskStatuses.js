import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';

export const syncOfflineTaskStatuses = async (statusHistory, changeStatus) => {
    for (const [id, status] of Object.entries(statusHistory)) {
        if (id) {
            await changeStatus({ id, status });
            useTaskOfflineMutationStore.getState().clearTaskStatus(id);
        }
    }
};
