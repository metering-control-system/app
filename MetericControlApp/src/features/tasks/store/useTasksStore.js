/* eslint-disable no-unused-vars */
import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mergeData } from '@/shared/lib/mergeData';
import { taskOfflineStorage } from '@/features/tasks/store/taskOfflineStorage';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { sortTasks } from '@/features/tasks/lib/sortTasks';
import { concatenateFields } from '@/shared/lib/collections/concatenateFields';

const useTasksStore = create(
    persist(
        (set, get) => ({
            tasks: null,
            replaceTasks: (newTasks) => {
                if (Array.isArray(newTasks)) {
                    for (const task of newTasks) {
                        task.search = concatenateFields(task);
                    }
                }
                set({ tasks: newTasks ? [...newTasks] : null });
            },
            setUpdatedTasks: (updatedTasks) => {
                if (updatedTasks) {
                    const oldTasks = get().tasks ?? [];
                    const mergedTasks = mergeData(oldTasks, updatedTasks);
                    for (const task of mergedTasks) {
                        task.search = concatenateFields(task);
                    }
                    try {
                        const sortedTasks = sortTasks(mergedTasks);
                        set({ tasks: [...sortedTasks] });
                    } catch {
                        set({ tasks: [...mergedTasks] });
                    }
                }
            },
            clearTasks: () => set({ tasks: null }),
        }),
        {
            name: 'tasks-store',
            storage: createJSONStorage(() =>
                createPersistStorage(taskOfflineStorage)
            ),
            partialize: (state) => {
                if (!state.tasks) return { tasks: null };
                return {
                    tasks: state.tasks.map(({ search, ...task }) => task),
                };
            },
            skipHydration: true,
        }
    )
);

export default useTasksStore;
