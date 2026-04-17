import useTasks from '@/features/tasks/hooks/useTasks';

const useTaskById = (id) => {
    const { tasks, isPending, error } = useTasks();

    const task = tasks?.find((task) => task.id === id);

    return { task, isPending, error };
};

export default useTaskById;
