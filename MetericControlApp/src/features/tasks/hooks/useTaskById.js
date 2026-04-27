import useTasksStore from '@/features/tasks/store/useTasksStore';

const useTaskById = (id) => {
    const tasks = useTasksStore((state) => state.tasks);

    const task = tasks?.find((task) => task.id === id);

    return { task };
};

export default useTaskById;
