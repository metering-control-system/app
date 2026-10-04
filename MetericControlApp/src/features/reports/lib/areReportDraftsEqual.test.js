import assert from 'node:assert/strict';
import test from 'node:test';
import { areReportDraftsEqual } from './areReportDraftsEqual.js';

const draft = {
    reportState: 'pending',
    metering: { oldReading: '12', dismantlingCompleted: false },
    photos: { meter: ['file://one.jpg', 'file://two.jpg'] },
    comment: '',
};

test('accepts a restored draft with equal nested data and different object identities', () => {
    assert.equal(
        areReportDraftsEqual(draft, JSON.parse(JSON.stringify(draft))),
        true
    );
});

test('does not depend on the order of object properties', () => {
    const { metering: _metering, ...rest } = draft;
    assert.equal(
        areReportDraftsEqual(draft, {
            ...rest,
            metering: { dismantlingCompleted: false, oldReading: '12' },
        }),
        true
    );
});

test('rejects changes to nested values, flags, comments, photos and draft state', () => {
    const changedDrafts = [
        { ...draft, metering: { ...draft.metering, oldReading: '13' } },
        {
            ...draft,
            metering: { ...draft.metering, dismantlingCompleted: true },
        },
        { ...draft, comment: 'new comment' },
        { ...draft, photos: { meter: ['file://two.jpg', 'file://one.jpg'] } },
        { ...draft, photos: { meter: ['file://one.jpg'] } },
        { ...draft, reportState: 'error' },
        { ...draft, reportState: undefined },
        null,
        undefined,
    ];
    for (const current of changedDrafts) {
        assert.equal(areReportDraftsEqual(draft, current), false);
    }
});

test('distinguishes missing fields, empty values, types and arrays from objects', () => {
    for (const [expected, current] of [
        [{ comment: '' }, {}],
        [{ comment: undefined }, {}],
        [{ reading: 0 }, { reading: '0' }],
        [{ checked: false }, { checked: null }],
        [{ photos: [] }, { photos: {} }],
    ]) {
        assert.equal(areReportDraftsEqual(expected, current), false);
        assert.equal(areReportDraftsEqual(current, expected), false);
    }
});
