import assert from 'node:assert/strict';
import test from 'node:test';

import {
    prepareReportPhotoMetadata,
    prepareReportSubmissionValues,
    prepareReportValues,
} from './reportPhotoMetadata.js';

const createSequentialId = () => {
    let value = 0;

    return () => `image-${++value}`;
};

test('keeps image ids stable across repeated submissions', () => {
    const createId = createSequentialId();
    const formValues = {
        comment: 'Updated comment',
        photos: { seal: ['file://seal.jpg'] },
    };
    const firstValues = prepareReportValues(formValues, createId);
    const secondValues = prepareReportSubmissionValues({
        values: formValues,
        persistedValues: firstValues,
        createId,
    });

    assert.deepEqual(secondValues.photoMetadata, firstValues.photoMetadata);
    assert.equal(secondValues.comment, 'Updated comment');
});

test('adds metadata only for new photos and removes deleted photos', () => {
    const createId = createSequentialId();
    const previousMetadata = prepareReportPhotoMetadata({
        photos: { seal: ['file://old.jpg', 'file://removed.jpg'] },
        createId,
    });
    const nextMetadata = prepareReportPhotoMetadata({
        photos: { seal: ['file://old.jpg', 'file://new.jpg'] },
        photoMetadata: previousMetadata,
        createId,
    });

    assert.deepEqual(nextMetadata.seal, [
        { uri: 'file://old.jpg', clientImageId: 'image-1' },
        { uri: 'file://new.jpg', clientImageId: 'image-3' },
    ]);
});
