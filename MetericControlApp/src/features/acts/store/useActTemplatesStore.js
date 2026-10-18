import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { actTemplatesStorage } from '@/features/acts/store/actTemplatesStorage';
import { mergeData } from '@/shared/lib/mergeData';

const useActTemplatesStore = create(
    persist(
        (set, get) => ({
            lastSyncAt: null,
            templates: [],
            setSyncTime: (syncTime) => set({ lastSyncAt: syncTime }),
            setTemplates: (templates) => {
                const prevTemplates = get().templates ?? [];
                const mergedTemplates = mergeData(prevTemplates, templates);
                set({ templates: mergedTemplates });
            },
            getTemplate: (id) =>
                get().templates.find((tmp) => tmp.id === id) ?? [],
            getTemplates: () => get().templates,
            clearTemplates: () => set({ templates: [], lastSyncAt: null }),
        }),
        {
            name: 'act-templates-store',
            storage: createJSONStorage(() =>
                createPersistStorage(actTemplatesStorage)
            ),
        }
    )
);

export default useActTemplatesStore;
