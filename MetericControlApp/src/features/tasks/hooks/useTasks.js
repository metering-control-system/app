import { getTasks } from '@/features/tasks/api/getTasksApi';
import { useQuery } from '@tanstack/react-query';
import useParams from '@/features/tasks/store/useParams';

const useTasks = () => {
    const setUpdateSince = useParams((state) => state.setUpdateSince);

    const {
        data: tasks,
        isPending,
        error,
    } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await getTasks();
            if (response.serverDate) {
                setUpdateSince(response.serverDate);
            }
            return response.tasks ?? [];
        },
        staleTime: Infinity,
    });

    return { tasks, error, isPending };
};

export default useTasks;
