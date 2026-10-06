import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mergeReportUpdates } from '@/features/reports/lib/mergeReportUpdates';
import { reportOfflineStorage } from '@/features/reports/store/reportOfflineStorage';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { sortingReports } from '@/features/reports/lib/sortingReports';
import { concatenateFields } from '@/shared/lib/collections/concatenateFields';

const useReportsStore = create(
    persist(
        (set, get) => ({
            reports: null,
            snapshotAt: null,
            replaceReports: (newReports) => {
                if (Array.isArray(newReports)) {
                    for (const report of newReports) {
                        report.search = concatenateFields(report);
                    }
                }
                set({ reports: newReports ? [...newReports] : null });
            },
            setUpdatedReports: (updatedReports, { snapshotAt } = {}) => {
                if (updatedReports) {
                    const oldReports = get().reports ?? [];
                    const mergedReports = mergeReportUpdates(
                        oldReports,
                        updatedReports,
                        { snapshotAt, previousSnapshotAt: get().snapshotAt }
                    );
                    const mergedIds = new Set(
                        mergedReports.map((report) => report.id)
                    );
                    const removedReports = oldReports.filter(
                        (report) => !mergedIds.has(report.id)
                    );
                    const nextSnapshotAt =
                        Number.isFinite(Date.parse(snapshotAt)) &&
                        !(Date.parse(snapshotAt) < Date.parse(get().snapshotAt))
                            ? snapshotAt
                            : get().snapshotAt;
                    for (const report of mergedReports) {
                        report.search = concatenateFields(report);
                    }
                    try {
                        const sortedReports = sortingReports(mergedReports);
                        set({
                            reports: [...sortedReports],
                            snapshotAt: nextSnapshotAt,
                        });
                    } catch {
                        set({
                            reports: [...mergedReports],
                            snapshotAt: nextSnapshotAt,
                        });
                    }
                    return removedReports;
                }
                return [];
            },
            removeReports: (expectedReports) => {
                const currentReports = get().reports ?? [];
                const removedReports = currentReports.filter((report) =>
                    expectedReports.some(
                        (expected) =>
                            expected.id === report.id &&
                            expected.updated_at === report.updated_at
                    )
                );
                const removedIds = new Set(
                    removedReports.map((report) => report.id)
                );
                set({
                    reports: currentReports.filter(
                        (report) => !removedIds.has(report.id)
                    ),
                });
                return removedReports;
            },
            clearReports: () => set({ reports: null, snapshotAt: null }),
        }),
        {
            name: 'reports-store',
            storage: createJSONStorage(() =>
                createPersistStorage(reportOfflineStorage)
            ),
            partialize: (state) => {
                if (!state.reports) return { reports: null };
                return {
                    reports: state.reports.map(
                        //eslint-disable-next-line
                        ({ search, ...report }) => report
                    ),
                };
            },
            merge: (persistedState, currentState) => {
                const state = { ...currentState, ...persistedState };
                if (Array.isArray(state.reports)) {
                    state.reports = state.reports.map((report) => ({
                        ...report,
                        search: concatenateFields(report),
                    }));
                }
                return state;
            },
            skipHydration: false,
        }
    )
);

export default useReportsStore;
