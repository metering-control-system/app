import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { areObjectsEqual } from '../../../shared/lib/collections/areObjectsEqual.js';

export const preserveBrigadeDraft = ({ taskId, values, expectedDraft }) => {
    const store = useReportDraftStore.getState();
    const draftId = String(taskId);
    const current = store.getDraft(draftId);
    if (expectedDraft && !areObjectsEqual(expectedDraft, current)) return;
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
