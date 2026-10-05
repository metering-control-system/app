export const mergeReportUpdates = (previous, incoming) => {
    const reports = new Map(
        (previous ?? []).map((report) => [report.id, report])
    );
    for (const report of incoming ?? []) {
        const cached = reports.get(report.id);
        if (Date.parse(cached?.updated_at) > Date.parse(report.updated_at)) {
            continue;
        }
        reports.set(report.id, report);
    }
    return [...reports.values()];
};
