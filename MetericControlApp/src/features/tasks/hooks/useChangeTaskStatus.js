import { useMutation } from '@tanstack/react-query';
import { changeTaskStatus } from '@/features/tasks/api/changeTaskStatusApi';
import useTasksStore from '@/features/tasks/store/useTasksStore';

const useChangeTaskStatus = () => {
    const replaceTasks = useTasksStore((state) => state.replaceTasks);
    const setUpdatedTasks = useTasksStore((state) => state.setUpdatedTasks);

    const { mutate, error, isPending } = useMutation({
        mutationFn: changeTaskStatus,
        onMutate: async ({ id, status }) => {
            const previousStoreTasks = useTasksStore.getState().tasks;

            const optimisticTasks =
                previousStoreTasks?.map((task) => {
                    if (task.id === id) {
                        return { ...task, status };
                    }
                    return task;
                }) ?? [];

            replaceTasks(optimisticTasks);

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
        mutate({ id, status });
    };

    return { changeStatus, error, isPending };
};

export default useChangeTaskStatus;
