import assert from 'node:assert/strict';
import test from 'node:test';

import { mapReportToFormValues } from './reportFormHydration.js';

test('hydrates existing images and report fields for editing', () => {
    const defaults = {
        clientReportId: 'new-id',
        meterBefore: { number: 'OLD-1', type: 'OldType' },
        metering: {},
        photos: { seal: [] },
        photoMetadata: { seal: [] },
        removedPhotoIds: [],
    };
    const values = mapReportToFormValues(
        {
            ['client_report_id']: 'existing-id',
            metering: {
                ['actual_old_meter_number']: 'OLD-2',
                ['new_meter_number']: 'NEW-1',
            },
            images: [
                {
                    kind: 'SEAL',
                    url: 'https://example.test/seal.jpg',
                    ['client_image_id']: 'image-id',
                },
            ],
        },
        defaults
    );

    assert.equal(values.clientReportId, 'existing-id');
    assert.equal(values.meterBefore.isActualDifferent, true);
    assert.equal(values.metering.newMeterNumber, 'NEW-1');
    assert.deepEqual(values.photos.seal, ['https://example.test/seal.jpg']);
    assert.deepEqual(values.photoMetadata.seal, [
        { uri: 'https://example.test/seal.jpg', clientImageId: 'image-id' },
    ]);
});
