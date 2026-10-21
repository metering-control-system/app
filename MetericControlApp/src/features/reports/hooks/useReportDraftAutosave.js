import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { REPORT_DRAFT_STATE } from '@/features/reports/constants/reportDraftState';
import { getReportOperationFilters } from '@/features/reports/lib/reportOperation';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { areObjectsEqual } from '@/shared/lib/collections/areObjectsEqual';

const useReportDraftAutosave = ({ draftId, watch, enabled }) => {
    const queryClient = useQueryClient();
    const cancelDraftSaveRef = useRef(null);
    const suspendedRef = useRef(false);
    const cancelAutosave = useCallback(() => {
        suspendedRef.current = true;
        cancelDraftSaveRef.current?.();
    }, []);
    const resumeAutosave = useCallback(() => {
        suspendedRef.current = false;
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!enabled) return;
            let timer;
            let pendingValues = null;
            let expectedDraft;
            const cancelSave = () => {
                clearTimeout(timer);
                pendingValues = null;
            };
            const saveDraft = () => {
                clearTimeout(timer);
                if (!pendingValues) return;
                const values = pendingValues;
                pendingValues = null;
                const store = useReportDraftStore.getState();
                const current = store.getDraft(draftId);
                if (
                    suspendedRef.current ||
                    queryClient.isMutating(
                        getReportOperationFilters(draftId)
                    ) ||
                    current !== expectedDraft ||
                    current?.reportState === REPORT_DRAFT_STATE.PENDING
                )
                    return;
                const nextDraft = { ...current, ...values };
                if (!areObjectsEqual(current, nextDraft)) {
                    store.setDraft({ draftId, values: nextDraft });
                }
            };
            cancelDraftSaveRef.current = cancelSave;
            const subscription = watch((values) => {
                if (
                    suspendedRef.current ||
                    queryClient.isMutating(getReportOperationFilters(draftId))
                ) {
                    cancelSave();
                    return;
                }
                clearTimeout(timer);
                expectedDraft = useReportDraftStore
                    .getState()
                    .getDraft(draftId);
                pendingValues = JSON.parse(JSON.stringify(values));
                timer = setTimeout(saveDraft, 2000);
            });
            return () => {
                subscription.unsubscribe();
                saveDraft();
                if (cancelDraftSaveRef.current === cancelSave) {
                    cancelDraftSaveRef.current = null;
                }
            };
        }, [enabled, watch, draftId, queryClient])
    );

    return { cancelAutosave, resumeAutosave };
};

export default useReportDraftAutosave;
