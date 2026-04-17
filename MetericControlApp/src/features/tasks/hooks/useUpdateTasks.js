import { mergeTasks } from '@/features/tasks/lib/mergeTasks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks } from '@/features/tasks/api/getTasksApi';
import useParams from '@/features/tasks/store/useParams';

const useUpdateTasks = () => {
    const queryClient = useQueryClient();
    const setUpdateSince = useParams((state) => state.setUpdateSince);

    const { mutate, error, isPending } = useMutation({
        mutationFn: async () => {
            const updateSince = useParams.getState().updateSince;
            return getTasks(
                //eslint-disable-next-line
                updateSince ? { update_since: updateSince } : undefined
            );
        },
        onSuccess: (data) => {
            const serverDate = data?.serverDate;
            if (serverDate) {
                setUpdateSince(serverDate);
            }
            queryClient.setQueryData(['tasks'], (oldTasks = []) => [
                ...mergeTasks(oldTasks, data?.tasks ?? []),
            ]);
        },
    });

    const updateTasks = () => {
        mutate();
    };

    return { updateTasks, error, isPending };
};

export default useUpdateTasks;
