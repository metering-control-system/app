import { getReports } from '@/features/reports/api/getReportsApi';
import { useInfiniteQuery } from '@tanstack/react-query';
import useReportsSyncStore from '@/features/reports/store/useReportsSyncStore';
import { useEffect, useState } from 'react';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import { concatenateFields } from '@/shared/lib/collections/concatenateFields';

const useReports = () => {
    const { isChecked, isOnline } = useNetwork();
    const setListSnapshotAt = useReportsSyncStore(
        (state) => state.setListSnapshotAt
    );
    const [error, setError] = useState(null);
    const setLastSyncAt = useReportsSyncStore((state) => state.setLastSyncAt);
    const setUpdatedReports = useReportsStore(
        (state) => state.setUpdatedReports
    );

    const {
        data,
        fetchNextPage,
        isPending,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ['reports'],
        queryFn: async ({ pageParam }) => {
            const listSnapshotAt =
                useReportsSyncStore.getState().listSnapshotAt;
            const lastSyncAt = useReportsSyncStore.getState().lastSyncAt;
            const response = await getReports({
                limit: 5,
                // eslint-disable-next-line camelcase
                snapshot_at: listSnapshotAt,
                cursor: pageParam,
            });
            if (response.snapshot_at) {
                if (!listSnapshotAt) {
                    setListSnapshotAt(response.snapshot_at);
                }
                if (!lastSyncAt) {
                    setLastSyncAt(response.snapshot_at);
                }
            }
            return response;
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
        enabled: isOnline,
    });

    useEffect(() => {
        if (data) {
            const allReports = data.pages.flatMap((page) => page.reports ?? []);
            setUpdatedReports(allReports);
        }
    }, [data, setUpdatedReports]);

    useEffect(() => {
        if (!isChecked || isOnline || useReportsStore.persist.hasHydrated()) {
            return;
        }

        void useReportsStore.persist
            .rehydrate()
            .then(() => {
                const reports = useReportsStore.getState().reports ?? [];
                for (const report of reports) {
                    report.search = concatenateFields(reports);
                }
                setError(useReportsStore.persist.hasHydrated());
            })
            .catch((error) => setError(`ERROR${error.message}`));
    }, [isChecked, isOnline]);

    return {
        fetchNextPage,
        error,
        isPending: !isChecked || (isOnline && isPending),
        isFetching,
        isFetchingNextPage,
        hasNextPage: isOnline && hasNextPage,
    };
};

export default useReports;
