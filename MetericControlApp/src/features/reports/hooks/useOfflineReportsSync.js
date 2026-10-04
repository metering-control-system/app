import useSubmitReport from '@/features/reports/hooks/useSubmitReport';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { useEffect, useRef } from 'react';
import { syncOfflineReportsRecords } from '@/features/reports/lib/syncOfflineReportsRecords';
import useStorePictures from '@/shared/store/useStorePictures';

export const useOfflineReportsSync = () => {
    const { submitTaskReport } = useSubmitReport();
    const { isChecked, isOnline } = useNetwork();
    const isSyncing = useRef(false);

    const syncReportsRecords = async () => {
        if (isSyncing.current || !isChecked || !isOnline) return;
        isSyncing.current = true;
        const reportDraftStore = useReportDraftStore.getState();
        const failedSyncCount = await syncOfflineReportsRecords(
            reportDraftStore.drafts ?? {},
            submitTaskReport,
            (id) => {
                reportDraftStore.clearDraft(id);
                useStorePictures
                    .getState()
                    .clearEntityPhotos({ entity: 'report', entityId: id });
            }
        ).finally(() => (isSyncing.current = false));

        return failedSyncCount;
    };

    useEffect(() => {
        if (!isChecked || !isOnline || isSyncing.current) return;
        void syncReportsRecords();
    }, [isChecked, isOnline]);

    return syncReportsRecords;
};
