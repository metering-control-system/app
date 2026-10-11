import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildReportReplacement,
    mapReportImagesToForm,
    mapReportToFormValues,
} from './reportFormHydration.js';

test('hydrates existing images and report fields for editing', () => {
    const defaults = {
        clientReportId: 'new-id',
        meterBefore: { number: 'OLD-1', type: 'OldType' },
        metering: {},
        photos: { seal: [] },
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
    assert.equal('photoMetadata' in values, false);
    assert.deepEqual(
        mapReportImagesToForm([
            {
                kind: 'SEAL',
                url: 'https://example.test/seal.jpg',
                ['client_image_id']: 'image-id',
            },
        ]).photoMetadata.seal,
        [{ uri: 'https://example.test/seal.jpg', clientImageId: 'image-id' }]
    );
});

test('replacement clears absent server fields, flags and photo slots', () => {
    const defaults = {
        clientReportId: 'new',
        comment: '',
        meterBefore: { number: '1', type: 'meter' },
        metering: {},
        photos: { seal: [], oldMeter: [] },
    };
    const { values, photoMetadata } = buildReportReplacement(
        { id: 10, images: [] },
        defaults
    );
    assert.equal(values.comment, '');
    assert.equal(values.metering.newMeterNumber, '');
    assert.equal(values.metering.dismantlingCompleted, false);
    assert.equal(values.consumerContact.fullName, '');
    assert.equal(values.consumerContact.isRefusedContact, false);
    assert.equal(values.admission.rejectionComment, '');
    assert.deepEqual(values.photos, { seal: [], oldMeter: [] });
    assert.deepEqual(photoMetadata, {});
    assert.equal('reportState' in values, false);
});

test('replacement preserves zero readings and remote photo identifiers', () => {
    const report = {
        metering: { ['removal_reading']: '0.000' },
        images: [
            {
                kind: 'SEAL',
                url: 'https://example.test/photo',
                ['client_image_id']: 'remote-id',
            },
        ],
    };
    const { values, photoMetadata } = buildReportReplacement(report, {
        meterBefore: {},
        metering: {},
        photos: { seal: [], oldMeter: [] },
    });
    assert.equal(values.metering.oldReading, '0.000');
    assert.deepEqual(values.photos.oldMeter, []);
    assert.deepEqual(photoMetadata.seal, [
        { uri: 'https://example.test/photo', clientImageId: 'remote-id' },
    ]);
});

test('hydration keeps an absent actual old meter instead of restoring the task meter', () => {
    const values = mapReportToFormValues(
        {
            metering: {
                ['actual_old_meter_number']: '',
                ['actual_old_meter_type']: '',
                ['removal_reading']: null,
            },
        },
        {
            meterBefore: { number: 'OLD-1', type: 'OldType' },
            metering: {},
            photos: {},
        }
    );
    assert.equal(values.meterBefore.isActualDifferent, true);
    assert.equal(values.meterBefore.actualNumber, '');
    assert.equal(values.meterBefore.actualType, '');
    assert.equal(values.metering.oldReading, '');
});

test('server replacement clears extra fields and preserves explicit no and numeric zero', () => {
    const { values } = buildReportReplacement(
        {
            metering: { ['old_digits_after']: 0, ['old_t1']: '0.000' },
            admission: { ['is_compliant']: false },
            ['act_details']: { ['power_of_attorney_date']: '2026-10-12' },
        },
        {
            meterBefore: { verificationDate: '01.01.2020' },
            metering: { newT2: '9' },
            actDetails: { representativeName: 'Локальное имя' },
            photos: {},
        }
    );
    assert.equal(values.meterBefore.verificationDate, '');
    assert.equal(values.meterBefore.digitsAfter, '0');
    assert.equal(values.metering.oldT1, '0.000');
    assert.equal(values.metering.newT2, '');
    assert.equal(values.admission.isCompliant, false);
    assert.equal(values.actDetails.representativeName, '');
    assert.equal(values.actDetails.powerOfAttorneyDate, '12.10.2026');
});

test('structured consumer names round trip without swapping surname and first name', () => {
    const values = mapReportToFormValues(
        {
            ['consumer_contact']: {
                ['first_name']: 'Иван',
                ['middle_name']: 'Иванович',
                ['last_name']: 'Петров',
                ['full_name']: 'Иван Иванович Петров',
            },
        },
        { meterBefore: {}, metering: {}, photos: {} }
    );
    assert.equal(values.consumerContact.fullName, 'Петров Иван Иванович');
});
