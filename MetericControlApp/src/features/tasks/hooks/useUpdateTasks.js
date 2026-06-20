import { useMutation } from '@tanstack/react-query';
import useTasksSyncStore from '@/features/tasks/store/useTasksSyncStore';
import { getTasksUpdate } from '@/features/tasks/api/getTasksUpdateApi';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const useUpdateTasks = () => {
    const setLastSyncAt = useTasksSyncStore((state) => state.setLastSyncAt);
    const setUpdatedTasks = useTasksStore((state) => state.setUpdatedTasks);
    const { isOnline, isChecked } = useNetwork();

    const { mutate, error, isPending } = useMutation({
        mutationFn: async () => {
            const lastSyncAt = useTasksSyncStore.getState().lastSyncAt;
            return getTasksUpdate({ lastSyncAt });
        },
        onSuccess: (data) => {
            const serverDate = data?.snapshot_at;
            if (serverDate) {
                setLastSyncAt(serverDate);
            }
            setUpdatedTasks(data?.tasks);
        },
    });

    const updateTasks = () => {
        if (!isChecked || !isOnline) {
            return;
        }

        mutate();
    };

    return { updateTasks, error, isPending };
};

export default useUpdateTasks;
