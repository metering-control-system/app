import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { actSignaturesStorage } from '@/features/acts/store/actSignaturesStorage';
import { areObjectsEqual } from '@/shared/lib/collections/areObjectsEqual';

const useActStore = create(
    persist(
        (set, get) => ({
            actMetadataByTask: {},
            session: null,
            result: null,
            saveAct: (taskId, actPdf) =>
                set((state) => ({
                    actMetadataByTask: {
                        ...state.actMetadataByTask,
                        [String(taskId)]: {
                            id:
                                state.actMetadataByTask[String(taskId)]?.id ??
                                actPdf.id,
                            checksum: actPdf.checksum,
                            uri: actPdf.uri,
                            templateId: actPdf.templateId,
                            signatures: actPdf.signatures ?? {},
                        },
                    },
                })),
            getActId: (taskId, createId) => {
                const key = String(taskId);
                const current = get().actMetadataByTask[key];
                if (current?.id) return current.id;
                const id = createId();
                set((state) => ({
                    actMetadataByTask: {
                        ...state.actMetadataByTask,
                        [key]: { ...state.actMetadataByTask[key], id },
                    },
                }));
                return id;
            },
            startSession: (session) => set({ session, result: null }),
            completeSession: (
                actPdf,
                { keepSession = false, expectedSession } = {}
            ) => {
                const session = get().session;
                if (
                    !session ||
                    (expectedSession && session !== expectedSession)
                )
                    return false;
                const taskId = String(session.taskId);
                if (
                    get().actMetadataByTask[taskId]?.checksum !==
                    actPdf.checksum
                )
                    return false;
                get().saveAct(taskId, actPdf);
                set({
                    session: keepSession
                        ? { ...session, values: { ...session.values, actPdf } }
                        : null,
                    result: { taskId, actPdf },
                });
                return true;
            },
            clearResult: () => set({ result: null }),
            clearSession: () => set({ session: null, result: null }),
            clearAllActs: () =>
                set({ actMetadataByTask: {}, session: null, result: null }),
            clearTaskAct: (taskId, expectedAct) => {
                const key = String(taskId);
                if (
                    !expectedAct ||
                    !areObjectsEqual(get().actMetadataByTask[key], expectedAct)
                )
                    return;
                set((state) => {
                    const actMetadataByTask = { ...state.actMetadataByTask };
                    delete actMetadataByTask[key];
                    return { actMetadataByTask };
                });
            },
        }),
        {
            name: 'report-signatures-store',
            storage: createJSONStorage(() =>
                createPersistStorage(actSignaturesStorage)
            ),
            partialize: (state) => ({
                actMetadataByTask: state.actMetadataByTask,
            }),
        }
    )
);

export default useActStore;
