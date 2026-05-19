import useTasksStore from '@/features/tasks/store/useTasksStore';
import { useQuery } from '@tanstack/react-query';
import { getTaskById } from '@/features/tasks/api/getTaskByIdApi';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const useTaskById = (id) => {
    const tasks = useTasksStore((state) => state.tasks);
    const { isChecked, isOnline } = useNetwork();

    const taskFromStore = tasks?.find((task) => task.id === id) ?? null;

    const { data: task, isPending } = useQuery({
        queryKey: ['task', id],
        queryFn: () => getTaskById(id),
        enabled: (!taskFromStore && Boolean(id)) || !isChecked || !isOnline,
        staleTime: 5 * 60 * 1000,
    });
    return {
        task: taskFromStore ?? task ?? null,
        isPending: taskFromStore ? false : isPending,
    };
};
export default useTaskById;
