import { getReports } from '@/features/reports/api/getReportsApi';
import { fetchReportPages } from '@/features/reports/lib/fetchReportPages';

export const getReportsUpdate = ({ lastSyncAt, signal }) =>
    fetchReportPages((params) => getReports(params, { signal }), lastSyncAt);
