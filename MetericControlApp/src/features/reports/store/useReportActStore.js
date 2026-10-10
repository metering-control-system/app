import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { reportSignaturesStorage } from '@/features/reports/store/reportSignaturesStorage';
import { areReportDraftsEqual } from '@/features/reports/lib/areReportDraftsEqual';

const useReportActStore = create(
    persist(
        (set, get) => ({
            actsByTask: {},
            session: null,
            result: null,
            saveAct: (taskId, actPdf) =>
                set((state) => ({
                    actsByTask: {
                        ...state.actsByTask,
                        [String(taskId)]: {
                            checksum: actPdf.checksum,
                            templateId: actPdf.templateId,
                            signatures: actPdf.signatures ?? {},
                        },
                    },
                })),
            startSession: (session) => set({ session, result: null }),
            completeSession: (actPdf) => {
                const session = get().session;
                if (!session) return false;
                const taskId = String(session.taskId);
                if (get().actsByTask[taskId]?.checksum !== actPdf.checksum)
                    return false;
                get().saveAct(taskId, actPdf);
                set({ result: { taskId, actPdf } });
                return true;
            },
            clearSession: () => set({ session: null, result: null }),
            clearTaskAct: (taskId, expectedAct) => {
                const key = String(taskId);
                if (
                    !expectedAct ||
                    !areReportDraftsEqual(get().actsByTask[key], expectedAct)
                )
                    return;
                set((state) => {
                    const actsByTask = { ...state.actsByTask };
                    delete actsByTask[key];
                    return { actsByTask };
                });
            },
        }),
        {
            name: 'report-signatures-store',
            version: 1,
            migrate: () => ({ actsByTask: {} }),
            storage: createJSONStorage(() =>
                createPersistStorage(reportSignaturesStorage)
            ),
            partialize: (state) => ({ actsByTask: state.actsByTask }),
        }
    )
);

export default useReportActStore;
