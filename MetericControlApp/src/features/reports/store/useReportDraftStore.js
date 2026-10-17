import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { reportDraftStorage } from '@/features/reports/store/reportDraftStorage';

const useReportDraftStore = create(
    persist(
        (set, get) => ({
            drafts: {},
            getDraft: (draftId) => get().drafts?.[draftId] ?? null,
            setDraft: ({ draftId, values }) =>
                set((state) => ({
                    drafts: { ...state.drafts, [draftId]: values },
                })),
            clearDraft: (draftId) =>
                set((state) => {
                    const nextDrafts = { ...state.drafts };
                    delete nextDrafts[draftId];

                    return { drafts: nextDrafts };
                }),
            returnToDraft: (draftId) =>
                set((state) => {
                    const current = state.drafts[draftId];
                    if (!['pending', 'error'].includes(current?.reportState))
                        return state;
                    const draft = { ...current, reportState: 'draft' };
                    delete draft.submissionFinalization;
                    return { drafts: { ...state.drafts, [draftId]: draft } };
                }),
            clearDrafts: () => set({ drafts: {} }),
        }),
        {
            name: 'report-drafts-store',
            storage: createJSONStorage(() =>
                createPersistStorage(reportDraftStorage)
            ),
        }
    )
);

export default useReportDraftStore;
