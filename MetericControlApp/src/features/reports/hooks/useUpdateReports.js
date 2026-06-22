import { useMutation } from '@tanstack/react-query';
import useReportsSyncStore from '@/features/reports/store/useReportsSyncStore';
import { getReportsUpdate } from '@/features/reports/api/getReportsUpdateApi';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const useUpdateReports = () => {
    const setLastSyncAt = useReportsSyncStore((state) => state.setLastSyncAt);
    const setUpdatedReports = useReportsStore(
        (state) => state.setUpdatedReports
    );
    const { isOnline, isChecked } = useNetwork();

    const { mutate, error, isPending } = useMutation({
        mutationFn: async () => {
            const lastSyncAt = useReportsSyncStore.getState().lastSyncAt;
            return getReportsUpdate({ lastSyncAt });
        },
        onSuccess: (data) => {
            const serverDate = data?.snapshot_at;
            if (serverDate) {
                setLastSyncAt(serverDate);
            }
            setUpdatedReports(data?.reports);
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
