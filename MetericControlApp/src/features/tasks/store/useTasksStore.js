import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mergeTasks } from '@/features/tasks/lib/mergeTasks';
import { taskOfflineStorage } from '@/features/tasks/store/taskOfflineStorage';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';

const useTasksStore = create(
    persist(
        (set, get) => ({
            tasks: null,
            replaceTasks: (newTasks) => {
                set({ tasks: newTasks ? [...newTasks] : null });
            },
            setUpdatedTasks: (updatedTasks) => {
                if (updatedTasks) {
                    const oldTasks = get().tasks ?? [];
                    const mergedTasks = mergeTasks(oldTasks, updatedTasks);
                    set({ tasks: [...mergedTasks] });
                }
            },
            clearTasks: () => set({ tasks: null }),
        }),
        {
            name: 'tasks-store',
            storage: createJSONStorage(() =>
                createPersistStorage(taskOfflineStorage)
            ),
            partialize: (state) => ({ tasks: state.tasks }),
            skipHydration: true,
        }
    )
);

export default useTasksStore;
