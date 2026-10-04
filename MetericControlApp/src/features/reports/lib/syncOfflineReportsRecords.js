import { deleteAct } from '@/features/reports/lib/savePdfToDocuments';

export const syncOfflineReportsRecords = async (
    records,
    sendReport,
    onSynced
) => {
    let unsynchronizedReports = 0;
    for (const id in records) {
        if (records[id]?.reportState === 'pending') {
            try {
                await sendReport({ taskId: id, values: records[id] });
                onSynced(id);
                deleteAct(records[id]?.actPdf?.uri);
            } catch {
                unsynchronizedReports++;
            }
        }
    }
    return unsynchronizedReports;
};
