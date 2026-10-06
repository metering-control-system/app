import { useMutation, useQueryClient } from '@tanstack/react-query';
import useReportsSyncStore from '@/features/reports/store/useReportsSyncStore';
import { getReportsUpdate } from '@/features/reports/api/getReportsUpdateApi';
import useReportsStore from '@/features/reports/store/useReportsStore';
import { clearRemovedReportQueries } from '@/features/reports/lib/clearRemovedReportQueries';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const useUpdateReports = () => {
    const queryClient = useQueryClient();
    const setLastSyncAt = useReportsSyncStore((state) => state.setLastSyncAt);
    const setUpdatedReports = useReportsStore(
        (state) => state.setUpdatedReports
    );
    const { isOnline, isChecked } = useNetwork();

    const { mutate, error, isPending } = useMutation({
        mutationFn: () => getReportsUpdate({ lastSyncAt: null }),
        onSuccess: (data) => {
            const serverDate = data?.snapshot_at;
            if (serverDate) {
                setLastSyncAt(serverDate);
            }
            const removedReports = setUpdatedReports(data?.reports, {
                snapshotAt: data?.snapshot_at,
            });
            clearRemovedReportQueries(
                queryClient,
                removedReports,
                useReportsStore.getState().reports
            );
        },
    });

    const updateReports = () => {
        if (!isChecked || !isOnline) {
            return;
        }

        mutate();
    };

    return { updateReports, error, isPending };
};

export default useUpdateReports;
