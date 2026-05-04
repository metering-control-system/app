import { create } from 'zustand/react';
import { mergeTasks } from '@/features/tasks/lib/mergeTasks';

const useTasksStore = create((set, get) => ({
    tasks: null,
    replaceTasks: (newTasks) => {
        if (newTasks) {
            set({ tasks: [...newTasks] });
        }
    },
    setUpdatedTasks: (updatedTasks) => {
        if (updatedTasks) {
            const oldTasks = get().tasks ?? [];
            const mergedTasks = mergeTasks(oldTasks, updatedTasks);
            set({ tasks: [...mergedTasks] });
        }
    },
    clearTasks: () => set({ tasks: null }),
}));

export default useTasksStore;
