import useStorePictures from '@/shared/store/useStorePictures';
import { deleteAct } from '@/features/reports/lib/savePdfToDocuments';
import { areReportDraftsEqual } from '@/features/reports/lib/areReportDraftsEqual';
import useSubmitReport from '@/features/reports/hooks/useSubmitReport';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutationState } from '@tanstack/react-query';
import { REPORT_OPERATION_KEY } from '@/features/reports/lib/reportOperation';
import { syncOfflineReportsRecords } from '@/features/reports/lib/syncOfflineReportsRecords';

export const useOfflineReportsSync = () => {
    const { submitTaskReport } = useSubmitReport();
    const { isChecked, isOnline } = useNetwork();
    const syncingRef = useRef(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const drafts = useReportDraftStore((state) => state.drafts);
    const pendingOperations = useMutationState({
        filters: { mutationKey: REPORT_OPERATION_KEY, status: 'pending' },
        select: (mutation) => String(mutation.state.variables?.taskId),
    });
    const hasReadyDraft = Object.entries(drafts ?? {}).some(
        ([taskId, draft]) =>
            draft?.reportState === 'pending' &&
            !pendingOperations.includes(taskId)
    );

    const syncReportsRecords = useCallback(async () => {
        if (syncingRef.current || !isChecked || !isOnline) return;
        syncingRef.current = true;
        setIsSyncing(true);
        const drafts = useReportDraftStore.getState().drafts ?? {};
        const failedSyncCount = await syncOfflineReportsRecords(
            drafts,
            submitTaskReport,
            (id, expectedDraft) => {
                const store = useReportDraftStore.getState();
                if (!areReportDraftsEqual(expectedDraft, store.getDraft(id)))
                    return;
                store.clearDraft(id);
                useStorePictures
                    .getState()
                    .clearEntityPhotos({ entity: 'report', entityId: id });
                deleteAct(expectedDraft.actPdf?.uri);
            }
        ).finally(() => {
            syncingRef.current = false;
            setIsSyncing(false);
        });

        return failedSyncCount;
    }, [isChecked, isOnline, submitTaskReport]);

    useEffect(() => {
        if (!isChecked || !isOnline || !hasReadyDraft || isSyncing) return;
        void syncReportsRecords();
    }, [isChecked, isOnline, hasReadyDraft, isSyncing, syncReportsRecords]);

    return syncReportsRecords;
};
