import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { taskOfflineMutationStorage } from '@/features/tasks/store/taskOfflineStorage';

const useTaskOfflineMutationStore = create(
    persist(
        (set, get) => ({
            tasksStatuses: null,
            setTaskStatus: (task) => {
                if (!task || !task.status || !task.id) {
                    return;
                }
                set({
                    tasksStatuses: {
                        ...(get().tasksStatuses ?? {}),
                        [task.id]: task.status,
                    },
                });
            },
            clearTaskStatus: (id) => {
                const tasksCopy = { ...get().tasksStatuses };
                delete tasksCopy[id];
                set({ tasksStatuses: tasksCopy });
            },
            clearTasksStatuses: () => set({ tasksStatuses: null }),
        }),
        {
            name: 'tasks-mutation-store',
            storage: createJSONStorage(() =>
                createPersistStorage(taskOfflineMutationStorage)
            ),
            partialize: (state) => ({ tasksStatuses: state.tasksStatuses }),
            skipHydration: false,
        }
    )
);

export default useTaskOfflineMutationStore;
