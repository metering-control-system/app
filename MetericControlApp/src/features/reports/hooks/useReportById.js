import { useQuery } from '@tanstack/react-query';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import { getReportById } from '@/features/reports/api/getReportByIdApi';
import useReportsStore from '@/features/reports/store/useReportsStore';

const useReportById = (id) => {
    const reports = useReportsStore((state) => state.reports);
    const { isChecked, isOnline } = useNetwork();

    const reportFromStore = reports?.find((report) => report.id === id) ?? null;

    const { data: report, isPending } = useQuery({
        queryKey: ['report', id],
        queryFn: () => getReportById(id),
        enabled: !reportFromStore && Boolean(id) && isOnline && isChecked,
        staleTime: 5 * 60 * 1000,
    });
    return {
        report: reportFromStore ?? report ?? null,
        isPending: reportFromStore ? false : isPending,
    };
};
export default useReportById;
