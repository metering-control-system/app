import assert from 'node:assert/strict';
import test from 'node:test';
import { fillEmptyReportFields } from './fillEmptyReportFields.js';

const replacement = {
    values: {
        comment: 'server',
        metering: { reading: 42, number: 'server-number', installed: true },
        photos: { before: ['server-before'], after: ['server-after'] },
    },
    photoMetadata: {
        before: [{ uri: 'server-before', clientImageId: 'before-id' }],
        after: [{ uri: 'server-after', clientImageId: 'after-id' }],
    },
};

test('fills nested blanks while preserving local text, zero and photo sections', () => {
    const currentValues = {
        comment: 'my comment',
        metering: { reading: 0, number: '  ', installed: false },
        photos: { before: ['local-before'], after: [] },
    };
    const original = structuredClone(currentValues);
    const result = fillEmptyReportFields({
        currentValues,
        replacement,
        localPhotoMetadata: {
            before: [{ uri: 'local-before', clientImageId: 'local-id' }],
        },
    });
    assert.deepEqual(result.values, {
        comment: 'my comment',
        metering: { reading: 0, number: 'server-number', installed: true },
        photos: { before: ['local-before'], after: ['server-after'] },
    });
    assert.equal(result.photoMetadata.before[0].clientImageId, 'local-id');
    assert.equal(result.photoMetadata.after[0].clientImageId, 'after-id');
    assert.deepEqual(currentValues, original);
});

test('preserves deletions except for photos restored into empty sections', () => {
    const result = fillEmptyReportFields({
        currentValues: { photos: { before: ['local-before'], after: [] } },
        replacement,
        removedPhotoIds: ['before-id', 'after-id', 'other-id'],
    });
    assert.deepEqual(result.removedPhotoIds, ['before-id', 'other-id']);
});

test('clears pending state so the merged draft requires manual submission', () => {
    const result = fillEmptyReportFields({
        currentValues: {
            comment: null,
            reportState: 'pending',
            photoMetadata: {},
            removedPhotoIds: ['old-id'],
            photos: {},
        },
        replacement,
    });
    assert.equal(result.values.comment, 'server');
    assert.equal(Object.hasOwn(result.values, 'reportState'), false);
    assert.equal(Object.hasOwn(result.values, 'photoMetadata'), false);
    assert.equal(Object.hasOwn(result.values, 'removedPhotoIds'), false);
});

test('fills unchecked flags from the server without unchecking local flags', () => {
    for (const [local, server, expected] of [
        [false, true, true],
        [true, false, true],
        [false, false, false],
        [true, true, true],
        [false, undefined, false],
    ]) {
        const result = fillEmptyReportFields({
            currentValues: { metering: { installed: local }, photos: {} },
            replacement: {
                values: { metering: { installed: server }, photos: {} },
                photoMetadata: {},
            },
        });
        assert.equal(result.values.metering.installed, expected);
    }
});
