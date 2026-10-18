import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { areReportDraftsEqual } from './areReportDraftsEqual';

export const preserveBrigadeDraft = ({ taskId, values, expectedDraft }) => {
    const store = useReportDraftStore.getState();
    const draftId = String(taskId);
    const current = store.getDraft(draftId);
    if (expectedDraft && !areReportDraftsEqual(expectedDraft, current)) return;
    const draft = {
        ...values,
        ...current,
        reportState: 'draft',
        requiresManualSubmit: true,
    };
    delete draft.submissionFinalization;
    delete draft.submissionReport;
    store.setDraft({ draftId, values: draft });
};
