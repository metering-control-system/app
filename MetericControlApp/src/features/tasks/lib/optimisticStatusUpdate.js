import useTasksStore from '@/features/tasks/store/useTasksStore';

export const optimisticStatusUpdate = ({ previousStoreTasks, id, status }) => {
    const replaceTasks = useTasksStore.getState().replaceTasks;

    const optimisticTasks =
        previousStoreTasks?.map((task) => {
            if (task.id === id) {
                return { ...task, status };
            }
            return task;
        }) ?? [];

    replaceTasks(optimisticTasks);
};
