import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildReportImagesPayload,
    buildReportPayload,
    getRemovedReportImageIds,
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

test('sends empty name strings when contacts are refused on create and update', () => {
    const values = createFormValues();
    values.consumerContact = {
        fullName: '',
        phoneNumber: '',
        phoneNumber2: '',
        email: '',
        isRefusedContact: true,
    };

    for (const includeEmptyOptionalFields of [false, true]) {
        const contact = buildReportPayload(values, {
            includeEmptyOptionalFields,
        }).consumer_contact;

        assert.equal(contact.is_refused_contact, true);
        assert.equal(contact.first_name, '');
        assert.equal(contact.middle_name, '');
        assert.equal(contact.last_name, '');
        assert.equal(contact.phone_number_1, null);
        assert.equal(contact.email, null);
        if (includeEmptyOptionalFields) {
            assert.equal(contact.phone_number_2, null);
        } else {
            assert.equal('phone_number_2' in contact, false);
        }
    }
});

test('allows a phone contact without a contact name', () => {
    const values = createFormValues();
    values.consumerContact.fullName = '   ';
    values.consumerContact.email = '';
    const contact = buildReportPayload(values).consumer_contact;

    assert.equal(contact.is_refused_contact, false);
    assert.equal(contact.phone_number_1, '+78005553535');
    assert.equal(contact.first_name, '');
    assert.equal(contact.middle_name, '');
    assert.equal(contact.last_name, '');
});

test('sends an empty middle name for a contact name without a patronymic', () => {
    const values = createFormValues();
    values.consumerContact.fullName = '  Иванов   Иван  ';
    const contact = buildReportPayload(values).consumer_contact;

    assert.equal(contact.first_name, 'Иван');
    assert.equal(contact.middle_name, '');
    assert.equal(contact.last_name, 'Иванов');
});

test('preserves all parts of a complete contact name', () => {
    const contact = buildReportPayload(createFormValues()).consumer_contact;

    assert.equal(contact.first_name, 'Иван');
    assert.equal(contact.middle_name, 'Иванович');
    assert.equal(contact.last_name, 'Иванов');
});

test('uploads only new photos with their stable client ids', () => {
    const formValues = {
        photos: { seal: ['file://existing.jpg', 'file://new.jpg'] },
    };
    const photoMetadata = {
        seal: [
            { uri: 'file://existing.jpg', clientImageId: 'existing-image-id' },
            { uri: 'file://new.jpg', clientImageId: 'new-image-id' },
        ],
    };
    const payload = buildReportImagesPayload(
        formValues,
        [{ ['client_image_id']: 'existing-image-id' }],
        photoMetadata
    );

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
    const formValues = { photos: { seal: ['file://seal.jpg'] } };
    const photoMetadata = {
        seal: [{ uri: 'file://seal.jpg', clientImageId: 'existing-image-id' }],
    };

    assert.equal(
        buildReportImagesPayload(
            formValues,
            [{ ['client_image_id']: 'existing-image-id' }],
            photoMetadata
        ),
        null
    );
});

test('deletes only explicitly removed photos that still exist remotely', () => {
    const values = {
        removedPhotoIds: ['deleted-id', 'deleted-id', 'already-gone-id'],
    };

    assert.deepEqual(
        getRemovedReportImageIds({
            removedPhotoIds: values.removedPhotoIds,
            existingImages: [
                { ['client_image_id']: 'deleted-id' },
                { ['client_image_id']: 'unchanged-id' },
            ],
        }),
        ['deleted-id']
    );
});

test('does not delete remote photos when the local form has no photos', () => {
    assert.deepEqual(
        getRemovedReportImageIds({
            photos: {},
            removedPhotoIds: [],
            existingImages: [{ ['client_image_id']: 'remote-id' }],
        }),
        []
    );
});

test('does not delete a photo removed and then restored before save', () => {
    assert.deepEqual(
        getRemovedReportImageIds({
            photos: { seal: ['https://example.test/seal.jpg'] },
            removedPhotoIds: ['seal-id'],
            existingImages: [{ ['client_image_id']: 'seal-id' }],
            photoMetadata: {
                seal: [
                    {
                        uri: 'https://example.test/seal.jpg',
                        clientImageId: 'seal-id',
                    },
                ],
            },
        }),
        []
    );
});

test('submits new act fields and allows explicitly missing old meter and seal', () => {
    const values = createFormValues();
    values.meterBefore = {
        ...values.meterBefore,
        isActualDifferent: true,
        actualType: '',
        actualNumber: '',
        accuracyClass: '1.0',
        digitsAfter: '0',
    };
    values.metering = {
        ...values.metering,
        oldReading: '',
        sealNumber: '',
        sealLocation: '',
        oldT1: '0',
        newT2: '12,345',
    };
    values.actDetails = {
        powerOfAttorneyDate: '12.10.2026',
        representativeName: 'Представитель',
    };
    values.admission.isCompliant = false;
    const payload = buildReportPayload(values);
    assert.equal(payload.metering.actual_old_meter_type, '');
    assert.equal(payload.metering.actual_old_meter_number, '');
    assert.equal(payload.metering.removal_reading, null);
    assert.equal(payload.metering.seal_number, '');
    assert.equal(payload.metering.seal_location, '');
    assert.equal(payload.metering.old_t1, '0');
    assert.equal(payload.metering.new_t2, '12.345');
    assert.equal(payload.metering.old_digits_after, 0);
    assert.equal(payload.admission.is_compliant, false);
    assert.equal(payload.act_details.power_of_attorney_date, '2026-10-12');
    assert.equal(payload.act_details.representative_name, 'Представитель');
});
