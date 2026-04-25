import { useMutation } from '@tanstack/react-query';
import { changeTaskStatus } from '@/features/tasks/api/changeTaskStatusApi';
import { mergeTasks } from '@/features/tasks/lib/mergeTasks';
import useParams from '@/features/tasks/store/useParams';

const useChangeTaskStatus = () => {
    const setUpdateSince = useParams((state) => state.setUpdateSince);

    const { mutate, error, isPending } = useMutation({
        mutationFn: changeTaskStatus,
        onMutate: async ({ id, status }, context) => {
            await context.client.cancelQueries({ queryKey: ['tasks'] });
            const previousTasks = context.client.getQueryData(['tasks']);

            context.client.setQueryData(['tasks'], (oldTasks) => [
                ...(oldTasks?.map((task) => {
                    if (task.id === id) {
                        return { ...task, status };
                    }
                    return task;
                }) ?? []),
            ]);
            return { previousTasks };
        },
        onSuccess: async (data, _, onMutateResult, context) => {
            const serverDate = data?.serverDate;
            if (serverDate) {
                setUpdateSince(serverDate);
            }
            context.client.setQueryData(['tasks'], (oldTasks = []) => [
                ...mergeTasks(oldTasks, [data?.task]),
            ]);
        },
        onError: (err, newTodo, onMutateResult, context) => {
            context.client.setQueryData(
                ['tasks'],
                onMutateResult.previousTasks
            );
        },
    });

    const changeStatus = async ({ id, status }) => {
        mutate({ id, status });
    };

    return { changeStatus, error, isPending };
};

export default useChangeTaskStatus;
