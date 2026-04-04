// eslint-disable-next-line import/no-unresolved
import { getTasks } from '@/features/tasks/api/getTasksApi';
import { useQuery } from '@tanstack/react-query';

const useTasks = () => {
    const { data: tasks } = useQuery({
        queryKey: ['tasks'],
        queryFn: getTasks,
        refetchInterval: 60 * 1000 * 60,
    });

    return tasks;
};

export default useTasks;
