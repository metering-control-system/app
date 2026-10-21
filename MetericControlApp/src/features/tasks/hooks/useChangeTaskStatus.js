import { useMutation } from '@tanstack/react-query';
import { changeTaskStatus } from '@/features/tasks/api/changeTaskStatusApi';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';

const useChangeTaskStatus = () => {
    const replaceTasks = useTasksStore((state) => state.replaceTasks);
    const { isChecked, isOnline } = useNetwork();

    const updateStatus = (id, status) => {
        replaceTasks(
            useTasksStore
                .getState()
                .tasks?.map((task) =>
                    task.id === id ? { ...task, status } : task
                ) ?? []
        );
    };

    const { mutateAsync, error, isPending } = useMutation({
        mutationFn: changeTaskStatus,
        onMutate: async ({ id, status }) => {
            const previousStoreTasks = useTasksStore.getState().tasks;

            updateStatus(id, status);

            return { previousStoreTasks };
        },
        onSuccess: (data) => {
            if (data) {
                updateStatus(data.id, data.status);
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
            updateStatus(id, status);
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
