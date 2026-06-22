import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mergeData } from '@/shared/lib/mergeData';
import { reportOfflineStorage } from '@/features/reports/store/reportOfflineStorage';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { sortingReports } from '@/features/reports/lib/sortingReports';
import { concatenateFields } from '@/shared/lib/collections/concatenateFields';

const useReportsStore = create(
    persist(
        (set, get) => ({
            reports: null,
            replaceReports: (newReports) => {
                if (Array.isArray(newReports)) {
                    for (const report of newReports) {
                        report.search = concatenateFields(report);
                    }
                }
                set({ reports: newReports ? [...newReports] : null });
            },
            setUpdatedReports: (updatedReports) => {
                if (updatedReports) {
                    const oldReports = get().reports ?? [];
                    const mergedReports = mergeData(oldReports, updatedReports);
                    for (const report of mergedReports) {
                        report.search = concatenateFields(report);
                    }
                    try {
                        const sortedReports = sortingReports(mergedReports);
                        set({ reports: [...sortedReports] });
                    } catch {
                        set({ reports: [...mergedReports] });
                    }
                }
            },
            clearReports: () => set({ reports: null }),
        }),
        {
            name: 'reports-store',
            storage: createJSONStorage(() =>
                createPersistStorage(reportOfflineStorage)
            ),
            partialize: (state) => ({
                //eslint-disable-next-line no-unused-vars
                reports: state.reports?.map(({ search, ...report }) => report),
            }),
            skipHydration: true,
        }
    )
);

export default useReportsStore;
