import { deleteAct } from '@/features/reports/lib/savePdfToDocuments';

export const syncOfflineReportsRecords = async (records, sendReport) => {
    let unsynchronizedReports = 0;
    for (const id in records) {
        if (records[id]?.reportState === 'pending') {
            try {
                await sendReport({ taskId: id, values: records[id] });
                deleteAct(records[id]?.actPdfUri);
            } catch {
                unsynchronizedReports++;
            }
        }
    }
    return unsynchronizedReports;
};
