export const syncOfflineReportsRecords = async (records, sendReport) => {
    let unsynchronizedReports = 0;
    for (const id in records) {
        if (records[id]?.reportState === 'pending') {
            try {
                const result = await sendReport({
                    taskId: id,
                    values: records[id],
                    expectedDraft: records[id],
                });
                if (result?.reason === 'busy' || result?.offline) {
                    unsynchronizedReports++;
                }
            } catch {
                unsynchronizedReports++;
            }
        }
    }
    return unsynchronizedReports;
};
