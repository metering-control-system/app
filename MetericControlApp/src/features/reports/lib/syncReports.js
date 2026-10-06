import { getReportsUpdate } from '@/features/reports/api/getReportsUpdateApi';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useReportsSyncStore from '@/features/reports/store/useReportsSyncStore';
import { clearRemovedReportQueries } from './clearRemovedReportQueries.js';

export const TASK_REPORTS_QUERY_KEY = ['reports', 'tasks'];
export const REPORTS_STALE_TIME = 30 * 1000;
export const REPORTS_FULL_SYNC_INTERVAL = 5 * 60 * 1000;

export const syncReports = async (
    queryClient,
    { signal, full = false } = {}
) => {
    const { lastSyncAt, lastFullSyncAt, generation } =
        useReportsSyncStore.getState();
    const fullSnapshot =
        full ||
        !lastSyncAt ||
        lastFullSyncAt === null ||
        Date.now() - lastFullSyncAt >= REPORTS_FULL_SYNC_INTERVAL;
    const data = await getReportsUpdate({
        lastSyncAt: fullSnapshot ? null : lastSyncAt,
        signal,
    });
    if (
        signal?.aborted ||
        generation !== useReportsSyncStore.getState().generation
    ) {
        return null;
    }

    const removedReports = useReportsStore
        .getState()
        .setUpdatedReports(data.reports, {
            snapshotAt: fullSnapshot ? data.snapshot_at : undefined,
        });
    clearRemovedReportQueries(
        queryClient,
        removedReports,
        useReportsStore.getState().reports
    );
    useReportsSyncStore.getState().recordSync(data.snapshot_at, fullSnapshot);
    return data;
};
