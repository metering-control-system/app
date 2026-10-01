import { create } from 'zustand';

export const useReportDraftStore = create((set, get) => ({
    drafts: {},
    getDraft: (id) => get().drafts[id],
    clearDraft: (id) =>
        set((state) => {
            const drafts = { ...state.drafts };
            delete drafts[id];
            return { drafts };
        }),
}));

export const useNetwork = create(() => ({ isChecked: true, isOnline: true }));
export const submission = { current: null };
export const useSubmitReport = () => ({ submitTaskReport: submission.current });
