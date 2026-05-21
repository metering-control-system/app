import { useMutation } from '@tanstack/react-query';
import { changeTaskStatus } from '@/features/tasks/api/changeTaskStatusApi';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import { optimisticStatusUpdate } from '@/features/tasks/lib/optimisticStatusUpdate';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';

const useChangeTaskStatus = () => {
    const replaceTasks = useTasksStore((state) => state.replaceTasks);
    const setUpdatedTasks = useTasksStore((state) => state.setUpdatedTasks);
    const { isChecked, isOnline } = useNetwork();

    const { mutateAsync, error, isPending } = useMutation({
        mutationFn: changeTaskStatus,
        onMutate: async ({ id, status }) => {
            const previousStoreTasks = useTasksStore.getState().tasks;

            optimisticStatusUpdate({ previousStoreTasks, id, status });

            return { previousStoreTasks };
        },
        onSuccess: (data) => {
            if (data) {
                setUpdatedTasks([data]);
            }
        },
        onError: (_error, _variables, context) => {
            replaceTasks(context?.previousStoreTasks ?? null);
        },
    });

    const changeStatus = async ({ id, status }) => {
        if (!isChecked) {
            return;
        }

        if (!isOnline) {
            const previousStoreTasks = useTasksStore.getState().tasks;
            optimisticStatusUpdate({ previousStoreTasks, id, status });
            useTaskOfflineMutationStore
                .getState()
                .setTaskStatus({ id, status });
            return;
        }
        return await mutateAsync({ id, status });
    };

    return { changeStatus, error, isPending };
};

export default useChangeTaskStatus;
