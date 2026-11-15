import { useCallback } from 'react';
import { REPORT_DRAFT_STATE } from '@/features/reports/constants/reportDraftState';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { areObjectsEqual } from '@/shared/lib/collections/areObjectsEqual';

const usePreserveBrigadeDraft = () =>
    useCallback(({ taskId, values, expectedDraft }) => {
        const store = useReportDraftStore.getState();
        const draftId = String(taskId);
        const current = store.getDraft(draftId);
        if (expectedDraft && !areObjectsEqual(expectedDraft, current)) return;
        const draft = {
            ...current,
            ...values,
            reportState: REPORT_DRAFT_STATE.DRAFT,
            requiresManualSubmit: true,
        };
        delete draft.submissionFinalization;
        delete draft.submissionReport;
        store.setDraft({ draftId, values: draft });
    }, []);

export default usePreserveBrigadeDraft;
