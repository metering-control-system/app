import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchReportPages } from './fetchReportPages.js';

test('loads all report pages before returning the synchronization snapshot', async () => {
    const params = [];
    const result = await fetchReportPages(async (request) => {
        params.push(request);
        return request.cursor
            ? {
                  reports: [{ id: 2, status: 'REJECTED' }],
                  ['snapshot_at']: 'snapshot',
                  ['next_cursor']: null,
              }
            : {
                  reports: [{ id: 1 }],
                  ['snapshot_at']: 'snapshot',
                  ['next_cursor']: 'next',
              };
    }, 'previous');

    assert.deepEqual(
        result.reports.map((report) => report.id),
        [1, 2]
    );
    assert.equal(result.snapshot_at, 'snapshot');
    assert.equal(params[1].cursor, 'next');
    assert.equal(params[1].update_since, 'previous');
});

test('does not return a partial snapshot if another page fails', async () => {
    await assert.rejects(
        fetchReportPages(async ({ cursor }) => {
            if (cursor) throw new Error('network');
            return { reports: [{ id: 1 }], ['next_cursor']: 'next' };
        }),
        /network/
    );
});

test('stops on a repeated server cursor', async () => {
    await assert.rejects(
        fetchReportPages(async () => ({
            reports: [],
            ['next_cursor']: 'same',
        })),
        /курсор/
    );
});
