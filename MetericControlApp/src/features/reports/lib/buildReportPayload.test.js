import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildReportImagesPayload,
    buildReportPayload,
} from './buildReportPayload.js';

const createFormValues = () => ({
    clientReportId: '9d9e7f4a-0e8c-4f9c-b8ec-123456789abc',
    taskId: 12,
    meterBefore: {
        actualNumber: '',
        actualType: '',
        number: 'OLD-1',
        type: 'OldType',
    },
    metering: {
        dismantlingCompleted: true,
        newMeterNumber: 'NEW-1',
        newMeterType: 'NewType',
        oldReading: '10',
        installationReading: '0',
        sealLocation: 'TERMINAL_COVER',
        sealNumber: 'SEAL-1',
    },
    admission: {
        status: 'ADMITTED',
        rejectionReason: '',
        rejectionComment: '',
    },
    consumerContact: {
        fullName: 'Иванов Иван Иванович',
        phoneNumber: '+78005553535',
        phoneNumber2: '',
        email: 'ivan@example.com',
        isRefusedContact: false,
    },
});

test('omits empty optional fields when creating a report', () => {
    const payload = buildReportPayload(createFormValues());

    assert.equal('phone_number_2' in payload['consumer_contact'], false);
    assert.equal('rejection_reason' in payload.admission, false);
    assert.equal('rejection_comment' in payload.admission, false);
});

test('keeps empty optional fields when updating a report', () => {
    const payload = buildReportPayload(createFormValues(), {
        includeEmptyOptionalFields: true,
    });

    assert.equal(payload['consumer_contact']['phone_number_2'], null);
    assert.equal(payload.admission['rejection_reason'], '');
    assert.equal(payload.admission['rejection_comment'], '');
});

test('uploads only new photos with their stable client ids', () => {
    const formValues = {
        photos: { seal: ['file://existing.jpg', 'file://new.jpg'] },
        photoMetadata: {
            seal: [
                {
                    uri: 'file://existing.jpg',
                    clientImageId: 'existing-image-id',
                },
                { uri: 'file://new.jpg', clientImageId: 'new-image-id' },
            ],
        },
    };
    const payload = buildReportImagesPayload(formValues, [
        { ['client_image_id']: 'existing-image-id' },
    ]);

    assert.deepEqual(payload.images, [
        {
            ['file_key']: 'seal_2',
            kind: 'SEAL',
            ['file_name']: 'seal.jpg',
            ['client_image_id']: 'new-image-id',
        },
    ]);
    assert.equal(payload.files.length, 1);
    assert.equal(payload.files[0].file.uri, 'file://new.jpg');
});

test('does not upload unchanged report photos again', () => {
    const formValues = {
        photos: { seal: ['file://seal.jpg'] },
        photoMetadata: {
            seal: [
                { uri: 'file://seal.jpg', clientImageId: 'existing-image-id' },
            ],
        },
    };

    assert.equal(
        buildReportImagesPayload(formValues, [
            { ['client_image_id']: 'existing-image-id' },
        ]),
        null
    );
});
