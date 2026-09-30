import useSubmitReport from '@/features/reports/hooks/useSubmitReport';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { useCallback, useEffect, useRef } from 'react';
import { useMutationState } from '@tanstack/react-query';
import { REPORT_OPERATION_KEY } from '@/features/reports/lib/reportOperation';
import { syncOfflineReportsRecords } from '@/features/reports/lib/syncOfflineReportsRecords';

export const useOfflineReportsSync = () => {
    const { submitTaskReport } = useSubmitReport();
    const { isChecked, isOnline } = useNetwork();
    const isSyncing = useRef(false);
    const pendingOperations = useMutationState({
        filters: { mutationKey: REPORT_OPERATION_KEY, status: 'pending' },
    });
    const pendingCount = pendingOperations.length;

    const syncReportsRecords = useCallback(async () => {
        if (isSyncing.current || !isChecked || !isOnline) return;
        isSyncing.current = true;
        const drafts = useReportDraftStore.getState().drafts ?? {};
        const failedSyncCount = await syncOfflineReportsRecords(
            drafts,
            submitTaskReport
        ).finally(() => (isSyncing.current = false));

        return failedSyncCount;
    }, [isChecked, isOnline, submitTaskReport]);

    useEffect(() => {
        if (!isChecked || !isOnline || pendingCount || isSyncing.current)
            return;
        void syncReportsRecords();
    }, [isChecked, isOnline, pendingCount, syncReportsRecords]);

    return syncReportsRecords;
};
