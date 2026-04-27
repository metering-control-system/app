import { useMutation } from '@tanstack/react-query';
import useTasksSyncStore from '@/features/tasks/store/useTasksSyncStore';
import { getTasksUpdate } from '@/features/tasks/api/getTasksUpdateApi';
import useTasksStore from '@/features/tasks/store/useTasksStore';

const useUpdateTasks = () => {
    const setLastSyncAt = useTasksSyncStore((state) => state.setLastSyncAt);
    const setUpdatedTasks = useTasksStore((state) => state.setUpdatedTasks);

    const { mutate, error, isPending } = useMutation({
        mutationFn: async () => {
            const lastSyncAt = useTasksSyncStore.getState().lastSyncAt;
            return getTasksUpdate(lastSyncAt ? { lastSyncAt } : undefined);
        },
        onSuccess: (data) => {
            const serverDate = data?.serverDate;
            if (serverDate) {
                setLastSyncAt(serverDate);
            }
            setUpdatedTasks(data?.tasks);
        },
    });

    const updateTasks = () => {
        mutate();
    };

    return { updateTasks, error, isPending };
};

export default useUpdateTasks;
