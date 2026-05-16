import { create } from 'zustand/react';
import { mergeTasks } from '@/features/tasks/lib/mergeTasks';
import { sortTasks } from '@/features/tasks/lib/sortTasks';

const useTasksStore = create((set, get) => ({
    tasks: null,
    replaceTasks: (newTasks) => {
        if (newTasks) {
            set({ tasks: sortTasks(newTasks) });
        }
    },
    setUpdatedTasks: (updatedTasks) => {
        if (updatedTasks) {
            const oldTasks = get().tasks ?? [];
            const mergedTasks = mergeTasks(oldTasks, updatedTasks);
            set({ tasks: sortTasks(mergedTasks) });
        }
    },
    clearTasks: () => set({ tasks: null }),
}));

export default useTasksStore;
