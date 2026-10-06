import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    syncReports,
    TASK_REPORTS_QUERY_KEY,
} from '@/features/reports/lib/syncReports';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const useUpdateReports = () => {
    const queryClient = useQueryClient();
    const { isOnline, isChecked } = useNetwork();

    const { mutate, mutateAsync, error, isPending } = useMutation({
        mutationFn: () => syncReports(queryClient, { full: true }),
        onSuccess: (data) => {
            if (data && queryClient.getQueryState(TASK_REPORTS_QUERY_KEY)) {
                queryClient.setQueryData(TASK_REPORTS_QUERY_KEY, data);
            }
        },
    });

    const updateReports = () => {
        if (!isChecked || !isOnline) {
            return;
        }

        mutate();
    };

    const updateReportsAsync = () => {
        if (!isChecked || !isOnline) return Promise.resolve();
        return mutateAsync();
    };

    return { updateReports, updateReportsAsync, error, isPending };
};

export default useUpdateReports;
