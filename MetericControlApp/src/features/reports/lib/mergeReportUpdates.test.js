import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeReportUpdates } from './mergeReportUpdates.js';

test('does not restore an old rejection after successful resubmission', () => {
    const current = {
        id: 1,
        status: 'ON_REVIEW',
        ['updated_at']: '2026-10-05T12:00:00Z',
    };
    const stale = {
        id: 1,
        status: 'REJECTED',
        ['updated_at']: '2026-10-05T11:00:00Z',
    };
    assert.deepEqual(mergeReportUpdates([current], [stale]), [current]);
});

test('applies a new rejection and keeps unrelated reports', () => {
    const previous = {
        id: 1,
        status: 'ON_REVIEW',
        ['updated_at']: '2026-10-05T11:00:00Z',
    };
    const rejected = {
        id: 1,
        status: 'REJECTED',
        ['updated_at']: '2026-10-05T12:00:00Z',
    };
    const other = { id: 2 };
    assert.deepEqual(mergeReportUpdates([previous, other], [rejected]), [
        rejected,
        other,
    ]);
});

test('merges reports without timestamps and does not change input arrays', () => {
    const previous = [{ id: 1, status: 'ON_REVIEW' }];
    assert.deepEqual(
        mergeReportUpdates(previous, [
            { id: 1, status: 'REJECTED' },
            { id: 2 },
        ]),
        [{ id: 1, status: 'REJECTED' }, { id: 2 }]
    );
    assert.equal(previous[0].status, 'ON_REVIEW');
    assert.deepEqual(mergeReportUpdates(null, null), []);
});

const snapshotAt = '2026-10-06T12:00:00Z';
const old = {
    id: 10,
    status: 'ON_REVIEW',
    ['updated_at']: '2026-10-06T11:00:00Z',
};
const concurrent = {
    id: 20,
    status: 'ON_REVIEW',
    ['updated_at']: '2026-10-06T12:01:00Z',
};

test('a complete snapshot removes missing old reports and preserves concurrent submissions', () => {
    assert.deepEqual(
        mergeReportUpdates([old, concurrent], [], { snapshotAt }),
        [concurrent]
    );
    assert.deepEqual(mergeReportUpdates([old], []), [old]);
    assert.deepEqual(mergeReportUpdates([old], [], { snapshotAt: 'invalid' }), [
        old,
    ]);
});

test('a late page cannot restore a report absent from the latest complete snapshot', () => {
    assert.deepEqual(
        mergeReportUpdates([], [old, concurrent], {
            previousSnapshotAt: snapshotAt,
        }),
        [concurrent]
    );
});

test('an older complete snapshot cannot restore deleted reports or remove current ones', () => {
    assert.deepEqual(
        mergeReportUpdates([concurrent], [old], {
            snapshotAt: old.updated_at,
            previousSnapshotAt: snapshotAt,
        }),
        [concurrent]
    );
});
