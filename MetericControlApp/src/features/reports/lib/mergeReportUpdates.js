export const mergeReportUpdates = (
    previous,
    incoming,
    { snapshotAt, previousSnapshotAt } = {}
) => {
    const snapshotTime = Date.parse(snapshotAt);
    const previousSnapshotTime = Date.parse(previousSnapshotAt);
    if (snapshotTime < previousSnapshotTime) return [...(previous ?? [])];
    const incomingIds = new Set((incoming ?? []).map((report) => report.id));
    const reports = new Map(
        (previous ?? [])
            .filter(
                (report) =>
                    !Number.isFinite(snapshotTime) ||
                    incomingIds.has(report.id) ||
                    Date.parse(report.updated_at) >= snapshotTime
            )
            .map((report) => [report.id, report])
    );
    for (const report of incoming ?? []) {
        const cached = reports.get(report.id);
        if (
            (!cached &&
                !Number.isFinite(snapshotTime) &&
                Number.isFinite(previousSnapshotTime) &&
                !(Date.parse(report.updated_at) >= previousSnapshotTime)) ||
            Date.parse(cached?.updated_at) > Date.parse(report.updated_at)
        ) {
            continue;
        }
        reports.set(report.id, report);
    }
    return [...reports.values()];
};
