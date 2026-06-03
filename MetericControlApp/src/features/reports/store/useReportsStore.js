import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mergeData } from '@/shared/lib/mergeData';
import { reportOfflineStorage } from '@/features/reports/store/reportOfflineStorage';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';

const useReportsStore = create(
    persist(
        (set, get) => ({
            reports: null,
            replaceReports: (newReports) => {
                set({ reports: newReports ? [...newReports] : null });
            },
            setUpdatedReports: (updatedReports) => {
                if (updatedReports) {
                    const oldReports = get().reports ?? [];
                    const mergedReports = mergeData(oldReports, updatedReports);
                    set({ reports: [...mergedReports] });
                }
            },
            clearReports: () => set({ reports: null }),
        }),
        {
            name: 'reports-store',
            storage: createJSONStorage(() =>
                createPersistStorage(reportOfflineStorage)
            ),
            partialize: (state) => ({ reports: state.reports }),
            skipHydration: true,
        }
    )
);

export default useReportsStore;
