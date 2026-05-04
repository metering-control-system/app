import useTasksStore from '@/features/tasks/store/useTasksStore';
import { useQuery } from '@tanstack/react-query';
import { getTaskById } from '@/features/tasks/api/getTaskByIdApi';

const useTaskById = (id) => {
    const tasks = useTasksStore((state) => state.tasks);

    const taskFromStore = tasks?.find((task) => task.id === id) ?? null;

    const { data: task, isPending } = useQuery({
        queryKey: ['task', id],
        queryFn: () => getTaskById(id),
        enabled: !taskFromStore && Boolean(id),
        staleTime: 5 * 60 * 1000,
    });
    return {
        task: taskFromStore ?? task ?? null,
        isPending: taskFromStore ? false : isPending,
    };
};
export default useTaskById;
