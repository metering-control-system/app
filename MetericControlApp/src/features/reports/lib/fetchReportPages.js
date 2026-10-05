import { registerReportPaginationCursor } from './reportPaginationGuard.js';

export const fetchReportPages = async (fetchPage, lastSyncAt) => {
    const reports = [];
    const seenCursors = new Set();
    let cursor;
    let snapshotAt;
    do {
        const page = await fetchPage({
            limit: 100,
            ['update_since']: lastSyncAt,
            cursor,
        });
        snapshotAt ??= page.snapshot_at;
        reports.push(...(page.reports ?? []));
        cursor = page.next_cursor;
        registerReportPaginationCursor(seenCursors, cursor);
    } while (cursor);
    return { reports, ['snapshot_at']: snapshotAt };
};
