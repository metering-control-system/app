export const syncOfflineReportsRecords = async (
    records,
    sendReport,
    onSynced
) => {
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
                if (result?.skipped || result?.offline) continue;
                await onSynced?.(id, records[id]);
            } catch {
                unsynchronizedReports++;
            }
        }
    }
    return unsynchronizedReports;
};
