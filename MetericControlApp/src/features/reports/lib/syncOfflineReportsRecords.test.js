import assert from 'node:assert/strict';
import test from 'node:test';
import { syncOfflineReportsRecords } from './syncOfflineReportsRecords.js';

test('cleans only successful submissions and passes the submitted draft to cleanup', async () => {
    const records = Object.fromEntries(
        [1, 2, 3, 4, 5].map((id) => [id, { reportState: 'pending' }])
    );
    const cleaned = [];
    const count = await syncOfflineReportsRecords(
        records,
        async ({ taskId }) => {
            if (taskId === '1') return { reportId: 10 };
            if (taskId === '2') return { skipped: true, reason: 'busy' };
            if (taskId === '3') return { skipped: true };
            if (taskId === '4') return { offline: true };
            throw new Error('Network error');
        },
        (id, draft) => {
            cleaned.push(id);
            assert.equal(draft, records[id]);
        }
    );
    assert.deepEqual(cleaned, ['1']);
    assert.equal(count, 3);
});

test('passes the persisted server revision to cleanup after a brigade upload', async () => {
    const original = { reportState: 'pending' };
    const sent = {
        ...original,
        submissionReport: { id: 10, updatedAt: '2026-10-06T12:00:00Z' },
    };
    let cleaned;
    const count = await syncOfflineReportsRecords(
        { 1: original },
        async () => ({ reportId: 10, submittedDraft: sent }),
        (id, draft) => {
            cleaned = draft;
        }
    );
    assert.equal(count, 0);
    assert.equal(cleaned, sent);
});
